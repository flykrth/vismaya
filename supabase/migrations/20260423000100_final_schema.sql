-- Final consolidated schema migration for Vismaya.
-- Includes: camper gender, workshop speaker metadata, slot-based scheduling (A-D),
-- duplicate workshop prevention, slot conflict prevention, and enrollment accounting.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Types
CREATE TYPE age_category_type AS ENUM ('sub-junior', 'junior', 'senior');
CREATE TYPE registration_status_type AS ENUM ('registered', 'waitlisted', 'cancelled');
CREATE TYPE camper_gender_type AS ENUM ('male', 'female', 'other');

-- Tables
CREATE TABLE parents (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE campers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender camper_gender_type NOT NULL DEFAULT 'male',
    age_category age_category_type,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workshops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    speaker_name TEXT NOT NULL DEFAULT 'TBD',
    speaker_title TEXT NOT NULL DEFAULT 'Instructor',
    learning_outcome TEXT NOT NULL DEFAULT 'Gain valuable skills and knowledge',
    allowed_age_categories age_category_type[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    slot_label TEXT NOT NULL CHECK (slot_label IN ('A', 'B', 'C', 'D')),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    venue TEXT NOT NULL,
    max_capacity INT NOT NULL CHECK (max_capacity > 0),
    current_enrollment INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camper_id UUID NOT NULL REFERENCES campers(id) ON DELETE CASCADE,
    schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    status registration_status_type NOT NULL DEFAULT 'registered',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(camper_id, schedule_id)
);

-- Trigger function: age category from DOB
CREATE OR REPLACE FUNCTION calculate_age_category() RETURNS TRIGGER AS $$
DECLARE
    age_years INT;
BEGIN
    age_years := date_part('year', age(CURRENT_DATE, NEW.date_of_birth));
    IF age_years <= 10 THEN
        NEW.age_category := 'sub-junior'::age_category_type;
    ELSIF age_years <= 14 THEN
        NEW.age_category := 'junior'::age_category_type;
    ELSE
        NEW.age_category := 'senior'::age_category_type;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_age_category
BEFORE INSERT OR UPDATE OF date_of_birth ON campers
FOR EACH ROW EXECUTE FUNCTION calculate_age_category();

-- Trigger function: registration validation
CREATE OR REPLACE FUNCTION validate_and_process_registration() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'cancelled' THEN
        RETURN NEW;
    END IF;

    -- A. Age validation
    IF NOT EXISTS (
        SELECT 1
        FROM campers c
        JOIN schedules s ON s.id = NEW.schedule_id
        JOIN workshops w ON w.id = s.workshop_id
        WHERE c.id = NEW.camper_id
          AND c.age_category = ANY(w.allowed_age_categories)
    ) THEN
        RAISE EXCEPTION 'Age Validation Failed: Camper age category is not allowed for this workshop';
    END IF;

    -- A2. Duplicate workshop validation (same workshop, different schedule)
    IF EXISTS (
        SELECT 1
        FROM registrations r
        JOIN schedules existing_s ON existing_s.id = r.schedule_id
        JOIN schedules new_s ON new_s.id = NEW.schedule_id
        WHERE r.camper_id = NEW.camper_id
          AND r.status != 'cancelled'
          AND r.id IS DISTINCT FROM NEW.id
          AND existing_s.workshop_id = new_s.workshop_id
    ) THEN
        RAISE EXCEPTION 'Duplicate workshop registration is not allowed for this camper.';
    END IF;

    -- B. Max 6 workshops
    IF (
        SELECT count(*)
        FROM registrations
        WHERE camper_id = NEW.camper_id
          AND status != 'cancelled'
          AND id IS DISTINCT FROM NEW.id
    ) >= 6 THEN
        RAISE EXCEPTION 'Maximum workshop limit reached.';
    END IF;

    -- C. No slot conflicts (A/B/C/D)
    IF EXISTS (
        SELECT 1
        FROM registrations r
        JOIN schedules existing_s ON r.schedule_id = existing_s.id
        JOIN schedules new_s ON new_s.id = NEW.schedule_id
        WHERE r.camper_id = NEW.camper_id
          AND r.status != 'cancelled'
          AND r.id IS DISTINCT FROM NEW.id
          AND new_s.slot_label = existing_s.slot_label
    ) THEN
        RAISE EXCEPTION 'Slot conflict detected.';
    END IF;

    -- D. Capacity -> waitlist if full
    IF NEW.status = 'registered' THEN
        NEW.status := (
            SELECT CASE
                WHEN current_enrollment >= max_capacity THEN 'waitlisted'::registration_status_type
                ELSE 'registered'::registration_status_type
            END
            FROM schedules
            WHERE id = NEW.schedule_id
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_registration
BEFORE INSERT OR UPDATE ON registrations
FOR EACH ROW EXECUTE FUNCTION validate_and_process_registration();

-- Trigger function: keep schedules.current_enrollment accurate
CREATE OR REPLACE FUNCTION public.update_schedule_enrollment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'registered' THEN
        UPDATE schedules
        SET current_enrollment = current_enrollment + 1
        WHERE id = NEW.schedule_id;

    ELSIF TG_OP = 'DELETE' AND OLD.status = 'registered' THEN
        UPDATE schedules
        SET current_enrollment = GREATEST(current_enrollment - 1, 0)
        WHERE id = OLD.schedule_id;

    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'registered' AND NEW.status = 'registered' THEN
            UPDATE schedules
            SET current_enrollment = current_enrollment + 1
            WHERE id = NEW.schedule_id;
        ELSIF OLD.status = 'registered' AND NEW.status != 'registered' THEN
            UPDATE schedules
            SET current_enrollment = GREATEST(current_enrollment - 1, 0)
            WHERE id = OLD.schedule_id;
        END IF;
    END IF;

    RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_update_enrollment
AFTER INSERT OR UPDATE OR DELETE ON registrations
FOR EACH ROW EXECUTE FUNCTION public.update_schedule_enrollment();

-- Trigger function: auto-create parent on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.parents (id, full_name, phone_number)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone_number'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE campers ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their own profile" ON parents
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Parents can insert their own profile" ON parents
    FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Parents can update their own profile" ON parents
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Parents can view their own campers" ON campers
    FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Parents can insert their own campers" ON campers
    FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Parents can update their own campers" ON campers
    FOR UPDATE USING (auth.uid() = parent_id);
CREATE POLICY "Parents can delete their own campers" ON campers
    FOR DELETE USING (auth.uid() = parent_id);

CREATE POLICY "Workshops are viewable by everyone" ON workshops
    FOR SELECT USING (true);
CREATE POLICY "Schedules are viewable by everyone" ON schedules
    FOR SELECT USING (true);

CREATE POLICY "Parents can view their campers registrations" ON registrations
    FOR SELECT USING (camper_id IN (SELECT id FROM campers WHERE parent_id = auth.uid()));
CREATE POLICY "Parents can insert registrations for their campers" ON registrations
    FOR INSERT WITH CHECK (camper_id IN (SELECT id FROM campers WHERE parent_id = auth.uid()));
CREATE POLICY "Parents can update registrations for their campers" ON registrations
    FOR UPDATE USING (camper_id IN (SELECT id FROM campers WHERE parent_id = auth.uid()));
CREATE POLICY "Parents can delete registrations for their campers" ON registrations
    FOR DELETE USING (camper_id IN (SELECT id FROM campers WHERE parent_id = auth.uid()));

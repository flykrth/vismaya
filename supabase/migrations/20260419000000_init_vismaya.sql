-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Custom ENUM Types
CREATE TYPE age_category_type AS ENUM ('sub-junior', 'junior', 'senior');
CREATE TYPE registration_status_type AS ENUM ('registered', 'waitlisted', 'cancelled');

-- 1. Parents Table
CREATE TABLE parents (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    emergency_contact TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Campers Table
CREATE TABLE campers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    age_category age_category_type, -- auto-calculated via trigger
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Workshops Table
CREATE TABLE workshops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    allowed_age_categories age_category_type[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Schedules Table
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    venue TEXT NOT NULL,
    max_capacity INT NOT NULL CHECK (max_capacity > 0),
    current_enrollment INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Registrations Table
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camper_id UUID NOT NULL REFERENCES campers(id) ON DELETE CASCADE,
    schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    status registration_status_type NOT NULL DEFAULT 'registered',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(camper_id, schedule_id) -- A camper can only register once for a specific schedule
);

-------------------------------------------------------------------------------
-- TRIGGERS & FUNCTIONS
-------------------------------------------------------------------------------

-- Trigger 1: Auto-calculate camper age category
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

-- Trigger 2: Master Validation for Registrations (Age, Limit, Time Conflict, Capacity)
CREATE OR REPLACE FUNCTION validate_and_process_registration() RETURNS TRIGGER AS $$
DECLARE
    c_age age_category_type;
    active_count INT;
    conflict_exists BOOLEAN;
    sched RECORD;
BEGIN
    -- Only validate if status is NOT cancelled
    IF NEW.status = 'cancelled' THEN
        RETURN NEW;
    END IF;

    -- Fetch Camper Age and Schedule info
    SELECT age_category INTO c_age FROM campers WHERE id = NEW.camper_id;
    SELECT w.allowed_age_categories, s.start_time, s.end_time, s.current_enrollment, s.max_capacity 
    INTO sched 
    FROM schedules s JOIN workshops w ON s.workshop_id = w.id 
    WHERE s.id = NEW.schedule_id;

    -- A. Age Validation
    IF NOT (c_age = ANY(sched.allowed_age_categories)) THEN
        RAISE EXCEPTION 'Age Validation Failed: Camper age category % is not allowed for this workshop', c_age;
    END IF;

    -- B. Max 6 Workshops Validation
    SELECT count(*) INTO active_count FROM registrations 
    WHERE camper_id = NEW.camper_id AND status != 'cancelled' AND id IS DISTINCT FROM NEW.id;
    
    IF active_count >= 6 THEN
        RAISE EXCEPTION 'Maximum workshop limit reached.';
    END IF;

    -- C. No Time Conflicts Validation
    SELECT EXISTS (
        SELECT 1 FROM registrations r
        JOIN schedules s ON r.schedule_id = s.id
        WHERE r.camper_id = NEW.camper_id
        AND r.status != 'cancelled'
        AND r.id IS DISTINCT FROM NEW.id
        AND sched.start_time < s.end_time AND sched.end_time > s.start_time
    ) INTO conflict_exists;

    IF conflict_exists THEN
        RAISE EXCEPTION 'Time slot conflict detected.';
    END IF;

    -- D. Capacity Limit (Waitlist if full)
    -- We only set waitlisted if transitioning to 'registered' or inserting 'registered'
    IF NEW.status = 'registered' AND sched.current_enrollment >= sched.max_capacity THEN
        NEW.status := 'waitlisted'::registration_status_type;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_registration
BEFORE INSERT OR UPDATE ON registrations
FOR EACH ROW EXECUTE FUNCTION validate_and_process_registration();

-- Trigger 3: Update current_enrollment on schedules when registration changes
CREATE OR REPLACE FUNCTION update_schedule_enrollment() RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT
    IF TG_OP = 'INSERT' AND NEW.status = 'registered' THEN
        UPDATE schedules SET current_enrollment = current_enrollment + 1 WHERE id = NEW.schedule_id;
    -- Handle DELETE
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'registered' THEN
        UPDATE schedules SET current_enrollment = current_enrollment - 1 WHERE id = OLD.schedule_id;
    -- Handle UPDATE
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'registered' AND NEW.status = 'registered' THEN
            UPDATE schedules SET current_enrollment = current_enrollment + 1 WHERE id = NEW.schedule_id;
        ELSIF OLD.status = 'registered' AND NEW.status != 'registered' THEN
            UPDATE schedules SET current_enrollment = current_enrollment - 1 WHERE id = OLD.schedule_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_enrollment
AFTER INSERT OR UPDATE OR DELETE ON registrations
FOR EACH ROW EXECUTE FUNCTION update_schedule_enrollment();

-------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-------------------------------------------------------------------------------

ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE campers ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Parents Policy
CREATE POLICY "Parents can view their own profile" ON parents
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Parents can insert their own profile" ON parents
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Parents can update their own profile" ON parents
    FOR UPDATE USING (auth.uid() = id);

-- Campers Policy
CREATE POLICY "Parents can view their own campers" ON campers
    FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert their own campers" ON campers
    FOR INSERT WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update their own campers" ON campers
    FOR UPDATE USING (auth.uid() = parent_id);
CREATE POLICY "Parents can delete their own campers" ON campers
    FOR DELETE USING (auth.uid() = parent_id);

-- Workshops & Schedules Policy (Read-only for authenticated users/public)
CREATE POLICY "Workshops are viewable by everyone" ON workshops
    FOR SELECT USING (true);

CREATE POLICY "Schedules are viewable by everyone" ON schedules
    FOR SELECT USING (true);

-- Registrations Policy
CREATE POLICY "Parents can view their campers registrations" ON registrations
    FOR SELECT USING (camper_id IN (SELECT id FROM campers WHERE parent_id = auth.uid()));

CREATE POLICY "Parents can insert registrations for their campers" ON registrations
    FOR INSERT WITH CHECK (camper_id IN (SELECT id FROM campers WHERE parent_id = auth.uid()));

CREATE POLICY "Parents can update registrations for their campers" ON registrations
    FOR UPDATE USING (camper_id IN (SELECT id FROM campers WHERE parent_id = auth.uid()));
CREATE POLICY "Parents can delete registrations for their campers" ON registrations
    FOR DELETE USING (camper_id IN (SELECT id FROM campers WHERE parent_id = auth.uid()));

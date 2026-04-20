-- Prevent duplicate active registrations for the same workshop by the same camper.
-- This hardens the rule at the database layer (not only in application code).

CREATE OR REPLACE FUNCTION validate_and_process_registration() RETURNS TRIGGER AS $$
BEGIN
    -- Only validate if status is NOT cancelled
    IF NEW.status = 'cancelled' THEN
        RETURN NEW;
    END IF;

    -- A. Age Validation
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

    -- A2. Duplicate Workshop Validation (same camper cannot hold multiple active schedules for one workshop)
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

    -- B. Max 6 Workshops Validation
    IF (SELECT count(*) FROM registrations WHERE camper_id = NEW.camper_id AND status != 'cancelled' AND id IS DISTINCT FROM NEW.id) >= 6 THEN
        RAISE EXCEPTION 'Maximum workshop limit reached.';
    END IF;

    -- C. No Time Conflicts Validation
    IF EXISTS (
        SELECT 1
        FROM registrations r
        JOIN schedules existing_s ON r.schedule_id = existing_s.id
        JOIN schedules new_s ON new_s.id = NEW.schedule_id
        WHERE r.camper_id = NEW.camper_id
        AND r.status != 'cancelled'
        AND r.id IS DISTINCT FROM NEW.id
        AND new_s.start_time < existing_s.end_time
        AND new_s.end_time > existing_s.start_time
    ) THEN
        RAISE EXCEPTION 'Time slot conflict detected.';
    END IF;

    -- D. Capacity Limit (Waitlist if full)
    IF NEW.status = 'registered' THEN
        NEW.status := (
            SELECT CASE
                WHEN current_enrollment >= max_capacity THEN 'waitlisted'::registration_status_type
                ELSE 'registered'::registration_status_type
            END
            FROM schedules WHERE id = NEW.schedule_id
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

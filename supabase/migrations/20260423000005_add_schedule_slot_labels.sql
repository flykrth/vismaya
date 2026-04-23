-- Add public slot labels for schedules and migrate existing records.
-- Slots are intentionally abstracted (A-D) so exact time details stay hidden.

ALTER TABLE schedules
ADD COLUMN IF NOT EXISTS slot_label TEXT;

WITH ranked_slots AS (
  SELECT
    id,
    ((DENSE_RANK() OVER (ORDER BY start_time::time, end_time::time) - 1) % 4) + 1 AS slot_rank
  FROM schedules
)
UPDATE schedules s
SET slot_label = CASE ranked_slots.slot_rank
  WHEN 1 THEN 'A'
  WHEN 2 THEN 'B'
  WHEN 3 THEN 'C'
  ELSE 'D'
END
FROM ranked_slots
WHERE s.id = ranked_slots.id
  AND s.slot_label IS NULL;

ALTER TABLE schedules
ALTER COLUMN slot_label SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'schedules_slot_label_check'
      AND conrelid = 'schedules'::regclass
  ) THEN
    ALTER TABLE schedules
    ADD CONSTRAINT schedules_slot_label_check
    CHECK (slot_label IN ('A', 'B', 'C', 'D'));
  END IF;
END;
$$;

-- Keep the registration validation function aligned with slot-based conflicts.
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

    -- C. No Slot Conflicts Validation
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

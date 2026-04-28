-- Add age-based registration numbers for campers.
-- Sub-junior => S101, S102, ...
-- Junior      => J101, J102, ...
-- Senior      => A101, A102, ...

ALTER TABLE campers
ADD COLUMN IF NOT EXISTS registration_number TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = 'camper_sub_junior_registration_seq'
  ) THEN
    CREATE SEQUENCE camper_sub_junior_registration_seq START WITH 101;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = 'camper_junior_registration_seq'
  ) THEN
    CREATE SEQUENCE camper_junior_registration_seq START WITH 101;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = 'camper_senior_registration_seq'
  ) THEN
    CREATE SEQUENCE camper_senior_registration_seq START WITH 101;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_camper_registration_number()
RETURNS TRIGGER AS $$
DECLARE
  age_years INT;
  prefix TEXT;
  sequence_name TEXT;
BEGIN
  IF NEW.registration_number IS NOT NULL THEN
    RETURN NEW;
  END IF;

  age_years := date_part('year', age(CURRENT_DATE, NEW.date_of_birth));

  IF age_years <= 10 THEN
    prefix := 'S';
    sequence_name := 'camper_sub_junior_registration_seq';
  ELSIF age_years <= 14 THEN
    prefix := 'J';
    sequence_name := 'camper_junior_registration_seq';
  ELSE
    prefix := 'A';
    sequence_name := 'camper_senior_registration_seq';
  END IF;

  NEW.registration_number := prefix || nextval(sequence_name)::TEXT;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assign_camper_registration_number ON campers;
CREATE TRIGGER trigger_assign_camper_registration_number
BEFORE INSERT ON campers
FOR EACH ROW EXECUTE FUNCTION public.assign_camper_registration_number();

WITH ranked_campers AS (
  SELECT
    id,
    age_category,
    ROW_NUMBER() OVER (PARTITION BY age_category ORDER BY created_at, id) AS rn
  FROM campers
)
UPDATE campers c
SET registration_number = CASE ranked_campers.age_category
  WHEN 'sub-junior'::age_category_type THEN 'S' || (100 + ranked_campers.rn)::TEXT
  WHEN 'junior'::age_category_type THEN 'J' || (100 + ranked_campers.rn)::TEXT
  ELSE 'A' || (100 + ranked_campers.rn)::TEXT
END
FROM ranked_campers
WHERE c.id = ranked_campers.id;

DO $$
DECLARE
  max_sub_junior INT;
  max_junior INT;
  max_senior INT;
BEGIN
  SELECT COALESCE(MAX((regexp_replace(registration_number, '^[A-Z]', ''))::INT), 100)
  INTO max_sub_junior
  FROM campers
  WHERE registration_number LIKE 'S%';
  PERFORM setval('camper_sub_junior_registration_seq', max_sub_junior, true);

  SELECT COALESCE(MAX((regexp_replace(registration_number, '^[A-Z]', ''))::INT), 100)
  INTO max_junior
  FROM campers
  WHERE registration_number LIKE 'J%';
  PERFORM setval('camper_junior_registration_seq', max_junior, true);

  SELECT COALESCE(MAX((regexp_replace(registration_number, '^[A-Z]', ''))::INT), 100)
  INTO max_senior
  FROM campers
  WHERE registration_number LIKE 'A%';
  PERFORM setval('camper_senior_registration_seq', max_senior, true);
END;
$$;

ALTER TABLE campers
ALTER COLUMN registration_number SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'campers_registration_number_key'
      AND conrelid = 'campers'::regclass
  ) THEN
    ALTER TABLE campers
    ADD CONSTRAINT campers_registration_number_key UNIQUE (registration_number);
  END IF;
END;
$$;

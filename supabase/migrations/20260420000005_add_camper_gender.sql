-- Add gender to campers and backfill existing rows with a safe default.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'camper_gender_type'
    ) THEN
        CREATE TYPE camper_gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
    END IF;
END $$;

ALTER TABLE public.campers
ADD COLUMN IF NOT EXISTS gender camper_gender_type;

UPDATE public.campers
SET gender = 'prefer_not_to_say'::camper_gender_type
WHERE gender IS NULL;

ALTER TABLE public.campers
ALTER COLUMN gender SET NOT NULL,
ALTER COLUMN gender SET DEFAULT 'prefer_not_to_say'::camper_gender_type;

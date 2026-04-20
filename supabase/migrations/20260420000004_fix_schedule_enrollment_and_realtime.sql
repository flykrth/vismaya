-- Fix enrollment counter updates and realtime propagation.
-- Why: Remaining spots are driven by schedules.current_enrollment.
-- If trigger updates run under caller RLS, counts may not change.

CREATE OR REPLACE FUNCTION public.update_schedule_enrollment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Handle INSERT
    IF TG_OP = 'INSERT' AND NEW.status = 'registered' THEN
        UPDATE schedules
        SET current_enrollment = current_enrollment + 1
        WHERE id = NEW.schedule_id;

    -- Handle DELETE
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'registered' THEN
        UPDATE schedules
        SET current_enrollment = GREATEST(current_enrollment - 1, 0)
        WHERE id = OLD.schedule_id;

    -- Handle UPDATE
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

DROP TRIGGER IF EXISTS trigger_update_enrollment ON public.registrations;

CREATE TRIGGER trigger_update_enrollment
AFTER INSERT OR UPDATE OR DELETE ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.update_schedule_enrollment();

-- Backfill existing counters so UI reflects the correct value immediately.
UPDATE public.schedules s
SET current_enrollment = COALESCE(reg_counts.count_registered, 0)
FROM (
    SELECT schedule_id, COUNT(*)::int AS count_registered
    FROM public.registrations
    WHERE status = 'registered'
    GROUP BY schedule_id
) reg_counts
WHERE s.id = reg_counts.schedule_id;

UPDATE public.schedules
SET current_enrollment = 0
WHERE id NOT IN (
    SELECT DISTINCT schedule_id
    FROM public.registrations
    WHERE status = 'registered'
);

-- Ensure realtime subscriptions can receive schedule/registration changes.
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.schedules;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.registrations;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

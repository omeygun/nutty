ALTER TABLE IF EXISTS public.availability
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE IF EXISTS public.friends
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE IF EXISTS public.date_availability
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE IF EXISTS public.group_events
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE IF EXISTS public.group_participants
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE IF EXISTS public.group_availability
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

CREATE OR REPLACE FUNCTION public.create_group_event(
  p_title TEXT,
  p_description TEXT,
  p_start_date DATE,
  p_end_date DATE,
  p_timezone TEXT
)
RETURNS public.group_events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event public.group_events;
  v_slug TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  v_slug := SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', '') FROM 1 FOR 12);

  INSERT INTO public.group_events (
    organizer_id,
    slug,
    title,
    description,
    start_date,
    end_date,
    timezone
  )
  VALUES (
    auth.uid(),
    v_slug,
    p_title,
    NULLIF(p_description, ''),
    p_start_date,
    p_end_date,
    COALESCE(NULLIF(p_timezone, ''), 'UTC')
  )
  RETURNING * INTO v_event;

  RETURN v_event;
END;
$$;

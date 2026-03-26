ALTER TABLE public.group_events
ADD COLUMN IF NOT EXISTS confirmed_date DATE,
ADD COLUMN IF NOT EXISTS confirmed_start_time TIME,
ADD COLUMN IF NOT EXISTS confirmed_end_time TIME,
ADD COLUMN IF NOT EXISTS confirmed_title TEXT,
ADD COLUMN IF NOT EXISTS confirmed_notes TEXT,
ADD COLUMN IF NOT EXISTS confirmed_google_event_id TEXT,
ADD COLUMN IF NOT EXISTS confirmed_google_event_url TEXT,
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.group_events
DROP CONSTRAINT IF EXISTS valid_group_event_confirmed_range;

ALTER TABLE public.group_events
ADD CONSTRAINT valid_group_event_confirmed_range
CHECK (
  (
    confirmed_date IS NULL
    AND confirmed_start_time IS NULL
    AND confirmed_end_time IS NULL
  ) OR (
    confirmed_date IS NOT NULL
    AND confirmed_start_time IS NOT NULL
    AND confirmed_end_time IS NOT NULL
    AND confirmed_start_time < confirmed_end_time
  )
);

CREATE OR REPLACE FUNCTION public.get_group_event_public(
  p_slug TEXT,
  p_edit_token_hash TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event public.group_events;
  v_participant public.group_participants;
  v_participant_count INTEGER;
  v_can_view_results BOOLEAN;
BEGIN
  SELECT *
  INTO v_event
  FROM public.group_events
  WHERE slug = p_slug
    AND status = 'active'
  LIMIT 1;

  IF v_event.id IS NULL THEN
    RAISE EXCEPTION 'Group event not found';
  END IF;

  IF p_edit_token_hash IS NOT NULL THEN
    SELECT *
    INTO v_participant
    FROM public.group_participants
    WHERE event_id = v_event.id
      AND edit_token_hash = p_edit_token_hash
    LIMIT 1;
  END IF;

  SELECT COUNT(*)
  INTO v_participant_count
  FROM public.group_participants
  WHERE event_id = v_event.id;

  v_can_view_results := v_event.results_visible OR v_event.organizer_id = auth.uid();

  RETURN jsonb_build_object(
    'id', v_event.id,
    'slug', v_event.slug,
    'title', v_event.title,
    'description', v_event.description,
    'start_date', v_event.start_date,
    'end_date', v_event.end_date,
    'timezone', v_event.timezone,
    'results_visible', v_event.results_visible,
    'can_view_results', v_can_view_results,
    'participant_count', v_participant_count,
    'confirmed_date', v_event.confirmed_date,
    'confirmed_start_time', v_event.confirmed_start_time,
    'confirmed_end_time', v_event.confirmed_end_time,
    'confirmed_title', v_event.confirmed_title,
    'confirmed_notes', v_event.confirmed_notes,
    'confirmed_google_event_url', v_event.confirmed_google_event_url,
    'confirmed_at', v_event.confirmed_at,
    'participant', CASE
      WHEN v_participant.id IS NULL THEN NULL
      ELSE jsonb_build_object(
        'id', v_participant.id,
        'name', v_participant.name
      )
    END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_group_event_public(TEXT, TEXT) TO anon, authenticated;

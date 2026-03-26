CREATE TABLE IF NOT EXISTS public.group_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  results_visible BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_group_event_dates CHECK (start_date <= end_date)
);

CREATE TABLE IF NOT EXISTS public.group_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.group_events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  edit_token_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_group_participant_token UNIQUE (event_id, edit_token_hash)
);

CREATE TABLE IF NOT EXISTS public.group_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.group_events(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.group_participants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_group_availability_time_range CHECK (start_time < end_time),
  CONSTRAINT unique_group_availability_slot UNIQUE (participant_id, date, start_time, end_time)
);

CREATE INDEX IF NOT EXISTS group_events_organizer_id_idx ON public.group_events(organizer_id);
CREATE INDEX IF NOT EXISTS group_events_slug_idx ON public.group_events(slug);
CREATE INDEX IF NOT EXISTS group_participants_event_id_idx ON public.group_participants(event_id);
CREATE INDEX IF NOT EXISTS group_availability_event_id_idx ON public.group_availability(event_id);
CREATE INDEX IF NOT EXISTS group_availability_participant_id_idx ON public.group_availability(participant_id);
CREATE INDEX IF NOT EXISTS group_availability_date_idx ON public.group_availability(date);

ALTER TABLE public.group_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers can view their own group events"
  ON public.group_events FOR SELECT
  USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can insert their own group events"
  ON public.group_events FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their own group events"
  ON public.group_events FOR UPDATE
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their own group events"
  ON public.group_events FOR DELETE
  USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can view their own group participants"
  ON public.group_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.group_events group_event
      WHERE group_event.id = event_id
        AND group_event.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can view their own group availability"
  ON public.group_availability FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.group_events group_event
      WHERE group_event.id = event_id
        AND group_event.organizer_id = auth.uid()
    )
  );

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

CREATE OR REPLACE FUNCTION public.toggle_group_results_visibility(
  p_slug TEXT,
  p_results_visible BOOLEAN
)
RETURNS public.group_events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event public.group_events;
BEGIN
  UPDATE public.group_events
  SET results_visible = p_results_visible,
      updated_at = NOW()
  WHERE slug = p_slug
    AND organizer_id = auth.uid()
  RETURNING * INTO v_event;

  IF v_event.id IS NULL THEN
    RAISE EXCEPTION 'Group event not found';
  END IF;

  RETURN v_event;
END;
$$;

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

CREATE OR REPLACE FUNCTION public.upsert_group_participant(
  p_slug TEXT,
  p_name TEXT,
  p_edit_token_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event public.group_events;
  v_participant public.group_participants;
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

  INSERT INTO public.group_participants (
    event_id,
    name,
    edit_token_hash
  )
  VALUES (
    v_event.id,
    p_name,
    p_edit_token_hash
  )
  ON CONFLICT (event_id, edit_token_hash)
  DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = NOW()
  RETURNING * INTO v_participant;

  RETURN jsonb_build_object(
    'id', v_participant.id,
    'name', v_participant.name
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_group_participant_availability(
  p_slug TEXT,
  p_edit_token_hash TEXT
)
RETURNS TABLE (
  date DATE,
  start_time TIME,
  end_time TIME
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id UUID;
  v_participant_id UUID;
BEGIN
  SELECT id
  INTO v_event_id
  FROM public.group_events
  WHERE slug = p_slug
    AND status = 'active'
  LIMIT 1;

  IF v_event_id IS NULL THEN
    RETURN;
  END IF;

  SELECT id
  INTO v_participant_id
  FROM public.group_participants
  WHERE event_id = v_event_id
    AND edit_token_hash = p_edit_token_hash
  LIMIT 1;

  IF v_participant_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT group_slot.date, group_slot.start_time, group_slot.end_time
  FROM public.group_availability group_slot
  WHERE group_slot.event_id = v_event_id
    AND group_slot.participant_id = v_participant_id
  ORDER BY group_slot.date, group_slot.start_time;
END;
$$;

CREATE OR REPLACE FUNCTION public.replace_group_participant_availability(
  p_slug TEXT,
  p_edit_token_hash TEXT,
  p_entries JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event public.group_events;
  v_participant public.group_participants;
  v_inserted_count INTEGER;
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

  SELECT *
  INTO v_participant
  FROM public.group_participants
  WHERE event_id = v_event.id
    AND edit_token_hash = p_edit_token_hash
  LIMIT 1;

  IF v_participant.id IS NULL THEN
    RAISE EXCEPTION 'Participant not found';
  END IF;

  DELETE FROM public.group_availability
  WHERE event_id = v_event.id
    AND participant_id = v_participant.id;

  INSERT INTO public.group_availability (
    event_id,
    participant_id,
    date,
    start_time,
    end_time
  )
  SELECT
    v_event.id,
    v_participant.id,
    item.date::DATE,
    item.start_time::TIME,
    item.end_time::TIME
  FROM jsonb_to_recordset(COALESCE(p_entries, '[]'::JSONB)) AS item(
    date TEXT,
    start_time TEXT,
    end_time TEXT
  )
  WHERE item.date::DATE BETWEEN v_event.start_date AND v_event.end_date
    AND item.start_time::TIME < item.end_time::TIME;

  GET DIAGNOSTICS v_inserted_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'participant_id', v_participant.id,
    'count', v_inserted_count
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_group_event_submissions(
  p_slug TEXT
)
RETURNS TABLE (
  participant_id UUID,
  participant_name TEXT,
  date DATE,
  start_time TIME,
  end_time TIME
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event public.group_events;
BEGIN
  SELECT *
  INTO v_event
  FROM public.group_events
  WHERE slug = p_slug
    AND status = 'active'
  LIMIT 1;

  IF v_event.id IS NULL THEN
    RETURN;
  END IF;

  IF NOT (v_event.results_visible OR v_event.organizer_id = auth.uid()) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    participant.id,
    participant.name,
    availability.date,
    availability.start_time,
    availability.end_time
  FROM public.group_participants participant
  INNER JOIN public.group_availability availability
    ON availability.participant_id = participant.id
  WHERE participant.event_id = v_event.id
    AND availability.event_id = v_event.id
  ORDER BY availability.date, availability.start_time, participant.name;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_group_event(TEXT, TEXT, DATE, DATE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_group_results_visibility(TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_group_event_public(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_group_participant(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_group_participant_availability(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.replace_group_participant_availability(TEXT, TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_group_event_submissions(TEXT) TO anon, authenticated;

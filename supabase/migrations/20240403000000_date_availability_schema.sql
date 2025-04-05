-- Create date_availability table
CREATE TABLE IF NOT EXISTS public.date_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS date_availability_user_id_idx ON public.date_availability(user_id);
CREATE INDEX IF NOT EXISTS date_availability_date_idx ON public.date_availability(date);

-- Create RLS policies
ALTER TABLE public.date_availability ENABLE ROW LEVEL SECURITY;

-- Date availability policies
CREATE POLICY "Users can view their own date availability"
  ON public.date_availability FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own date availability"
  ON public.date_availability FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own date availability"
  ON public.date_availability FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own date availability"
  ON public.date_availability FOR DELETE
  USING (auth.uid() = user_id);


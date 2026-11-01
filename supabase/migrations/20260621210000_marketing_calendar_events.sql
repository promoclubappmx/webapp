-- Marketing Calendar Events Table
CREATE TABLE IF NOT EXISTS public.marketing_calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_locations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'promo',
  category TEXT NOT NULL DEFAULT 'promotion',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_hour INTEGER DEFAULT 9,
  end_hour INTEGER DEFAULT 18,
  status TEXT NOT NULL DEFAULT 'scheduled',
  description TEXT,
  origin TEXT DEFAULT '/promotions-management',
  metrics JSONB DEFAULT NULL,
  color TEXT,
  is_system_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketing Calendar Templates Table
CREATE TABLE IF NOT EXISTS public.marketing_calendar_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.business_locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  events JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketing Calendar Reminders Table
CREATE TABLE IF NOT EXISTS public.marketing_calendar_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.marketing_calendar_events(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.business_locations(id) ON DELETE CASCADE,
  remind_before_hours INTEGER DEFAULT 24,
  is_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.marketing_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_calendar_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_calendar_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketing_calendar_events' AND policyname = 'marketing_calendar_events_all') THEN
    CREATE POLICY "marketing_calendar_events_all" ON public.marketing_calendar_events FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketing_calendar_templates' AND policyname = 'marketing_calendar_templates_all') THEN
    CREATE POLICY "marketing_calendar_templates_all" ON public.marketing_calendar_templates FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketing_calendar_reminders' AND policyname = 'marketing_calendar_reminders_all') THEN
    CREATE POLICY "marketing_calendar_reminders_all" ON public.marketing_calendar_reminders FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_mce_business_dates ON public.marketing_calendar_events(business_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_mce_status ON public.marketing_calendar_events(status);
CREATE INDEX IF NOT EXISTS idx_mce_type ON public.marketing_calendar_events(type);

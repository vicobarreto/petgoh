
-- Bookings Table (Hospedagem & Services)
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID REFERENCES public.tutors(id),
  partner_id UUID REFERENCES public.partners(id),
  package_id UUID REFERENCES public.packages(id), 
  transaction_id UUID REFERENCES public.transactions(id),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_tutor ON public.bookings(tutor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_partner ON public.bookings(partner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(start_date, end_date);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY bookings_select_own ON public.bookings
  FOR SELECT USING (
    tutor_id IN (SELECT id FROM public.tutors WHERE user_id = auth.uid()) OR
    partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()) OR
    auth.role() = 'service_role'
  );

CREATE POLICY bookings_insert_own ON public.bookings
  FOR INSERT WITH CHECK (
    tutor_id IN (SELECT id FROM public.tutors WHERE user_id = auth.uid())
  );

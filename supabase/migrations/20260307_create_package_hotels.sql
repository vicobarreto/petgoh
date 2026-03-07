-- =============================================
-- Package Hotels & Booking Stays - Migration
-- Execute no Supabase Dashboard > SQL Editor
-- =============================================

-- Tabela de ligação: quais hotéis pertencem a cada pacote
-- Cada pacote pode ter N hotéis, e cada hotel tem seu preço avulso
CREATE TABLE IF NOT EXISTS public.package_hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  avulso_price_per_night DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(package_id, partner_id)
);

-- Reservas de hotel feitas pelo usuário ao comprar um pacote
-- Guarda a distribuição de diárias e datas escolhidas
CREATE TABLE IF NOT EXISTS public.package_booking_stays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_package_id UUID NOT NULL REFERENCES public.user_packages(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES public.partners(id),
  nights INT NOT NULL CHECK (nights > 0 AND nights <= 3),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_package_hotels_package ON public.package_hotels(package_id);
CREATE INDEX IF NOT EXISTS idx_package_hotels_partner ON public.package_hotels(partner_id);
CREATE INDEX IF NOT EXISTS idx_booking_stays_user_pkg ON public.package_booking_stays(user_package_id);

-- Enable RLS
ALTER TABLE public.package_hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_booking_stays ENABLE ROW LEVEL SECURITY;

-- package_hotels: leitura pública (qualquer um pode ver quais hotéis tem no pacote)
CREATE POLICY "Anyone can view package hotels" ON public.package_hotels
  FOR SELECT USING (true);

-- package_hotels: apenas admin pode inserir/atualizar/deletar
CREATE POLICY "Admin can manage package hotels" ON public.package_hotels
  FOR ALL USING (auth.role() = 'service_role');

-- package_booking_stays: usuário vê apenas suas reservas
CREATE POLICY "Users can view own booking stays" ON public.package_booking_stays
  FOR SELECT USING (
    user_package_id IN (
      SELECT id FROM public.user_packages WHERE user_id = auth.uid()
    )
  );

-- package_booking_stays: usuário pode inserir suas reservas
CREATE POLICY "Users can insert own booking stays" ON public.package_booking_stays
  FOR INSERT WITH CHECK (
    user_package_id IN (
      SELECT id FROM public.user_packages WHERE user_id = auth.uid()
    )
  );

-- =============================================
-- Carrinho de Compras - Migração SQL
-- Execute isso no Supabase Dashboard > SQL Editor
-- =============================================

-- Cart Items: armazena o carrinho ativo de cada usuário
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, package_id)
);

-- Cart History: armazena itens removidos para "deseja voltar a comprar?"
CREATE TABLE IF NOT EXISTS public.cart_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  removed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_history ENABLE ROW LEVEL SECURITY;

-- Políticas para cart_items
CREATE POLICY "Users can view own cart items" ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" ON public.cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" ON public.cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" ON public.cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para cart_history
CREATE POLICY "Users can view own cart history" ON public.cart_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart history" ON public.cart_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart history" ON public.cart_history
  FOR DELETE USING (auth.uid() = user_id);

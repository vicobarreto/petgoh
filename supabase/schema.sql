-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- CORE TABLES (Reconstructed & Reordered)
-- ============================================

-- Users (Base table for Auth/Roles)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('tutor', 'partner', 'admin')),
  full_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partners
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id),
  company_name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20),
  email VARCHAR(255),
  stripe_account_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  custom_commission_rate DECIMAL(5,2),
  rating DECIMAL(3,2) DEFAULT 0,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tutors
CREATE TABLE public.tutors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id),
  full_name VARCHAR(255),
  phone VARCHAR(20),
  loyalty_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pets
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID REFERENCES public.tutors(id),
  name VARCHAR(255) NOT NULL,
  breed VARCHAR(100),
  age VARCHAR(20),
  gender VARCHAR(20),
  weight VARCHAR(20),
  chip_id VARCHAR(100),
  image_url TEXT,
  color VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Packages
CREATE TABLE public.packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES public.partners(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    validity_days INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions (from Split doc)
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID REFERENCES public.tutors(id),
  total_amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  final_amount DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending',
  payment_gateway VARCHAR(50) DEFAULT 'stripe',
  gateway_transaction_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Transaction Splits (from Split doc)
CREATE TABLE public.transaction_splits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES public.partners(id),
  gross_amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  platform_fee_rate DECIMAL(5,2) NOT NULL,
  net_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  gateway_transfer_id VARCHAR(255),
  transferred_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction Items
CREATE TABLE public.transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES public.transactions(id),
    package_id UUID REFERENCES public.packages(id),
    partner_id UUID REFERENCES public.partners(id), -- added for context
    quantity INTEGER,
    amount DECIMAL(10,2)
);

-- Tutor Packages
CREATE TABLE public.tutor_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES public.tutors(id),
    package_id UUID REFERENCES public.packages(id),
    transaction_id UUID REFERENCES public.transactions(id),
    partner_id UUID REFERENCES public.partners(id),
    total_units INTEGER,
    used_units INTEGER DEFAULT 0,
    valid_until DATE,
    purchase_code VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reminders
CREATE TABLE public.reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES public.tutors(id),
    pet_id UUID REFERENCES public.pets(id),
    title VARCHAR(255),
    remind_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loyalty Points History (The broken table from PRD start)
CREATE TABLE public.loyalty_points_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES public.tutors(id),
    transaction_id UUID REFERENCES public.transactions(id),
    points INTEGER NOT NULL,
    transaction_type VARCHAR(20),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PRD TABLES (From PRD File)
-- ============================================

CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  reward_type VARCHAR(50),
  reward_value JSONB,
  stock_quantity INTEGER,
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.reward_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID REFERENCES public.tutors(id),
  reward_id UUID REFERENCES public.rewards(id),
  points_spent INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  redemption_code VARCHAR(50) UNIQUE,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.quotation_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID REFERENCES public.tutors(id),
  product_name VARCHAR(255) NOT NULL,
  product_category VARCHAR(100),
  specifications TEXT,
  preferred_brands JSONB,
  quantity INTEGER DEFAULT 1,
  frequency VARCHAR(20),
  last_quotation_date DATE,
  next_quotation_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.quotation_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.quotation_products(id),
  quotation_date DATE NOT NULL,
  partner_quotes JSONB,
  best_price DECIMAL(10,2),
  best_partner_id UUID REFERENCES public.partners(id),
  sent_to_tutor BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES public.partners(id),
  category VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2),
  stock_quantity INTEGER DEFAULT 0,
  sku VARCHAR(100),
  brand VARCHAR(100),
  specifications JSONB,
  images JSONB,
  loyalty_points INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20),
  discount_value DECIMAL(10,2) NOT NULL,
  min_purchase_amount DECIMAL(10,2),
  max_discount_amount DECIMAL(10,2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  applicable_to JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.giveaways (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  prize_description TEXT NOT NULL,
  prize_value DECIMAL(10,2),
  entry_requirements JSONB,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  draw_date TIMESTAMP WITH TIME ZONE NOT NULL,
  winner_id UUID REFERENCES public.tutors(id),
  winner_selected_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'upcoming',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.wall_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID REFERENCES public.tutors(id),
  post_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  contact_info JSONB,
  location JSONB,
  images JSONB,
  status VARCHAR(20) DEFAULT 'pending',
  moderated_by UUID REFERENCES public.users(id),
  moderated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES public.users(id),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  category VARCHAR(100),
  tags JSONB,
  seo_meta JSONB,
  status VARCHAR(20) DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.pet_friendly_places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  place_type VARCHAR(50),
  description TEXT,
  address JSONB NOT NULL,
  coordinates GEOGRAPHY(POINT),
  contact_info JSONB,
  amenities JSONB,
  pet_rules TEXT,
  photos JSONB,
  website VARCHAR(255),
  rating DECIMAL(3,2),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_for VARCHAR(20) NOT NULL, -- 'tutor' or 'partner'
  name VARCHAR(100) NOT NULL,
  description TEXT,
  plan_type VARCHAR(20),
  price DECIMAL(10,2) NOT NULL,
  benefits JSONB NOT NULL,
  commission_rate DECIMAL(5,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id),
  plan_id UUID REFERENCES public.subscription_plans(id),
  status VARCHAR(20) DEFAULT 'active',
  stripe_subscription_id VARCHAR(255),
  current_period_start DATE NOT NULL,
  current_period_end DATE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_transactions_tutor ON public.transactions(tutor_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_created ON public.transactions(created_at DESC);
CREATE INDEX idx_tutor_packages_tutor ON public.tutor_packages(tutor_id);
CREATE INDEX idx_tutor_packages_status ON public.tutor_packages(status);
CREATE INDEX idx_pets_tutor ON public.pets(tutor_id);
CREATE INDEX idx_reminders_date ON public.reminders(remind_date);
CREATE INDEX idx_reminders_status ON public.reminders(status);
CREATE INDEX idx_quotation_next_date ON public.quotation_products(next_quotation_date);
CREATE INDEX idx_pet_friendly_coords ON public.pet_friendly_places USING GIST (coordinates);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policies for tutors (can only see their own data)
CREATE POLICY tutors_select_own ON public.tutors
  FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE email = auth.jwt() ->> 'email')); -- Simplified for now, assume email match or id match

-- Policies for partners
CREATE POLICY partners_select_own ON public.partners
  FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE email = auth.jwt() ->> 'email'));

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update loyalty points
CREATE OR REPLACE FUNCTION update_loyalty_points(
  p_tutor_id UUID,
  p_points_to_add INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.tutors
  SET loyalty_points = loyalty_points + p_points_to_add
  WHERE id = p_tutor_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate package expiry
CREATE OR REPLACE FUNCTION calculate_package_expiry(
  p_package_id UUID,
  p_purchase_date DATE
)
RETURNS DATE AS $$
DECLARE
  v_validity_days INTEGER;
BEGIN
  SELECT validity_days INTO v_validity_days
  FROM public.packages
  WHERE id = p_package_id;
  
  RETURN p_purchase_date + v_validity_days;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

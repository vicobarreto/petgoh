-- =============================================
-- Phase 2 Schema: Admin Panel New Features
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Blog Management
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT,
    excerpt TEXT,
    featured_image TEXT,
    category TEXT,
    tags TEXT[],
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    author_id UUID REFERENCES public.users(id),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published posts" ON public.blog_posts
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all posts" ON public.blog_posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'support')
        )
    );

-- Blog Images Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view blog images" ON storage.objects
    FOR SELECT USING (bucket_id = 'blog-images');

CREATE POLICY "Admins can upload blog images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'blog-images' AND
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'support')
        )
    );

-- 2. Pet Friendly Places
CREATE TABLE IF NOT EXISTS public.pet_friendly_places (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT, -- Hotel, Restaurant, Park, etc.
    description TEXT,
    address JSONB, -- { street, city, state, zip, lat, lng }
    images TEXT[],
    website TEXT,
    phone TEXT,
    rules TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.pet_friendly_places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view places" ON public.pet_friendly_places
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage places" ON public.pet_friendly_places
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'support')
        )
    );

-- Place Photos Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('place-photos', 'place-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view place photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'place-photos');

CREATE POLICY "Admins can upload place photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'place-photos' AND
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'support')
        )
    );

-- 3. Subscription Plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    interval TEXT DEFAULT 'month' CHECK (interval IN ('month', 'year')),
    benefits JSONB,
    target_role TEXT CHECK (target_role IN ('tutor', 'partner')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active plans" ON public.subscription_plans
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage plans" ON public.subscription_plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'support')
        )
    );

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    plan_id UUID REFERENCES public.subscription_plans(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins manage subscriptions" ON public.subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'support')
        )
    );

-- 4. Reward Management (Loyalty)
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    points_cost INTEGER NOT NULL,
    type TEXT, -- 'product', 'discount', 'service'
    value DECIMAL(10, 2), -- monetary value if applicable
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view active rewards" ON public.rewards
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins manage rewards" ON public.rewards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'support')
        )
    );

CREATE TABLE IF NOT EXISTS public.reward_redemptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    reward_id UUID REFERENCES public.rewards(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'delivered')),
    points_spent INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own redemptions" ON public.reward_redemptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins manage redemptions" ON public.reward_redemptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'support')
        )
    );

-- Reward Images Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('reward-images', 'reward-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public view reward images" ON storage.objects
    FOR SELECT USING (bucket_id = 'reward-images');

CREATE POLICY "Admins upload reward images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'reward-images' AND EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('admin', 'support')));

-- 5. Lost Pets
CREATE TABLE IF NOT EXISTS public.lost_pets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    pet_name TEXT,
    description TEXT,
    last_seen_location JSONB,
    last_seen_date TIMESTAMP WITH TIME ZONE,
    contact_phone TEXT,
    status TEXT DEFAULT 'lost' CHECK (status IN ('lost', 'found', 'archived')),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.lost_pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view lost pets" ON public.lost_pets
    FOR SELECT USING (true);

CREATE POLICY "Users manage own lost pets" ON public.lost_pets
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins manage all lost pets" ON public.lost_pets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'support')
        )
    );

-- 6. Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    partner_id UUID REFERENCES public.partners(id),
    service_id UUID, -- Optional link to a service/package
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'canceled', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Partners view own bookings" ON public.bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.partners 
            WHERE partners.owner_id = auth.uid()
            AND partners.id = bookings.partner_id
        )
    );

CREATE POLICY "Admins manage all bookings" ON public.bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'support')
        )
    );

-- 7. Products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2),
    stock INTEGER DEFAULT 0,
    sku TEXT,
    brand TEXT,
    category TEXT,
    images JSONB, -- Array of strings
    specifications JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view active products" ON public.products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins manage products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'support')
        )
    );

-- Product Media Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-media', 'product-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public view product media" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-media');

CREATE POLICY "Admins upload product media" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'product-media' AND EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('admin', 'support')));

-- 8. Vouchers
CREATE TABLE IF NOT EXISTS public.vouchers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES public.users(id),
    promotion_id UUID REFERENCES public.coupons(id), -- Assuming coupons table exists from Phase 1
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired')),
    redeemed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own vouchers" ON public.vouchers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins manage vouchers" ON public.vouchers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'support')
        )
    );

-- 9. Notification Center
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    target_role TEXT DEFAULT 'all', -- 'all', 'tutor', 'partner'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id)
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view notifications" ON public.admin_notifications
    FOR SELECT USING (true); -- Filter by role in frontend or add complex RLS

CREATE POLICY "Admins manage notifications" ON public.admin_notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'support')
        )
    );

_generate_v4(),
  tutor_id UUID REFERENCES public.tutors(id),
  transaction_id UUID REFERENCES public.transactions(id),
  points INTEGER NOT NULL,
  transaction_type VARCHAR(20),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- ============================================
-- QUOTATION CLUB
-- ============================================

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

-- ============================================
-- E-COMMERCE
-- ============================================

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

-- ============================================
-- PROMOTIONS & COUPONS
-- ============================================

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

-- ============================================
-- CONTENT & COMMUNITY
-- ============================================

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

-- ============================================
-- SUBSCRIPTIONS
-- ============================================

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
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY tutors_update_own ON public.tutors
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY pets_select_own ON public.pets
  FOR SELECT USING (
    tutor_id IN (SELECT id FROM public.tutors WHERE auth.uid() = id)
  );

-- Policies for partners
CREATE POLICY partners_select_own ON public.partners
  FOR SELECT USING (auth.uid() = id);

-- Policies for transactions
CREATE POLICY transactions_select_tutor ON public.transactions
  FOR SELECT USING (
    tutor_id IN (SELECT id FROM public.tutors WHERE auth.uid() = id)
  );

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

-- ============================================
-- VIEWS
-- ============================================

-- View for transaction summary
CREATE OR REPLACE VIEW transaction_summary AS
SELECT 
  t.id,
  t.tutor_id,
  tu.full_name as tutor_name,
  t.total_amount,
  t.platform_fee,
  t.final_amount,
  t.status,
  t.created_at,
  COUNT(ti.id) as items_count,
  json_agg(
    json_build_object(
      'partner_id', p.id,
      'partner_name', p.company_name,
      'amount', ts.gross_amount
    )
  ) as splits
FROM public.transactions t
LEFT JOIN public.tutors tu ON t.tutor_id = tu.id
LEFT JOIN public.transaction_items ti ON t.id = ti.transaction_id
LEFT JOIN public.transaction_splits ts ON t.id = ts.transaction_id
LEFT JOIN public.partners p ON ts.partner_id = p.id
GROUP BY t.id, tu.full_name;

-- View for package usage stats
CREATE OR REPLACE VIEW package_usage_stats AS
SELECT 
  tp.id,
  tp.tutor_id,
  tp.package_id,
  pkg.name as package_name,
  tp.total_units,
  tp.used_units,
  tp.remaining_units,
  tp.valid_until,
  tp.status,
  CASE 
    WHEN tp.valid_until < CURRENT_DATE THEN 'expired'
    WHEN tp.remaining_units = 0 THEN 'exhausted'
    WHEN tp.valid_until - CURRENT_DATE <= 7 THEN 'expiring_soon'
    ELSE 'active'
  END as usage_status
FROM public.tutor_packages tp
JOIN public.packages pkg ON tp.package_id = pkg.id;
```

---

## 6. SEGURANÇA E COMPLIANCE

### 6.1 Autenticação e Autorização

**JWT Strategy:**
```typescript
// Payload do JWT
interface JWTPayload {
  sub: string;        // user_id
  email: string;
  role: 'tutor' | 'partner' | 'admin';
  iat: number;        // issued at
  exp: number;        // expiration
}

// Middleware de autenticação
async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar se token está na blacklist (logout)
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token invalidated' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Middleware de role
function requireRole(...roles: string[]) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
```

### 6.2 LGPD Compliance

**Dados Pessoais:**
- Consentimento explícito no cadastro
- Política de privacidade clara
- Direito ao esquecimento (delete account)
- Portabilidade de dados
- Logs de acesso

**Implementação:**
```typescript
// Service de LGPD
class LGPDService {
  async requestDataDeletion(userId: string): Promise<void> {
    // 1. Anonimizar dados sensíveis
    await this.anonymizeSensitiveData(userId);
    
    // 2. Soft delete (manter transações por lei)
    await this.softDeleteUser(userId);
    
    // 3. Notificar parceiros
    await this.notifyPartners(userId);
    
    // 4. Log de auditoria
    await this.logDeletion(userId);
  }
  
  async exportUserData(userId: string): Promise<object> {
    // Coletar todos dados do usuário
    const data = {
      profile: await this.getUserProfile(userId),
      pets: await this.getUserPets(userId),
      purchases: await this.getUserPurchases(userId),
      loyalty: await this.getUserLoyalty(userId),
      preferences: await this.getUserPreferences(userId)
    };
    
    return data;
  }
}
```

### 6.3 PCI DSS Compliance

**Cartões de Crédito:**
- **NUNCA armazenar dados de cartão**
- Usar Stripe Elements (PCI compliant)
- Tokens únicos por transação
- 3D Secure quando disponível

**Boas Práticas:**
```typescript
// ❌ NUNCA FAZER ISSO
interface BadPayment {
  card_number: string;    // NUNCA
  cvv: string;            // NUNCA
  expiry: string;         // NUNCA
}

// ✅ CORRETO
interface GoodPayment {
  payment_method_id: string;  // Token do Stripe
  amount: number;
  currency: string;
}
```

### 6.4 Rate Limiting

```typescript
// Rate limit por endpoint
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests
  message: 'Too many requests'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // apenas 5 tentativas de login
  message: 'Too many login attempts'
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
```

---

## 7. MONITORAMENTO E OBSERVABILIDADE

### 7.1 Logging

**Estrutura de Logs:**
```typescript
// Winston logger
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'petgoh-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Logs estruturados
logger.info('Purchase completed', {
  transaction_id: 'abc123',
  tutor_id: 'user123',
  amount: 150.00,
  items_count: 3
});
```

### 7.2 Error Tracking

**Sentry Integration:**
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

// Error middleware
app.use((err, req, res, next) => {
  Sentry.captureException(err, {
    user: {
      id: req.user?.id,
      email: req.user?.email
    },
    extra: {
      body: req.body,
      params: req.params
    }
  });
  
  res.status(500).json({ error: 'Internal server error' });
});
```

### 7.3 Métricas

**Prometheus + Grafana:**
```typescript
import promClient from 'prom-client';

// Criar métricas customizadas
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const purchaseCounter = new promClient.Counter({
  name: 'purchases_total',
  help: 'Total number of purchases',
  labelNames: ['package_type']
});

// Middleware de métricas
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path, res.statusCode)
      .observe(duration);
  });
  
  next();
});

// Endpoint de métricas
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
```

### 7.4 Health Checks

```typescript
app.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'ok',
    checks: {
      database: 'ok',
      redis: 'ok',
      stripe: 'ok'
    }
  };
  
  try {
    // Check database
    await supabase.from('users').select('id').limit(1);
  } catch (error) {
    health.checks.database = 'error';
    health.status = 'degraded';
  }
  
  try {
    // Check Redis
    await redis.ping();
  } catch (error) {
    health.checks.redis = 'error';
    health.status = 'degraded';
  }
  
  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

---

## 8. PLANO DE DEPLOY

### 8.1 Ambientes

```yaml
# Estrutura de ambientes
environments:
  - name: development
    url: https://dev.petgoh.com
    database: dev-petgoh
    auto_deploy: true
    branch: develop
    
  - name: staging
    url: https://staging.petgoh.com
    database: staging-petgoh
    auto_deploy: true
    branch: main
    requires_approval: true
    
  - name: production
    url: https://app.petgoh.com
    database: prod-petgoh
    auto_deploy: false
    manual_deploy: true
    requires_approval: true
```

### 8.2 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build application
        run: npm run build
      
      - name: Build Docker image
        run: docker build -t petgoh-api:${{ github.sha }} .
      
      - name: Push to registry
        run: docker push petgoh-api:${{ github.sha }}

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to staging
        run: |
          kubectl set image deployment/petgoh-api \
            petgoh-api=petgoh-api:${{ github.sha }} \
            --namespace=staging
      
      - name: Run migrations
        run: npm run migrate:staging
      
      - name: Smoke tests
        run: npm run test:smoke -- --env=staging

  deploy-production:
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to production
        run: |
          kubectl set image deployment/petgoh-api \
            petgoh-api=petgoh-api:${{ github.sha }} \
            --namespace=production
      
      - name: Run migrations
        run: npm run migrate:production
      
      - name: Health check
        run: curl https://app.petgoh.com/health
      
      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment completed!'
```

### 8.3 Database Migrations

```typescript
// migrations/001_initial_schema.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary();
    table.string('email').unique().notNullable();
    table.string('role').notNullable();
    table.timestamps(true, true);
  });
  
  // ... mais tabelas
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users');
}
```

### 8.4 Rollback Strategy

```bash
# Script de rollback
#!/bin/bash

PREVIOUS_VERSION=$1

if [ -z "$PREVIOUS_VERSION" ]; then
  echo "Usage: ./rollback.sh <previous_version>"
  exit 1
fi

echo "Rolling back to version $PREVIOUS_VERSION..."

# 1. Reverter deployment
kubectl rollout undo deployment/petgoh-api -n production

# 2. Reverter migrations (se necessário)
npm run migrate:rollback --env=production

# 3. Clear cache
redis-cli FLUSHALL

# 4. Health check
curl https://app.petgoh.com/health

echo "Rollback completed!"
```

---

## 9. CUSTOS E INFRAESTRUTURA

### 9.1 Estimativa de Custos Mensais

**Fase 1 (MVP - 0-1k usuários):**
```
Antigravity (Servidor VPS 4GB RAM, 2 vCPU)   $ 50
Supabase (Pro Plan)                           $ 25
Redis (Upstash 1GB)                           $ 10
Stripe (sem custo fixo, apenas %)             $ 0
SendGrid (Essentials 100k emails)             $ 20
WhatsApp Business API (1k conversas)          $ 15
Sentry (Team Plan)                            $ 26
CDN (CloudFlare Pro)                          $ 20
Total                                         $ 166/mês
```

**Fase 2 (Crescimento - 1k-10k usuários):**
```
Antigravity (Servidor 8GB RAM, 4 vCPU)        $ 100
Supabase (Pro Plan + extras)                  $ 75
Redis (Upstash 5GB)                           $ 40
Stripe (variável)                             $ 0
SendGrid (Pro 1M emails)                      $ 90
WhatsApp Business API (10k conversas)         $ 150
Sentry (Business Plan)                        $ 89
CDN (CloudFlare Pro)                          $ 20
Backup & Storage                              $ 30
Total                                         $ 594/mês
```

**Fase 3 (Escala - 10k+ usuários):**
```
Antigravity (Múltiplos servidores + LB)       $ 400
Supabase (Team Plan)                          $ 599
Redis (Dedicated 10GB)                        $ 200
Stripe (variável)                             $ 0
SendGrid (Premier)                            $ 450
WhatsApp Business API (50k+ conversas)        $ 750
Sentry (Enterprise)                           $ 299
CDN (CloudFlare Business)                     $ 200
Backup & Storage                              $ 100
Monitoring (Grafana Cloud)                    $ 50
Total                                         $ 3,048/mês
```

### 9.2 Projeção de Receita vs Custos

**Ano 1:**
```
Mês 1-3 (MVP):
- Usuários: 500
- GMV: R$ 50k
- Receita Platform Fee (15%): R$ 7.5k
- Custos Infra: R$ 800 ($ 166 × 4.8)
- Margem: R$ 6.7k
- Status: Breakeven alcançado

Mês 4-6 (Crescimento):
- Usuários: 2k
- GMV: R$ 200k
- Receita: R$ 30k
- Custos: R$ 2.9k ($ 594 × 4.9)
- Margem: R$ 27.1k
- Status: Lucro operacional

Mês 7-12 (Expansão):
- Usuários: 5k
- GMV: R$ 500k
- Receita: R$ 75k
- Custos: R$ 15k
- Margem: R$ 60k
- Status: Escala positiva
```

---

## 10. RISCOS E MITIGAÇÃO

### 10.1 Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Falha no split de pagamento** | Média | Alto | - Sistema de retry automático<br>- Logs detalhados<br>- Alertas em tempo real<br>- Reconciliação diária |
| **Downtime do Supabase** | Baixa | Alto | - Backup diário automático<br>- Réplicas read-only<br>- Cache em Redis<br>- Plano de contingência |
| **Sobrecarga de automações** | Média | Médio | - Rate limiting<br>- Queue system (BullMQ)<br>- Processamento assíncrono<br>- Monitoramento de filas |
| **Vazamento de dados** | Baixa | Muito Alto | - RLS no Supabase<br>- Criptografia end-to-end<br>- Auditorias regulares<br>- Penetration testing |

### 10.2 Riscos de Negócio

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Baixa adesão de parceiros** | Média | Alto | - Programa de incentivo inicial<br>- Comissão reduzida primeiros 3 meses<br>- Onboarding assistido<br>- Marketing direcionado |
| **Churn alto de tutores** | Média | Alto | - Programa de fidelidade agressivo<br>- Notificações inteligentes<br>- Previsão de churn com IA<br>- Campanhas de retenção |
| **Concorrência** | Alta | Médio | - Diferenciação (split, automação)<br>- Velocidade de inovação<br>- Foco em UX superior<br>- Network effects |

### 10.3 Plano de Contingência

**Cenário 1: Falha total do Supabase**
```
1. Ativar réplica do PostgreSQL (em 5 min)
2. Redirecionar tráfego para réplica
3. Modo degradado: desabilitar features não-críticas
4. Comunicar usuários (status page)
5. Restaurar do backup mais recente
6. Validar integridade dos dados
7. Retomar operação normal
Tempo total: 30-60 minutos
```

**Cenário 2: Problema no Gateway de Pagamento**
```
1. Detectar falha via webhook timeout
2. Ativar gateway secundário (Pagar.me)
3. Redirecionar novos checkouts
4. Reprocessar transações pendentes
5. Reconciliação manual se necessário
Tempo total: 15-30 minutos
```

---

## CONCLUSÃO

Este PRD apresenta um roadmap completo e detalhado para o desenvolvimento do PetGoH na stack Antigravity + Supabase. O projeto está estruturado em 7 fases principais ao longo de aproximadamente 40 sprints (80 semanas / 20 meses).

**Principais Diferenciais da Arquitetura:**
1. **Modular e Escalável** - Cada módulo pode evoluir independentemente
2. **Split de Pagamento Nativo** - Core do negócio implementado corretamente desde o início
3. **Automações Inteligentes** - IA e workers automáticos aumentam valor percebido
4. **Observabilidade** - Monitoramento completo desde o MVP
5. **Segurança** - LGPD, PCI DSS, RLS implementados por design

**Próximos Passos:**
1. Aprovação do PRD por stakeholders
2. Setup da Fase 0 (infraestrutura)
3. Início do desenvolvimento da Fase 1
4. Sprints quinzenais com demos
5. Beta fechado após Fase 1
6. Lançamento público após Fase 2

---

**Documento elaborado por:** Equipe de Produto PetGoH  
**Última atualização:** Fevereiro 2026  
**Versão:** 1.0  
**Status:** Draft para Aprovação

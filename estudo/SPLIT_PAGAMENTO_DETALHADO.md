# PETGOH - SISTEMA DE SPLIT DE PAGAMENTO
## Documentação Técnica Detalhada

**Versão:** 1.0  
**Plataforma:** Antigravity + Supabase + Stripe Connect  
**Autor:** Time de Engenharia PetGoH

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Split](#arquitetura-do-split)
3. [Fluxo Completo](#fluxo-completo)
4. [Implementação Stripe Connect](#implementação-stripe-connect)
5. [Database Schema](#database-schema)
6. [APIs e Endpoints](#apis-e-endpoints)
7. [Webhooks](#webhooks)
8. [Casos de Uso](#casos-de-uso)
9. [Tratamento de Erros](#tratamento-de-erros)
10. [Reconciliação](#reconciliação)
11. [Testes](#testes)

---

## 1. VISÃO GERAL

### O que é Split de Pagamento?

Split de pagamento é um sistema que divide automaticamente o valor de uma transação entre múltiplos recebedores no momento da compra.

**No PetGoH:**
- Tutor compra pacote com serviços de múltiplos parceiros
- Pagamento é processado em uma única transação
- Cada parceiro recebe sua parte **diretamente** em sua conta
- PetGoH recebe sua taxa de plataforma

### Por que é Importante?

✅ **Transparência:** Parceiro vê exatamente quanto vai receber  
✅ **Imediatismo:** Recebimento no mesmo dia (D+0 ou D+1)  
✅ **Confiança:** PetGoH não "segura" dinheiro de terceiros  
✅ **Compliance:** Menos risco legal e contábil  
✅ **Automação:** Sem necessidade de transferências manuais  

---

## 2. ARQUITETURA DO SPLIT

### Componentes

```
┌─────────────────────────────────────────────────┐
│               FRONTEND (Next.js)                │
│  - Carrinho multi-parceiro                      │
│  - Stripe Elements (PCI compliant)              │
│  - Confirmação visual                           │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│            API CORE (Node.js)                   │
│  - Cálculo de splits                            │
│  - Validações de negócio                        │
│  - Orquestração do processo                     │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│           STRIPE CONNECT                        │
│  - PaymentIntent (cobrança do tutor)            │
│  - Transfers (repasse aos parceiros)            │
│  - Webhooks (confirmações)                      │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│         CONTAS BANCÁRIAS                        │
│  - Conta do Parceiro A                          │
│  - Conta do Parceiro B                          │
│  - Conta do PetGoH                              │
└─────────────────────────────────────────────────┘
```

### Fluxo de Dinheiro

```
Tutor paga R$ 480
        │
        ▼
┌─────────────────┐
│  Stripe (temp)  │
└────────┬────────┘
         │
         ├──→ R$ 163,20 → Parceiro A
         ├──→ R$ 244,80 → Parceiro B
         └──→ R$ 72,00  → PetGoH (taxa 15%)
```

---

## 3. FLUXO COMPLETO

### Passo a Passo Detalhado

#### **FASE 1: Carrinho**

```typescript
// Estado do carrinho
interface CartState {
  items: [
    {
      packageId: 'pkg_001',
      packageName: 'Hospedagem 5 diárias',
      packagePrice: 480.00,
      partnerSelections: [
        { partnerId: 'partner_A', quantity: 2, unitPrice: 96 },  // R$ 192
        { partnerId: 'partner_B', quantity: 3, unitPrice: 96 }   // R$ 288
      ]
    }
  ],
  total: 480.00
}
```

#### **FASE 2: Checkout Iniciado**

```typescript
// Frontend chama API
const response = await fetch('/api/checkout/create', {
  method: 'POST',
  body: JSON.stringify({
    tutorId: 'tutor_123',
    items: cartState.items
  })
});

// API responde com client_secret para Stripe Elements
{
  clientSecret: 'pi_xxx_secret_yyy',
  transactionId: 'txn_abc123'
}
```

#### **FASE 3: Cálculo de Splits (Backend)**

```typescript
// src/services/split-calculator.service.ts

interface SplitItem {
  partnerId: string;
  partnerName: string;
  grossAmount: number;      // Valor bruto que o parceiro vendeu
  platformFeeRate: number;  // Taxa da plataforma (%)
  platformFee: number;      // Valor da taxa
  netAmount: number;        // Valor líquido que o parceiro recebe
}

class SplitCalculatorService {
  private DEFAULT_PLATFORM_FEE_RATE = 0.15; // 15%
  
  async calculateSplits(cartItems: CartItem[]): Promise<SplitItem[]> {
    const splits: SplitItem[] = [];
    
    for (const item of cartItems) {
      for (const selection of item.partnerSelections) {
        // Buscar taxa customizada do parceiro (se houver)
        const partner = await this.getPartner(selection.partnerId);
        const feeRate = partner.customCommissionRate || this.DEFAULT_PLATFORM_FEE_RATE;
        
        // Calcular valores
        const grossAmount = selection.quantity * selection.unitPrice;
        const platformFee = grossAmount * feeRate;
        const netAmount = grossAmount - platformFee;
        
        splits.push({
          partnerId: selection.partnerId,
          partnerName: partner.company_name,
          grossAmount,
          platformFeeRate: feeRate,
          platformFee,
          netAmount
        });
      }
    }
    
    return splits;
  }
  
  getTotalAmount(splits: SplitItem[]): number {
    return splits.reduce((sum, split) => sum + split.grossAmount, 0);
  }
  
  getTotalPlatformFee(splits: SplitItem[]): number {
    return splits.reduce((sum, split) => sum + split.platformFee, 0);
  }
}
```

#### **FASE 4: Criar PaymentIntent**

```typescript
// src/services/payment.service.ts

class PaymentService {
  async createPaymentIntent(
    tutorId: string,
    splits: SplitItem[],
    transactionId: string
  ): Promise<Stripe.PaymentIntent> {
    
    const totalAmount = this.calculator.getTotalAmount(splits);
    
    // Criar PaymentIntent no Stripe
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Converter para centavos
      currency: 'brl',
      
      // Associar ao tutor (se já for customer)
      customer: await this.getTutorStripeCustomerId(tutorId),
      
      // Metadata para rastreamento
      metadata: {
        transaction_id: transactionId,
        tutor_id: tutorId,
        platform: 'petgoh'
      },
      
      // Descrição
      description: `Compra PetGoH - Transação ${transactionId}`,
      
      // Configurações adicionais
      capture_method: 'automatic',
      confirmation_method: 'automatic',
      
      // Métodos de pagamento aceitos
      payment_method_types: ['card']
    });
    
    return paymentIntent;
  }
}
```

#### **FASE 5: Confirmar Pagamento (Frontend)**

```typescript
// Frontend - usando Stripe Elements
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    // Confirmar pagamento
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: tutorName,
            email: tutorEmail,
          }
        }
      }
    );
    
    if (error) {
      // Mostrar erro
      setError(error.message);
    } else if (paymentIntent.status === 'succeeded') {
      // Pagamento confirmado!
      router.push(`/confirmacao/${transactionId}`);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>
        Pagar R$ {total.toFixed(2)}
      </button>
    </form>
  );
};
```

#### **FASE 6: Webhook - Pagamento Confirmado**

```typescript
// src/controllers/webhook.controller.ts

router.post('/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    // Verificar assinatura do webhook
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Processar evento
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
      
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
      
    case 'transfer.created':
      await handleTransferCreated(event.data.object);
      break;
      
    case 'transfer.failed':
      await handleTransferFailed(event.data.object);
      break;
  }
  
  res.json({ received: true });
});

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const transactionId = paymentIntent.metadata.transaction_id;
  
  console.log(`✅ Pagamento confirmado: ${transactionId}`);
  
  // 1. Atualizar status da transação
  await db.query(
    `UPDATE transactions 
     SET status = 'completed', 
         paid_at = NOW(),
         gateway_transaction_id = $1
     WHERE id = $2`,
    [paymentIntent.id, transactionId]
  );
  
  // 2. Executar splits (transferir para parceiros)
  await executeSplits(transactionId);
  
  // 3. Criar registros de pacotes adquiridos
  await createTutorPackages(transactionId);
  
  // 4. Adicionar pontos de fidelidade
  await addLoyaltyPoints(transactionId);
  
  // 5. Enviar e-mail de confirmação
  await sendPurchaseConfirmationEmail(transactionId);
  
  // 6. Notificar parceiros
  await notifyPartners(transactionId);
}
```

#### **FASE 7: Executar Splits**

```typescript
// src/services/split-executor.service.ts

class SplitExecutorService {
  async executeSplits(transactionId: string): Promise<void> {
    // Buscar splits pendentes desta transação
    const splits = await db.query(
      `SELECT s.*, p.stripe_account_id, p.company_name
       FROM transaction_splits s
       JOIN partners p ON s.partner_id = p.id
       WHERE s.transaction_id = $1 
         AND s.status = 'pending'`,
      [transactionId]
    );
    
    for (const split of splits.rows) {
      try {
        await this.executeSingleSplit(split);
      } catch (error) {
        // Log erro mas continua com próximos
        await this.logSplitError(split.id, error);
      }
    }
  }
  
  private async executeSingleSplit(split: SplitRecord): Promise<void> {
    // Validar conta Stripe do parceiro
    if (!split.stripe_account_id) {
      throw new Error(`Parceiro ${split.partner_id} não tem conta Stripe conectada`);
    }
    
    // Criar transfer no Stripe
    const transfer = await this.stripe.transfers.create({
      amount: Math.round(split.net_amount * 100), // Centavos
      currency: 'brl',
      destination: split.stripe_account_id,
      
      // Metadata
      metadata: {
        transaction_id: split.transaction_id,
        partner_id: split.partner_id,
        partner_name: split.company_name
      },
      
      // Descrição
      description: `PetGoH - Venda ${split.transaction_id.substring(0, 8)}`
    });
    
    // Atualizar registro do split
    await db.query(
      `UPDATE transaction_splits
       SET status = 'completed',
           gateway_transfer_id = $1,
           transferred_at = NOW()
       WHERE id = $2`,
      [transfer.id, split.id]
    );
    
    console.log(`✅ Split executado: ${split.company_name} recebeu R$ ${split.net_amount.toFixed(2)}`);
    
    // Enviar notificação ao parceiro
    await this.notifyPartnerOfTransfer(split);
  }
  
  private async logSplitError(splitId: string, error: Error): Promise<void> {
    await db.query(
      `UPDATE transaction_splits
       SET status = 'failed',
           error_message = $1
       WHERE id = $2`,
      [error.message, splitId]
    );
    
    // Alertar time de ops
    await this.alertOpsTeam({
      type: 'split_failed',
      splitId,
      error: error.message
    });
  }
}
```

#### **FASE 8: Criar Pacotes do Tutor**

```typescript
async function createTutorPackages(transactionId: string): Promise<void> {
  // Buscar itens da transação
  const items = await db.query(
    `SELECT * FROM transaction_items WHERE transaction_id = $1`,
    [transactionId]
  );
  
  for (const item of items.rows) {
    // Calcular data de validade
    const packageInfo = await getPackage(item.package_id);
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + packageInfo.validity_days);
    
    // Gerar código único
    const purchaseCode = generatePurchaseCode();
    
    // Criar registro de pacote adquirido
    await db.query(
      `INSERT INTO tutor_packages (
        id, tutor_id, transaction_id, package_id, partner_id,
        total_units, valid_until, purchase_code, status
      ) VALUES (
        uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, 'active'
      )`,
      [
        item.tutor_id,
        transactionId,
        item.package_id,
        item.partner_id,
        item.quantity,
        validUntil,
        purchaseCode
      ]
    );
    
    console.log(`📦 Pacote criado: ${purchaseCode} - ${item.quantity}x ${packageInfo.name}`);
  }
}

function generatePurchaseCode(): string {
  // Formato: PETGOH-XXXX-XXXX
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const part1 = Array.from({ length: 4 }, () => 
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  const part2 = Array.from({ length: 4 }, () => 
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  
  return `PETGOH-${part1}-${part2}`;
}
```

---

## 4. IMPLEMENTAÇÃO STRIPE CONNECT

### Setup do Parceiro

```typescript
// src/services/partner-onboarding.service.ts

class PartnerOnboardingService {
  async createStripeConnectAccount(partnerId: string): Promise<string> {
    const partner = await this.getPartner(partnerId);
    
    // Criar Stripe Connect Account
    const account = await this.stripe.accounts.create({
      type: 'express', // Mais simples para o parceiro
      country: 'BR',
      email: partner.email,
      
      capabilities: {
        transfers: { requested: true }
      },
      
      business_type: 'company',
      company: {
        name: partner.company_name,
        tax_id: partner.cnpj.replace(/\D/g, '') // Apenas números
      },
      
      metadata: {
        partner_id: partnerId,
        platform: 'petgoh'
      }
    });
    
    // Salvar ID da conta
    await db.query(
      `UPDATE partners SET stripe_account_id = $1 WHERE id = $2`,
      [account.id, partnerId]
    );
    
    return account.id;
  }
  
  async createOnboardingLink(partnerId: string): Promise<string> {
    const partner = await this.getPartner(partnerId);
    
    // Criar link de onboarding
    const accountLink = await this.stripe.accountLinks.create({
      account: partner.stripe_account_id,
      refresh_url: `${process.env.APP_URL}/parceiro/onboarding/refresh`,
      return_url: `${process.env.APP_URL}/parceiro/onboarding/completo`,
      type: 'account_onboarding'
    });
    
    return accountLink.url;
  }
  
  async checkOnboardingStatus(partnerId: string): Promise<boolean> {
    const partner = await this.getPartner(partnerId);
    
    const account = await this.stripe.accounts.retrieve(
      partner.stripe_account_id
    );
    
    // Verificar se pode receber transfers
    const canReceive = account.capabilities?.transfers === 'active';
    
    // Atualizar status do parceiro
    if (canReceive) {
      await db.query(
        `UPDATE partners SET status = 'active' WHERE id = $1`,
        [partnerId]
      );
    }
    
    return canReceive;
  }
}
```

---

## 5. DATABASE SCHEMA

```sql
-- Transações principais
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID REFERENCES tutors(id),
  total_amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  payment_gateway VARCHAR(50) DEFAULT 'stripe',
  gateway_transaction_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Splits de cada transação
CREATE TABLE transaction_splits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partners(id),
  gross_amount DECIMAL(10,2) NOT NULL,        -- Valor bruto vendido
  platform_fee DECIMAL(10,2) NOT NULL,        -- Taxa PetGoH
  platform_fee_rate DECIMAL(5,2) NOT NULL,    -- % da taxa
  net_amount DECIMAL(10,2) NOT NULL,          -- Líquido para parceiro
  status VARCHAR(20) DEFAULT 'pending',       -- pending, completed, failed
  gateway_transfer_id VARCHAR(255),           -- ID do transfer no Stripe
  transferred_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_tutor ON transactions(tutor_id);
CREATE INDEX idx_splits_status ON transaction_splits(status);
CREATE INDEX idx_splits_partner ON transaction_splits(partner_id);
```

---

## 6. CASOS DE USO

### Caso 1: Compra Simples (1 Parceiro)

```typescript
// Tutor compra pacote de apenas 1 parceiro
const cart = {
  items: [{
    packageId: 'pkg_001',
    partnerSelections: [
      { partnerId: 'partner_A', quantity: 5, unitPrice: 96 } // R$ 480
    ]
  }]
};

// Split calculado:
{
  partnerId: 'partner_A',
  grossAmount: 480.00,
  platformFee: 72.00,    // 15%
  netAmount: 408.00      // Parceiro recebe
}
```

### Caso 2: Compra Multi-Parceiro (Mais Comum)

```typescript
const cart = {
  items: [{
    packageId: 'pkg_001',
    partnerSelections: [
      { partnerId: 'partner_A', quantity: 2, unitPrice: 96 }, // R$ 192
      { partnerId: 'partner_B', quantity: 3, unitPrice: 96 }  // R$ 288
    ]
  }]
};

// Splits calculados:
[
  {
    partnerId: 'partner_A',
    grossAmount: 192.00,
    platformFee: 28.80,
    netAmount: 163.20
  },
  {
    partnerId: 'partner_B',
    grossAmount: 288.00,
    platformFee: 43.20,
    netAmount: 244.80
  }
]
```

### Caso 3: Taxas Customizadas por Parceiro

```typescript
// Parceiro Premium tem taxa reduzida
const partnerA = {
  id: 'partner_A',
  plan: 'premium',
  customCommissionRate: 0.10  // 10% ao invés de 15%
};

// Split calculado:
{
  partnerId: 'partner_A',
  grossAmount: 480.00,
  platformFeeRate: 0.10,      // Taxa customizada
  platformFee: 48.00,         // 10% de R$ 480
  netAmount: 432.00           // Parceiro recebe mais!
}
```

---

## 7. TRATAMENTO DE ERROS

### Erro 1: Parceiro Sem Conta Stripe

```typescript
try {
  await executeSingleSplit(split);
} catch (error) {
  if (error.message.includes('não tem conta Stripe')) {
    // Marcar como pendente manual
    await db.query(
      `UPDATE transaction_splits
       SET status = 'pending_manual',
           error_message = 'Parceiro precisa conectar conta Stripe'
       WHERE id = $1`,
      [split.id]
    );
    
    // Notificar parceiro
    await sendEmail(partner.email, {
      subject: 'Ação Necessária: Conecte sua conta bancária',
      body: 'Você tem um pagamento pendente...'
    });
    
    // Notificar ops
    await alertOps({
      type: 'split_pending_account',
      partnerId: partner.id,
      amount: split.net_amount
    });
  }
}
```

### Erro 2: Falha no Transfer

```typescript
try {
  const transfer = await stripe.transfers.create({...});
} catch (error) {
  if (error.code === 'account_invalid') {
    // Conta do parceiro tem problema
    await handleInvalidAccount(split);
  } else if (error.code === 'insufficient_funds') {
    // Platform account sem saldo (não deveria acontecer)
    await handleInsufficientFunds(split);
  } else {
    // Erro genérico - tentar novamente
    await scheduleRetry(split);
  }
}
```

### Sistema de Retry

```typescript
interface RetryConfig {
  maxAttempts: number;
  backoffMultiplier: number;
  initialDelay: number;
}

class SplitRetryService {
  private config: RetryConfig = {
    maxAttempts: 5,
    backoffMultiplier: 2,
    initialDelay: 60000 // 1 minuto
  };
  
  async scheduleRetry(splitId: string, attempt: number = 1): Promise<void> {
    if (attempt > this.config.maxAttempts) {
      // Excedeu tentativas - escalar para manual
      await this.escalateToManual(splitId);
      return;
    }
    
    const delay = this.config.initialDelay * Math.pow(
      this.config.backoffMultiplier,
      attempt - 1
    );
    
    // Agendar retry usando BullMQ
    await splitQueue.add(
      'retry-split',
      { splitId, attempt },
      {
        delay,
        attempts: 1 // Não retentar o job, só o split
      }
    );
    
    console.log(`🔄 Retry #${attempt} agendado para split ${splitId} em ${delay}ms`);
  }
}
```

---

## 8. RECONCILIAÇÃO

### Reconciliação Diária

```typescript
class ReconciliationService {
  async dailyReconciliation(): Promise<ReconciliationReport> {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Buscar todas transações do dia
    const transactions = await this.getTransactionsOfDay(today);
    
    // 2. Para cada transação, validar splits
    const issues = [];
    
    for (const txn of transactions) {
      const splits = await this.getSplits(txn.id);
      
      // Validar soma dos splits = total da transação
      const totalSplits = splits.reduce((sum, s) => sum + s.gross_amount, 0);
      
      if (Math.abs(totalSplits - txn.total_amount) > 0.01) {
        issues.push({
          type: 'amount_mismatch',
          transactionId: txn.id,
          expected: txn.total_amount,
          actual: totalSplits,
          diff: txn.total_amount - totalSplits
        });
      }
      
      // Validar todos splits foram transferidos
      const pendingSplits = splits.filter(s => s.status === 'pending');
      if (pendingSplits.length > 0) {
        issues.push({
          type: 'pending_splits',
          transactionId: txn.id,
          count: pendingSplits.length,
          totalPending: pendingSplits.reduce((sum, s) => sum + s.net_amount, 0)
        });
      }
    }
    
    // 3. Gerar relatório
    const report = {
      date: today,
      totalTransactions: transactions.length,
      totalVolume: transactions.reduce((sum, t) => sum + t.total_amount, 0),
      issues: issues,
      status: issues.length === 0 ? 'ok' : 'needs_attention'
    };
    
    // 4. Salvar relatório
    await this.saveReport(report);
    
    // 5. Alertar se houver problemas
    if (issues.length > 0) {
      await this.alertOps({
        type: 'reconciliation_issues',
        report
      });
    }
    
    return report;
  }
}
```

---

## 9. TESTES

### Teste Unitário: Cálculo de Split

```typescript
describe('SplitCalculatorService', () => {
  let service: SplitCalculatorService;
  
  beforeEach(() => {
    service = new SplitCalculatorService();
  });
  
  it('deve calcular split simples corretamente', async () => {
    const cartItems = [{
      packageId: 'pkg_001',
      partnerSelections: [{
        partnerId: 'partner_A',
        quantity: 5,
        unitPrice: 96
      }]
    }];
    
    const splits = await service.calculateSplits(cartItems);
    
    expect(splits).toHaveLength(1);
    expect(splits[0].grossAmount).toBe(480);
    expect(splits[0].platformFee).toBe(72); // 15%
    expect(splits[0].netAmount).toBe(408);
  });
  
  it('deve calcular split multi-parceiro corretamente', async () => {
    const cartItems = [{
      packageId: 'pkg_001',
      partnerSelections: [
        { partnerId: 'partner_A', quantity: 2, unitPrice: 96 },
        { partnerId: 'partner_B', quantity: 3, unitPrice: 96 }
      ]
    }];
    
    const splits = await service.calculateSplits(cartItems);
    
    expect(splits).toHaveLength(2);
    
    const splitA = splits.find(s => s.partnerId === 'partner_A');
    expect(splitA.grossAmount).toBe(192);
    expect(splitA.netAmount).toBe(163.20);
    
    const splitB = splits.find(s => s.partnerId === 'partner_B');
    expect(splitB.grossAmount).toBe(288);
    expect(splitB.netAmount).toBe(244.80);
  });
});
```

### Teste de Integração: Fluxo Completo

```typescript
describe('Payment Split E2E', () => {
  it('deve processar compra com split completo', async () => {
    // 1. Criar tutor de teste
    const tutor = await createTestTutor();
    
    // 2. Criar parceiros de teste com contas Stripe
    const partnerA = await createTestPartner({ stripeAccountId: 'acct_test_A' });
    const partnerB = await createTestPartner({ stripeAccountId: 'acct_test_B' });
    
    // 3. Criar checkout
    const checkout = await request(app)
      .post('/api/checkout/create')
      .send({
        tutorId: tutor.id,
        items: [{
          packageId: 'pkg_test',
          partnerSelections: [
            { partnerId: partnerA.id, quantity: 2, unitPrice: 96 },
            { partnerId: partnerB.id, quantity: 3, unitPrice: 96 }
          ]
        }]
      });
    
    expect(checkout.status).toBe(200);
    expect(checkout.body.clientSecret).toBeDefined();
    
    // 4. Simular pagamento confirmado (webhook)
    await simulateStripeWebhook('payment_intent.succeeded', {
      id: 'pi_test_123',
      metadata: {
        transaction_id: checkout.body.transactionId
      }
    });
    
    // 5. Verificar transação foi atualizada
    const transaction = await getTransaction(checkout.body.transactionId);
    expect(transaction.status).toBe('completed');
    
    // 6. Verificar splits foram executados
    const splits = await getSplits(checkout.body.transactionId);
    expect(splits.every(s => s.status === 'completed')).toBe(true);
    
    // 7. Verificar pacotes foram criados
    const packages = await getTutorPackages(tutor.id);
    expect(packages.length).toBeGreaterThan(0);
  });
});
```

---

## 10. MONITORAMENTO

### Métricas Importantes

```typescript
// Prometheus metrics
const splitSuccessRate = new promClient.Gauge({
  name: 'split_success_rate',
  help: 'Percentage of successful splits',
  labelNames: ['period']
});

const splitExecutionTime = new promClient.Histogram({
  name: 'split_execution_seconds',
  help: 'Time to execute a split',
  buckets: [0.1, 0.5, 1, 2, 5]
});

const pendingSplitsCount = new promClient.Gauge({
  name: 'pending_splits_total',
  help: 'Number of splits pending execution'
});

// Atualizar métricas periodicamente
setInterval(async () => {
  const stats = await getSplitStats();
  
  splitSuccessRate.set({ period: 'daily' }, stats.successRate);
  pendingSplitsCount.set(stats.pendingCount);
}, 60000); // A cada minuto
```

### Alertas

```yaml
# alerts.yml
groups:
  - name: splits
    rules:
      - alert: HighSplitFailureRate
        expr: split_success_rate{period="daily"} < 0.95
        for: 5m
        annotations:
          summary: "Taxa de sucesso de splits abaixo de 95%"
          
      - alert: PendingSplitsAccumulating
        expr: pending_splits_total > 10
        for: 10m
        annotations:
          summary: "Mais de 10 splits pendentes há 10 minutos"
          
      - alert: SplitExecutionSlow
        expr: histogram_quantile(0.95, split_execution_seconds) > 5
        for: 5m
        annotations:
          summary: "P95 de execução de splits > 5 segundos"
```

---

## 📚 CONCLUSÃO

Este sistema de split de pagamento é o **coração financeiro** do PetGoH. Sua implementação correta é crítica para:

✅ **Confiança dos parceiros**  
✅ **Transparência financeira**  
✅ **Compliance legal**  
✅ **Escalabilidade do negócio**  

**Próximos Passos:**
1. Implementar calculadora de splits
2. Integrar Stripe Connect
3. Criar sistema de webhooks
4. Implementar retry e reconciliação
5. Testes exaustivos
6. Deploy gradual com monitoramento

---

**Contato:**  
Para dúvidas sobre implementação: tech@petgoh.com  
Documentação Stripe Connect: https://stripe.com/docs/connect

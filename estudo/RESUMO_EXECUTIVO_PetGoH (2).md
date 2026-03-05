# PETGOH - RESUMO EXECUTIVO
## Product Requirements Document - Antigravity + Supabase

**Versão:** 1.0  
**Data:** Fevereiro 2026  
**Autor:** Equipe de Produto PetGoH

---

## 📋 SUMÁRIO EXECUTIVO

O PetGoH é uma plataforma completa que conecta tutores de pets a serviços especializados através de um ecossistema digital inovador com split de pagamento automático, automações inteligentes e programa de fidelidade.

### Stack Tecnológico Escolhido
- **Frontend:** Next.js 14 + TypeScript + TailwindCSS
- **Backend:** Node.js + Python (automações)
- **Database:** PostgreSQL via Supabase
- **Infraestrutura:** Antigravity + Supabase
- **Pagamentos:** Stripe Connect (split automático)

---

## 🎯 ROADMAP RESUMIDO

### **FASE 0: Setup (2 semanas)**
- Configuração de repositórios e CI/CD
- Setup Supabase e Antigravity
- Ambientes dev/staging/prod

### **FASE 1: CORE OPERACIONAL (8-10 semanas)**

**Sprint 1-2: Autenticação (2 semanas)**
- Login/Cadastro tutores e parceiros
- Supabase Auth + JWT
- Perfis de usuário

**Sprint 3-4: Pacotes e Serviços (2 semanas)**
- CRUD de pacotes (admin)
- Cadastro de serviços (parceiros)
- Seleção de parceiros por pacote
- Regras de negócio (max 3 diárias)

**Sprint 5-6: Checkout e Split (3 semanas)** ⭐ **CRÍTICO**
- Carrinho multi-parceiro
- Split de pagamento automático
- Integração Stripe Connect
- Webhooks de confirmação
- Geração de códigos de compra

**Sprint 7-8: Backoffice Admin (2 semanas)**
- Dashboard administrativo
- Gestão de usuários/parceiros
- Aprovação de parceiros
- Relatórios básicos

**Entregável Fase 1:** Plataforma funcional com jornada completa de compra ✅

---

### **FASE 2: EXPANSÃO (6-8 semanas)**

**Sprint 9-10: Dashboard Tutor (2 semanas)**
- Visualização de pacotes adquiridos
- Histórico de compras
- Alertas de vencimento

**Sprint 11-12: Agenda Pet (2 semanas)**
- Cadastro de vacinas e vermifugação
- Lembretes automáticos WhatsApp/Email
- Timeline de saúde do pet

**Sprint 13-14: Fidelidade (2 semanas)**
- Sistema de pontos
- Catálogo de prêmios
- Resgate de recompensas

**Sprint 15-16: Mural (2 semanas)**
- Mural de adoção
- Pets perdidos
- Moderação

**Entregável Fase 2:** Engajamento e recorrência ✅

---

### **FASE 3: E-COMMERCE (4-6 semanas)**

**Sprint 17-18: Loja Virtual (3 semanas)**
- Catálogo de produtos
- Carrinho integrado
- Checkout unificado

**Sprint 19-20: Promoções (2 semanas)**
- Sistema de cupons
- Sorteios mensais
- Promoções temporárias

**Entregável Fase 3:** Hub de consumo pet ✅

---

### **FASE 4: AUTOMAÇÃO (6-8 semanas)** ⭐ **DIFERENCIAL**

**Sprint 21-23: Clube de Cotação (3 semanas)**
- IA Agent para buscar preços
- Cotação automática via WhatsApp
- Agregação de cotações
- Envio ao tutor

**Sprint 24-26: WhatsApp Completo (3 semanas)**
- Chatbot com IA
- Lembretes automáticos
- Confirmações de agendamento
- Promoções segmentadas

**Entregável Fase 4:** Automação inteligente ✅

---

### **FASE 5: ECOSSISTEMA (4 semanas)**

**Sprint 27-28: Pet Friendly (2 semanas)**
- Busca de locais pet friendly
- Mapa interativo
- Avaliações

**Sprint 29-30: Conteúdo (2 semanas)**
- Blog SEO otimizado
- Dicas e artigos

**Entregável Fase 5:** Referência pet ✅

---

### **FASE 6: MONETIZAÇÃO (4 semanas)**

**Sprint 31-32: Planos Tutores (2 semanas)**
- Assinaturas mensais/anuais
- Recurring billing (Stripe)

**Sprint 33-34: Planos Parceiros (2 semanas)**
- Taxa de adesão
- Comissões configuráveis

**Entregável Fase 6:** Múltiplas fontes de receita ✅

---

### **FASE 7: INTELIGÊNCIA (6 semanas)**

**Sprint 35-37: Analytics (3 semanas)**
- Dashboards avançados
- Data warehouse
- Relatórios customizáveis

**Sprint 38-40: IA (3 semanas)**
- Recomendações personalizadas
- Previsão de churn
- Segmentação automática

**Entregável Fase 7:** Plataforma data-driven ✅

---

## 🏗️ ARQUITETURA TÉCNICA

### Diagrama Simplificado
```
┌─────────────────────────────────────┐
│  Web App (Next.js)                  │
│  - Tutor, Parceiro, Admin           │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│  API Gateway (Antigravity)          │
│  - Rate Limiting                    │
│  - Load Balancing                   │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│  Backend Services                   │
│  - API Core (Node.js)               │
│  - Automation (Python)              │
│  - Message Queue (BullMQ)           │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│  Supabase                           │
│  - PostgreSQL + Auth                │
│  - Storage + Realtime               │
│  - Edge Functions                   │
└─────────────────────────────────────┘
```

---

## 💰 SISTEMA DE SPLIT DE PAGAMENTO

### Como Funciona

**1. Tutor compra pacote com múltiplos parceiros:**
```
Pacote Hospedagem: R$ 480
- Parceiro A (2 diárias): R$ 192
- Parceiro B (3 diárias): R$ 288
Total: R$ 480
```

**2. Split automático:**
```
Parceiro A:
- Bruto: R$ 192
- Taxa PetGoH (15%): R$ 28,80
- Líquido: R$ 163,20 ✅ (vai direto para conta)

Parceiro B:
- Bruto: R$ 288
- Taxa PetGoH (15%): R$ 43,20
- Líquido: R$ 244,80 ✅ (vai direto para conta)

PetGoH recebe: R$ 72,00 (soma das taxas)
```

**3. Implementação (Stripe Connect):**
```typescript
// Criar PaymentIntent
const payment = await stripe.paymentIntents.create({
  amount: 48000, // R$ 480 em centavos
  currency: 'brl'
});

// Após confirmação, executar transfers
await stripe.transfers.create({
  amount: 16320,  // R$ 163,20
  destination: parceiroA.stripe_account_id
});

await stripe.transfers.create({
  amount: 24480,  // R$ 244,80
  destination: parceiroB.stripe_account_id
});
```

### Vantagens
✅ Parceiro recebe imediatamente  
✅ PetGoH não administra dinheiro de terceiros  
✅ Transparência total  
✅ Reconciliação automática  
✅ Compliance facilitado

---

## 📊 ESTIMATIVA DE CUSTOS

### Fase 1 (MVP - 0-1k usuários)
```
Antigravity (VPS 4GB)      $ 50
Supabase (Pro)             $ 25
Redis                      $ 10
Comunicação (Email/WhatsApp) $ 35
Monitoring                 $ 46
Total/mês                  $ 166 (~R$ 800)
```

### Fase 2 (1k-10k usuários)
```
Infra total               $ 594/mês (~R$ 2.900)
```

### Fase 3 (10k+ usuários)
```
Infra total               $ 3.048/mês (~R$ 15.000)
```

---

## 💡 DIFERENCIAIS COMPETITIVOS

### 1. **Split de Pagamento Nativo**
- Único no mercado pet brasileiro
- Recebimento imediato para parceiros
- Sem intermediação manual

### 2. **Automação Inteligente**
- Clube de cotação com IA
- WhatsApp automático
- Chatbot com contexto

### 3. **Programa de Fidelidade Robusto**
- Pontos por compra
- Bônus especiais
- Catálogo de prêmios

### 4. **Ecossistema Completo**
- Não é só marketplace
- Utilidade pública pet
- Conteúdo educativo

---

## 📈 PROJEÇÃO DE CRESCIMENTO

### Ano 1
```
Mês 1-3:   500 usuários  →  R$ 7,5k receita/mês
Mês 4-6:   2k usuários   →  R$ 30k receita/mês
Mês 7-12:  5k usuários   →  R$ 75k receita/mês
```

### Ano 2
```
Q1: 10k usuários   →  R$ 150k/mês
Q2: 15k usuários   →  R$ 225k/mês
Q3: 20k usuários   →  R$ 300k/mês
Q4: 25k usuários   →  R$ 375k/mês
```

**Assumindo:**
- GMV médio por usuário: R$ 100/mês
- Platform fee: 15%
- Churn mensal: 5%
- Crescimento orgânico + paid

---

## ⚠️ RISCOS PRINCIPAIS

### Técnicos
| Risco | Mitigação |
|-------|-----------|
| Falha no split | Retry automático + alertas |
| Downtime Supabase | Backup diário + réplicas |
| Sobrecarga automações | Queue system + rate limit |

### Negócio
| Risco | Mitigação |
|-------|-----------|
| Baixa adesão parceiros | Incentivo inicial + onboarding |
| Churn alto tutores | Fidelidade + previsão IA |
| Concorrência | Velocidade + diferenciação |

---

## ✅ CHECKLIST DE ENTREGAS POR FASE

### Fase 1 (Core)
- [ ] Auth funcional
- [ ] Pacotes e serviços
- [ ] Split de pagamento ⭐
- [ ] Admin backoffice

### Fase 2 (Engajamento)
- [ ] Dashboard tutor
- [ ] Agenda pet + lembretes
- [ ] Programa fidelidade
- [ ] Mural comunidade

### Fase 3 (E-commerce)
- [ ] Loja virtual
- [ ] Cupons e promoções
- [ ] Sorteios

### Fase 4 (Automação)
- [ ] Clube de cotação IA ⭐
- [ ] WhatsApp completo
- [ ] Chatbot

### Fase 5 (Ecossistema)
- [ ] Busca pet friendly
- [ ] Blog e conteúdo

### Fase 6 (Monetização)
- [ ] Assinaturas tutores
- [ ] Planos parceiros

### Fase 7 (Inteligência)
- [ ] Analytics avançado
- [ ] Recomendações IA
- [ ] Previsão churn

---

## 🚀 PRÓXIMOS PASSOS

1. **Imediato (Esta Semana)**
   - Aprovação do PRD
   - Setup repositórios
   - Criar projeto Supabase
   - Provisionar Antigravity

2. **Semana 1-2 (Fase 0)**
   - CI/CD pipeline
   - Ambientes configurados
   - Database inicial
   - Documentação

3. **Mês 1 (Sprint 1-2)**
   - Autenticação completa
   - Cadastros funcionais
   - Testes >80% coverage

4. **Mês 2 (Sprint 3-6)**
   - Pacotes e serviços
   - **SPLIT DE PAGAMENTO** ⭐
   - Checkout funcional

5. **Mês 3 (Sprint 7-8)**
   - Backoffice admin
   - Beta fechado
   - Ajustes finais

**META:** Plataforma operacional em 3 meses (Fase 1)

---

## 📞 CONTATOS E APROVAÇÕES

**Documento elaborado por:** Equipe de Produto  
**Última atualização:** Fevereiro 2026  
**Versão:** 1.0  

**Aprovações Necessárias:**
- [ ] CEO/Founder
- [ ] CTO/Tech Lead
- [ ] Head of Product
- [ ] CFO (budget)

**Para dúvidas ou sugestões:**
- Slack: #petgoh-produto
- Email: produto@petgoh.com

---

## 📚 DOCUMENTOS RELACIONADOS

1. PRD Completo (este documento + detalhamento técnico)
2. Visão Geral do Negócio (documento original)
3. Estrutura do Site (wireframes)
4. Database Schema (SQL completo)
5. API Documentation (Swagger/OpenAPI)
6. Design System (Figma)

---

**🎯 OBJETIVO FINAL:**  
Lançar a plataforma PetGoH mais completa e inovadora do mercado pet brasileiro, com tecnologia de ponta, automações inteligentes e a melhor experiência para tutores e parceiros.

**Vamos juntos revolucionar o mercado pet! 🐾**

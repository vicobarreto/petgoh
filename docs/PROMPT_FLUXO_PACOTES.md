# PROMPT: Fluxo Padronizado de Navegação de Pacotes PetGoH

> **Este documento é o prompt predefinido para todas as telas de produto da PetGoH.**  
> Todos os serviços (Hospedagem, Creche, Saúde, Estética e futuros) devem seguir exatamente este fluxo.

---

## Fluxo Obrigatório (4 Etapas)

```
STEP 1: ITENS → STEP 2: DISTRIBUIR → STEP 3: DATAS → STEP 4: PAGAMENTO
```

### STEP 1 — Itens Disponíveis
**Objetivo:** Mostrar os itens/parceiros disponíveis para o pacote. O usuário visualiza e seleciona.

**UI obrigatória:**
- Breadcrumb: `Home > [Categoria] > [Nome do Pacote] > Reserva`
- Stepper visual horizontal com 4 etapas (ícones + labels)
- Banner com info do pacote (nome, tipo, quantidade, preço)
- Grid de cards dos parceiros/itens com:
  - Imagem de capa com gradiente overlay
  - Badge "Verificado" no topo
  - Nome, rating (estrelas), localização
  - Hover: scale 1.05 na imagem
- Botão primário para avançar: `[Label Contextual] →`

**Dados:** Fetch de `partners` no Supabase filtrados por categoria.

---

### STEP 2 — Distribuir (Condicional)

> ⚠️ **REGRA:** Se o usuário selecionou APENAS 1 item/parceiro, PULAR esta etapa automaticamente.

**Objetivo:** Distribuir a quantidade do serviço entre os parceiros selecionados.

**UI obrigatória:**
- Contador visual: `Distribuídas X / Y`
- Cards por parceiro com:
  - Thumb pequena + nome
  - Botões `-` e `+` com barra de progresso
  - Máximo configurável por parceiro
- Botões: `← Voltar` + `Avançar →`
- Validação: só avança se total distribuído = total do pacote

---

### STEP 3 — Selecionar Datas

**Objetivo:** Escolher as datas (e opcionalmente horários) para cada serviço.

**Comportamento por categoria:**

| Categoria | Seleção | Regras |
|-----------|---------|--------|
| **Hospedagem** | Apenas dia | Básico: somente dias úteis. Especial: qualquer dia |
| **Creche** | Apenas dia | Segunda a Sexta (exceto feriados) |
| **Saúde** | Dia → Horário | Primeiro seleciona o dia, depois escolhe horário disponível |
| **Estética** | Dia → Horário | Primeiro seleciona o dia, depois escolhe horário disponível |

**UI obrigatória:**
- Card por parceiro com thumb, nome, quantidade de serviços
- Inputs de data com validação visual (verde = OK, vermelho = inválido)
- Para Saúde/Estética: dropdown ou grid de horários após selecionar dia
- Data mínima: amanhã (nunca hoje)
- Botões: `← Voltar` + `Ver Resumo →`

---

### STEP 4 — Resumo e Pagamento

**Objetivo:** Revisar toda a reserva antes de pagar.

**UI obrigatória:**
- Cards com resumo por parceiro (nome, datas selecionadas em tags)
- Seção de totais (subtotal, taxas, total)
- Redireciona para `/checkout/:id` com state contendo os dados da reserva
- Botões: `← Voltar` + `🔒 Ir para Pagamento`
- Trust badge: "Pagamento 100% seguro"

---

## Stepper Visual (Padrão)

```tsx
const STEP_CONFIG = [
  { key: 'ITEMS',      label: '[Contexto]',    icon: '[contexto_icon]' },
  { key: 'DISTRIBUTE', label: 'Distribuir',     icon: 'tune' },
  { key: 'DATES',      label: 'Datas',          icon: 'calendar_month' },
  { key: 'SUMMARY',    label: 'Resumo',         icon: 'receipt_long' },
];
```

**Configuração por categoria:**

| Categoria | Step 1 Label | Step 1 Icon | Parceiro Tipo |
|-----------|-------------|-------------|---------------|
| Hospedagem | Hotéis | hotel | Hotel |
| Creche | Creches | child_care | Creche |
| Saúde | Serviços | medical_services | Veterinário |
| Estética | Serviços | spa | Banho e Tosa |

---

## Design Rules

1. **Header:** Usar APENAS o header global do site. NÃO criar header secundário na página.
2. **Max-width:** `max-w-4xl mx-auto`
3. **Animação:** `animate-in fade-in duration-300` em cada mudança de step
4. **Bordas:** `rounded-2xl` para cards, `rounded-xl` para botões e inputs
5. **Cores:** Primary (laranja) para botões e estados ativos, cinza para inativos
6. **Sombra:** `shadow-lg shadow-primary/20` no botão principal
7. **Responsivo:** Grid 1 coluna mobile, 2 colunas sm+ para cards de parceiros
8. **Fonte:** Font-bold para títulos, font-semibold para subtítulos

---

## Template para nova categoria

Para criar uma nova tela de produto, copie a estrutura de `Hospedagem.tsx` e ajuste:

1. `STEP_CONFIG` — labels e ícones
2. `fetchData()` — query Supabase com filtro de categoria correto
3. `partnerCategory` — tipo do parceiro para filtrar
4. Regras de datas (dia apenas vs dia+horário)
5. Labels e textos descritivos em PT-BR

---

> **Última atualização:** 2026-03-15  
> **Autor:** PetGoH Dev Team  
> **Referência:** `PackageBooking.tsx` (implementação de referência para hospedagem)

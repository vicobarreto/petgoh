# PetGoH - Plano de Correções e Melhorias

**Data:** 2026-03-20
**Tipo:** WEB
**Status:** EM EXECUÇÃO

---

## Visão Geral

Resolução de 10 bugs, 12 melhorias de UI/UX e 8 regras de lógica de negócio extraídas do relatório de extração do produto PetGoH.

---

## Prioridade de Execução

### P0 — Bugs Críticos (quebram funcionalidade)

| ID | Arquivo | Status |
|----|---------|--------|
| BUG-07 | `RegisterPartner.tsx` - upload `disabled` | ✅ |
| BUG-03/04/05 | `Checkout.tsx` - id não-UUID → redirect | ✅ |
| BUG-10 | `GiveawayManagement.tsx` - FK query errada | ✅ |
| BUG-02 | `PartnerManagement.tsx` + `RegisterPartner.tsx` - valores de categoria inconsistentes | ✅ |
| BUG-01 | `Hospedagem.tsx` - filtro categoria incompleto | ✅ |
| BUG-06 | `CommunityWall.tsx` - tela quebra ao voltar do formulário | ✅ |
| BUG-08 | `PetRegistration.tsx` - "is not a function" | ✅ |
| BUG-09 | `PromotionManagement.tsx` - erro ao salvar | ✅ |

### P1 — UI/UX e Regras de Negócio

| ID | Arquivo | Status |
|----|---------|--------|
| LOG-04 | `RegisterPartner.tsx` - remover campo comissão | ✅ |
| LOG-05 | `RegisterPartner.tsx` - bloquear campo status | ✅ |
| UI-05 | `RegisterPartner.tsx` - checkbox para categoria | ✅ |
| UI-07 | `RegisterPartner.tsx` - fotos hotel, site, redes sociais | ✅ |
| UI-08 | `UserProfile.tsx` - remover aba "Minha Lista" | ✅ |
| UI-09 | `UserProfile.tsx` - alterar foto de perfil | ✅ |
| UI-10 | `Footer.tsx` + mobile footer component | ✅ |
| LOG-06 | `TutorManagement.tsx` - deletar usuário | ✅ |
| LOG-07 | `PartnerManagement.tsx` - filtro por categoria | ✅ |
| UI-04 | `Saude.tsx` + `Estetica.tsx` - "Filtrar Tudo" | ✅ |
| UI-03 | `Checkout.tsx` - ocultar check-in/out geral | ✅ |
| LOG-02 | `Hospedagem.tsx` - ajuste regra fim de semana | ✅ |
| LOG-03 | `Checkout.tsx` - desconto agendamento antecipado | ✅ |
| UI-01 | Tela resumo pacote - mostrar todas as etapas | ✅ |
| UI-02 | `Hospedagem.tsx` - "Distribuir Diárias" só após hospedagem | ✅ (já implementado) |
| LOG-08 | `GiveawayManagement.tsx` - sorteio didático | ✅ |
| UI-12 | `Hospedagem.tsx` - split screen redimensionável | ✅ |
| UI-11 | `CommunityWall.tsx` / social - arquivar/deletar posts | ✅ |
| LOG-01 | `PackageBooking.tsx` - parceiros para serviços extras | ✅ |

---

## Diagnóstico dos Bugs

### BUG-03/04/05
`Checkout.tsx` chama `fetchPackage()` usando `id` da URL. Quando navega para `/checkout/hospedagem`, o `id = 'hospedagem'` não é UUID válido → Supabase retorna erro → redirect para `/packages`.

**Fix:** Detectar se `id` é não-UUID e pular o fetch, usando `location.state` diretamente.

### BUG-07
`RegisterPartner.tsx:104` - `<input type="file" disabled />` — atributo `disabled` impede qualquer upload.

### BUG-02
`RegisterPartner.tsx` usa "Hotel / Hospedagem" mas `PartnerManagement.tsx` usa "Hotel". Valores inconsistentes fazem o select não corresponder ao valor salvo no banco.

### BUG-10
`GiveawayManagement.tsx` usa `winner:users!giveaways_winner_id_fkey(...)` — se a FK não tiver esse nome exato no Supabase, a query falha ao salvar/carregar.

---

## Verificação Final (Phase X)

- [x] Build sem erros: `npm run build` ✅
- [x] Sem purple/violet hex codes ✅
- [x] Upload de imagem funcionando ✅ (BUG-07)
- [x] Botões "Ir para pagamento" redirecionam corretamente ✅ (BUG-03/04/05)
- [x] Footer mobile exibe ícones de navegação ✅ (UI-10)
- [x] Admin consegue editar categoria do parceiro ✅ (BUG-02)
- [x] Delete de usuário funciona no admin ✅ (LOG-06)
- [x] CommunityWall não quebra ao navegar de volta ✅ (BUG-06)
- [x] Split screen Hospedagem redimensionável ✅ (UI-12)
- [x] Posts podem ser excluídos pelo autor ✅ (UI-11)
- [x] Parceiros para serviços extras selecionáveis no PackageBooking ✅ (LOG-01)

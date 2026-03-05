# Cão-municação — Rede Social Pet (Instagram-like)

## Overview

Transformar a seção "Cão-municação" do PetGoH em uma rede social completa estilo Instagram, focada em pets. Atualmente existem 4 páginas stub (`SocialFeed`, `SocialProfile`, `SocialPostDetail`, `SocialNotifications`), todas com dados hardcoded e sem funcionalidade real.

**Objetivo:** 4 telas funcionais + sistema de amizades + banco de dados completo no Supabase.

> [!IMPORTANT]
> **Pré-requisito:** O usuário precisa executar o SQL de schema no Supabase SQL Editor antes da implementação.

---

## Project Type: **WEB** (React + Vite + Supabase)

---

## Success Criteria

| # | Critério | Verificação |
|---|----------|-------------|
| 1 | Feed mostra posts reais com likes, comentários e salvos | Publicar post → aparece no feed |
| 2 | Tela "Meu Perfil" mostra grid de posts do usuário | Navegar para perfil → ver posts em grid 3x3 |
| 3 | Tela "Publicar" permite texto + múltiplas fotos | Criar post com 1-4 fotos → post aparece no feed |
| 4 | Tela "Mensagens" com chat real-time | Enviar mensagem → aparece instantaneamente |
| 5 | Sistema de amizades funcional | Enviar/aceitar/recusar solicitação |
| 6 | Navegação bottom-tab estilo Instagram | 5 ícones: Feed, Buscar, Publicar, Mensagens, Perfil |

---

## Tech Stack

| Tecnologia | Uso | Justificativa |
|-----------|-----|---------------|
| React + TypeScript | Frontend | Stack existente |
| Supabase (Postgres) | Database | Já utilizado no projeto |
| Supabase Storage | Imagens | Bucket `wall-images` |
| Supabase Realtime | Chat + Notificações | WebSockets nativo |
| React Router | Navegação | Já configurado |

---

## Arquitetura de Telas

```
/caomunicacao                → Feed (home, posts de todos)
/caomunicacao/publicar       → Nova Publicação (texto + fotos)
/caomunicacao/meu-perfil     → Meu Perfil (grid 3x3 + stats)
/caomunicacao/mensagens      → Lista de Conversas
/caomunicacao/mensagens/:id  → Chat Individual
/caomunicacao/perfil/:userId → Perfil de Outro Usuário
/caomunicacao/post/:postId   → Detalhe do Post (modal ou página)
/caomunicacao/buscar         → Buscar Usuários/Posts
```

---

## Database Schema (Supabase)

### Tabelas Necessárias

#### 1. `wall_posts` (JÁ EXISTE — ajustar schema)
```sql
-- Verificar e adicionar colunas faltantes
ALTER TABLE wall_posts ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE wall_posts ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;
```

#### 2. `post_likes` (NOVA)
```sql
CREATE TABLE post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES wall_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);
```

#### 3. `post_comments` (NOVA)
```sql
CREATE TABLE post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES wall_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. `post_saves` (NOVA)
```sql
CREATE TABLE post_saves (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES wall_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);
```

#### 5. `friendships` (NOVA)
```sql
CREATE TABLE friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
    addressee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(requester_id, addressee_id)
);
```

#### 6. `conversations` (NOVA)
```sql
CREATE TABLE conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_1 UUID REFERENCES users(id),
    participant_2 UUID REFERENCES users(id),
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(participant_1, participant_2)
);
```

#### 7. `messages` (NOVA)
```sql
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 8. Storage Bucket
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('wall-images', 'wall-images', true)
ON CONFLICT (id) DO NOTHING;
```

#### RLS Policies (Todas as tabelas)
- `post_likes`: Usuário pode curtir/descurtir próprios likes
- `post_comments`: Público leitura, autenticado cria, dono deleta
- `post_saves`: Privado por usuário
- `friendships`: Participantes podem ver/gerenciar
- `conversations`: Participantes podem ver
- `messages`: Participantes podem ver/enviar

---

## Task Breakdown

### Fase 0: Database & Storage
- [ ] **T0.1** Gerar SQL completo com todas as tabelas acima
- [ ] **T0.2** Usuário executar SQL no Supabase Dashboard
- [ ] **T0.3** Verificar que `wall-images` bucket existe

### Fase 1: Componentes Compartilhados
- [ ] **T1.1** `SocialLayout.tsx` — Layout com bottom nav (5 tabs: Feed, Buscar, +Publicar, Mensagens, Perfil)
- [ ] **T1.2** `PostCard.tsx` — Card de post reutilizável (imagem, like, comentar, salvar, compartilhar)
- [ ] **T1.3** `UserAvatar.tsx` — Avatar com ring de story e badge online

### Fase 2: Feed (Tela Principal)
- [ ] **T2.1** Reescrever `SocialFeed.tsx` completo com dados reais
- [ ] **T2.2** Stories mock no topo (horizontal scroll)
- [ ] **T2.3** Infinite scroll ou "carregar mais"
- [ ] **T2.4** Like em tempo real (optimistic UI + Supabase)
- [ ] **T2.5** Comentários inline (expandível)
- [ ] **T2.6** Salvar/favoritar post

### Fase 3: Publicar
- [ ] **T3.1** Nova página `SocialPublish.tsx` — upload 1-4 fotos + texto
- [ ] **T3.2** Preview das fotos antes de publicar
- [ ] **T3.3** Filtros básicos ou crops (opcional v2)
- [ ] **T3.4** Integrar com `wall-images` bucket

### Fase 4: Meu Perfil
- [ ] **T4.1** Reescrever `SocialProfile.tsx` — grid 3x3 de posts
- [ ] **T4.2** Stats: posts, amigos, recebidos
- [ ] **T4.3** Editar bio/avatar
- [ ] **T4.4** Tabs: Posts | Salvos | Curtidos

### Fase 5: Perfil de Outro Usuário
- [ ] **T5.1** Reutilizar `SocialProfile.tsx` com parâmetro `:userId`
- [ ] **T5.2** Botão "Adicionar Amigo" / "Amigos" / "Pendente"
- [ ] **T5.3** Botão "Enviar Mensagem"

### Fase 6: Amizades
- [ ] **T6.1** Enviar solicitação de amizade
- [ ] **T6.2** Aceitar/recusar solicitação
- [ ] **T6.3** Lista de amigos
- [ ] **T6.4** Notificação de nova solicitação

### Fase 7: Mensagens
- [ ] **T7.1** `SocialMessages.tsx` — lista de conversas
- [ ] **T7.2** `SocialChat.tsx` — chat individual real-time
- [ ] **T7.3** Supabase Realtime subscription para novas mensagens
- [ ] **T7.4** Badge de mensagens não lidas
- [ ] **T7.5** Enviar texto (v1), imagens (v2)

### Fase 8: Busca
- [ ] **T8.1** `SocialSearch.tsx` — buscar usuários por nome
- [ ] **T8.2** Sugestões de amizade

### Fase 9: Rotas & Integração
- [ ] **T9.1** Atualizar `App.tsx` com novas rotas
- [ ] **T9.2** Wrapping com `SocialLayout` para bottom nav
- [ ] **T9.3** Testar navegação completa

---

## File Structure

```
src/pages/social/
├── SocialLayout.tsx          ← Bottom nav wrapper
├── SocialFeed.tsx            ← Feed principal (reescrito)
├── SocialPublish.tsx         ← Nova publicação
├── SocialProfile.tsx         ← Meu perfil + perfil de outro
├── SocialPostDetail.tsx      ← Detalhe do post (reescrito)
├── SocialMessages.tsx        ← Lista de conversas
├── SocialChat.tsx            ← Chat individual
├── SocialSearch.tsx          ← Buscar usuários
└── SocialNotifications.tsx   ← Notificações (reescrito)

src/components/social/
├── PostCard.tsx              ← Card de post reutilizável
├── UserAvatar.tsx            ← Avatar com ring
├── CommentSection.tsx        ← Comentários inline
├── FriendButton.tsx          ← Botão de amizade
└── BottomNav.tsx             ← Barra de navegação inferior
```

---

## Verification Plan

### Automated
- `npm run build` → zero errors
- Verificar todas as rotas acessíveis

### Manual
1. Criar post com foto → aparece no feed
2. Curtir/comentar/salvar post
3. Enviar solicitação de amizade → aceitar → aparece na lista
4. Enviar mensagem → receber em tempo real
5. Navegar entre todas as 4 telas via bottom nav
6. Perfil mostra grid correto de posts

---

## Decisões do Usuário ✅

1. **Feed:** Duas abas — "Todos" (todos os usuários) + "Amigos" (apenas amigos aceitos)
2. **Mensagens:** Duas abas — "Pendentes" (primeira interação) + "Geral" (conversas aceitas)
3. **Moderação:** Posts publicam direto, sem aprovação
4. **Stories:** Stories reais com expiração de 24h

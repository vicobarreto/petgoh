# Configuração de E-mail (SMTP) - Turbo Cloud + Supabase

Para que os e-mails de recuperação de senha e boas-vindas funcionem corretamente e cheguem na caixa de entrada dos usuários (evitando Spam), você precisa conectar o seu e-mail do Turbo Cloud ao Supabase.

## Passo 1: Criar/Verificar E-mail no Turbo Cloud (cPanel)

1. Acesse o **cPanel** da sua hospedagem Turbo Cloud (geralmente `seudominio.com.br/cpanel`).
2. Vá até a seção **E-mail** e clique em **Contas de e-mail**.
3. Clique em **+ Criar**.
4. Defina o endereço (ex: `nao-responda@petgoh.com.br`) e uma senha forte.
5. Clique em **Criar**.

## Passo 2: Pegar as Configurações de SMTP

1. Na mesma tela de **Contas de e-mail**, encontre o e-mail que você acabou de criar.
2. Clique no botão **Connect Devices** (Conectar Dispositivos).
3. Procure pela caixa **Mail Client Manual Settings** (Configurações Manuais). Você precisará destes dados:
    *   **Outgoing Server (Servidor de Saída):** Geralmente é `mail.seudominio.com.br`.
    *   **SMTP Port (Porta SMTP):** `465` (Recomendado, com SSL) ou `587` (com TLS).
    *   **Username (Usuário):** O e-mail completo (ex: `nao-responda@petgoh.com.br`).
    *   **Password (Senha):** A senha que você criou para este e-mail.

## Passo 3: Configurar no Supabase

1. Acesse o painel do seu projeto no [Supabase Dashboard](https://supabase.com/dashboard).
2. No menu lateral esquerdo, clique no ícone de engrenagem **Project Settings** (Configurações do Projeto).
3. Vá para a aba **Auth** (Autenticação) -> **SMTP Settings**.
4. Ative a chave **Enable Custom SMTP**.
5. Preencha os campos com os dados do Passo 2:
    *   **Sender Email:** `nao-responda@petgoh.com.br` (Seu e-mail criado).
    *   **Sender Name:** `PetGoH` (Nome que aparecerá para o usuário).
    *   **Host:** `mail.seudominio.com.br` (Seu servidor de saída).
    *   **Port:** `465` (ou `587`).
    *   **User:** `nao-responda@petgoh.com.br` (Seu usuário).
    *   **Password:** A senha do e-mail.
    *   **Minimum encryption:** Selecione `SSL` se usou a porta 465, ou `TLS` se usou a 587. (Geralmente `SSL` na 465 é o padrão do cPanel).
6. Clique em **Save**.

## Passo 4: Testar

1. No seu aplicativo PetGoH, vá para a tela "Esqueci minha senha".
2. Digite um e-mail real seu.
3. Clique em "Enviar Link".
4. Verifique se o e-mail chegou na sua caixa de entrada (pode levar alguns minutos).

---

**Dica:** Se o e-mail não chegar, verifique se a porta 465 está correta ou tente a 587. Certifique-se também de que a senha do e-mail não contém caracteres que possam quebrar a string de conexão (embora o Supabase trate isso bem, senhas muito complexas com muitos símbolos às vezes geram dúvidas na configuração).

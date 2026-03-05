n# Guia de Deploy no Turbo Cloud (cPanel)

Como o PetGoH é um aplicativo React (Single Page Application - SPA), ele precisa ser "construído" (buildado) antes de ser colocado na hospedagem.

## 1. Preparar os Arquivos (Build)

No seu computador (onde você está programando), abra o terminal na pasta do projeto e rode:

```bash
npm run build
```

Isso vai criar uma pasta chamada `dist` na raiz do seu projeto. Essa pasta contém:
- `index.html`
- `assets/` (com seus CSS, JS e imagens otimizadas)

**Atenção:** É o conteúdo DESTA pasta `dist` que vai para o servidor, não os seus arquivos `.ts` ou `.tsx`.

## 2. Acessar o cPanel (Gerenciador de Arquivos)

1. Acesse seu cPanel (ex: `seudominio.com.br/cpanel`).
2. Clique em **Gerenciador de Arquivos** (File Manager).
3. Vá para a pasta **public_html** (ou a pasta do subdomínio onde você quer que o site funcione).

## 3. Limpar a Pasta (Se necessário)

Se houver arquivos antigos do WordPress ou outro site que você não usa mais na `public_html`, delete-os ou mova para um backup. Se for um site novo, a pasta deve estar vazia (ou só com `cgi-bin`).

## 4. Enviar os Arquivos

1. No Gerenciador de Arquivos, clique em **Carregar** (Upload).
2. Arraste **todo o conteúdo de DENTRO da pasta `dist`** para lá.
   - **Dica:** Para facilitar, você pode compactar o conteúdo da pasta `dist` em um arquivo `site.zip`, fazer o upload desse único arquivo e depois usar a opção **Extrair** do cPanel.

No final, sua `public_html` deve ter:
- `assets/`
- `index.html`
- `vite.svg` (opcional)

## 5. Corrigir Rotas (Erro 404 ao atualizar página)

Como é um app React, se o usuário entrar em `/login` e der F5, o servidor vai procurar um arquivo `login.html` que não existe, e dará Erro 404. Precisamos dizer ao servidor: "Se não achar o arquivo, mande para o `index.html` que o React resolve".

1. Na `public_html` do cPanel, clique em **+ Arquivo**.
2. Nomeie como `.htaccess` (tem que ter o ponto no início).
   - *Se você não vir o arquivo depois de criar, clique em "Configurações" no canto superior direito e marque "Mostrar arquivos ocultos".*
3. Clique com o botão direito no `.htaccess` e vá em **Edit**.
4. Cole este código:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

5. Clique em **Salvar Alterações**.

## 6. Pronto!

Acesse seu domínio `seudominio.com.br` e o site deve carregar.

---

### Resumo dos Pontos Críticos
*   **Não suba a pasta `node_modules`** (ela é ignorada no deploy).
*   **Não suba a pasta `src`** (o navegador não lê TypeScript).
*   **Configure o `.htaccess`** ou as páginas secundárias (Login, Perfil) darão erro 404 ao recarregar.

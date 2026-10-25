# Giovani Stuchi — Portfólio

Portfólio pessoal em HTML, CSS e JavaScript, com versões em português e inglês.

## Executar localmente

```sh
python3 -m http.server 4173 --directory dist
```

Abra http://localhost:4173.

## Publicar na Cloudflare Workers

O arquivo `wrangler.jsonc` configura a publicação dos arquivos estáticos de `dist/`. No projeto Workers conectado ao GitHub, use:

- Branch de produção: `main`
- Comando de build: vazio
- Comando de deploy: `npx wrangler deploy`
- Diretório raiz: `/`

Após publicar, adicione `giovanistuchi.com` na configuração de domínios do Worker.

## Alternativa: Cloudflare Pages

Conecte este repositório a um projeto Pages com:

- Branch de produção: `main`
- Framework: `None`
- Comando de build: `exit 0`
- Diretório de saída: `dist`

Em **Custom domains**, adicione `giovanistuchi.com` e siga a configuração de DNS indicada pela Cloudflare. Adicione `www.giovanistuchi.com` e configure o redirecionamento para o domínio principal.

## Estrutura

Layout de página única com barra lateral fixa (perfil, assinatura, redes, currículo e e-mail), inspirado no template [Developer Portfolio with Sticky Sidebar](https://21st.dev/@kedhareswer/templates/developer-portfolio-template-with-sticky-sidebar) e recriado sem dependências.

- `dist/index.html`: conteúdo e estrutura, com os textos em português e inglês (`data-pt` / `data-en`).
- `dist/style.css`: layout responsivo, temas claro e escuro e animações.
- `dist/theme.js`: aplica tema e idioma salvos antes da página aparecer.
- `dist/script.js`: idioma, tema, filtros, galeria, destaques da experiência e cópia do e-mail.
- `dist/assets/`: imagens utilizadas no site.
- `dist/resume.pdf`: currículo para download.

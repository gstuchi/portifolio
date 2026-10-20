# Giovani Stuchi — Portfólio

Portfólio pessoal em HTML, CSS e JavaScript, com versões em português e inglês.

## Executar localmente

```sh
python3 -m http.server 4173 --directory dist
```

Abra http://localhost:4173.

## Publicar na Cloudflare Pages

Conecte este repositório a um projeto Pages com:

- Branch de produção: `main`
- Framework: `None`
- Comando de build: `exit 0`
- Diretório de saída: `dist`

Em **Custom domains**, adicione `giovanistuchi.com` e siga a configuração de DNS indicada pela Cloudflare. Adicione `www.giovanistuchi.com` e configure o redirecionamento para o domínio principal.

## Estrutura

- `dist/index.html`: conteúdo e estrutura.
- `dist/style.css`: layout responsivo e efeitos visuais.
- `dist/script.js`: troca de idioma.
- `dist/assets/`: imagens utilizadas no site.
- `dist/resume.pdf`: currículo para download.

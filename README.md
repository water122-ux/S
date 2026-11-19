# Easy Jukebox Server

API REST independente. Armazena metadados em JSON e arquivos em `data/music/`.

## Requisitos
- Node.js 18 ou superior.

## Executar localmente
```bash
npm install
npm start
```
A API ficará em `http://localhost:3030`.

## Rotas
- `GET /health` — estado do servidor.
- `GET /api/tracks?q=termo&sort=newest&page=1&limit=20` — lista e pesquisa.
- `POST /api/upload` — multipart/form-data:
  - `audio`: arquivo `.mp3` ou `.ogg` (máximo 20 MB)
  - `title`: título
  - `artist`: artista
  - `rightsConfirmed`: `true` (confirmação de autorização de distribuição)
- `GET /api/tracks/:id/file` — baixa a música.

## Antes de publicar na internet
Este backend é um protótipo funcional, não está pronto para produção. Antes de abrir uploads públicos, adicione autenticação, rate limiting, moderação/denúncia, antivírus/validação real do conteúdo, armazenamento persistente adequado, backups, HTTPS, limites por usuário e proteção contra abuso. Não distribua músicas protegidas por direitos autorais sem autorização.

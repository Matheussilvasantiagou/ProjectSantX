# Convite Project X (site)

Site em [Next.js](https://nextjs.org) (App Router). As fotos são servidas com otimização automática (`next/image`: WebP/AVIF, tamanhos responsivos, lazy loading).

## Como colocar suas fotos

- Coloque suas imagens em `public/assets/` (ex.: `public/assets/partyImages/1.jpeg`)
- Edite o `config.json` e ajuste os caminhos (sempre começando com `/`, ex.: `/assets/partyImages/1.jpeg`):
  - `background.media`: fotos/vídeos do mosaico de fundo
  - `sections.gallery.images`: fotos da galeria
  - `event.locationImages`: fotos do local

## Como editar as informações

Tudo fica no `config.json`: título, data, horário, endereço, textos das seções, botão de RSVP (WhatsApp), música de fundo etc.

## Como rodar local

```bash
yarn dev
```

Acesse `http://localhost:3000`.

## Build de produção

```bash
yarn build
yarn start
```

## Publicar no Vercel

1. Suba o repositório no GitHub (se ainda não estiver).
2. Crie uma conta gratuita em [vercel.com](https://vercel.com) e importe o repositório.
3. O Vercel detecta o Next.js automaticamente e faz o deploy — sem custo, sem precisar de domínio próprio (você recebe uma URL `seu-projeto.vercel.app`).
4. A cada `git push`, o Vercel gera um novo deploy sozinho.

## Estrutura

- `app/page.tsx` — página de entrada (`/`)
- `app/invite/page.tsx` — página do convite (`/invite`)
- `components/` — background/mosaico, galeria, player de música, nav, sticky CTA
- `lib/config.ts` — tipos e leitura do `config.json`
- `config.json` — todo o conteúdo editável do site
- `public/assets/` — fotos, vídeos e música

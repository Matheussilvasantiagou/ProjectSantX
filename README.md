# Convite Project X (site)

## Como colocar suas fotos

- Crie a pasta `assets/` (se ainda não existir)
- Coloque suas imagens lá dentro (ex.: `bg-1.jpg`, `bg-2.jpg`, `gallery-1.jpg`, etc.)
- Edite o `config.json` e ajuste:
  - `background.images`: fotos do fundo
  - `sections.gallery.images`: fotos da galeria

## Como editar as informações

Tudo fica no `config.json`:

- Título, data, horário, endereço, mapa
- Textos e itens das seções
- Botão de RSVP (WhatsApp)

## Como rodar local

Você pode abrir o `index.html` direto no navegador, mas para o `fetch("./config.json")` funcionar sem bloqueio é melhor usar um servidor local.

Se você tiver Node:

```bash
npx serve .
```

Ou Python 3:

```bash
python3 -m http.server 5173
```

Depois acesse a URL que o comando mostrar.

## Publicar no GitHub Pages

- **Opção A (recomendado)**: Settings → Pages → **Deploy from a branch**
  - Branch: `main`
  - Folder: `/ (root)`
- **Opção B**: usar `/docs` (se você preferir). Aí teria que mover os arquivos para `docs/`.

Depois de publicar, seu site vai ficar em:

- `https://<seu-usuario>.github.io/<nome-do-repo>/`

Dicas:

- Deixe o `index.html` na raiz (já está) — é o arquivo que o Pages procura.
- O arquivo `.nojekyll` já foi adicionado (evita o Jekyll interferir em pastas/arquivos).


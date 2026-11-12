# Manifesto Educ.Attive

Landing page statica del manifesto di Educ.Attive (HTML + CSS + JS, nessuna dipendenza, nessun build).

## Avvio in locale

```bash
python3 -m http.server 8000
```

Poi apri http://localhost:8000. Per pubblicarla basta caricare la cartella così com'è su un hosting statico (GitHub Pages, Netlify, ecc.).

## File

- `index.html` — tutti i testi del manifesto
- `styles.css` — colori, tipografia, layout (desktop ≥ 760px, mobile < 760px)
- `main.js` — nav dei capitoli, barra di lettura, rivelazione allo scroll, video dell'hero mobile
- `assets/` — immagini e video. `hero-video.mp4` è già senza audio e ricompresso (540px, ~5.7 MB)
- `fonts/` — vedi sotto

## Font Lazy Dog

Il font della cliente non è incluso. Copialo in `fonts/lazy_dog.ttf` e verrà usato automaticamente;
finché manca, la pagina usa Patrick Hand SC (Google Fonts). Una volta inserito il font vero,
rimuovi la regola `.st` in `styles.css` (applica un grassetto sintetico per ispessire il font di riserva).

# 🌸 Pointillism Lily — un fiore da condividere

Sito web **mobile-first**, senza server, senza Python, senza librerie esterne.
Riproduce il giglio puntinista che cresce e sboccia dall'animazione Pygame originale.

## Provalo

Apri `index.html` su un computer oppure visita il sito dopo la pubblicazione su GitHub Pages. Safari e Chrome su telefono sono supportati.

> Per test locali più affidabili, dalla cartella usa `python3 -m http.server 8000` e visita `http://localhost:8000`.

## Cambiare la dedica

Apri **`config.js`** e modifica:

```js
message: "Un piccolo fiore, solo per te. ♡",
```

Puoi scrivere, per esempio:

```js
message: "Per te, che rendi più belli i giorni. ✨",
```

Per fare andare a capo la frase: `message: "Prima riga\nSeconda riga",`

Puoi anche modificare `messageAt: 16.5` (secondi) e `autoLoop: false`.

## Pubblicare gratis su GitHub Pages (da browser)

1. Accedi a [github.com](https://github.com) e clicca **New repository**.
2. Nome a scelta, per esempio `un-fiore-per-te`. Seleziona **Public** e crea il repository.
3. Apri **Add file → Upload files**. Carica i file **all'interno** dello ZIP: `index.html`, `style.css`, `config.js`, `app.js` e `.nojekyll` (il README è facoltativo). Non caricare lo ZIP stesso.
4. Clicca **Commit changes**.
5. Apri **Settings → Pages**. Sotto **Build and deployment**, scegli **Deploy from a branch**; seleziona `main`, cartella `/ (root)` e clicca **Save**.
6. Il sito sarà disponibile all'indirizzo `https://TUO-USERNAME.github.io/un-fiore-per-te/` dopo il completamento del deployment. Puoi controllare lo stato nella scheda **Actions**.
7. Apri il link da Safari/Chrome sul telefono e condividilo per messaggio.

**Nota sulla privacy:** se il repository è Public, i file (e quindi la dedica) sono leggibili da chi visita il repository. Non scrivere segreti o dati sensibili.

## Utilizzo

- All'apertura la fioritura parte da sola (circa 15 secondi).
- Dopo 16,5 secondi appare la frase; poco dopo compare «Rivedi la fioritura».
- Toccando il fiore dopo la fioritura, oppure il pulsante, ricomincia.
- Da computer: `R` ricomincia, `Spazio` pausa/riprendi.
- Con la preferenza di sistema "Riduci movimento", il sito mostra direttamente il fiore aperto.
- Se passi ad altre app e torni, il sito non cerca di recuperare il tempo in un unico salto.

## File

- `index.html`: pagina e accessibilità.
- `style.css`: layout, dedica e pulsante.
- `config.js`: **testo e personalizzazioni**.
- `app.js`: conversione Pygame → Canvas 2D, generazione punti e rendering.
- `.nojekyll`: pubblicazione statica GitHub Pages.

## Prestazioni e fedeltà

Le formule geometriche, le durate, il punto di origine, i sei petali, i quattro gruppi di foglie, le aureole e le particelle del Python originale sono stati adattati in JavaScript. Per l'esecuzione su smartphone, il sito usa 480 × 853 pixel interni (proporzione 9:16), circa 30 FPS e un ordinamento della profondità in 256 fasce. Il risultato è **molto vicino**, ma non pixel-per-pixel identico all'originale: il generatore casuale e la rasterizzazione sono diversi. Non richiede Internet dopo il caricamento, ma GitHub Pages richiede una connessione iniziale.

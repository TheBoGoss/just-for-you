# Just for you ✧ · V2

Nuova esperienza floreale cinematografica per smartphone e browser: giglio 3D procedurale, petali color perla/rosa, polline, atmosfera notturna, pulviscolo, luci, meteore, gesto touch e dedica finale. HTML/CSS/JS senza dipendenze, pubblicabile direttamente su GitHub Pages.

## Personalizzazione

Apri `config.js` e cambia il valore di `message`. Usa `\\n` per una nuova riga. La dedica appare a 18,5 secondi; il tempo si cambia con `messageAt`. Per ricominciare in automatico, imposta `autoLoop: true`.

## Pubblicazione nel repository esistente tramite GitHub CLI (Mac)

```bash
brew install gh
gh auth login
gh repo clone TheBoGoss/just-for-you
cd just-for-you
```

Sostituisci i file `index.html`, `style.css`, `config.js`, `app.js` con quelli di questa versione, poi:

```bash
git add index.html style.css config.js app.js README.md
git commit -m "Nuova esperienza floreale cinematografica"
git push origin main
```

Sito: https://thebogoss.github.io/just-for-you/

## Interazioni

- Il fiore cresce, poi sboccia con effetti di luce e dediche.
- Toccare lo schermo produce scintille; dopo la dedica compare `Rivedi la magia`.
- Il sito rispetta l'impostazione accessibilità `Riduci movimento`.
- Nessun audio involontario, nessuna raccolta dati, nessun servizio esterno.

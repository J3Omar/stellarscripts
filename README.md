# Stellar Scripts

Interactive, narrated book about NASA's discarded equipment on the Moon and Mars (NASA Space Apps Challenge 2026).

## Run it

```bash
npm start            # http://localhost:3000  (Node 22+; the chatbot also needs GEMINI_API_KEY in .env)
```

## How the narrated book works

| What | Where |
|---|---|
| Narration text (source of truth for the highlighted words) | `narration/<device>.txt` |
| Narration audio | `assets/audio/<device>.mp3` |
| Page starts and diagram trigger words | `scripts/cue-plan.json` |
| Generated timings (pages, sentences, words, triggers) | `assets/cues/<device>.json` (committed; do not edit by hand) |
| Page content: headline, stat, diagram, photo, caption, sources | `js/book-data.js` |
| Original SVG diagrams | `js/book-diagrams.js` |
| Sync engine (everything derived from `audio.currentTime`) | `js/narration-sync.js` |
| Page renderer | `js/book.js`, styles in `css/book.css` |
| Image credits (all photos must be listed here) | `assets/credits.json`, shown on `credits.html` |

The page text is never typed into `book-data.js`. It comes from the cue file, which is built from the narration `.txt`, so the highlighted words always match the audio.

### Re-time the audio (after re-generating an MP3 or editing a script)

```bash
python3 -m venv .venv && .venv/bin/pip install pocketsphinx   # once; needs ffmpeg on PATH
.venv/bin/python scripts/align_cues.py            # all devices
.venv/bin/python scripts/align_cues.py spirit     # one device
```

The script force-aligns the `.txt` to the `.mp3` (offline, with PocketSphinx's bundled English model), writes `assets/cues/<device>.json` and prints a page timing table plus sanity checks. A word that is not in the dictionary stops the script; add its pronunciation to `EXTRA_WORDS` in `scripts/align_cues.py`.

### Add a device

1. Put `narration/<id>.txt` and `assets/audio/<id>.mp3` in place.
2. Add `<id>` to `scripts/cue-plan.json`: one entry per page (`first` = the first words of the page's first sentence) and the trigger words that reveal diagram parts.
3. Run the aligner (above).
4. In `js/book-data.js`, add the device's `pages` (headline, stat, diagram, optional photo, caption) and list it in its chapter's `devices`.
5. Draw its diagrams in `js/book-diagrams.js`. Elements with `data-at="<trigger action>"` appear when the narration reaches that word. Without narration every page shows its final state.
6. Add any photo to `assets/photos/` and `assets/credits.json` with `"status": "in repo"` and its exact credit line.

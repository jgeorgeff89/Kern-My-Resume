# Kern My Resume

_A very serious typography game about my actual resume._

A tiny browser game for the "Coffee Break" section of a portfolio. The
player fixes intentionally terrible letterspacing on 15 short phrases
pulled straight from a real resume. At the end, the phrases are revealed
to be exactly that — a resume — and the player gets a score, a joke
"kerning title," and links back into the portfolio.

Built with plain HTML, CSS, and vanilla JavaScript. No build step, no
dependencies, nothing to install.

## Running it

Just open `index.html` in a browser, or serve the folder with any static
file server, e.g.:

```
npx serve .
# or
python3 -m http.server 8000
```

It's a static site — GitHub Pages, Netlify, S3, or dropping the three
files into an existing site all work.

## Files

```
index.html    structure for all four screens (start, how-to-play, game, final reveal)
styles.css    all visual styling — retro desktop-publishing look
game.js       game logic, config, challenge data, scoring, character, music/sound
assets/       real character sprites (see assets/README.md)
```

## Links on the final screen

These are set as plain, absolute URLs directly in `index.html` (the
`href` on `#btn-work` and `#btn-coffee`), and `game.js` reads the same
values from `GAME_CONFIG` at the top of the file:

```js
const GAME_CONFIG = {
  ...
  portfolioURL: 'https://www.jamesgeorgeff.com/mywork',      // "VIEW MY WORK"
  coffeeBreakURL: 'https://www.jamesgeorgeff.com/coffeebreak', // "BACK TO COFFEE BREAK"
  ...
};
```

To change them, edit both places (or just the HTML `href`s directly —
that's what actually renders). If you only see a stale destination after
updating these, it's almost always the browser serving a cached copy of
the old file — hard-refresh (Cmd/Ctrl+Shift+R) or re-download/re-extract
this project fresh.

## Controls

- **Desktop:** **Left Arrow tightens**, **Right Arrow loosens**, Space
  locks in an answer (also advances the start and how-to-play screens).
- **Touch / mouse:** on-screen **TIGHTER** (left) / **LOCK IT IN**
  (center) / **LOOSER** (right) buttons — press-and-hold the outer two to
  adjust faster.
- Space never scrolls the page while playing, and none of this hijacks
  keyboard input if focus is in a text field.

This mapping is implemented with named constants in `game.js`
(`TIGHTEN = -1`, `LOOSEN = 1`) rather than inline `+1`/`-1` literals, so
it's unambiguous which key does what if you read the source.

## Music and sound

Both are synthesized in the browser with the Web Audio API — there are no
audio files to host or go missing:

- **SFX** — short blips for adjusting spacing, locking in an answer, and
  round feedback (a little chime on a perfect score, a low buzz on a bad
  one).
- **Music** — a small looping 4-bar chiptune (arpeggio + bassline over a
  i–VI–III–VII progression) that starts on the first click/press on the
  start screen (browsers require a user gesture before audio can play)
  and loops for the rest of the session.

Both have independent toggles on the start screen (**SFX** / **MUSIC**).
Turning music off stops the loop immediately; turning it back on resumes
it. Tempo, chord progression, and the arpeggio pattern are all in the
`MUSIC` / `CHORD_ROOTS` / `ARP_PATTERN` constants in `game.js` if you want
to change the tune.

## Customizing the content

Everything gameplay-related lives in two places in `game.js`:

**`GAME_CONFIG`** — timing, rounds, links, sound/music defaults.

**`CHALLENGES`** — one object per round:

```js
{ text: 'HIGH VOLUME', pair: 'VO', startingOffset: 26, idealOffset: -1, difficulty: 1, font: 'font-serif-display' }
```

- `text` — the phrase shown.
- `pair` — the two adjacent letters (case-insensitive) whose spacing is
  adjustable. The game finds the first occurrence of this pair in `text`.
- `startingOffset` — how many pixels out of position the pair starts
  (positive = too loose, negative = too tight).
- `idealOffset` — the "correctly kerned" target the player is scored
  against.
- `difficulty` — 1 to 5. Controls how visible the highlight under the
  pair is (it fades out entirely by difficulty 5, per the brief).
- `font` — one of the keys in `FONT_CLASS` (serif display, bold grotesk,
  condensed sans, editorial serif, medium sans) for typography variety.

Add, remove, or reorder rounds freely — `GAME_CONFIG.totalRounds` and the
progress bar / round counter follow the length of `CHALLENGES`
automatically as long as you keep them in sync.

**`FEEDBACK`**, **`EXTRA_LINES`**, **`STATUS_LINES`**, and
**`KERNING_TITLES`** hold all the copy for round feedback, the flavor
lines under it, the fake status-bar text, and the end-of-game titles —
edit freely.

**The bio** on the final reveal screen is plain HTML in `index.html`
inside `#screen-final .final-bio`.

## The pixel character

James appears on the start screen, in-game (bottom-left corner), and on
the final reveal, and reacts per state (neutral, thinking, encouraging,
celebrating, disappointed, impatient). Three states use real cropped
sprite art in `/assets`; the rest fall back to a canvas-drawn pixel
sprite defined in `game.js`. See `assets/README.md` for details and how
to add more real art later.

## Accessibility

- Full keyboard operability, visible focus states, semantic buttons.
- `aria-live` region announces round changes, feedback, and the final
  score for screen readers.
- Respects `prefers-reduced-motion` (shortens/removes animation).
- Independent SFX and music toggles.

## Notes

- Scoring: distance from the ideal offset maps to 100 / 85 / 70 / 50 /
  10–35 points per round, for a 1500-point max across 15 rounds. Timing
  out submits whatever offset the player was last on, scored at a
  reduced rate.
- Fonts are loaded from Google Fonts (Press Start 2P, Playfair Display,
  Archivo Black, Oswald, Libre Caslon Text, Inter) via the `<link>` tags
  in `index.html`. Swap or self-host if you'd rather not depend on
  Google Fonts.

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
game.js       game logic, config, challenge data, scoring, character, sound
assets/       optional — drop in real character sprite PNGs here (see assets/README.md)
```

## Embedding in your portfolio

The game is self-contained. Either:

- Link to `index.html` directly (e.g. `/coffee-break/kern-my-resume/`), or
- `<iframe>` it into an existing page.

Before shipping, set these two values at the top of `game.js`:

```js
const GAME_CONFIG = {
  ...
  portfolioURL: '/work',           // "VIEW MY WORK" button on the final screen
  coffeeBreakURL: '/coffee-break',  // "BACK TO COFFEE BREAK" link
  ...
};
```

## Customizing the content

Everything gameplay-related lives in two places in `game.js`:

**`GAME_CONFIG`** — timing, rounds, links, sound default.

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
the final reveal. He's drawn on `<canvas>` from a small pixel grid defined
directly in `game.js` (`BASE_SPRITE` + `STATE_OVERRIDES`), so there are no
image assets required to run the game. If you have real sprite art, drop
it into `/assets` — see `assets/README.md` for exact filenames — and it's
used automatically instead, per state (neutral, thinking, encouraging,
celebrating, disappointed, impatient).

## Controls

- **Desktop:** Left / Right arrow keys to loosen/tighten, Space to lock in
  an answer (also advances the start and how-to-play screens).
- **Touch / mouse:** on-screen LOOSER / LOCK IT IN / TIGHTER buttons —
  press-and-hold on the arrow buttons to adjust faster.
- Space never scrolls the page while playing, and none of this hijacks
  keyboard input if focus is in a text field.

## Accessibility

- Full keyboard operability, visible focus states, semantic buttons.
- `aria-live` region announces round changes, feedback, and the final
  score for screen readers.
- Respects `prefers-reduced-motion` (shortens/removes animation).
- A sound toggle mutes the (synthesized, no audio files) UI blips.

## Notes

- Scoring: distance from the ideal offset maps to 100 / 85 / 70 / 50 /
  10–35 points per round, exactly as specified, for a 1500-point max
  across 15 rounds. Timing out submits whatever offset the player was
  last on, scored at a reduced rate.
- Fonts are loaded from Google Fonts (Press Start 2P, Playfair Display,
  Archivo Black, Oswald, Libre Caslon Text, Inter) via the `<link>` tags
  in `index.html`. Swap or self-host if you'd rather not depend on
  Google Fonts.

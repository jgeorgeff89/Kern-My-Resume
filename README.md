# /assets

Three real sprites are already here, cropped and keyed from your mockup
reference:

```
james-celebrating.png   (from the "PERFECT!" panel)
james-disappointed.png  (from the "Oof." panel)
james-thinking.png      (from the gameplay corner pose)
```

The other three states still use the built-in canvas-drawn placeholder in
`game.js` (`BASE_SPRITE` / `STATE_OVERRIDES`), because the mockup didn't
have clean, isolated art for them — the neutral/pencil poses are
composited into busy scenes (desk, books, plants) that can't be cleanly
cut out without redrawing them:

```
james-neutral.png     — not included, falls back to canvas sprite
james-encouraging.png — not included, falls back to canvas sprite
james-impatient.png   — not included, falls back to canvas sprite
```

If you get clean, isolated versions of those three poses (flat or
transparent background, no overlapping props/text), drop them in here
with those exact filenames and `game.js` will pick them up automatically
— no code changes needed. Same goes for replacing any of the three
that are already here with cleaner source art.

Any reasonable size works (the three included assets are small — a few
dozen pixels — and are upscaled with crisp nearest-neighbor scaling to
match the game's pixel-art look, so don't worry about them looking soft;
that's intentional). If a file is missing or fails to load, that state
silently falls back to the canvas sprite, so the game is fully playable
with any subset of these present.

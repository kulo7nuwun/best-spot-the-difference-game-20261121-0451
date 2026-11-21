# Twin Harbor — Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/kulo7nuwun/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/kulo7nuwun/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)

An original spot-the-difference game, built for the
[make.fun "Make the best spot the difference game" competition](https://make.fun/c/best-spot-the-difference-game-20261121-0451).
Two pictures, side by side, almost identical — find every difference before
the clock runs out.

## How to play

- **Click or tap** either picture on a difference. A green ring marks it on
  both pictures; a wrong click costs 5 seconds.
- **Keyboard:** arrow keys move the crosshair, `Enter` or `Space` clicks,
  `Tab` switches pictures, `H` spends a hint, `M` mutes, `Esc` goes to the menu.
- **Hints:** 3 per level. A hint pulses a gold ring around one difference you
  have not found yet.
- **Levels:** Sunny Harbor (6 differences), Cozy Kitchen (7), Night Garden (8).
  Each level has its own timer; clearing a level banks a time bonus.

## Run it locally

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network: `game/` is plain static files, every scene drawn
with canvas paths in code — original art, no copied characters or music.

## Layout

- `game/index.html` — the page; `game/src/main.js` — bootstrap and loop
- `game/src/config.js` — canvas and timing constants
- `game/src/differences.js` — the three levels and their hidden differences
- `game/src/scenes.js` — the original scene painters (harbor, kitchen, garden)
- `game/src/state.js` — game state: screens, scoring, hints, clock
- `game/src/input.js` — mouse and keyboard input
- `game/src/render.js` — the frame painter: pictures, markers, HUD, overlays
- `game/src/audio.js` — synthesized Web Audio sounds (no audio files)
- `game/src/ui.js` — button and panel geometry shared by input and render
- `main.ts` — hands the game in: copies `game/` and `screenshots/` to
  `/output` and writes `/output/dossier.json`
- `screenshots/` — real renders of the game, taken in a browser

## License

MIT — see [LICENSE](LICENSE).

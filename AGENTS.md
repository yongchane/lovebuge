# Lovebug Cleanup - Codex Guide

## Project

Vite + React 19 browser game.
Main gameplay is Canvas-based in `src/gameEngine.js`.
React UI shell is in `src/App.jsx`.

## Important files

- `src/gameEngine.js`: game state, canvas rendering, skills, tools, venues, input, localStorage save.
- `src/App.jsx`: HUD, shop UI, panels, React state bridge.
- `src/main.jsx`: imports React app and game engine.
- `styles.css`: responsive/mobile layout and pixel UI.
- `growth-system.md`: gameplay/design reference.

## Rules for Codex

- Do not rewrite the whole game engine unless explicitly asked.
- Prefer small targeted patches.
- Before editing, identify the exact function names involved.
- After changes, run `npm run build`.
- For UI/gameplay changes, use Playwright or browser QA when possible.
- Preserve mobile-first layout.
- Avoid adding heavy dependencies.
- Do not edit generated `dist/` unless specifically asked.
- Do not commit `node_modules`.

## Common tasks

- Balance tools/levels: edit `tools`, `requiredExp`, `levelUpCheck`.
- Balance skills: edit `purchasableSkills`, `useSkill`, `usePurchasedSkill`.
- Venue behavior: edit `venues`, `spawnBug`, `drawBackground`.
- UI/shop behavior: edit `src/App.jsx` and `emitUi/getUiSnapshot` bridge.

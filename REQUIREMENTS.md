# Thailand Avontuur – Complete Requirements

> Sufficient to rebuild the entire project from scratch.

---

## 1. Project Overview

**Thailand Avontuur** is a Dutch-language, educational mobile game for two 10-year-old children (Emma & Lars) that recreates a real family vacation to Thailand from April 26 to May 11.

The experience is structured as a journey: players enter their names once, then unlock and play through 7 destinations in order, each with a themed Phaser 3 mini-game. Completing a location awards 1–3 stars and unlocks the next destination.

- Target players: two children sharing one device (collaborative, not competitive)
- Language: Dutch throughout (UI, story text, game text, audio none — only synthesised SFX)
- Platform: mobile-first PWA, portrait orientation, designed for 390×844 (iPhone 14 viewport)
- Offline capable: Workbox service worker caches all assets on first visit
- Installable: PWA manifest enables "Add to Home Screen" on iOS and Android

The 7 locations in chronological order:

| # | Location | Dates | Scene key |
|---|----------|-------|-----------|
| 0 | Bangkok | 26–29 april | BangkokMapGame |
| 1 | Kanchanaburi | 29 apr – 1 mei | KanchanaburiMemory |
| 2 | Nachttrein | 1–2 mei | TrainReflexGame |
| 3 | Khao Sok | 2–3 mei | KhaoSokPuzzle |
| 4 | Cheow Lan Meer | 3–4 mei | LakeRaftGame |
| 5 | Koh Samui | 4–10 mei | SamuiBeachGame |
| 6 | Terug Bangkok | 10–11 mei | BangkokFinalGame |

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| UI shell | React | ^19.1.0 |
| Bundler | Vite | ^6.3.5 |
| Game engine | Phaser 3 | bundled as `lib/phaser.min.js`, loaded via `<script>` tag before React |
| Icons | lucide-react | ^0.511.0 |
| PWA | vite-plugin-pwa (Workbox) | ^0.21.1 |
| Static assets | vite-plugin-static-copy | ^2.3.0 |
| E2E tests | Playwright + pytest-playwright | system install |
| Runtime | Node.js (for dev/build only) | any LTS |

**Key architectural constraint:** Phaser is loaded as a plain `<script>` tag (not an npm module) so its classes are available as globals on `window` before the React ES-module bundle runs. This avoids bundler complications with Phaser's WebGL renderer.

---

## 3. Project Structure

```
thailand-game/
├── index.html                    # Entry point; loads Phaser + all JS globals before React
├── package.json                  # npm manifest (see §2)
├── vite.config.js                # Vite + PWA + static-copy plugin config
├── manifest.json                 # Legacy standalone PWA manifest (superseded by vite-plugin-pwa)
├── sw.js                         # Legacy hand-written service worker (superseded by Workbox)
├── make_icons.py                 # One-off script to generate PNG icons
├── reisschema.md                 # Human-readable travel itinerary (reference document)
│
├── src/                          # React application (ES modules, bundled by Vite)
│   ├── main.jsx                  # ReactDOM.createRoot; imports theme.css; renders <App>
│   ├── App.jsx                   # Root component; screen state machine; createSave / readSave
│   ├── theme.css                 # Global CSS variables, resets, animations
│   ├── data/
│   │   └── locations.js          # LOCATIONS array (7 objects) – single source of truth for React UI
│   └── components/
│       ├── NameScreen.jsx        # First-run name-entry form
│       ├── MapScreen.jsx         # Map + header (incl. "Spellen" button) + progress bar
│       ├── GamesMenuScreen.jsx   # Full-screen scrollable list of all vacation + bonus games
│       ├── ThailandMap.jsx       # <img map.png> + SVG route lines + location marker buttons
│       ├── StoryDrawer.jsx       # Bottom-sheet with story text + play / replay button
│       └── GameScreen.jsx        # Mounts/destroys Phaser.Game; handles vacation + bonus scenes
│
├── js/                           # Phaser game code (plain ES5 globals, loaded via <script>)
│   ├── config.js                 # GAME_WIDTH/HEIGHT, MAP_*, COLORS, THAILAND_POLY, LOCATIONS (Phaser copy)
│   ├── save.js                   # localStorage CRUD: loadSave, writeSave, completeLocation, resetSave
│   ├── main.js                   # Legacy standalone entry (unused in React build)
│   ├── utils/
│   │   ├── draw.js               # Shared Phaser drawing helpers: makeButton, buttonInteractive, drawStar(s), createWater, updateWater, titleText, bodyText
│   │   └── audio.js              # Web Audio API SFX object (no audio files needed)
│   └── scenes/
│       ├── BootScene.js          # Legacy boot scene (unused in React build)
│       ├── MapScene.js           # Legacy Phaser map scene (unused in React build)
│       ├── StoryScene.js         # Legacy story scene (loaded but not started by GameScreen)
│       ├── PassportScene.js      # Legacy passport scene (unused in React build)
│       ├── WinScene.js           # Shared win screen: confetti, passport stamp, stars, return button
│       └── games/
│           ├── BangkokMapGame.js       # Location 0 – multiple-choice quiz (50-question pool, 10 shown)
│           ├── KanchanaburiMemory.js   # Location 1 – 4×4 memory card game (8 animal pairs)
│           ├── TrainReflexGame.js      # Location 2 – reflex: catch golden suitcases on conveyor belt
│           ├── KhaoSokPuzzle.js        # Location 3 – 3-option jungle quiz (7 questions, need 5/7)
│           ├── LakeRaftGame.js         # Location 4 – 3-lane canoe race; collect 12 stars; 3 lives
│           ├── SamuiBeachGame.js       # Location 5 – 3 sub-games: coconut catch, shell memory, snorkel
│           ├── BangkokFinalGame.js     # Location 6 – anagram word-scramble (8 words, need 6/8)
│           ├── TetrisGame.js           # Bonus – Thailand-themed Tetris with virtual d-pad
│           └── LevelDevilGame.js       # Bonus – tap-to-jump temple platformer, 5 levels, 3 lives
│
├── lib/
│   └── phaser.min.js             # Phaser 3 engine (vendored, ~1 MB minified)
│
├── img/
│   └── map.png                   # Thailand map image used as React map background
│
├── icons/
│   ├── icon-192.png              # PWA icon 192×192
│   └── icon-512.png              # PWA icon 512×512
│
├── css/
│   └── style.css                 # Legacy stylesheet (unused in React build)
│
└── tests/
    ├── conftest.py               # pytest fixtures: starts Vite dev server on port 5174
    └── test_game.py              # Playwright E2E test suite
```

---

## 4. Architecture

### Screen state machine (React)

`App.jsx` owns a `screen` state string:

```
'loading'  →  readSave() from localStorage
              ├── save exists with name1  →  'map'
              └── no save                →  'name'

'name'     →  <NameScreen onSubmit>
              └── onSubmit(name1, name2) → createSave() → 'map'

'map'      →  <MapScreen save onPlay>
              └── onPlay(idx)            → 'game'

'game'     →  <GameScreen locationIndex saveData onReturn>
              └── onReturn()             → readSave() → 'map'
```

The `App` also tracks `gameIdx` (number | null) to know which location launched the game.

### React ↔ Phaser bridge

Two `window` globals couple the two worlds:

| Global | Direction | Purpose |
|--------|-----------|---------|
| `window._game` | React → Phaser | The `Phaser.Game` instance; set by `GameScreen`, used by tests |
| `window._onReturnToMap` | React → Phaser | Callback function; set by `GameScreen`; called by `WinScene` when the player taps "Terug naar de kaart" |

### GameScreen lifecycle

1. React renders `<GameScreen>` with a fixed `div` (position:fixed, inset:0, z-index:100).
2. A 40 ms `setTimeout` fires (lets the DOM settle) then creates `new Phaser.Game(config)`.
3. Phaser config:
   - `width: 390, height: 844`
   - `backgroundColor: '#1A0A00'`
   - `resolution: window.devicePixelRatio || 1` (retina sharpness)
   - `scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }`
   - `scene`: array of all scene classes pulled from `window.*` globals + `window.WinScene`
4. On `game.events.once('ready')`, the target scene is started with `{ locationIndex, name1, name2, saveData }`.
5. On React unmount (cleanup): timer is cleared, `Phaser.Game.destroy(true)` is called, refs are nulled.

### Script loading order (index.html)

```
phaser.min.js        (Phaser global)
config.js            (GAME_WIDTH, GAME_HEIGHT, COLORS, LOCATIONS, THAILAND_POLY)
save.js              (loadSave, writeSave, completeLocation, resetSave)
utils/draw.js        (makeButton, buttonInteractive, drawStar, drawStars, createWater, updateWater, titleText, bodyText)
utils/audio.js       (SFX object)
scenes/StoryScene.js
scenes/WinScene.js
scenes/games/BangkokMapGame.js
scenes/games/KanchanaburiMemory.js
scenes/games/TrainReflexGame.js
scenes/games/KhaoSokPuzzle.js
scenes/games/LakeRaftGame.js
scenes/games/SamuiBeachGame.js
scenes/games/BangkokFinalGame.js
scenes/games/TetrisGame.js
scenes/games/LevelDevilGame.js
<inline script>      (assigns each class to window.*, including TetrisGame + LevelDevilGame)
src/main.jsx         (React, type="module")
```

---

## 5. Data Model (localStorage key: `thailand_save`)

```jsonc
{
  "version": 1,                        // integer – schema version
  "players": {
    "name1": "Emma",                   // string – first player name (max 20 chars)
    "name2": "Lars"                    // string – second player name (max 20 chars)
  },
  "locations": [                       // array, always length 7, order matches LOCATIONS
    {
      "id": "bangkok",                 // string – matches LOCATIONS[i].id
      "unlocked": true,                // boolean – only Bangkok starts true
      "completed": false,              // boolean – true once game is beaten
      "stars": 0                       // integer – 0 | 1 | 2 | 3; best score kept
    },
    // ... 6 more entries
  ],
  "totalStars": 0,                     // integer – sum of all location stars
  "lastPlayed": "2025-05-01T12:00:00.000Z",  // ISO string | null – set on each writeSave()
  "highscores": {                      // optional object; keyed by location id or game key
    "nachttrein": 42,                  // TrainReflexGame best caught count
    "tetris": 1200                     // TetrisGame best score
  }
}
```

**Invariants:**
- `locations` is always exactly 7 items in the same order as `LOCATIONS`.
- `locations[0].unlocked` is always `true` (Bangkok starts open).
- `completeLocation(i, stars)` also sets `locations[i+1].unlocked = true` when `i+1 < 7`.
- `stars` only ever increases (best score is kept: `Math.max(existing, new)`).

---

## 6. Save API (`js/save.js`)

All functions are plain globals (no `export`). They depend on `LOCATIONS` from `config.js`.

### `loadSave() → SaveObject`
Reads `thailand_save` from `localStorage`. Returns a default save object (bangkok unlocked, all others locked, no names) if the key is absent or JSON is invalid.

### `writeSave(data: SaveObject) → void`
Sets `data.lastPlayed` to `new Date().toISOString()` then writes to `localStorage`.

### `createNewSave(name1: string, name2: string) → SaveObject`
Returns a fresh save object with player names populated. Does **not** write to localStorage; caller must call `writeSave()` if persistence is needed. (Note: `App.jsx` has its own inline `createSave()` that writes immediately.)

### `completeLocation(locationIndex: number, stars: number) → SaveObject`
1. Loads current save.
2. Sets `locations[locationIndex].completed = true`.
3. Updates `locations[locationIndex].stars = Math.max(existing, stars)`.
4. If `locationIndex + 1 < 7`, sets `locations[locationIndex + 1].unlocked = true`.
5. Recalculates `totalStars` as the sum of all location stars.
6. Writes and returns the updated save.

### `getHighscore(locationId: string) → number`
Returns the best score stored for the given key (defaults to 0 if absent).

### `setHighscore(locationId: string, score: number) → void`
Updates the highscore only if `score` exceeds the current best; calls `writeSave()`.

### `resetSave() → void`
Removes the `thailand_save` key from `localStorage`.

### `_defaultSave() → SaveObject` (private)
Internal helper; returns a fresh blank save.

---

## 7. Drawing Helpers (`js/utils/draw.js`)

All functions are plain globals that depend on `GAME_WIDTH`, `GAME_HEIGHT` from `config.js`.

### `makeButton(scene, x, y, w, h, color, label, fontSize?) → { bg: Graphics, text: Text }`
Draws a rounded-rect (radius 12) button centered at `(x, y)` with fill `color`. Returns references to the Graphics and Text objects for use with `buttonInteractive`.
- `fontSize` defaults to 20.
- Text style: Georgia serif, white, black stroke thickness 2, word-wrap.

### `buttonInteractive(scene, bg, x, y, w, h, callback) → Zone`
Creates a `Zone` at `(x, y, w, h)` and registers `pointerdown` that triggers a 80 ms scale-down tween (0.94×) with yoyo, then calls `callback`.

### `drawStar(gfx, cx, cy, r, color) → void`
Draws a 5-pointed star polygon directly onto a Graphics object. Inner radius = 0.38 × outer radius.

### `drawStars(scene, x, y, total, filled, size?) → Graphics`
Draws a row of `total` stars centered horizontally at `x`. Stars `< filled` are gold (0xFFD700), rest gray (0x444444). `size` defaults to 18. Spacing is `size * 2.4`.

### `createWater(scene, surfaceY, waterColor) → Graphics`
Creates a Graphics object with `_wy` and `_wc` properties set. Pass the returned object to `updateWater` each frame.

### `updateWater(gfx, time) → void`
Clears and redraws a sine-wave animated water fill below `gfx._wy`. Wave: amplitude 9 px, period ~283 px, speed `time * 0.0022`. Call in `update(time, delta)`.

### `titleText(scene, y, label, color?, xOffset?) → Text`
Creates text at `(GAME_WIDTH/2 + xOffset, y)` in Georgia 26px with black stroke. `color` defaults to `'#E8A020'`. `xOffset` (default 0) shifts the center right to avoid overlap with the back button (pass 35–45 for games that have a back button in the top-left).

### `bodyText(scene, y, label, color?, size?) → Text`
Creates centered text at `(GAME_WIDTH/2, y)` in Arial. `color` defaults to `'#ffffff'`, `size` defaults to 17. Word-wrap at `GAME_WIDTH - 40`.

---

## 8. Audio (`js/utils/audio.js`)

Uses the Web Audio API exclusively — no audio files. A single `AudioContext` is created lazily on first use (handles autoplay policy). All methods are on the global `SFX` object.

| Method | Waveform | Freq(s) | Duration | Usage |
|--------|----------|---------|----------|-------|
| `SFX.tap()` | sine | 550 Hz | 0.07 s | Button press, card flip |
| `SFX.correct()` | sine | 880 Hz | 0.18 s | Correct quiz answer |
| `SFX.wrong()` | square | 200 Hz | 0.35 s | Wrong answer / missed item |
| `SFX.match()` | sine | 660→880 Hz | 0.14+0.18 s (140 ms apart) | Memory card pair matched |
| `SFX.win()` | sine | C5→E5→G5→C6 | 0.28 s each, 110 ms apart | Game won |
| `SFX.stamp()` | triangle | 440 Hz | 0.12 s | Passport stamp animation |
| `SFX.collect()` | sine | 660 Hz | 0.08 s | Item collected |
| `SFX.lose()` | sawtooth | 180 Hz | 0.45 s | Life lost / game over |
| `SFX.whoosh()` | sawtooth | 400→80 Hz sweep | 0.25 s | Whoosh transition |

Volume is kept low (0.15–0.30) and uses `exponentialRampToValueAtTime` to avoid clicks.

---

## 9. The 7 Locations & Games

### Location 0 — Bangkok (`BangkokMapGame`)

- **Game type:** Multiple-choice quiz
- **Pool:** 50 questions about Thailand (stored in `QUIZ_QUESTIONS` array at top of file)
- **Per round:** 10 random questions are drawn and shuffled; each shows 4 answer options
- **Mechanic:** Tap one of 4 answer buttons. Green flash = correct; red flash = wrong. 1.2 s delay before next question.
- **Win condition:** Answer 7 of 10 correctly (`this.needed = 7`)
- **Star rating:** 10/10 → 3 stars; 8–9/10 → 2 stars; 7/10 → 1 star
- **Lose path:** Fewer than 7 correct → overlay with retry button (`scene.scene.restart()`)
- **Background:** Dark night city with animated canvas drawing

### Location 1 — Kanchanaburi (`KanchanaburiMemory`)

- **Game type:** Memory card matching
- **Grid:** 4 columns × 4 rows = 16 cards = 8 pairs
- **Animals:** 🐘 🐯 🦋 🐊 🦜 🌸 🌉 🐒
- **Mechanic:** Tap to flip two cards; if they match they stay face-up (dimmed, gold border) and their zones are disabled. If no match, they flip back after 700 ms. Only 2 cards can be flipped at a time (`canFlip` flag).
- **Win condition:** All 8 pairs matched
- **Star rating:** ≤ 12 moves → 3 stars; ≤ 22 moves → 2 stars; else → 1 star
- **Hit detection:** Each card has a companion `Zone` at the card's absolute position (NOT `container.setInteractive()`). This is required for reliable hit detection under `Scale.FIT`.
- **Card flip animation:** Container `scaleX` tweens 1→0 (110 ms), swap visible layers, 0→1 (110 ms).

### Location 2 — Nachttrein (`TrainReflexGame`)

- **Game type:** Reflex / catch (redesigned — no timer, progressive belts, highscore)
- **Mechanic:** Items slide right-to-left across 1–3 conveyor belts. Tap golden suitcases to catch them. Tap red X items → lose a life. Missing a golden item also loses a life.
- **Progressive difficulty:** 0–9 caught = 1 belt at y=505; 10–19 = 2 belts; 20+ = 3 belts. Spawn interval tightens per tier.
- **Speed formula:** `180 + floor(caught / 5) * 15` px/s (score-based, not time-based)
- **Win condition:** Catch ≥ 30 items in one session
- **Star rating:** ≥ 50 → 3 stars; ≥ 35 → 2 stars; ≥ 30 → 1 star
- **Lose path:** Lives reach 0 → retry overlay (all children destroyed and rebuilt cleanly)
- **Highscore:** Saved via `setHighscore('nachttrein', caught)`; shown in HUD alongside caught count
- **HUD:** "✅ Gepakt: N  🏆 Record: N"; hearts display for 3 lives

### Location 3 — Khao Sok (`KhaoSokPuzzle`)

- **Game type:** 3-option quiz (expanded pool, more questions per session)
- **Pool:** 50 questions about Khao Sok jungle, Rafflesia, gibbons, Cheow Lan, rainforest biology
- **Per round:** 15 random questions drawn from the pool (shuffled); each shows 3 answer options
- **Mechanic:** Tap one of 3 answer buttons. Green = correct; red = wrong with correct answer revealed. 1.2 s delay, then next question. Progress dots at top change color per answer.
- **Win condition:** Answer 10 of 15 correctly (`this.needed = 10`, `this.total = 15`)
- **Star rating:** 15/15 → 3 stars; 13+/15 → 2 stars; 10+/15 → 1 star
- **Lose path:** Fewer than 10 correct → retry screen
- **Container pattern:** All question UI (card, text, answer zones) goes into `this._qContainer`; `removeAll(true)` clears it between questions

### Location 4 — Cheow Lan Meer (`LakeRaftGame`)

- **Game type:** 3-lane canoe race (complete redesign)
- **Mechanic:** Canoe at bottom of screen (y=720), starts in center of 3 lanes (x=97/195/293). Tap left half = move left lane; tap right half = move right lane. Canoe slides with 150 ms tween.
- **Obstacles:** Logs (brown rect) and rocks (gray circle) scroll down from y=-50. Stars (⭐) scroll down for points.
- **Spawn:** 1200 ms timer; random lane; 70% obstacle, 30% star
- **Collision:** AABB check in `update()`; same lane and y-overlap = collision or star catch
- **Speed:** `150 + floor(score/4)*20` px/s, increases with score
- **Lives:** 3 (obstacle hit = lose life; SFX.wrong())
- **Win condition:** Collect 12 stars before lives run out (`this.score >= 12`)
- **Star rating:** 20+ caught → 3 stars; 16+ → 2 stars; 12+ → 1 star
- **Lose path:** Lives reach 0 → retry screen
- **HUD:** ⭐ score/12, ❤️ hearts, speed indicator

### Location 5 — Koh Samui (`SamuiBeachGame`)

Three sequential sub-games. Win 2 of 3 to complete the location.

**Sub-game A – Coconut Catch:**
- Beach background with animated coconuts falling from a palm tree
- Tap LEFT or RIGHT half of screen to move the basket ±80 px (clamped to screen edges)
- Coconuts spawn from x≈290 ±30 every 1.1 s, fall at 4.5 px/frame
- Catch 10 to win; miss 5 → lose sub-game

**Sub-game B – Shell Memory:**
- 9 sand-hole positions in 2 rows
- 3 rounds: show 3, 4, 5 shells for 2.5 s then hide them
- Player taps holes to guess positions; correct tap → shell reappears; wrong tap → ❌ + all correct positions hinted; round ends
- Win round if all shells found without a wrong tap
- Win sub-game if ≥ 2 of 3 rounds won

**Sub-game C – Snorkel Fish Find:**
- Underwater scene with 6 fish hidden at alpha 0.35 (with glowing Zone pulsing rings)
- Tap to reveal each fish (alpha → 1.0)
- Win: find all 6 within 90 s; partial win: find 4+ (still counts as sub-game win)

**Final scoring:** 3 wins → 3 stars; 2 wins → 2 stars

### Location 6 — Terug Bangkok (`BangkokFinalGame`)

- **Game type:** Anagram / word-scramble (complete redesign)
- **Theme:** "Maak Thaise woorden van door elkaar gooide letters!"
- **Pool:** 20 Dutch clue → Thai/travel word pairs (TUK-TUK, SAWADEE, RAFFLESIA, GIBBON, etc.)
- **Per round:** 8 words randomly chosen from pool
- **Mechanic:** Dutch clue shown at top; scrambled letter tiles below (tappable rounded rects); empty answer slots at bottom. Tap letter → place in next slot; tap slot → undo. When all slots filled → auto-check. Correct = green flash + advance; wrong = red flash + clear (max 2 attempts, then show answer).
- **Win condition:** 6 of 8 words correct (`this.needed = 6`)
- **Star rating:** 8/8 → 3 stars; 7/8 → 2 stars; 6/8 → 1 star
- **Lose path:** < 6 correct → retry screen (`scene.scene.restart()`)
- **Win path:** Win overlay with "Verder! ▶" button → starts `WinScene`

---

## 10. Bonus Games

### `TetrisGame` (standalone, scene key: `'TetrisGame'`)

- **File:** `js/scenes/games/TetrisGame.js`
- **Game type:** Classic Tetris with Thailand skin
- **Board:** 10×20 grid, centered on screen; 7 standard tetrominoes in Thai-inspired colors
- **Controls (virtual buttons):** ← move left, ↻ rotate, → move right, ⬇ hard drop
- **Scoring:** 1 line=100, 2=300, 3=500, 4=800 (Tetris), multiplied by current level
- **Gravity:** Starts 800 ms/row; decreases 50 ms every 10 lines cleared
- **Highscore:** Saved via `setHighscore('tetris', score)`
- **End screen:** Game over overlay with score, highscore, "Opnieuw" and "Terug" buttons
- **No WinScene / completeLocation** — standalone endless game
- **Init:** Receives `{ name1, name2 }` from `GameScreen`; no `locationIndex`

### `LevelDevilGame` (standalone, scene key: `'LevelDevilGame'`)

- **File:** `js/scenes/games/LevelDevilGame.js`
- **Game type:** Tap-to-jump Thai temple platformer, 5 levels
- **Character:** Monk sprite (orange robe rect + beige circle head)
- **Movement:** Auto-runs right at 85 px/s; tap anywhere = single jump (−580 px/s, gravity 1100 px/s²)
- **Lives:** 3 shared across all 5 levels
- **Controls:** Touch anywhere to jump (only when on ground)
- **Level 1:** 3 collapsing floor tiles (crack after 700 ms, fall after 1.5 s)
- **Level 2:** 3 floor spike zones (extend after 2 s, retract after 1.5 s, staggered)
- **Level 3:** Solid (gray) and fake (purple, collapses 0.9 s after contact) platforms; must reach elevated door
- **Level 4:** Camera auto-pans; player must cross floor gaps before camera outruns them
- **Level 5:** Gauntlet — collapse tiles + spikes + fake platforms combined
- **Death:** Fall off screen or spike hit → lose life → restart current level
- **Level complete:** Reach golden door → flash → next level
- **End screen:** Win (all 5 levels) or game over (no lives left); "Opnieuw" uses `scene.restart({ lives:3 })`
- **No WinScene / completeLocation** — standalone game

---

## 11. React Components

### `App` (`src/App.jsx`)

**State:**
- `save: SaveObject | null` — current save data
- `screen: 'loading' | 'name' | 'map' | 'gamesmenu' | 'game'`
- `gameIdx: number | null` — index of location being played (null for bonus games)
- `bonusScene: string | null` — scene key for bonus game (null for vacation games)
- `returnTo: 'map' | 'gamesmenu'` — where to return after a game

**Behaviour:**
- On mount: `readSave()` from localStorage; route to `'map'` or `'name'`
- `handleNames(name1, name2)`: creates and persists save, goes to `'map'`
- `handlePlay(idx)`: from map, sets `gameIdx`, `returnTo='map'`, goes to `'game'`
- `handlePlayFromMenu(idx)`: from games menu, sets `gameIdx`, `returnTo='gamesmenu'`, goes to `'game'`
- `handlePlayBonus(sceneKey)`: sets `bonusScene`, `returnTo='gamesmenu'`, goes to `'game'`
- `handleReturn()`: re-reads save, clears `gameIdx`/`bonusScene`, goes back to `returnTo`

**Renders:** one of `null | <NameScreen> | <GamesMenuScreen> | <GameScreen> | <MapScreen>` based on `screen`.

---

### `NameScreen` (`src/components/NameScreen.jsx`)

**Props:** `onSubmit: (name1: string, name2: string) => void`

**State:** `name1: string`, `name2: string`

**Renders:** Full-screen gradient form with two `<Field>` sub-components (label + styled input, maxLength 20). Submit button disabled until both fields are non-empty. Calls `onSubmit(name1.trim(), name2.trim())` on submit.

---

### `GamesMenuScreen` (`src/components/GamesMenuScreen.jsx`)

**Props:** `save: SaveObject`, `onPlay: (idx: number) => void`, `onPlayBonus: (sceneKey: string) => void`, `onBack: () => void`

**Renders:**
1. Sticky header with "← Kaart" back button and "🎮 Alle Spellen" title
2. Section "🗺️ Vakantie Spellen" — scrollable list of all 7 vacation game tiles (stamp emoji, name, dateLabel, lock icon if locked, star row if completed)
3. Section "🎮 Extra Spellen" — 2 bonus game tiles (TetrisGame, LevelDevilGame; always unlocked)

**Locked tile behaviour:** Vacation tiles with `unlocked=false` are greyed out and disabled.

---

### `MapScreen` (`src/components/MapScreen.jsx`)

**Props:** `save: SaveObject`, `onPlay: (idx: number) => void`, `onGamesMenu: () => void`

**State:** `activeIdx: number | null` — which location's story drawer is open

**Renders:**
1. Header bar: title "Thailand Avontuur", player names, "Spellen" button (→ `onGamesMenu`), total star count
2. Scrollable map area: `<ThailandMap>` with route lines and markers
3. `<ProgressBar>`: completed count, gradient fill bar
4. Conditionally: `<StoryDrawer>` in an absolute overlay when `activeIdx !== null`

**handleMarkerTap(idx):** Only opens drawer if `save.locations[idx].unlocked`.

---

### `ThailandMap` (`src/components/ThailandMap.jsx`)

**Props:** `save: SaveObject`, `activeIdx: number | null`, `onMarkerTap: (idx: number) => void`

**Renders:**
- `<img src="/img/map.png">` full-width, pointer-events:none
- SVG overlay (`viewBox="0 0 100 100"`, `preserveAspectRatio="none"`): dashed amber route lines between consecutive unlocked locations
- One `<LocationMarker>` per location positioned by `location.mapX * 100%` / `location.mapY * 100%`

**LocationMarker behaviour:**
- Locked: 26 px gray circle, 🔒 emoji, no label
- Unlocked not completed: 42 px colored circle, location stamp emoji, name label below, `marker-pulse` CSS animation, glow shadow
- Unlocked completed: same but without pulse, slightly muted border
- Active (selected): scale 1.25×, white ring + color glow shadow, z-index 20

---

### `StoryDrawer` (`src/components/StoryDrawer.jsx`)

**Props:** `location: LocationDef`, `locSave: LocationSave`, `onPlay: () => void`, `onClose: () => void`

**Renders:**
- Semi-opaque backdrop (`onClick` → `onClose`)
- Bottom sheet that slides up (`.drawer` animation class): gradient background, rounded top corners, drag handle bar, close (X) button
- Location header: stamp emoji, `storyTitle`, `dateLabel · nameTH`
- Star row (3 stars, filled gold up to `stars`) — only shown when `completed && stars > 0`
- Story text (pre-line whitespace, `storyText` from location data)
- Play button: "Speel nu!" (orange gradient) or "Speel opnieuw" (green gradient) with lucide icons

---

### `GameScreen` (`src/components/GameScreen.jsx`)

**Props:** `locationIndex: number`, `saveData: SaveObject`, `onReturn: () => void`

**State:** none (uses refs)

**Refs:** `containerRef` (DOM div), `gameRef` (Phaser.Game instance)

**Behaviour:** See §4 Architecture — GameScreen lifecycle.

**Renders:** A `position:fixed; inset:0; z-index:100; background:#1A0A00` div that Phaser renders into.

---

## 11. Phaser Scene Structure

### Common pattern for all game scenes

```js
class MyGame extends Phaser.Scene {
    constructor() { super({ key: 'MyGame' }); }

    init(data) {
        // Called before create(). Store data from scene.start():
        this.locationIndex = data.locationIndex;  // number
        this.name1 = data.name1;                  // string
        this.name2 = data.name2;                  // string
        // data.saveData is also available if needed
    }

    create() {
        // Build all game objects here.
        // Use Zone for all interactive hit areas (see §13).
        // Store timer events in refs so _cleanup() can remove them.
    }

    update(time, delta) {
        // Called every frame. Check this._running flag first.
        // time: ms since game start; delta: ms since last frame
    }

    _endGame(won) {
        this._cleanup();
        if (won) {
            var stars = /* compute 1–3 */;
            completeLocation(this.locationIndex, stars);  // saves to localStorage
            this.scene.start('WinScene', {
                locationIndex: this.locationIndex,
                stars: stars,
                name1: this.name1,
                name2: this.name2
            });
        } else {
            this._showRetry();
        }
    }

    _showRetry() {
        // Overlay + retry button that calls scene.scene.restart()
    }

    _cleanup() {
        // Remove timer events; destroy spawned objects; set this._running = false
    }
}
```

### Win path (all scenes)

```
_endGame(true)
  → completeLocation(idx, stars)   // writes localStorage
  → scene.start('WinScene', data)
      WinScene.create()
        → passport stamp animation + confetti + SFX.win()
        → "Terug naar de kaart" button
           → window._onReturnToMap()    // React's handleReturn()
              → readSave() → setSave() → setScreen('map')
```

### Lose path (all scenes)

```
_endGame(false) or _showRetry()
  → SFX.lose()
  → overlay with retry button
     → scene.scene.restart()   // re-runs init() + create()
```

### How to add a new game (step-by-step)

1. Create `js/scenes/games/MyNewGame.js` using the pattern above.
2. Add `LOCATIONS` entry in `js/config.js` (Phaser copy) and `src/data/locations.js` (React copy) with `scene: 'MyNewGame'`.
3. Add the initial location save entry in `App.jsx`'s `createSave()` and `js/save.js`'s `_defaultSave()`.
4. Add `<script src="/js/scenes/games/MyNewGame.js"></script>` in `index.html` before the inline script block.
5. Add `window.MyNewGame = MyNewGame;` in the inline script block.
6. Add `'MyNewGame'` to `SCENE_KEYS` in `GameScreen.jsx`.

---

## 12. Scene Transition Flow

```
React: screen='name'
  │  User submits names
  ▼
React: screen='map'   [save loaded from localStorage]
  │  User taps unlocked marker → StoryDrawer opens
  │  User taps "Speel nu!"
  ▼
React: screen='game'  [GameScreen mounts]
  │  Phaser.Game created (40 ms defer)
  │  scene.start(loc.scene, { locationIndex, name1, name2, saveData })
  ▼
Phaser: [GameScene].init(data)
  │  [GameScene].create()
  │  ... gameplay loop ...
  │  _endGame(true)
  │    completeLocation(idx, stars) → localStorage
  │    scene.start('WinScene', { locationIndex, stars, name1, name2 })
  ▼
Phaser: WinScene.create()
  │  Confetti, stamp, stars animate
  │  Player taps "Terug naar de kaart"
  │    window._onReturnToMap()
  ▼
React: handleReturn()
  │  readSave() → setSave(updated)
  │  setGameIdx(null), setScreen('map')
  ▼
React: screen='map'
  │  GameScreen unmounts → Phaser.destroy(true)
  │  MapScreen renders with updated save (next location now unlocked)
  ▼
(repeat for next location)
```

---

## 13. Input Reliability Notes

**CRITICAL — read before adding any interactive game object.**

### The problem

Under `Phaser.Scale.FIT`, the Phaser canvas is scaled by the browser. Container-based interactivity (`container.setInteractive(new Phaser.Geom.Rectangle(...), ...)`) uses container-local coordinates, but the coordinate mapping from screen touch → Phaser world breaks when a container is a child of a scaled parent. This causes taps to register on the wrong object or not at all.

### The solution: always use independent Zones

```js
// WRONG — coordinate mapping fails under Scale.FIT
var container = this.add.container(cx, cy);
container.setInteractive(new Phaser.Geom.Rectangle(-w/2, -h/2, w, h),
    Phaser.Geom.Rectangle.Contains);

// CORRECT — Zone uses world coordinates, unaffected by container transforms
var container = this.add.container(cx, cy);       // visual only
var hitZone = scene.add.zone(cx, cy, w, h).setInteractive();
hitZone.on('pointerdown', callback);
```

### Moving objects

When a game object moves (e.g., sliding conveyor items), create a companion Zone and update its position every frame:

```js
// In create():
this.itemSprite = this.add.text(x, y, '🎒', { fontSize: '36px' });
this.itemZone   = this.add.zone(x, y, 50, 50).setInteractive();
this.itemZone.on('pointerdown', onTap);

// In update():
this.itemSprite.setPosition(newX, newY);
this.itemZone.setPosition(newX, newY);   // keeps hit area in sync
```

### Moving interactive objects

For objects that move (e.g., TrainReflexGame belt items), create a Zone alongside the container and update it each frame:

```js
var hitZone = scene.add.zone(container.x, container.y, w, h).setInteractive();
container._hitZone = hitZone;
// In update():
this._items.forEach(function(item) { if (item._hitZone) item._hitZone.x = item.x; });
// On destroy:
if (container._hitZone) { container._hitZone.destroy(); container._hitZone = null; }
```

---

## 14. Testing

### Installation

```bash
pip install pytest playwright
playwright install chromium
```

### Running

```bash
# From the project root:
python -m pytest tests/ -v
```

### Infrastructure (`tests/conftest.py`)

- `game_server` fixture (session scope): launches `npm run dev -- --port 5174` as a subprocess, waits up to 20 s for the port to open, yields the base URL, terminates on teardown.
- `game_page` fixture: sets viewport to 390×844, navigates to server, injects a pre-built save into `localStorage` (Bangkok unlocked, Emma & Lars), reloads page.

Hardcoded paths in `conftest.py`:
- `NODE_PATH = r"C:\Program Files\nodejs"` — adjust for non-Windows or different Node install
- `cwd = "c:/projects/claude/thailand-game"`

### Test classes (`tests/test_game.py`)

| Class | What it covers |
|-------|----------------|
| `TestNameScreen` | Fresh start shows name inputs; submitting names routes to map; save is written to localStorage |
| `TestMapScreen` | Map renders with Bangkok marker; locked markers are visible; tapping Bangkok opens story drawer |
| `TestStoryDrawer` | Drawer shows correct title, date label; play button present; close button works |
| `TestGameTransition` | "Speel nu!" mounts Phaser; `window._game` is set; `BangkokMapGame` scene becomes active |
| `TestBangkokGame` | Quiz scene is active; answering questions works; winning calls `completeLocation`; WinScene appears |
| `TestReturnToMap` | After WinScene, "Terug naar de kaart" button returns React to map screen; save is updated |
| `TestProgressPersistence` | Completed locations show star rating in drawer; progress bar reflects completion |

### Key helper functions

```python
get_save(page)                         # reads and parses localStorage save
wait_for_phaser_scene(page, key)       # waits for window._game.scene.isActive(key)
enter_bangkok_game(page)               # clicks Bangkok marker → story drawer → "Speel nu!"
answer_quiz_n_correct(page, n)         # drives quiz answers via JS evaluation
```

---

## 15. Build & Deploy

### Development

```bash
npm install
npm run dev
# App at http://localhost:5173
# Tests use port 5174 (separate --port flag passed by conftest.py)
```

### Production build

```bash
npm run build
# Output: dist/
```

`vite-plugin-static-copy` copies these directories into `dist/` verbatim:
- `lib/` → `dist/lib/` (phaser.min.js)
- `js/` → `dist/js/` (all game scripts)
- `img/` → `dist/img/` (map.png)
- `icons/` → `dist/icons/` (PWA icons)

`vite-plugin-pwa` generates:
- `dist/sw.js` (Workbox service worker)
- `dist/manifest.webmanifest`
- Caches all `**/*.{js,css,html,png,svg}` files up to 5 MB each

### PWA install (phone)

1. Deploy `dist/` to any HTTPS static host (Netlify, Vercel, GitHub Pages, etc.).
2. Open on phone in Chrome/Safari.
3. Chrome: "Add to Home Screen" in browser menu.
4. Safari iOS: Share → "Voeg toe aan beginscherm".

The app then launches in `standalone` mode (no browser chrome), portrait orientation, with `theme_color: #0288D1` and `background_color: #0D1B4B`.

### Offline capability

After first load, the Workbox service worker caches all assets. Subsequent visits — including after going offline — serve fully from cache. Save data lives in `localStorage` (always available offline).

### Preview built output locally

```bash
npm run preview
# Serves dist/ at http://localhost:4173
```

---

## 16. Color Palette & Theme

### CSS variables (`src/theme.css`)

| Variable | Value | Used for |
|----------|-------|----------|
| `--ocean` | `#0288D1` | Primary blue, theme color |
| `--ocean-deep` | `#01579B` | Header backgrounds |
| `--ocean-dark` | `#0D1B4B` | App background, body |
| `--jungle` | `#2E7D32` | Kanchanaburi, Khao Sok accent |
| `--jungle-mid` | `#388E3C` | Secondary jungle |
| `--sand` | `#E8A020` | Gold accent, titles, stars |
| `--sand-light` | `#FFF8E7` | Light cream |
| `--coral` | `#D84315` | Orange/red, play buttons |
| `--white` | `#ffffff` | Text |
| `--muted` | `rgba(255,255,255,0.65)` | Secondary text |
| `--card` | `rgba(255,255,255,0.08)` | Card backgrounds |
| `--border` | `rgba(255,255,255,0.14)` | Card borders |
| `--radius` | `20px` | Large border-radius |
| `--radius-sm` | `12px` | Small border-radius |
| `--shadow` | `0 8px 32px rgba(0,0,0,0.45)` | Card shadows |

### CSS animations (`src/theme.css`)

| Class / Keyframe | Effect |
|-----------------|--------|
| `.marker-pulse` | `pulse-ring` — 2 s infinite white box-shadow ring on unlocked markers |
| `.drawer` | `slide-up` — 0.28 s cubic-bezier bottom-sheet slide |
| `.backdrop` | `fade-in` — 0.2 s opacity 0→1 |

### Phaser color constants (`js/config.js`)

| Constant | Hex | Usage |
|----------|-----|-------|
| `COLORS.gold` | `0xE8A020` | Titles, stars, Bangkok marker |
| `COLORS.orange` | `0xD84315` | Retry buttons |
| `COLORS.red` | `0xB71C1C` | Terug Bangkok marker |
| `COLORS.teal` | `0x00897B` | Koh Samui marker |
| `COLORS.jungle` | `0x2E7D32` | Kanchanaburi/Khao Sok |
| `COLORS.night` | `0x0D1B4B` | Night backgrounds |
| `COLORS.sand` | `0xF5DEB3` | Sandy surfaces |
| `COLORS.water` | `0x0288D1` | Water surfaces |
| `COLORS.bg` | `0x1A0A00` | Default Phaser game background |
| `COLORS.white` | `0xFFFFFF` | White elements |
| `COLORS.dark` | `0x111111` | Near-black |
| `COLORS.gray` | `0x555555` | Inactive / locked elements |

### Per-location colors

| Location | Color (hex) | Used for marker background and accent |
|----------|-------------|--------------------------------------|
| Bangkok | `#E8A020` / `0xE8A020` | Gold |
| Kanchanaburi | `#2E7D32` / `0x2E7D32` | Forest green |
| Nachttrein | `#5C6BC0` (React) / `0x1A237E` (Phaser) | Indigo |
| Khao Sok | `#388E3C` / `0x388E3C` | Mid green |
| Cheow Lan | `#0288D1` / `0x0288D1` | Sky blue |
| Koh Samui | `#00897B` / `0x00897B` | Teal |
| Terug Bangkok | `#B71C1C` / `0xB71C1C` | Dark red |

Note: React `locations.js` and Phaser `config.js` both define `LOCATIONS` arrays independently, so color values must be kept in sync in both files if changed.

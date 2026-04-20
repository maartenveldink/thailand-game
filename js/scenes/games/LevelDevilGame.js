// LevelDevilGame — Tap-to-jump Thai temple platformer, 15 levels.
// Auto-runs right; tap to jump; 3 lives shared across all levels.
// Standalone bonus game — no completeLocation(), no WinScene.

// Module-level: persists completed levels across scene restarts within a session
var _templeCompleted = new Set();
var _templeUnlockAll = (function () {
    try { return new URLSearchParams(window.location.search).get('unlock') === 'all'; } catch (e) { return false; }
}());

class LevelDevilGame extends Phaser.Scene {
    constructor() { super({ key: 'LevelDevilGame' }); }

    init(data) {
        this.name1 = data.name1 !== undefined ? data.name1 : (this.name1 || '');
        this.name2 = data.name2 !== undefined ? data.name2 : (this.name2 || '');
        this._initLives      = data.lives      !== undefined ? data.lives      : 3;
        this._initStartLevel = data.startLevel !== undefined ? data.startLevel : 1;
    }

    create() {
        var scene = this;

        // ── Game state ────────────────────────────────────────────────────
        this.lives    = this._initLives;
        this.level    = 1;
        this._running = false;
        this._dead    = false;
        this._completedLevels = _templeCompleted;   // shared module ref
        this._unlockAll       = _templeUnlockAll;

        // ── Player physics constants ──────────────────────────────────────
        this._PW      = 24;
        this._PH      = 38;
        this._GRAVITY = 1100;
        this._JUMP_V  = -580;
        var _s = window.loadSettings ? window.loadSettings() : {};
        this._SPEED   = _s.templeSpeed === 'slow' ? 60 : _s.templeSpeed === 'fast' ? 120 : 85;
        this._GROUND_Y = 762;

        // ── Player state ──────────────────────────────────────────────────
        this._px       = 35;
        this._py       = this._GROUND_Y - this._PH;
        this._vy       = 0;
        this._onGround = true;

        // ── Camera / world ────────────────────────────────────────────────
        this._camX   = 0;
        this._LEVEL_W = 630;

        // ── World objects ─────────────────────────────────────────────────
        this._platforms = [];   // { x, y, w, h, type, triggered?, cracking?, wobbling?, destroyed? }
        this._traps     = [];   // { type:'spike', x, y, w, h, extended, _lastToggle, _phase, extendTime?, retractTime? }
        this._holes     = [];   // { x, w, moving?, speed?, minX?, maxX? }
        this._door      = null;

        // ── Graphics layers ───────────────────────────────────────────────
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x1C0A00).setOrigin(0);
        this._bgGfx     = this.add.graphics();
        this._worldGfx  = this.add.graphics();
        this._playerGfx = this.add.graphics();
        this._flashGfx  = this.add.graphics();

        this._playerText = this.add.text(0, 0, '🏃', {
            fontSize: '32px', stroke: '#000', strokeThickness: 1
        }).setOrigin(0.5, 1).setScale(-1, 1);

        this._drawBackground();
        this._setupHUD();
        this._buildLevel(this._initStartLevel);

        // Tap to jump (guard: selector open ↔ _running false)
        this.input.on('pointerdown', function () {
            if (!scene._running || scene._dead) return;
            if (scene._onGround) {
                scene._vy      = scene._JUMP_V;
                scene._onGround = false;
            }
        });

        this._running = true;
    }

    // ── Background ────────────────────────────────────────────────────────
    _drawBackground() {
        var g = this._bgGfx;
        g.clear();
        g.fillStyle(0x3E2723, 1);
        g.fillRect(0, 76, GAME_WIDTH, GAME_HEIGHT - 76);
        g.lineStyle(1, 0xFFD700, 0.25);
        for (var gy = 114; gy < GAME_HEIGHT; gy += 55) {
            g.beginPath(); g.moveTo(0, gy); g.lineTo(GAME_WIDTH, gy); g.strokePath();
        }
        g.fillStyle(0x4A1505, 1);
        g.fillTriangle(295, 76, 345, 76, 320, 36);
        g.fillTriangle(338, 76, 382, 76, 360, 44);
        g.lineStyle(1, 0xFFD700, 0.5);
        g.beginPath(); g.moveTo(320, 76); g.lineTo(320, 36); g.strokePath();
        g.beginPath(); g.moveTo(360, 76); g.lineTo(360, 44); g.strokePath();
    }

    // ── HUD ───────────────────────────────────────────────────────────────
    _setupHUD() {
        var scene = this;
        this.add.rectangle(0, 0, GAME_WIDTH, 76, 0x000000, 0.88).setOrigin(0);
        backArrow(this, function () { window._onReturnToMap && window._onReturnToMap(); }, 44);

        // Title centered with left margin for back arrow
        scene.add.text(GAME_WIDTH / 2, 14, '🛕 Tempel Tocht', {
            fontFamily: 'Georgia, serif', fontSize: '22px', color: '#FFD700',
            stroke: '#000000', strokeThickness: 3, align: 'center'
        }).setOrigin(0.5, 0);

        // Lives — bottom-left of header
        this._livesText = this.add.text(14, 52, '❤️❤️❤️', {
            fontFamily: 'Arial', fontSize: '15px'
        }).setOrigin(0, 0);

        // Level text — bottom-right, tappable
        this._levelText = this.add.text(GAME_WIDTH - 10, 52, 'Level 1 / 15  📋', {
            fontFamily: 'Arial', fontSize: '12px', color: '#AAAAAA'
        }).setOrigin(1, 0).setInteractive();
        this._levelText.on('pointerdown', function () { scene._showLevelSelector(); });
    }

    _updateHUD() {
        var h = '';
        for (var i = 0; i < this.lives; i++) h += '❤️';
        for (var j = this.lives; j < 3; j++) h += '🖤';
        this._livesText.setText(h);
        this._levelText.setText('Level ' + this.level + ' / 15  📋');
    }

    // ── Level builder ─────────────────────────────────────────────────────
    _buildLevel(lvl) {
        this._running   = false;
        this._dead      = false;
        this.level      = lvl;
        this._platforms = [];
        this._traps     = [];
        this._holes     = [];
        this._door      = null;
        this._camX      = 0;
        this._LEVEL_W   = 630;

        this._px       = 35;
        this._py       = this._GROUND_Y - this._PH;
        this._vy       = 0;
        this._onGround = true;

        if (lvl >= 1 && lvl <= 15) this['_level' + lvl]();

        this._updateHUD();
        this._running = true;
    }

    // ── LEVEL DEFINITIONS ─────────────────────────────────────────────────

    // Level 1 — Collapse tiles: 3 floor tiles crack and fall after 1.5 s
    _level1() {
        var gY = this._GROUND_Y;
        this._platforms.push({ x: 110, y: gY - 14, w: 60, h: 14, type: 'collapse', triggered: false, cracking: false, destroyed: false });
        this._platforms.push({ x: 240, y: gY - 14, w: 60, h: 14, type: 'collapse', triggered: false, cracking: false, destroyed: false });
        this._platforms.push({ x: 375, y: gY - 14, w: 60, h: 14, type: 'collapse', triggered: false, cracking: false, destroyed: false });
        this._platforms.push({ x: 470, y: gY - 88, w: 75, h: 14, type: 'solid' });
        this._door = { x: 562, y: gY - 95, w: 28, h: 78 };
    }

    // Level 2 — Staggered spike traps with bypass platforms
    _level2() {
        var gY = this._GROUND_Y;
        this._traps.push({ type: 'spike', x: 130, y: gY - 36, w: 52, h: 36, extended: false, _lastToggle: null, _phase: 0 });
        this._traps.push({ type: 'spike', x: 275, y: gY - 36, w: 52, h: 36, extended: false, _lastToggle: null, _phase: 700 });
        this._traps.push({ type: 'spike', x: 420, y: gY - 36, w: 52, h: 36, extended: false, _lastToggle: null, _phase: 1400 });
        this._platforms.push({ x: 110, y: gY - 118, w: 85, h: 14, type: 'solid' });
        this._platforms.push({ x: 380, y: gY - 118, w: 85, h: 14, type: 'solid' });
        this._platforms.push({ x: 505, y: gY - 88,  w: 80, h: 14, type: 'solid' });
        this._door = { x: 562, y: gY - 158, w: 28, h: 70 };
    }

    // Level 3 — Fake platforms: purple = fake (wobbles then falls), gray = real
    _level3() {
        var gY = this._GROUND_Y;
        this._LEVEL_W = 750;
        this._platforms.push({ x: 200, y: gY - 82,  w: 80, h: 14, type: 'solid' });
        this._platforms.push({ x: 320, y: gY - 172, w: 80, h: 14, type: 'fake', triggered: false, wobbling: false, destroyed: false });
        this._platforms.push({ x: 440, y: gY - 260, w: 80, h: 14, type: 'solid' });
        this._platforms.push({ x: 560, y: gY - 345, w: 80, h: 14, type: 'fake', triggered: false, wobbling: false, destroyed: false });
        this._platforms.push({ x: 650, y: gY - 400, w: 75, h: 14, type: 'solid' });
        this._door = { x: 680, y: gY - 470, w: 28, h: 70 };
    }

    // Level 4 — Moving holes: ground gaps that slide back and forth (NEW)
    _level4() {
        var gY = this._GROUND_Y;
        this._LEVEL_W = 720;
        this._holes.push({ x: 130, w: 58, moving: true, speed:  55, minX:  90, maxX: 230 });
        this._holes.push({ x: 355, w: 58, moving: true, speed: -65, minX: 295, maxX: 435 });
        this._holes.push({ x: 550, w: 58, moving: true, speed:  70, minX: 500, maxX: 645 });
        this._door = { x: 665, y: gY - 68, w: 28, h: 68 };
    }

    // Level 5 — Gauntlet 1: all trap types from levels 1-3
    _level5() {
        var gY = this._GROUND_Y;
        this._platforms.push({ x: 70,  y: gY - 14, w: 50, h: 14, type: 'collapse', triggered: false, cracking: false, destroyed: false });
        this._traps.push(    { type: 'spike', x: 165, y: gY - 32, w: 42, h: 32, extended: false, _lastToggle: null, _phase: 0 });
        this._platforms.push({ x: 248, y: gY - 98, w: 72, h: 14, type: 'fake',    triggered: false, wobbling: false, destroyed: false });
        this._platforms.push({ x: 348, y: gY - 14, w: 50, h: 14, type: 'collapse', triggered: false, cracking: false, destroyed: false });
        this._traps.push(    { type: 'spike', x: 443, y: gY - 32, w: 42, h: 32, extended: false, _lastToggle: null, _phase: 600 });
        this._platforms.push({ x: 522, y: gY - 90, w: 78, h: 14, type: 'solid' });
        this._door = { x: 560, y: gY - 160, w: 28, h: 70 };
    }

    // Level 6 — Static holes: fixed gaps in the ground
    _level6() {
        var gY = this._GROUND_Y;
        this._LEVEL_W = 700;
        this._holes.push({ x: 110, w: 58, moving: false });
        this._holes.push({ x: 262, w: 62, moving: false });
        this._holes.push({ x: 422, w: 58, moving: false });
        this._platforms.push({ x: 340, y: gY - 92, w: 68, h: 14, type: 'solid' });
        this._door = { x: 635, y: gY - 68, w: 28, h: 68 };
    }

    // Level 7 — Moving hole + spike combo
    _level7() {
        var gY = this._GROUND_Y;
        this._LEVEL_W = 750;
        this._holes.push({ x: 120, w: 58, moving: true, speed:  60, minX:  90, maxX: 220 });
        this._traps.push({ type: 'spike', x: 320, y: gY - 36, w: 52, h: 36, extended: false, _lastToggle: null, _phase: 0 });
        this._platforms.push({ x: 296, y: gY - 118, w: 86, h: 14, type: 'solid' });
        this._holes.push({ x: 492, w: 58, moving: true, speed: -55, minX: 440, maxX: 580 });
        this._door = { x: 690, y: gY - 68, w: 28, h: 68 };
    }

    // Level 8 — Collapse platforms + static holes alternating
    _level8() {
        var gY = this._GROUND_Y;
        this._LEVEL_W = 720;
        this._holes.push({ x: 108, w: 56, moving: false });
        this._platforms.push({ x: 210, y: gY - 14, w: 60, h: 14, type: 'collapse', triggered: false, cracking: false, destroyed: false });
        this._holes.push({ x: 332, w: 58, moving: false });
        this._platforms.push({ x: 432, y: gY - 14, w: 60, h: 14, type: 'collapse', triggered: false, cracking: false, destroyed: false });
        this._platforms.push({ x: 516, y: gY - 90, w: 72, h: 14, type: 'solid' });
        this._door = { x: 650, y: gY - 158, w: 28, h: 70 };
    }

    // Level 9 — Fast spikes + moving hole
    _level9() {
        var gY = this._GROUND_Y;
        this._LEVEL_W = 750;
        this._traps.push({ type: 'spike', x: 120, y: gY - 36, w: 52, h: 36, extended: false, _lastToggle: null, _phase: 0,   extendTime: 1500, retractTime: 1000 });
        this._platforms.push({ x:  98, y: gY - 118, w: 82, h: 14, type: 'solid' });
        this._traps.push({ type: 'spike', x: 270, y: gY - 36, w: 52, h: 36, extended: false, _lastToggle: null, _phase: 600, extendTime: 1500, retractTime: 1000 });
        this._platforms.push({ x: 248, y: gY - 118, w: 82, h: 14, type: 'solid' });
        this._holes.push({ x: 422, w: 62, moving: true, speed: 80, minX: 380, maxX: 530 });
        this._platforms.push({ x: 576, y: gY - 92, w: 72, h: 14, type: 'solid' });
        this._door = { x: 682, y: gY - 160, w: 28, h: 70 };
    }

    // Level 10 — Dense collapse trail + moving hole at end
    _level10() {
        var gY = this._GROUND_Y;
        this._LEVEL_W = 720;
        this._platforms.push({ x: 100, y: gY - 14, w: 55, h: 14, type: 'collapse', triggered: false, cracking: false, destroyed: false });
        this._platforms.push({ x: 195, y: gY - 14, w: 55, h: 14, type: 'collapse', triggered: false, cracking: false, destroyed: false });
        this._platforms.push({ x: 295, y: gY - 14, w: 55, h: 14, type: 'collapse', triggered: false, cracking: false, destroyed: false });
        this._platforms.push({ x: 392, y: gY - 14, w: 55, h: 14, type: 'collapse', triggered: false, cracking: false, destroyed: false });
        this._platforms.push({ x: 472, y: gY - 92, w: 72, h: 14, type: 'solid' });
        this._holes.push({ x: 558, w: 58, moving: true, speed: 65, minX: 522, maxX: 648 });
        this._door = { x: 660, y: gY - 160, w: 28, h: 70 };
    }

    // Level 11 — Triple moving holes, no platforms to hide on
    _level11() {
        var gY = this._GROUND_Y;
        this._LEVEL_W = 800;
        this._holes.push({ x: 110, w: 62, moving: true, speed:  55, minX:  80, maxX: 235 });
        this._holes.push({ x: 372, w: 62, moving: true, speed: -70, minX: 312, maxX: 462 });
        this._holes.push({ x: 612, w: 62, moving: true, speed:  65, minX: 562, maxX: 715 });
        this._door = { x: 748, y: gY - 68, w: 28, h: 68 };
    }

    // Level 12 — Vertical climb + moving hole at the base
    _level12() {
        var gY = this._GROUND_Y;
        this._LEVEL_W = 820;
        this._holes.push({ x: 100, w: 58, moving: true, speed: 55, minX: 70, maxX: 205 });
        this._platforms.push({ x: 192, y: gY - 96,  w: 72, h: 14, type: 'solid' });
        this._platforms.push({ x: 308, y: gY - 186, w: 72, h: 14, type: 'solid' });
        this._platforms.push({ x: 418, y: gY - 276, w: 72, h: 14, type: 'fake', triggered: false, wobbling: false, destroyed: false });
        this._platforms.push({ x: 532, y: gY - 362, w: 72, h: 14, type: 'solid' });
        this._platforms.push({ x: 642, y: gY - 442, w: 72, h: 14, type: 'fake', triggered: false, wobbling: false, destroyed: false });
        this._platforms.push({ x: 732, y: gY - 512, w: 72, h: 14, type: 'solid' });
        this._door = { x: 762, y: gY - 582, w: 28, h: 70 };
    }

    // Level 13 — Slow + fast moving holes with spikes in between
    _level13() {
        var gY = this._GROUND_Y;
        this._LEVEL_W = 850;
        this._holes.push({ x: 112, w: 58, moving: true, speed:  40, minX:  80, maxX: 242 });  // slow
        this._traps.push({ type: 'spike', x: 322, y: gY - 36, w: 52, h: 36, extended: false, _lastToggle: null, _phase: 0, extendTime: 1800, retractTime: 1200 });
        this._platforms.push({ x: 300, y: gY - 118, w: 82, h: 14, type: 'solid' });
        this._holes.push({ x: 462, w: 62, moving: true, speed:  90, minX: 412, maxX: 582 });  // fast
        this._platforms.push({ x: 462, y: gY - 100, w: 75, h: 14, type: 'solid' });           // hop over fast hole
        this._platforms.push({ x: 612, y: gY - 14,  w: 55, h: 14, type: 'collapse', triggered: false, cracking: false, destroyed: false });
        this._door = { x: 776, y: gY - 68, w: 28, h: 68 };
    }

    // Level 14 — All mechanics combined
    _level14() {
        var gY = this._GROUND_Y;
        this._LEVEL_W = 900;
        this._holes.push({ x: 100, w: 56, moving: false });
        this._platforms.push({ x: 205, y: gY - 14,  w: 56, h: 14, type: 'collapse', triggered: false, cracking: false, destroyed: false });
        this._traps.push({ type: 'spike', x: 317, y: gY - 36, w: 52, h: 36, extended: false, _lastToggle: null, _phase: 0 });
        this._platforms.push({ x: 296, y: gY - 118, w: 82, h: 14, type: 'solid' });
        this._holes.push({ x: 442, w: 60, moving: true, speed: 65, minX: 402, maxX: 544 });
        this._platforms.push({ x: 576, y: gY - 96,  w: 72, h: 14, type: 'fake', triggered: false, wobbling: false, destroyed: false });
        this._platforms.push({ x: 672, y: gY - 166, w: 72, h: 14, type: 'solid' });
        this._holes.push({ x: 762, w: 56, moving: false });
        this._door = { x: 832, y: gY - 68, w: 28, h: 68 };
    }

    // Level 15 — Final gauntlet: everything, tight timing
    _level15() {
        var gY = this._GROUND_Y;
        this._LEVEL_W = 1000;
        this._holes.push({ x:  90, w: 60, moving: true, speed:  70, minX:  60, maxX: 202 });
        this._traps.push({ type: 'spike', x: 258, y: gY - 36, w: 52, h: 36, extended: false, _lastToggle: null, _phase: 0,   extendTime: 1500, retractTime: 1000 });
        this._platforms.push({ x: 238, y: gY - 118, w: 82, h: 14, type: 'solid' });
        this._platforms.push({ x: 337, y: gY - 14,  w: 56, h: 14, type: 'collapse', triggered: false, cracking: false, destroyed: false });
        this._holes.push({ x: 432, w: 62, moving: true, speed: -85, minX: 382, maxX: 555 });
        this._traps.push({ type: 'spike', x: 604, y: gY - 36, w: 52, h: 36, extended: false, _lastToggle: null, _phase: 500, extendTime: 1500, retractTime: 1000 });
        this._platforms.push({ x: 582, y: gY - 118, w: 82, h: 14, type: 'solid' });
        this._platforms.push({ x: 702, y: gY - 102, w: 72, h: 14, type: 'fake', triggered: false, wobbling: false, destroyed: false });
        this._platforms.push({ x: 788, y: gY - 172, w: 72, h: 14, type: 'solid' });
        this._holes.push({ x: 868, w: 62, moving: true, speed: 75, minX: 832, maxX: 958 });
        this._door = { x: 955, y: gY - 68, w: 28, h: 68 };
    }

    // ── Update loop ───────────────────────────────────────────────────────
    update(time, delta) {
        if (!this._running || this._dead) return;
        var dt = Math.min(delta / 1000, 0.05);
        var prevPY = this._py;

        // Physics
        this._vy += this._GRAVITY * dt;
        this._px += this._SPEED * dt;
        this._py += this._vy * dt;

        // Right-edge death
        if (this._px > this._LEVEL_W + 40) { this._die(); return; }

        // Update holes and spikes
        this._updateHoles(dt);
        this._updateSpikes(time);

        // ── Platform collision ────────────────────────────────────────────
        this._onGround = false;
        var pw = this._PW, ph = this._PH;

        for (var i = 0; i < this._platforms.length; i++) {
            var p = this._platforms[i];
            if (p.destroyed) continue;
            var inX    = this._px + pw > p.x && this._px < p.x + p.w;
            var botNow  = this._py + ph;
            var botPrev = prevPY + ph;
            if (inX && this._vy >= 0 && botPrev <= p.y + 4 && botNow >= p.y - 2) {
                this._py       = p.y - ph;
                this._vy       = 0;
                this._onGround = true;
                if (p.type === 'collapse' && !p.triggered) this._triggerCollapse(p);
                if (p.type === 'fake'     && !p.triggered) this._triggerFake(p);
            }
        }

        // Ground collision — skip when player is over a hole
        if (!this._isOverHole(this._px, pw)) {
            if (this._py + ph >= this._GROUND_Y) {
                this._py       = this._GROUND_Y - ph;
                this._vy       = 0;
                this._onGround = true;
            }
        }

        // Spike collision
        for (var j = 0; j < this._traps.length; j++) {
            var tr = this._traps[j];
            if (tr.type === 'spike' && tr.extended) {
                if (this._px + pw > tr.x && this._px < tr.x + tr.w &&
                    this._py + ph > tr.y && this._py < tr.y + tr.h) {
                    this._die(); return;
                }
            }
        }

        // Fall off screen
        if (this._py > GAME_HEIGHT + 80) { this._die(); return; }

        // Door reached
        var d = this._door;
        if (d) {
            var cx2 = this._px + pw / 2, cy2 = this._py + ph / 2;
            if (cx2 > d.x && cx2 < d.x + d.w && cy2 > d.y - 10 && cy2 < d.y + d.h) {
                this._winLevel(); return;
            }
        }

        // Camera tracking
        var target = this._px - 100;
        if (target < 0) target = 0;
        var maxC = this._LEVEL_W - GAME_WIDTH;
        if (maxC < 0) maxC = 0;
        if (target > maxC) target = maxC;
        this._camX = target;

        this._draw();
    }

    // ── Holes ─────────────────────────────────────────────────────────────

    _isOverHole(px, pw) {
        for (var i = 0; i < this._holes.length; i++) {
            var h = this._holes[i];
            if (px + pw > h.x && px < h.x + h.w) return true;
        }
        return false;
    }

    _updateHoles(dt) {
        for (var i = 0; i < this._holes.length; i++) {
            var h = this._holes[i];
            if (!h.moving) continue;
            h.x += h.speed * dt;
            if (h.speed > 0 && h.x + h.w >= h.maxX) { h.x = h.maxX - h.w; h.speed = -h.speed; }
            if (h.speed < 0 && h.x <= h.minX)        { h.x = h.minX;       h.speed = -h.speed; }
        }
    }

    // ── Spikes ────────────────────────────────────────────────────────────

    _updateSpikes(time) {
        for (var i = 0; i < this._traps.length; i++) {
            var t = this._traps[i];
            if (t.type !== 'spike') continue;
            if (t._lastToggle === null) { t._lastToggle = time + (t._phase || 0); continue; }
            if (time < t._lastToggle) continue;
            var el      = time - t._lastToggle;
            var extT    = t.extendTime  || 2000;
            var retT    = t.retractTime || 1500;
            if (!t.extended && el > extT) { t.extended = true;  t._lastToggle = time; }
            else if (t.extended && el > retT) { t.extended = false; t._lastToggle = time; }
        }
    }

    // ── Platform triggers ─────────────────────────────────────────────────

    _triggerCollapse(p) {
        p.triggered = true;
        var scene = this;
        scene.time.delayedCall(700,  function () { p.cracking = true;  });
        scene.time.delayedCall(1500, function () { p.destroyed = true; });
    }

    _triggerFake(p) {
        p.triggered = true;
        var scene = this;
        scene.time.delayedCall(260, function () { p.wobbling = true;  });
        scene.time.delayedCall(900, function () { p.destroyed = true; });
    }

    // ── Draw ──────────────────────────────────────────────────────────────
    _draw() {
        var g  = this._worldGfx;
        var cx = this._camX;
        var gY = this._GROUND_Y;
        g.clear();
        this._playerGfx.clear();

        // Ground fill
        g.fillStyle(0x5D4037, 1);
        g.fillRect(-cx, gY, this._LEVEL_W + GAME_WIDTH, GAME_HEIGHT - gY + 20);
        // Ground surface strip
        g.fillStyle(0x78909C, 1);
        g.fillRect(-cx, gY, this._LEVEL_W + GAME_WIDTH, 10);
        // Brick seams
        g.lineStyle(1, 0x546E7A, 0.45);
        var brickOff = Math.floor(cx) % 50;
        for (var bx = -brickOff; bx < GAME_WIDTH; bx += 50) {
            g.beginPath(); g.moveTo(bx, gY); g.lineTo(bx, gY + 10); g.strokePath();
        }

        // ── Holes — dark void punched through the ground strip ────────────
        for (var hi = 0; hi < this._holes.length; hi++) {
            var ho = this._holes[hi];
            var hsx = ho.x - cx;
            if (hsx + ho.w < 0 || hsx > GAME_WIDTH) continue;
            // Void (matches bg wall colour)
            g.fillStyle(0x1C0A00, 1);
            g.fillRect(hsx, gY - 8, ho.w, GAME_HEIGHT - gY + 30);
            // Moving holes get a pulsing amber edge so the player can spot them
            if (ho.moving) {
                var pulse = 0.5 + 0.5 * Math.sin(Date.now() / 200);
                g.lineStyle(2, 0xFFB300, 0.6 + 0.4 * pulse);
                g.beginPath();
                g.moveTo(hsx,          gY - 8);
                g.lineTo(hsx,          gY + 6);
                g.strokePath();
                g.beginPath();
                g.moveTo(hsx + ho.w,   gY - 8);
                g.lineTo(hsx + ho.w,   gY + 6);
                g.strokePath();
            }
        }

        // ── Platforms ─────────────────────────────────────────────────────
        for (var i = 0; i < this._platforms.length; i++) {
            var p  = this._platforms[i];
            if (p.destroyed) continue;
            var sx = p.x - cx;
            if (sx + p.w < 0 || sx > GAME_WIDTH) continue;

            if (p.type === 'solid') {
                g.fillStyle(0x78909C, 1);
                g.fillRect(sx, p.y, p.w, p.h);
                g.lineStyle(1, 0xB0BEC5, 0.6);
                g.strokeRect(sx, p.y, p.w, p.h);
            } else if (p.type === 'collapse') {
                g.fillStyle(p.cracking ? 0x8D6E63 : 0xA1887F, 1);
                g.fillRect(sx, p.y, p.w, p.h);
                if (p.cracking) {
                    g.lineStyle(1, 0x3E2723, 1);
                    g.beginPath(); g.moveTo(sx + p.w * 0.25, p.y); g.lineTo(sx + p.w * 0.40, p.y + p.h); g.strokePath();
                    g.beginPath(); g.moveTo(sx + p.w * 0.70, p.y); g.lineTo(sx + p.w * 0.55, p.y + p.h); g.strokePath();
                }
            } else if (p.type === 'fake') {
                var wob = p.wobbling ? Math.sin(Date.now() / 55) * 3 : 0;
                g.fillStyle(p.wobbling ? 0x7B1FA2 : 0xAB47BC, p.wobbling ? 0.7 : 1);
                g.fillRect(sx + wob, p.y, p.w, p.h);
            }
        }

        // ── Spike traps ───────────────────────────────────────────────────
        for (var j = 0; j < this._traps.length; j++) {
            var tr  = this._traps[j];
            var tsx = tr.x - cx;
            if (tsx + tr.w < 0 || tsx > GAME_WIDTH) continue;
            g.fillStyle(0x212121, 0.6);
            g.fillRect(tsx, gY - 4, tr.w, 4);
            var ns = Math.floor(tr.w / 10);
            if (tr.extended) {
                g.fillStyle(0xE53935, 1);
                for (var k = 0; k < ns; k++) {
                    var spX = tsx + k * 10;
                    g.fillTriangle(spX, tr.y + tr.h, spX + 5, tr.y, spX + 10, tr.y + tr.h);
                }
            } else {
                g.fillStyle(0x757575, 0.45);
                for (var k2 = 0; k2 < ns; k2++) {
                    var spX2 = tsx + k2 * 10;
                    g.fillTriangle(spX2, gY - 4, spX2 + 5, gY - 9, spX2 + 10, gY - 4);
                }
            }
        }

        // ── Golden door ───────────────────────────────────────────────────
        var d = this._door;
        if (d) {
            var dx = d.x - cx;
            if (dx + d.w >= 0 && dx <= GAME_WIDTH) {
                g.fillStyle(0xFFD700, 1);
                g.fillRect(dx, d.y, d.w, d.h);
                g.fillStyle(0x7A5800, 1);
                g.fillRect(dx + 4, d.y + 5, d.w - 8, d.h - 9);
                g.lineStyle(3, 0xFFD700, 1);
                g.strokeRect(dx, d.y, d.w, d.h);
                g.fillStyle(0xFFD700, 1);
                g.fillCircle(dx + d.w - 7, d.y + d.h / 2, 3);
            }
        }

        // ── Player (emoji) ────────────────────────────────────────────────
        var psx = Math.round(this._px - cx);
        var psy = Math.round(this._py);
        this._playerText.setPosition(psx + this._PW / 2, psy + this._PH);
    }

    // ── Death ─────────────────────────────────────────────────────────────
    _die() {
        if (this._dead) return;
        this._running = false;
        this._dead    = true;
        this.lives--;
        this._updateHUD();

        var flash = this._flashGfx;
        flash.clear();
        flash.fillStyle(0xFF0000, 0.45);
        flash.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        var scene = this;
        if (this.lives <= 0) {
            this.time.delayedCall(900, function () { flash.clear(); scene._showGameOver(); });
        } else {
            this.time.delayedCall(900, function () { flash.clear(); scene._buildLevel(scene.level); });
        }
    }

    // ── Level complete ────────────────────────────────────────────────────
    _winLevel() {
        if (!this._running) return;
        this._running = false;
        this._completedLevels.add(this.level);

        var flash = this._flashGfx;
        flash.clear();
        flash.fillStyle(0xFFD700, 0.3);
        flash.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        var scene = this;
        if (this.level >= 15) {
            this.time.delayedCall(600, function () { flash.clear(); scene._showWin(); });
        } else {
            var msg = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20,
                'Level ' + this.level + ' gehaald! 🏅', {
                    fontFamily: 'Georgia', fontSize: '22px', color: '#FFD700',
                    stroke: '#000', strokeThickness: 4, align: 'center'
                }).setOrigin(0.5);
            this.time.delayedCall(950, function () {
                flash.clear(); msg.destroy();
                scene._buildLevel(scene.level + 1);
            });
        }
    }

    // ── Level selector ────────────────────────────────────────────────────
    _showLevelSelector() {
        if (!this._running && !this._dead) return; // already on a screen
        var wasRunning = this._running;
        this._running = false;
        var scene = this;

        var panelW = 358, panelH = 310;
        var px = Math.round((GAME_WIDTH  - panelW) / 2);
        var py = Math.round((GAME_HEIGHT - panelH) / 2);

        // Background overlay (absorbs taps below)
        var overlay = scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.72).setOrigin(0).setInteractive();
        var panel   = scene.add.rectangle(px, py, panelW, panelH, 0x1A0A00, 1).setOrigin(0);
        var border  = scene.add.graphics();
        border.lineStyle(2, 0xFFD700, 1);
        border.strokeRect(px, py, panelW, panelH);

        var title = scene.add.text(GAME_WIDTH / 2, py + 18, 'Kies een Level', {
            fontFamily: 'Georgia', fontSize: '18px', color: '#FFD700',
            stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5, 0);

        var elements = [overlay, panel, border, title];

        // 5 columns × 3 rows
        var cols = 5, btnW = 58, btnH = 50, gapX = 6, gapY = 8;
        var gridW = cols * btnW + (cols - 1) * gapX;
        var gridX = Math.round((GAME_WIDTH - gridW) / 2);
        var gridY = py + 54;
        var highest = 0;
        scene._completedLevels.forEach(function (n) { if (n > highest) highest = n; });

        for (var lv = 1; lv <= 15; lv++) {
            var r  = Math.floor((lv - 1) / cols);
            var c  = (lv - 1) % cols;
            var bx = gridX + c * (btnW + gapX);
            var by = gridY + r * (btnH + gapY);

            var completed  = scene._completedLevels.has(lv);
            var avail      = scene._unlockAll || lv === 1 || lv <= highest + 1 || completed;
            var isCurrent  = (lv === scene.level);

            var bgColor = completed ? 0x1B5E20 : (isCurrent ? 0x1A237E : (avail ? 0x37474F : 0x212121));
            var btnAlpha = avail ? 1 : 0.45;

            var btn = scene.add.rectangle(bx + btnW / 2, by + btnH / 2, btnW, btnH, bgColor, btnAlpha).setOrigin(0.5);
            var lbl = scene.add.text(bx + btnW / 2, by + btnH / 2, String(lv), {
                fontFamily: 'Georgia', fontSize: '18px',
                color: avail ? '#FFFFFF' : '#666666',
                stroke: '#000', strokeThickness: 2
            }).setOrigin(0.5);

            elements.push(btn, lbl);

            if (completed) {
                var chk = scene.add.text(bx + btnW - 3, by + 3, '✓', {
                    fontSize: '11px', color: '#69F0AE'
                }).setOrigin(1, 0);
                elements.push(chk);
            }
            if (isCurrent && !completed) {
                var cur = scene.add.text(bx + btnW - 3, by + 3, '▶', {
                    fontSize: '9px', color: '#FFD700'
                }).setOrigin(1, 0);
                elements.push(cur);
            }

            if (avail) {
                var zone = scene.add.zone(bx + btnW / 2, by + btnH / 2, btnW, btnH).setInteractive();
                elements.push(zone);
                (function (level, elems) {
                    zone.on('pointerdown', function () {
                        elems.forEach(function (el) { try { el.destroy(); } catch (e) {} });
                        scene._buildLevel(level);
                    });
                }(lv, elements));
            }
        }

        // Close button
        var closeZone = scene.add.zone(px + panelW - 14, py + 14, 28, 28).setInteractive();
        var closeTxt  = scene.add.text(px + panelW - 14, py + 14, '✕', {
            fontFamily: 'Arial', fontSize: '20px', color: '#FFFFFF',
            stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5);
        elements.push(closeZone, closeTxt);
        closeZone.on('pointerdown', function () {
            elements.forEach(function (el) { try { el.destroy(); } catch (e) {} });
            if (wasRunning) scene._running = true;
        });
    }

    // ── End screens ───────────────────────────────────────────────────────
    _showGameOver() {
        this._running = false;
        this._worldGfx.clear();
        this._playerGfx.clear();
        this._bgGfx.clear();

        var scene = this;
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0A0000, 0.94).setOrigin(0);
        this.add.text(GAME_WIDTH / 2, 250, '💀', { fontSize: '58px' }).setOrigin(0.5);
        this.add.text(GAME_WIDTH / 2, 340, 'Spel voorbij!', {
            fontFamily: 'Georgia', fontSize: '28px', color: '#FF6B6B',
            stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);
        this.add.text(GAME_WIDTH / 2, 392, 'Alle levens verloren in level ' + this.level, {
            fontFamily: 'Arial', fontSize: '14px', color: '#CCCCCC'
        }).setOrigin(0.5);

        var retryZone = this.add.zone(GAME_WIDTH / 2, 468, 214, 54).setInteractive();
        this.add.rectangle(GAME_WIDTH / 2, 468, 214, 54, 0xE53935).setOrigin(0.5);
        this.add.text(GAME_WIDTH / 2, 468, '🔄 Opnieuw', {
            fontFamily: 'Georgia', fontSize: '18px', color: '#FFF'
        }).setOrigin(0.5);
        retryZone.on('pointerdown', function () {
            scene.scene.restart({ name1: scene.name1, name2: scene.name2, lives: 3 });
        });

        var backZone = this.add.zone(GAME_WIDTH / 2, 540, 214, 54).setInteractive();
        this.add.rectangle(GAME_WIDTH / 2, 540, 214, 54, 0x37474F).setOrigin(0.5);
        this.add.text(GAME_WIDTH / 2, 540, '← Terug', {
            fontFamily: 'Georgia', fontSize: '18px', color: '#FFF'
        }).setOrigin(0.5);
        backZone.on('pointerdown', function () { window._onReturnToMap && window._onReturnToMap(); });
    }

    _showWin() {
        this._running = false;
        this._worldGfx.clear();
        this._playerGfx.clear();
        this._bgGfx.clear();

        var scene = this;
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0D1B0A, 0.95).setOrigin(0);
        this.add.text(GAME_WIDTH / 2, 190, '🏆', { fontSize: '72px' }).setOrigin(0.5);
        this.add.text(GAME_WIDTH / 2, 295, 'Tempel Klaar!', {
            fontFamily: 'Georgia', fontSize: '30px', color: '#FFD700',
            stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);
        this.add.text(GAME_WIDTH / 2, 352, 'Alle 15 niveaus voltooid!', {
            fontFamily: 'Arial', fontSize: '16px', color: '#FFFFFF'
        }).setOrigin(0.5);
        this.add.text(GAME_WIDTH / 2, 385, 'Levens over: ' + this.lives + ' van de 3', {
            fontFamily: 'Arial', fontSize: '14px', color: '#A5D6A7'
        }).setOrigin(0.5);

        var againZone = this.add.zone(GAME_WIDTH / 2, 478, 224, 56).setInteractive();
        this.add.rectangle(GAME_WIDTH / 2, 478, 224, 56, 0x2E7D32).setOrigin(0.5);
        this.add.text(GAME_WIDTH / 2, 478, '🔄 Opnieuw spelen', {
            fontFamily: 'Georgia', fontSize: '17px', color: '#FFF'
        }).setOrigin(0.5);
        againZone.on('pointerdown', function () {
            _templeCompleted.clear();
            scene.scene.restart({ name1: scene.name1, name2: scene.name2, lives: 3 });
        });

        var backZone = this.add.zone(GAME_WIDTH / 2, 552, 224, 56).setInteractive();
        this.add.rectangle(GAME_WIDTH / 2, 552, 224, 56, 0x37474F).setOrigin(0.5);
        this.add.text(GAME_WIDTH / 2, 552, '← Terug', {
            fontFamily: 'Georgia', fontSize: '17px', color: '#FFF'
        }).setOrigin(0.5);
        backZone.on('pointerdown', function () { window._onReturnToMap && window._onReturnToMap(); });
    }
}

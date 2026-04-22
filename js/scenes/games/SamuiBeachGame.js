// SamuiBeachGame — Endless shell memory game with growing difficulty.
// No hard end; highscore = max level reached, saved per player.
// Completing 5 levels unlocks the next location.

// Returns {cols, rows} for a given level. Grid grows every 2 levels:
// 3×3 → 3×4 → 4×4 → 4×5 → 5×5 → … max 6×7
function _samuiGridAt(level, minCols, minRows, maxCols, maxRows) {
    minCols = minCols || 3; minRows = minRows || 3;
    maxCols = maxCols || 6; maxRows = maxRows || 7;
    var cols = minCols, rows = minRows;
    var steps = Math.floor((level - 1) / 2);
    for (var i = 0; i < steps; i++) {
        if (cols >= maxCols && rows >= maxRows) break;
        if (cols === rows) {
            if (rows < maxRows) rows++; else cols++;
        } else if (cols > rows) {
            if (rows < maxRows) rows++; else cols++;
        } else {
            if (cols < maxCols) cols++; else rows++;
        }
    }
    return { cols: Math.min(cols, maxCols), rows: Math.min(rows, maxRows) };
}

// Generate centered grid positions on the beach area
function _samuiSpots(cols, rows) {
    var marginX = 20;
    var startY = Math.round(GAME_HEIGHT * 0.47);
    var areaH  = Math.round(GAME_HEIGHT * 0.47);
    var w = GAME_WIDTH - 2 * marginX;
    var cW = w / cols, rH = areaH / rows;
    var spots = [];
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
            spots.push({
                x: Math.round(marginX + (c + 0.5) * cW),
                y: Math.round(startY + (r + 0.5) * rH)
            });
        }
    }
    return spots;
}

class SamuiBeachGame extends Phaser.Scene {
    constructor() { super({ key: 'SamuiBeachGame' }); }

    init(data) {
        this.locationIndex = data.locationIndex;
        this.name1 = data.name1;
        this.name2 = data.name2;
    }

    create() {
        var settings      = window.loadSettings ? window.loadSettings() : {};
        this._minShells   = Math.max(1, settings.shellsMin || 2);
        this._maxShells   = Math.max(this._minShells + 1, settings.shellsMax || 8);
        this._minGridCols = Math.max(2, settings.samuiMinCols || 3);
        this._minGridRows = Math.max(2, settings.samuiMinRows || 3);
        this._maxGridCols = Math.min(8, settings.samuiMaxCols || 6);
        this._maxGridRows = Math.min(10, settings.samuiMaxRows || 7);
        this._level       = 1;
        this._unlocked    = false;
        this._running     = true;
        this._phase       = 'idle';
        this._roundObjs   = [];

        this._startRound();
    }

    // ── Background (recreated each round) ────────────────────────────────────
    _buildBackground() {
        var scene = this;

        // Sky
        scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x87CEEB).setOrigin(0);
        // Sand
        scene.add.rectangle(0, Math.round(GAME_HEIGHT * 0.45), GAME_WIDTH, Math.round(GAME_HEIGHT * 0.55), 0xF5DEB3).setOrigin(0);
        // Wave
        wave2(scene);

        // Header
        scene.add.rectangle(0, 0, GAME_WIDTH, 94, 0x000000, 0.6).setOrigin(0);
        titleText(scene, 42, 'Koh Samui  Schelpenspel 🐚', '#00897B');
        backArrow(scene, function () {
            scene._running = false;
            if (window._onReturnToMap) window._onReturnToMap();
        });

        // Footer HUD
        scene.add.rectangle(0, GAME_HEIGHT - 52, GAME_WIDTH, 52, 0x000000, 0.75).setOrigin(0);
        var hs = window.getHighscore ? window.getHighscore('samui') : 0;
        scene._hudText = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 26, '', {
            fontFamily: 'Arial', fontSize: '14px', color: '#E8A020', align: 'center'
        }).setOrigin(0.5);
        scene._updateHUD(hs);

        // Status text (mid-screen, above spots)
        scene._statusText = scene.add.text(GAME_WIDTH / 2, 106, '', {
            fontFamily: 'Arial', fontSize: '15px', color: '#E8A020',
            stroke: '#000000', strokeThickness: 1, align: 'center'
        }).setOrigin(0.5);
    }

    _updateHUD(hs) {
        var best = hs !== undefined ? hs : (window.getHighscore ? window.getHighscore('samui') : 0);
        this._hudText.setText('Level: ' + this._level + '   |   Beste: ' + best);
    }

    // ── Round lifecycle ───────────────────────────────────────────────────────
    _startRound() {
        var scene = this;
        if (!scene._running) return;

        // Destroy previous round objects
        scene._roundObjs.forEach(function (o) { try { o.destroy(); } catch (_) {} });
        scene._roundObjs = [];

        // Destroy all children (background + HUD recreated fresh)
        scene.children.list.slice().forEach(function (c) { c.destroy(); });
        scene.input.off('pointerdown');

        scene._buildBackground();

        // Compute grid dimensions for this level
        var grid = _samuiGridAt(scene._level,
            scene._minGridCols, scene._minGridRows,
            scene._maxGridCols, scene._maxGridRows);
        scene._spots = _samuiSpots(grid.cols, grid.rows);

        // Hole radius scales with cell size so holes don't overlap
        var cellW = (GAME_WIDTH - 40) / grid.cols;
        var cellH = Math.round(GAME_HEIGHT * 0.47) / grid.rows;
        scene._holeR = Math.max(10, Math.min(22, Math.floor(Math.min(cellW, cellH) * 0.38)));

        // Number of hidden shells this round (grows with level, capped at spot count)
        var numShells = Math.min(
            scene._maxShells,
            Math.min(scene._spots.length, Math.max(scene._minShells, scene._minShells + Math.floor((scene._level - 1) / 2)))
        );
        var shuffled  = Phaser.Utils.Array.Shuffle(scene._spots.slice());
        scene._answers = shuffled.slice(0, numShells);
        scene._remaining = numShells;
        scene._phase = 'show';

        // Draw holes
        var holeGfx = scene.add.graphics();
        scene._roundObjs.push(holeGfx);
        holeGfx.fillStyle(0xC4A882, 0.65);
        scene._spots.forEach(function (h) { holeGfx.fillCircle(h.x, h.y, scene._holeR); });

        // Show status + shells
        var showMs = Math.max(1200, 3000 - (scene._level - 1) * 100);
        scene._statusText.setText('Onthoud de ' + numShells + ' schelpen! (' + (showMs / 1000).toFixed(1) + 's)');
        scene._statusText.setColor('#E8A020');

        var shellFontSize = Math.max(16, Math.min(36, scene._holeR * 2 - 4)) + 'px';
        scene._answers.forEach(function (pos) {
            var s = scene.add.text(pos.x, pos.y, '🐚', { fontSize: shellFontSize }).setOrigin(0.5);
            scene._roundObjs.push(s);
        });

        // After showMs: hide shells, enter guess phase
        scene._hideTimer = scene.time.delayedCall(showMs, function () {
            if (!scene._running) return;
            // Remove shell sprites
            scene._roundObjs.forEach(function (o) { try { o.destroy(); } catch (_) {} });
            scene._roundObjs = [];

            // Redraw holes (no shells)
            var hGfx = scene.add.graphics();
            scene._roundObjs.push(hGfx);
            hGfx.fillStyle(0xC4A882, 0.65);
            scene._spots.forEach(function (h) { hGfx.fillCircle(h.x, h.y, scene._holeR); });

            scene._statusText.setText('Waar waren de schelpen?  0 / ' + numShells + ' gevonden');
            scene._statusText.setColor('#00CFA0');
            scene._phase = 'guess';
            scene._setupTaps();
        });
    }

    _setupTaps() {
        var scene = this;
        var zoneSize = Math.max(40, scene._holeR * 2 + 8);
        scene._tapZones = scene._spots.map(function (pos) {
            var z = scene.add.zone(pos.x, pos.y, zoneSize, zoneSize).setInteractive();
            z.on('pointerdown', function () { scene._onTap(pos, z); });
            scene._roundObjs.push(z);
            return z;
        });
    }

    _onTap(pos, zone) {
        var scene = this;
        if (scene._phase !== 'guess') return;

        var isCorrect = scene._answers.some(function (a) { return a.x === pos.x && a.y === pos.y; });
        zone.disableInteractive();

        if (isCorrect) {
            SFX.correct();
            var shellFs = Math.max(16, Math.min(36, scene._holeR * 2 - 4)) + 'px';
            var shell = scene.add.text(pos.x, pos.y, '🐚', { fontSize: shellFs }).setOrigin(0.5);
            scene._roundObjs.push(shell);
            scene.tweens.add({ targets: shell, scaleX: 1.3, scaleY: 1.3, duration: 120, yoyo: true });
            scene._remaining--;
            var found = scene._answers.length - scene._remaining;
            scene._statusText.setText('Waar waren de schelpen?  ' + found + ' / ' + scene._answers.length + ' gevonden');

            if (scene._remaining <= 0) {
                scene._phase = 'idle';
                scene._roundWon();
            }
        } else {
            SFX.wrong();
            var crossFs = Math.max(14, Math.min(28, scene._holeR * 2 - 6)) + 'px';
            var cross = scene.add.text(pos.x, pos.y, '❌', { fontSize: crossFs }).setOrigin(0.5);
            scene._roundObjs.push(cross);
            // Reveal the correct positions briefly
            scene._answers.forEach(function (a) {
                var already = scene._roundObjs.some(function (o) {
                    return o.x === a.x && o.y === a.y && o.text === '🐚';
                });
                if (!already) {
                    var hintFs = Math.max(16, Math.min(36, scene._holeR * 2 - 4)) + 'px';
                    var hint = scene.add.text(a.x, a.y, '🐚', {
                        fontSize: hintFs, alpha: 0.5
                    }).setOrigin(0.5);
                    scene._roundObjs.push(hint);
                }
            });
            scene._phase = 'idle';
            scene._statusText.setText('Bijna! Probeer opnieuw...').setColor('#FF8888');
            scene.time.delayedCall(1600, function () {
                if (!scene._running) return;
                scene._startRound();
            });
        }
    }

    _roundWon() {
        var scene = this;
        SFX.win();
        var prevLevel = scene._level;
        scene._level++;
        if (window.setHighscore) window.setHighscore('samui', scene._level - 1);
        scene._updateHUD();

        scene._statusText.setText('Niveau ' + prevLevel + ' gehaald! 🏅').setColor('#FFD700');

        // Reached level 6 → unlock next location (only once)
        if (prevLevel >= 5 && !scene._unlocked) {
            scene._unlocked = true;
            if (window.completeLocation) window.completeLocation(scene.locationIndex, 3);
            scene.time.delayedCall(700, function () { scene._showUnlockBanner(); });
        } else {
            scene.time.delayedCall(900, function () { scene._startRound(); });
        }
    }

    // ── Unlock banner (shown once after level 5) ──────────────────────────────
    _showUnlockBanner() {
        var scene = this;
        var els = [];

        var overlay = scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.72).setOrigin(0).setInteractive();
        var panel   = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 340, 240, 0x002A1A, 1).setOrigin(0.5);
        var border  = scene.add.graphics();
        border.lineStyle(2, 0xFFD700, 1);
        border.strokeRect(GAME_WIDTH / 2 - 170, GAME_HEIGHT / 2 - 120, 340, 240);

        scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, '🎉', { fontSize: '48px' }).setOrigin(0.5);
        scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 48, '5 niveaus gehaald!', {
            fontFamily: 'Georgia', fontSize: '22px', color: '#FFD700',
            stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5);
        scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Je hebt Koh Samui\nontgrendeld!', {
            fontFamily: 'Arial', fontSize: '14px', color: '#A5D6A7', align: 'center'
        }).setOrigin(0.5);

        els.push(overlay, panel, border);

        // Continue button (added first so proceed zone is last = test-clickable)
        var contBg = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 62, 220, 46, 0x37474F).setOrigin(0.5);
        var contTx = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 62, 'Verder spelen', {
            fontFamily: 'Georgia', fontSize: '16px', color: '#fff', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5);
        var contZ = scene.add.zone(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 62, 220, 46).setInteractive();
        contZ.on('pointerdown', function () {
            els.forEach(function (e) { try { e.destroy(); } catch (_) {} });
            scene._startRound();
        });

        // Proceed button (added last so test _click_last_zone hits this)
        var proceedBg = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 116, 220, 46, 0x2E7D32).setOrigin(0.5);
        var proceedTx = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 116, 'Volgende avontuur ▶', {
            fontFamily: 'Georgia', fontSize: '16px', color: '#fff', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5);
        var proceedZ = scene.add.zone(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 116, 220, 46).setInteractive();
        proceedZ.on('pointerdown', function () {
            scene.scene.start('WinScene', {
                locationIndex: scene.locationIndex, stars: 3,
                name1: scene.name1, name2: scene.name2
            });
        });

        els.push(contBg, contTx, contZ, proceedBg, proceedTx, proceedZ);
    }

    // Called by tests to programmatically complete the game
    _doFinalEnd() {
        var scene = this;
        scene._running = false;
        scene._unlocked = true;
        if (window.completeLocation) window.completeLocation(scene.locationIndex, 3);
        scene._showUnlockBanner();
    }

    update() {} // no frame-based logic needed
}

function wave2(scene) {
    var w = scene.add.graphics();
    w.fillStyle(0x0288D1, 0.5);
    w.fillRect(0, Math.floor(GAME_HEIGHT * 0.45) - 15, GAME_WIDTH, 22);
}

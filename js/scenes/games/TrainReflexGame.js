class TrainReflexGame extends Phaser.Scene {
    constructor() { super({ key: 'TrainReflexGame' }); }

    init(data) {
        this.locationIndex = data.locationIndex ?? this.locationIndex ?? 2;
        this.name1 = data.name1 ?? this.name1 ?? '';
        this.name2 = data.name2 ?? this.name2 ?? '';
    }

    create() {
        var scene = this;
        this.lives       = 3;
        this.caught      = 0;
        this._running    = true;
        this._items      = [];
        this._belts      = [];
        this._spawnTimer = null;
        this._beltOffset = 0;
        this._beltCount  = 0;
        this._beltGfx    = null;
        this.highscore   = getHighscore('nachttrein');

        // Apply difficulty setting
        var settings = window.loadSettings ? window.loadSettings() : {};
        this._speedMult  = settings.trainSpeed === 'easy' ? 0.8  : settings.trainSpeed === 'hard' ? 1.25 : 1;
        this._delayMult  = settings.trainSpeed === 'easy' ? 1.4  : settings.trainSpeed === 'hard' ? 0.7  : 1;

        // ── Night station background ───────────────────────────────────────
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0D0D1A).setOrigin(0);

        // Stars in sky
        var starGfx = this.add.graphics();
        starGfx.fillStyle(0xFFFFFF, 1);
        for (var si = 0; si < 60; si++) {
            var sr = Math.random() < 0.2 ? 1.5 : 1;
            starGfx.fillCircle(Math.random() * GAME_WIDTH, 20 + Math.random() * 160, sr);
        }

        // Moon
        var moon = this.add.graphics();
        moon.fillStyle(0xFFF9C4, 0.85);
        moon.fillCircle(330, 60, 28);
        moon.fillStyle(0x0D0D1A, 1);
        moon.fillCircle(341, 54, 24);

        // Distant city skyline silhouette
        var skyline = this.add.graphics();
        skyline.fillStyle(0x180830, 1);
        var buildings = [
            [0, 30], [40, 60], [80, 40], [120, 80], [160, 50],
            [200, 70], [240, 45], [280, 90], [320, 55], [360, 40], [390, 65]
        ];
        for (var bi = 0; bi < buildings.length - 1; bi++) {
            skyline.fillRect(
                buildings[bi][0],
                180 - buildings[bi][1],
                buildings[bi + 1][0] - buildings[bi][0],
                buildings[bi][1]
            );
        }

        // Train body (parked behind the platform area)
        var train = this.add.graphics();
        train.fillStyle(0x1A237E, 1);
        train.fillRect(-20, 195, 430, 200);
        train.fillStyle(0x3949AB, 1);
        train.fillRect(-20, 195, 430, 18);
        train.fillStyle(0x0D1B4B, 1);
        train.fillRect(-20, 370, 430, 25);
        // Train windows — lit yellow
        for (var wi = 0; wi < 5; wi++) {
            train.fillStyle(0xFFF9C4, 0.9);
            train.fillRoundedRect(10 + wi * 78, 228, 50, 38, 4);
            train.fillStyle(0xFFF176, 0.45);
            train.fillRoundedRect(10 + wi * 78, 276, 50, 38, 4);
        }
        // Door
        train.fillStyle(0x0D1B4B, 1);
        train.fillRect(158, 316, 64, 79);
        train.fillStyle(0x283593, 1);
        train.fillRect(160, 318, 60, 75);
        train.fillStyle(0xFFD700, 1);
        train.fillRect(173, 352, 8, 3);

        // Station platform — drawn across full width
        var plat = this.add.graphics();
        plat.fillStyle(0x3A3A3A, 1);
        plat.fillRect(0, 390, GAME_WIDTH, 28);
        plat.fillStyle(0x4A4A4A, 1);
        plat.fillRect(0, 416, GAME_WIDTH, 8);
        plat.fillStyle(0xFFD700, 0.8);
        plat.fillRect(0, 390, GAME_WIDTH, 4);

        // Platform lights
        var lights = this.add.graphics();
        for (var li = 0; li < 4; li++) {
            var lx = 50 + li * 100;
            lights.fillStyle(0x444444, 1);
            lights.fillRect(lx - 2, 345, 4, 48);
            lights.fillStyle(0xFFF9C4, 0.9);
            lights.fillCircle(lx, 345, 6);
            lights.fillStyle(0xFFF9C4, 0.12);
            lights.fillCircle(lx, 345, 20);
        }

        // Belt graphics layer (animated, redrawn each update)
        this._beltGfx = this.add.graphics();

        // ── Title bar ─────────────────────────────────────────────────────
        this.add.rectangle(0, 0, GAME_WIDTH, 94, 0x000000, 0.8).setOrigin(0);
        titleText(this, 40, 'Nachttrein – Bagage Pakken', '#1565C0');
        this.add.text(GAME_WIDTH / 2, 76, 'Tik alleen op de GOEDE koffers ✅', {
            fontFamily: 'Arial', fontSize: '15px', color: '#FFD700',
            stroke: '#000000', strokeThickness: 1
        }).setOrigin(0.5);

        // ── HUD bar at bottom ─────────────────────────────────────────────
        this.add.rectangle(0, GAME_HEIGHT - 56, GAME_WIDTH, 56, 0x000000, 0.8).setOrigin(0);
        this._hudText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 36, '', {
            fontFamily: 'Arial', fontSize: '15px', color: '#E8A020'
        }).setOrigin(0.5);
        this._livesText = this.add.text(20, GAME_HEIGHT - 18, '', {
            fontFamily: 'Arial', fontSize: '18px', color: '#ff4444'
        }).setOrigin(0, 0.5);

        // ── Setup belts and spawn timer ───────────────────────────────────
        this._setupBelts();
        this._updateHUD();

        // ── Back button ───────────────────────────────────────────────────
        backArrow(this, function () {
            scene._cleanup();
            if (window._onReturnToMap) window._onReturnToMap();
            else scene.scene.start('MapScene', { saveData: loadSave() });
        });
    }

    // ── Initial belt setup and first spawn timer ───────────────────────────
    _setupBelts() {
        this._beltCount = 1;
        this._drawBelts();
        this._spawnTimer = this.time.addEvent({
            delay: Math.round(900 * this._delayMult), callback: this._spawnItem, callbackScope: this, loop: true
        });
    }

    // ── Belt y-positions based on current belt count ───────────────────────
    _getBeltYs() {
        if (this._beltCount === 3) return [380, 500, 620];
        if (this._beltCount === 2) return [420, 570];
        return [480];
    }

    // ── Check and upgrade difficulty after each successful catch ───────────
    _checkDifficulty() {
        var newCount;
        if (this.caught >= 20) {
            newCount = 3;
        } else if (this.caught >= 10) {
            newCount = 2;
        } else {
            newCount = 1;
        }

        if (newCount !== this._beltCount) {
            this._beltCount = newCount;
            if (this._spawnTimer) { this._spawnTimer.remove(); this._spawnTimer = null; }
            this._drawBelts();
            var delay = Math.round((newCount === 3 ? 600 : newCount === 2 ? 750 : 900) * this._delayMult);
            this._spawnTimer = this.time.addEvent({
                delay: delay, callback: this._spawnItem, callbackScope: this, loop: true
            });
        }
    }

    // ── Draw all active belt lanes ─────────────────────────────────────────
    _drawBelts() {
        if (!this._beltGfx) return;
        this._beltGfx.clear();
        var ys = this._getBeltYs();
        var off = ((this._beltOffset | 0) % 36);
        for (var i = 0; i < ys.length; i++) {
            var by = ys[i];
            var bh = 58;
            var top = by - bh / 2;
            // Belt base
            this._beltGfx.fillStyle(0x2A2020, 1);
            this._beltGfx.fillRect(0, top, GAME_WIDTH, bh);
            // Belt surface
            this._beltGfx.fillStyle(0x3A2E2E, 1);
            this._beltGfx.fillRect(0, top + 4, GAME_WIDTH, bh - 8);
            // Belt top/bottom edges
            this._beltGfx.fillStyle(0x1A1010, 1);
            this._beltGfx.fillRect(0, top, GAME_WIDTH, 4);
            this._beltGfx.fillRect(0, top + bh - 4, GAME_WIDTH, 4);
            // Animated chevron marks
            this._beltGfx.lineStyle(2, 0x605050, 0.75);
            for (var bx = -36 + off; bx < GAME_WIDTH + 36; bx += 36) {
                this._beltGfx.lineBetween(bx, top + 4, bx - 20, top + bh - 4);
            }
        }
    }

    // ── Draw luggage graphic by type ───────────────────────────────────────
    _drawSuitcase(gfx, type) {
        if (type === 'suitcase') {
            gfx.fillStyle(0x8B5E3C, 1);
            gfx.fillRoundedRect(-32, -24, 64, 48, 6);
            gfx.lineStyle(2, 0x5C3A1E, 1);
            gfx.strokeRoundedRect(-32, -24, 64, 48, 6);
            gfx.lineStyle(3, 0x5C3A1E, 1);
            gfx.strokeRoundedRect(-12, -32, 24, 12, 4);
            gfx.lineStyle(2, 0xC4956A, 0.7);
            gfx.lineBetween(0, -24, 0, 24);
            gfx.lineBetween(-32, 0, 32, 0);
            gfx.fillStyle(0xD4A840, 1);
            gfx.fillRect(-5, -3, 10, 6);
            drawStar(gfx, 20, -14, 10, 0xFFD700);
        } else if (type === 'backpack') {
            // Teal/blue travel backpack — main body
            gfx.fillStyle(0x00796B, 1);
            gfx.fillRoundedRect(-24, -28, 48, 54, 12);
            gfx.lineStyle(2, 0x004D40, 1);
            gfx.strokeRoundedRect(-24, -28, 48, 54, 12);
            // Front pocket
            gfx.fillStyle(0x00897B, 1);
            gfx.fillRoundedRect(-16, 2, 32, 20, 6);
            gfx.lineStyle(1, 0x004D40, 0.8);
            gfx.strokeRoundedRect(-16, 2, 32, 20, 6);
            // Top handle loop
            gfx.lineStyle(4, 0x004D40, 1);
            gfx.strokeRoundedRect(-8, -36, 16, 12, 5);
            // Zipper line
            gfx.lineStyle(1, 0x80CBC4, 0.8);
            gfx.lineBetween(-24, -4, 24, -4);
            // Gold compass badge
            drawStar(gfx, 0, -14, 10, 0xFFD700);
        } else if (type === 'box') {
            // Cardboard box with tape
            gfx.fillStyle(0xC8A060, 1);
            gfx.fillRect(-30, -22, 60, 44);
            gfx.lineStyle(2, 0x8D6E30, 1);
            gfx.strokeRect(-30, -22, 60, 44);
            // Tape lines
            gfx.lineStyle(3, 0xD4B896, 0.8);
            gfx.lineBetween(-30, 0, 30, 0);
            gfx.lineBetween(0, -22, 0, 22);
            // "THAILAND" label
            gfx.fillStyle(0xFFFFFF, 0.6);
            gfx.fillRect(-18, -8, 36, 12);
        } else if (type === 'bad_suitcase') {
            gfx.fillStyle(0x6B2D1A, 1);
            gfx.fillRoundedRect(-32, -24, 64, 48, 6);
            gfx.lineStyle(2, 0xFF4444, 1.0);
            gfx.strokeRoundedRect(-32, -24, 64, 48, 6);
            gfx.lineStyle(3, 0x5C1E1E, 1);
            gfx.strokeRoundedRect(-12, -32, 24, 12, 4);
            gfx.lineStyle(4, 0xFF4444, 1);
            gfx.lineBetween(10, -18, 28, -2);
            gfx.lineBetween(28, -18, 10, -2);
        } else if (type === 'bad_bag') {
            // Dark purple bag with skull emoji
            gfx.fillStyle(0x4A1578, 1);
            gfx.fillRoundedRect(-28, -26, 56, 50, 12);
            gfx.lineStyle(2, 0xFF0000, 0.9);
            gfx.strokeRoundedRect(-28, -26, 56, 50, 12);
            // Top knot
            gfx.lineStyle(4, 0x4A1578, 1);
            gfx.strokeRoundedRect(-8, -34, 16, 12, 4);
            // Skull — two eye circles + mouth
            gfx.fillStyle(0xFF4444, 1);
            gfx.fillCircle(-8, -4, 5);
            gfx.fillCircle(8, -4, 5);
            gfx.fillRect(-10, 6, 20, 4);
        }
    }

    // ── Spawn one item on a random active belt ─────────────────────────────
    _spawnItem() {
        if (!this._running) return;
        var scene = this;
        var ys = this._getBeltYs();
        var beltY = ys[Math.floor(Math.random() * ys.length)];
        var isGood = Math.random() > 0.4; // 60% good
        var goodTypes = ['suitcase', 'backpack', 'box'];
        var badTypes  = ['bad_suitcase', 'bad_bag'];
        var itemType  = isGood
            ? goodTypes[Math.floor(Math.random() * goodTypes.length)]
            : badTypes[Math.floor(Math.random() * badTypes.length)];

        var gfx = scene.add.graphics();
        scene._drawSuitcase(gfx, itemType);

        var container = scene.add.container(GAME_WIDTH + 50, beltY, [gfx]);
        container._isGood = isGood;
        container._active = true;

        // Hit zone synced to container position in update()
        var hitZone = scene.add.zone(container.x, container.y, 70, 56).setInteractive();
        container._hitZone = hitZone;

        hitZone.on('pointerdown', function () {
            if (!container._active) return;
            container._active = false;
            hitZone.disableInteractive();

            if (isGood) {
                SFX.collect();
                scene.caught++;
                scene.tweens.add({
                    targets: container, scaleX: 0, scaleY: 0, duration: 150,
                    onComplete: function () {
                        if (container.scene) container.destroy();
                        scene._items = scene._items.filter(function (c) { return c !== container; });
                    }
                });
            } else {
                scene._loseLife();
                scene.tweens.add({
                    targets: container, alpha: 0, duration: 150,
                    onComplete: function () {
                        if (container.scene) container.destroy();
                        scene._items = scene._items.filter(function (c) { return c !== container; });
                    }
                });
            }

            scene.time.delayedCall(160, function () {
                if (hitZone.scene) hitZone.destroy();
            });
            scene._updateHUD();
        });

        // Speed: px/s increases with score, scaled by difficulty
        var speed = (180 + Math.floor(scene.caught / 5) * 15) * scene._speedMult;
        var duration = (GAME_WIDTH + 120) / speed * 1000;

        scene.tweens.add({
            targets: container, x: -70, duration: duration, ease: 'Linear',
            onComplete: function () {
                if (!container._active) return;
                container._active = false;
                // Missing a good suitcase costs a life
                if (isGood) {
                    scene._loseLife();
                }
                if (hitZone.scene) hitZone.destroy();
                container._hitZone = null;
                if (container.scene) container.destroy();
                scene._items = scene._items.filter(function (c) { return c !== container; });
            }
        });

        scene._items.push(container);
    }

    // ── Lose a life ────────────────────────────────────────────────────────
    _loseLife() {
        if (!this._running) return;
        this.lives--;
        SFX.wrong();
        this._updateHUD();
        // Flash red overlay
        var flash = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0xFF0000, 0.28).setOrigin(0);
        this.tweens.add({
            targets: flash, alpha: 0, duration: 320,
            onComplete: function () { if (flash.scene) flash.destroy(); }
        });
        if (this.lives <= 0) this._endGame();
    }

    // ── Update HUD text ────────────────────────────────────────────────────
    _updateHUD() {
        this._hudText.setText('✅ Gepakt: ' + this.caught + '   🏆 Record: ' + this.highscore);
        var hearts = '';
        for (var h = 0; h < 3; h++) hearts += (h < this.lives ? '♥' : '♡');
        this._livesText.setText(hearts);
        this._checkDifficulty();
    }

    // ── End game (always on lives=0) ──────────────────────────────────────
    _endGame() {
        if (!this._running) return;
        this._cleanup();
        setHighscore('nachttrein', this.caught);
        if (this.caught > this.highscore) this.highscore = this.caught;
        // Complete the location — star rating based on score achieved
        var stars = this.caught >= 75 ? 3 : this.caught >= 40 ? 2 : this.caught >= 15 ? 1 : 0;
        if (stars > 0) completeLocation(this.locationIndex, stars);
        SFX.lose();
        this._showRetry();
    }

    // ── Retry overlay ──────────────────────────────────────────────────────
    _showRetry() {
        var scene = this;
        // Destroy ALL existing children first for a clean slate
        this.children.list.slice().forEach(function (c) { c.destroy(); });

        // Dark overlay background
        scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.88).setOrigin(0);

        scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 120, '😟', {
            fontFamily: 'Arial', fontSize: '64px'
        }).setOrigin(0.5);

        scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, 'Oh nee!\nDe koffers zijn weg!', {
            fontFamily: 'Arial', fontSize: '22px', color: '#FF8888',
            align: 'center'
        }).setOrigin(0.5);

        scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 12, '✅ Gepakt: ' + scene.caught, {
            fontFamily: 'Arial', fontSize: '18px', color: '#E8A020'
        }).setOrigin(0.5);

        scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 42, '🏆 Record: ' + scene.highscore, {
            fontFamily: 'Arial', fontSize: '16px', color: '#FFD700'
        }).setOrigin(0.5);

        var btn = makeButton(scene, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 110, 220, 52, COLORS.orange, '🔄 Opnieuw', 20);
        buttonInteractive(scene, btn, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 110, 220, 52, function () {
            scene.scene.restart({
                locationIndex: scene.locationIndex,
                name1: scene.name1,
                name2: scene.name2
            });
        });

        // Back to map button
        var backBtn = makeButton(scene, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 176, 220, 44, 0x333333, '← Kaart', 16);
        buttonInteractive(scene, backBtn, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 176, 220, 44, function () {
            if (window._onReturnToMap) window._onReturnToMap();
            else scene.scene.start('MapScene', { saveData: loadSave() });
        });
    }

    // ── Cleanup timers and items ───────────────────────────────────────────
    _cleanup() {
        this._running = false;
        if (this._spawnTimer) { this._spawnTimer.remove(); this._spawnTimer = null; }
        this._items.forEach(function (c) {
            if (c._hitZone && c._hitZone.scene) c._hitZone.destroy();
            c._hitZone = null;
            if (c.scene) c.destroy();
        });
        this._items = [];
    }

    // ── Update loop ────────────────────────────────────────────────────────
    update(time, delta) {
        if (!this._running) return;
        this._beltOffset += delta * 0.12;
        this._drawBelts();

        // Sync hit zones with their moving containers
        this._items.forEach(function (item) {
            if (item._hitZone && item._active) {
                item._hitZone.x = item.x;
                item._hitZone.y = item.y;
            }
        });
    }
}

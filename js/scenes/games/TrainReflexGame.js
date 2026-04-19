class TrainReflexGame extends Phaser.Scene {
    constructor() { super({ key: 'TrainReflexGame' }); }

    init(data) {
        this.locationIndex = data.locationIndex;
        this.name1 = data.name1;
        this.name2 = data.name2;
    }

    create() {
        var scene = this;
        this.lives    = 3;
        this.caught   = 0;
        this.needed   = 6;
        this.elapsed  = 0;
        this.gameTime = 90;
        this._items   = [];
        this._spawnTimer = null;
        this._running = true;
        this._beltOffset = 0;

        // ── Night station background ───────────────────────────────────────
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0A0A1E).setOrigin(0);

        // Stars
        var stars = this.add.graphics();
        stars.fillStyle(0xFFFFFF, 1);
        for (var si = 0; si < 50; si++) {
            stars.fillCircle(Math.random() * GAME_WIDTH, Math.random() * 200, 1);
        }

        // Station platform
        var plat = this.add.graphics();
        plat.fillStyle(0x3A3A3A, 1);
        plat.fillRect(0, 440, GAME_WIDTH, 30);
        plat.fillStyle(0x555555, 1);
        plat.fillRect(0, 468, GAME_WIDTH, 8);

        // Train (parked)
        var train = this.add.graphics();
        train.fillStyle(0x1A237E, 1);
        train.fillRect(-20, 200, 430, 240);
        train.fillStyle(0x2A337E, 1);
        train.fillRect(-20, 200, 430, 30); // roof strip
        // Windows
        train.fillStyle(0xFFF9C4, 0.9);
        for (var wi = 0; wi < 5; wi++) {
            train.fillRect(10 + wi * 80, 240, 50, 40);
            train.fillRect(10 + wi * 80, 300, 50, 40);
        }
        // Door
        train.fillStyle(0x0D1B4B, 1);
        train.fillRect(160, 350, 60, 90);

        // Conveyor belt
        this._beltGfx = this.add.graphics();
        this._drawBelt();

        // ── Title ─────────────────────────────────────────────────────────
        this.add.rectangle(0, 0, GAME_WIDTH, 72, 0x000000, 0.75).setOrigin(0);
        titleText(this, 26, 'Nachttrein – Pak de Koffers!', '#1A237E');
        this.add.text(GAME_WIDTH / 2, 52, 'Tik alleen op de GOUDEN koffers ⭐', {
            fontFamily: 'Arial', fontSize: '13px', color: '#FFD700'
        }).setOrigin(0.5);

        // ── HUD ───────────────────────────────────────────────────────────
        this.add.rectangle(0, GAME_HEIGHT - 56, GAME_WIDTH, 56, 0x000000, 0.75).setOrigin(0);
        this._caughtText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 38, '', {
            fontFamily: 'Arial', fontSize: '15px', color: '#E8A020'
        }).setOrigin(0.5);
        this._timerText = this.add.text(GAME_WIDTH - 20, GAME_HEIGHT - 28, '', {
            fontFamily: 'Arial', fontSize: '15px', color: '#ffffff'
        }).setOrigin(1, 0.5);
        this._livesText = this.add.text(20, GAME_HEIGHT - 28, '', {
            fontFamily: 'Arial', fontSize: '18px', color: '#ff4444'
        }).setOrigin(0, 0.5);

        this._updateHUD();

        // ── Spawn timer ───────────────────────────────────────────────────
        this._spawnTimer = this.time.addEvent({
            delay: 1400, callback: this._spawnItem, callbackScope: this, loop: true
        });

        // Back button
        var bz = this.add.zone(42, 32, 70, 30).setInteractive();
        makeButton(this, 42, 32, 70, 30, 0x333333, '← Terug', 13);
        bz.on('pointerdown', function () {
            scene._cleanup();
            scene.scene.start('MapScene', { saveData: loadSave() });
        });
    }

    _drawBelt() {
        this._beltGfx.clear();
        this._beltGfx.fillStyle(0x333333, 1);
        this._beltGfx.fillRect(0, 470, GAME_WIDTH, 70);
        // Belt stripes
        this._beltGfx.lineStyle(2, 0x555555, 0.7);
        var off = ((this._beltOffset | 0) % 30);
        for (var bx = -30 + off; bx < GAME_WIDTH + 30; bx += 30) {
            this._beltGfx.lineBetween(bx, 470, bx - 15, 540);
        }
    }

    _spawnItem() {
        if (!this._running) return;
        var scene = this;
        var isGood = Math.random() > 0.4; // 60% good items
        var items  = isGood
            ? ['🧳⭐','🎒⭐','💼⭐']
            : ['🧳❌','🎒❌','👜❌'];
        var label  = items[Math.floor(Math.random() * 3)];

        var bg = this.add.graphics();
        bg.fillStyle(isGood ? 0x3D2800 : 0x2D0000, 1);
        bg.fillRoundedRect(-35, -28, 70, 56, 8);
        bg.lineStyle(3, isGood ? 0xFFD700 : 0xFF4444, 1);
        bg.strokeRoundedRect(-35, -28, 70, 56, 8);

        var txt = this.add.text(0, 0, label, {
            fontFamily: 'Arial', fontSize: '22px', align: 'center'
        }).setOrigin(0.5);

        var container = this.add.container(GAME_WIDTH + 50, 505, [bg, txt]);
        container._isGood = isGood;
        container._active = true;

        // Move across belt
        var speed = 180 + Math.floor(this.elapsed / 25) * 20; // speed up over time
        this.tweens.add({
            targets: container, x: -70, duration: (GAME_WIDTH + 120) / speed * 1000,
            ease: 'Linear',
            onComplete: function () {
                if (!container._active) return;
                container._active = false;
                if (isGood) {
                    // Missed a good bag
                    SFX.lose();
                    scene._loseLife();
                }
                container.destroy();
                scene._items = scene._items.filter(function (c) { return c !== container; });
            }
        });

        container.setSize(70, 56);
        container.setInteractive(
            new Phaser.Geom.Rectangle(-35, -28, 70, 56),
            Phaser.Geom.Rectangle.Contains
        );
        container.on('pointerdown', function () {
            if (!container._active) return;
            container._active = false;
            if (isGood) {
                SFX.collect();
                scene.caught++;
                scene.tweens.add({ targets: container, scaleX: 0, scaleY: 0, duration: 150 });
            } else {
                SFX.wrong();
                scene.tweens.add({ targets: container, alpha: 0, duration: 150 });
                scene._loseLife();
            }
            scene.time.delayedCall(200, function () {
                container.destroy();
                scene._items = scene._items.filter(function (c) { return c !== container; });
                scene._updateHUD();
            });
            scene._updateHUD();
        });

        this._items.push(container);
    }

    _loseLife() {
        this.lives--;
        this._updateHUD();
        if (this.lives <= 0) this._endGame(false);
    }

    _updateHUD() {
        this._livesText.setText('🎟️'.repeat(this.lives));
        this._caughtText.setText('✅ Gepakt: ' + this.caught + ' / ' + this.needed);
    }

    _cleanup() {
        if (this._spawnTimer) { this._spawnTimer.remove(); this._spawnTimer = null; }
        this._items.forEach(function (c) { c.destroy(); });
        this._items = [];
        this._running = false;
    }

    _endGame(won) {
        if (!this._running) return;
        this._cleanup();
        var scene = this;

        if (won) {
            SFX.win();
            var stars = this.lives === 3 ? 3 : this.lives === 2 ? 2 : 1;
            completeLocation(this.locationIndex, stars);
            this.time.delayedCall(400, function () {
                scene.scene.start('WinScene', {
                    locationIndex: scene.locationIndex, stars: stars,
                    name1: scene.name1, name2: scene.name2
                });
            });
        } else {
            SFX.lose();
            this._showRetry();
        }
    }

    _showRetry() {
        var scene = this;
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7).setOrigin(0);
        bodyText(this, GAME_HEIGHT / 2 - 40, 'Oh nee! De trein gaat bijna weg!\nProbeer het opnieuw!', '#FF8888', 20);
        var btn = makeButton(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, 220, 52, COLORS.orange, '🔄 Opnieuw', 20);
        buttonInteractive(this, btn, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, 220, 52, function () {
            scene.scene.restart();
        });
    }

    update(time, delta) {
        if (!this._running) return;
        this.elapsed += delta / 1000;
        this._beltOffset += delta * 0.12;
        this._drawBelt();

        var remaining = Math.ceil(this.gameTime - this.elapsed);
        this._timerText.setText('⏱ ' + remaining + 's');

        if (this.elapsed >= this.gameTime) {
            this._endGame(this.caught >= this.needed);
        }
    }
}

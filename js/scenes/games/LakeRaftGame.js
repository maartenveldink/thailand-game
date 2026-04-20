class LakeRaftGame extends Phaser.Scene {
    constructor() { super({ key: 'LakeRaftGame' }); }

    init(data) {
        this.locationIndex = data.locationIndex;
        this.name1 = data.name1;
        this.name2 = data.name2;
    }

    create() {
        var scene = this;
        this.lane = 1;           // 0=left, 1=center, 2=right
        this.score = 0;          // stars collected
        this.lives = 3;
        this._running = true;
        this._moving = false;    // canoe tween in progress
        this._objects = [];      // {gfx, lane, y, type, active}

        this._laneX = [97, 195, 293];
        this._canoeX = this._laneX[1];

        // ── Background ──────────────────────────────────────────────────
        // Night lake: dark teal
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x041C2C).setOrigin(0);

        // Moon
        var moonGfx = this.add.graphics();
        moonGfx.fillStyle(0xFFF8E1, 0.9);
        moonGfx.fillCircle(320, 80, 30);
        moonGfx.fillStyle(0x041C2C, 1);
        moonGfx.fillCircle(330, 74, 26); // crescent

        // Stars (random dots)
        var starGfx = this.add.graphics();
        starGfx.fillStyle(0xFFFFFF, 0.7);
        for (var i = 0; i < 40; i++) {
            starGfx.fillCircle(Math.random() * GAME_WIDTH, Math.random() * 300, Math.random() * 1.5 + 0.5);
        }

        // Jungle silhouette left and right
        var jungle = this.add.graphics();
        jungle.fillStyle(0x0A3020, 1);
        for (var j = 0; j < 6; j++) {
            // Left trees
            jungle.fillTriangle(-10, GAME_HEIGHT, j * 12, GAME_HEIGHT - 80 - j * 15, j * 12 + 24, GAME_HEIGHT);
            // Right trees
            var rx = GAME_WIDTH - j * 12 - 24;
            jungle.fillTriangle(rx, GAME_HEIGHT, rx + 12, GAME_HEIGHT - 80 - j * 15, rx + 24, GAME_HEIGHT);
        }

        // Lane dividers (subtle)
        var laneGfx = this.add.graphics();
        laneGfx.lineStyle(1, 0x1A5276, 0.4);
        laneGfx.lineBetween(this._laneX[0] + 48, 100, this._laneX[0] + 48, GAME_HEIGHT - 100);
        laneGfx.lineBetween(this._laneX[1] + 48, 100, this._laneX[1] + 48, GAME_HEIGHT - 100);

        // Water (animated)
        this._water = createWater(this, 160, 0x0D4B6E);

        // ── Canoe ────────────────────────────────────────────────────────
        this._canoeGfx = this.add.graphics();
        this._drawCanoe(this._canoeGfx, this._laneX[1], 720);

        // ── Title bar ────────────────────────────────────────────────────
        this.add.rectangle(0, 0, GAME_WIDTH, 94, 0x000000, 0.75).setOrigin(0);
        titleText(this, 40, 'Cheow Lan – Kano Race', '#00BCD4');

        // HUD (stars + lives, shown inside title bar)
        this._hudText = this.add.text(GAME_WIDTH / 2, 79, '', {
            fontFamily: 'Arial', fontSize: '15px', color: '#FFFFFF',
            stroke: '#000000', strokeThickness: 1
        }).setOrigin(0.5);
        this._updateHUD();

        // ── Bottom bar ───────────────────────────────────────────────────
        this.add.rectangle(0, GAME_HEIGHT - 55, GAME_WIDTH, 55, 0x000000, 0.7).setOrigin(0);
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 27, 'Tik links of rechts om te sturen!', {
            fontFamily: 'Arial', fontSize: '13px', color: '#888888'
        }).setOrigin(0.5);

        // ── Input ────────────────────────────────────────────────────────
        this.input.on('pointerdown', function (ptr) {
            if (!scene._running || scene._moving) return;
            if (ptr.y < 72 || ptr.y > GAME_HEIGHT - 55) return; // ignore UI zones
            if (ptr.x < GAME_WIDTH / 2) {
                scene._moveLane(-1);
            } else {
                scene._moveLane(1);
            }
        });

        // ── Spawn timer ───────────────────────────────────────────────────
        this._spawnEvent = this.time.addEvent({
            delay: 1200, loop: true, callback: this._spawnObject, callbackScope: this
        });

        // ── Back button ──────────────────────────────────────────────────
        backArrow(this, function () {
            scene._running = false;
            if (window._onReturnToMap) window._onReturnToMap();
            else scene.scene.start('MapScene', { saveData: loadSave() });
        });
    }

    _drawCanoe(gfx, cx, cy) {
        gfx.clear();
        // Canoe body: dark brown elongated shape
        gfx.fillStyle(0x5D3A1A, 1);
        gfx.fillEllipse(cx, cy, 56, 26);
        // Canoe rim: lighter brown
        gfx.lineStyle(3, 0x8B5E3C, 1);
        gfx.strokeEllipse(cx, cy, 56, 26);
        // Paddle (horizontal)
        gfx.lineStyle(4, 0x795548, 1);
        gfx.lineBetween(cx - 30, cy - 8, cx + 30, cy - 8);
        gfx.fillStyle(0x5D4037, 1);
        gfx.fillEllipse(cx - 32, cy - 8, 14, 8);
        gfx.fillEllipse(cx + 32, cy - 8, 14, 8);
    }

    _moveLane(dir) {
        var newLane = Phaser.Math.Clamp(this.lane + dir, 0, 2);
        if (newLane === this.lane) return;
        this.lane = newLane;
        this._moving = true;
        var scene = this;
        this.tweens.add({
            targets: { x: this._canoeX },
            x: this._laneX[this.lane],
            duration: 150,
            ease: 'Power2',
            onUpdate: function (tween, target) {
                scene._canoeX = target.x;
                scene._drawCanoe(scene._canoeGfx, target.x, 720);
            },
            onComplete: function () { scene._moving = false; }
        });
        SFX.tap();
    }

    _spawnObject() {
        if (!this._running) return;
        var lane = Phaser.Math.Between(0, 2);
        var type = Math.random() < 0.3 ? 'star' : (Math.random() < 0.5 ? 'log' : 'rock');
        var gfx = this.add.graphics();
        // Draw once at local origin; setPosition to move cheaply each frame
        this._drawObjectLocal(gfx, type);
        gfx.setPosition(this._laneX[lane], -40);
        var obj = { gfx: gfx, lane: lane, y: -40, type: type, active: true };
        this._objects.push(obj);
    }

    // Draw obstacle/star at (0,0) local coords — called once at spawn, not every frame
    _drawObjectLocal(gfx, type) {
        gfx.clear();
        if (type === 'log') {
            gfx.fillStyle(0x6D4C41, 1);
            gfx.fillRoundedRect(-40, -11, 80, 22, 8);
            gfx.lineStyle(2, 0x4E342E, 1);
            gfx.strokeRoundedRect(-40, -11, 80, 22, 8);
            gfx.lineStyle(1, 0x4E342E, 0.5);
            for (var i = -20; i <= 20; i += 10) {
                gfx.lineBetween(i, -9, i, 9);
            }
        } else if (type === 'rock') {
            gfx.fillStyle(0x607D8B, 1);
            gfx.fillCircle(0, 0, 20);
            gfx.fillStyle(0x546E7A, 1);
            gfx.fillCircle(-5, -5, 8);
            gfx.lineStyle(2, 0x455A64, 1);
            gfx.strokeCircle(0, 0, 20);
        } else { // star
            drawStar(gfx, 0, 0, 18, 0xFFD700);
        }
    }

    _updateHUD() {
        var hearts = '';
        for (var i = 0; i < 3; i++) hearts += (i < this.lives ? '❤️' : '🖤');
        this._hudText.setText('⭐ ' + this.score + '/12   ' + hearts);
    }

    _doEnd() {
        if (!this._running) return;
        this._running = false;
        if (this._spawnEvent) this._spawnEvent.remove();

        var won = this.score >= 12;
        var scene = this;

        // Overlay
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.65).setOrigin(0);

        if (won) {
            SFX.win();
            var stars = this.score >= 20 ? 3 : this.score >= 16 ? 2 : 1;
            completeLocation(this.locationIndex, stars);
            this.add.text(GAME_WIDTH / 2, 270, '🚣', { fontSize: '70px' }).setOrigin(0.5);
            bodyText(this, 370, 'Geweldig! ' + this.score + ' sterren gevangen!\nJullie zijn echte kanohelden!', '#88FF88', 18);
            var btn = makeButton(this, GAME_WIDTH / 2, 490, 240, 54, COLORS.gold, 'Verder ▶', 22);
            buttonInteractive(this, btn, GAME_WIDTH / 2, 490, 240, 54, function () {
                scene.scene.start('WinScene', {
                    locationIndex: scene.locationIndex, stars: stars,
                    name1: scene.name1, name2: scene.name2
                });
            });
        } else {
            SFX.lose();
            this.add.text(GAME_WIDTH / 2, 270, '🌊', { fontSize: '70px' }).setOrigin(0.5);
            bodyText(this, 370, 'Oh nee! ' + this.score + ' sterren – je hebt 12 nodig.\nProbeer het opnieuw!', '#FF8888', 18);
            var retryBtn = makeButton(this, GAME_WIDTH / 2, 490, 220, 52, COLORS.orange, '🔄 Opnieuw', 20);
            buttonInteractive(this, retryBtn, GAME_WIDTH / 2, 490, 220, 52, function () {
                scene.scene.restart({ locationIndex: scene.locationIndex, name1: scene.name1, name2: scene.name2 });
            });
        }
    }

    update(time, delta) {
        if (!this._running) return;

        // Animate water
        updateWater(this._water, time);

        // Move objects down
        var speed = 120 + Math.floor(this.score / 3) * 20;
        var dt = delta / 1000;
        var scene = this;

        for (var i = this._objects.length - 1; i >= 0; i--) {
            var obj = this._objects[i];
            if (!obj.active) {
                this._objects.splice(i, 1);
                continue;
            }
            obj.y += speed * dt;
            obj.gfx.setY(obj.y);

            // Off screen
            if (obj.y > GAME_HEIGHT + 40) {
                obj.gfx.destroy();
                obj.active = false;
                this._objects.splice(i, 1);
                continue;
            }

            // Collision with canoe (same lane, y close to 720)
            if (obj.lane === this.lane && Math.abs(obj.y - 720) < 35) {
                obj.active = false;
                obj.gfx.destroy();
                this._objects.splice(i, 1);

                if (obj.type === 'star') {
                    this.score++;
                    SFX.collect();
                    this._updateHUD();
                    if (this.score >= 12) {
                        this._doEnd();
                        return;
                    }
                } else {
                    // Obstacle hit
                    SFX.wrong();
                    this.lives--;
                    this._updateHUD();
                    // Flash canoe red
                    scene.cameras.main.flash(300, 150, 0, 0);
                    if (this.lives <= 0) {
                        this._doEnd();
                        return;
                    }
                }
            }
        }
    }
}

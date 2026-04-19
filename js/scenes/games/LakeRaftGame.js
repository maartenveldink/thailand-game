class LakeRaftGame extends Phaser.Scene {
    constructor() { super({ key: 'LakeRaftGame' }); }

    init(data) {
        this.locationIndex = data.locationIndex;
        this.name1 = data.name1;
        this.name2 = data.name2;
    }

    create() {
        var scene     = this;
        this.raftCX   = GAME_WIDTH  / 2;
        this.raftCY   = 580;
        this.raftW    = 300;
        this.raftH    = 24;
        this.tilt     = 0;
        this._jerk    = 0;
        this.lostItems = 0;
        this.elapsed  = 0;
        this.gameTime = 60;
        this._running = true;

        // Items: emoji + offsetX on raft
        var itemData = [
            { icon: '🧳', offsetX: -115 },
            { icon: '🎒', offsetX: -55  },
            { icon: '📷', offsetX:  0   },
            { icon: '💧', offsetX:  55  },
            { icon: '🕶️', offsetX:  115 }
        ];
        this.items       = itemData.map(function (d) {
            return { icon: d.icon, offsetX: d.offsetX, caught: false, fallen: false };
        });

        // ── Night lake background ─────────────────────────────────────────
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x020C18).setOrigin(0);

        // Stars
        var stars = this.add.graphics();
        stars.fillStyle(0xFFFFFF, 1);
        for (var si = 0; si < 60; si++) {
            var alpha = 0.5 + Math.random() * 0.5;
            stars.fillStyle(0xFFFFFF, alpha);
            stars.fillCircle(Math.random() * GAME_WIDTH, Math.random() * 350, Math.random() < 0.2 ? 2 : 1);
        }

        // Moon
        this.add.circle(300, 70, 28, 0xFFF9C4).setAlpha(0.9);

        // Jungle silhouette
        var jungle = this.add.graphics();
        jungle.fillStyle(0x0A1A0A, 1);
        for (var ji = 0; ji < 10; ji++) {
            var tx = ji * 45 - 20;
            jungle.fillTriangle(tx, 450, tx + 30, 370 - Math.random() * 60, tx + 65, 450);
        }

        // Water (animated)
        this.waterGfx = createWater(this, 440, 0x0D47A1);

        // Water reflection (stars shimmering in water)
        this.reflectionGfx = this.add.graphics();

        // Raft graphics (redrawn each frame)
        this.raftGfx = this.add.graphics();

        // ── Item sprites ──────────────────────────────────────────────────
        this.itemSprites = this.items.map(function (item) {
            return scene.add.text(0, 0, item.icon, { fontSize: '36px' }).setOrigin(0.5);
        });
        this.itemZones = this.items.map(function (item, i) {
            var z = scene.add.zone(0, 0, 50, 50).setInteractive();
            z.on('pointerdown', function () { scene._catchItem(i); });
            return z;
        });

        // ── Title ─────────────────────────────────────────────────────────
        this.add.rectangle(0, 0, GAME_WIDTH, 72, 0x000000, 0.8).setOrigin(0);
        titleText(this, 26, 'Cheow Lan – Houd het Vlot!', '#0288D1');
        this.add.text(GAME_WIDTH / 2, 54, 'Tik op de spullen als ze beginnen te schuiven!', {
            fontFamily: 'Arial', fontSize: '13px', color: '#80D8FF'
        }).setOrigin(0.5);

        // ── HUD ───────────────────────────────────────────────────────────
        this.add.rectangle(0, GAME_HEIGHT - 54, GAME_WIDTH, 54, 0x000000, 0.8).setOrigin(0);
        this._safeText  = this.add.text(20, GAME_HEIGHT - 27, '', {
            fontFamily: 'Arial', fontSize: '15px', color: '#80D8FF'
        }).setOrigin(0, 0.5);
        this._timerText = this.add.text(GAME_WIDTH - 20, GAME_HEIGHT - 27, '', {
            fontFamily: 'Arial', fontSize: '15px', color: '#ffffff'
        }).setOrigin(1, 0.5);
        this._updateHUD();

        // Occasional jerk events
        this.time.addEvent({
            delay: 2200, loop: true, callback: function () {
                if (!scene._running) return;
                scene._jerk = (Math.random() - 0.5) * 0.36;
                scene.time.delayedCall(700, function () { scene._jerk = 0; });
            }
        });

        // Back
        var bz = this.add.zone(42, 32, 70, 30).setInteractive();
        makeButton(this, 42, 32, 70, 30, 0x333333, '← Terug', 13);
        bz.on('pointerdown', function () {
            scene._running = false;
            scene.scene.start('MapScene', { saveData: loadSave() });
        });
    }

    _catchItem(idx) {
        var item = this.items[idx];
        if (item.caught || item.fallen) return;
        item.caught = true;
        SFX.collect();
        this.tweens.add({ targets: this.itemSprites[idx], scaleX: 1.4, scaleY: 1.4, duration: 100, yoyo: true });
        this._updateHUD();
    }

    _updateHUD() {
        var safe = this.items.filter(function (it) { return it.caught; }).length;
        var lost = this.lostItems;
        this._safeText.setText('✅ Veilig: ' + safe + '  ❌ Verloren: ' + lost);
    }

    _drawRaft() {
        var cx  = this.raftCX;
        var cy  = this.raftCY;
        var w   = this.raftW;
        var h   = this.raftH;
        var t   = this.tilt;
        var cos = Math.cos(t), sin = Math.sin(t);

        this.raftGfx.clear();

        // Raft body
        this.raftGfx.fillStyle(0x6D3B1A, 1);
        var pts = [
            { x: cx - w/2*cos + h/2*sin, y: cy - w/2*sin - h/2*cos },
            { x: cx + w/2*cos + h/2*sin, y: cy + w/2*sin - h/2*cos },
            { x: cx + w/2*cos - h/2*sin, y: cy + w/2*sin + h/2*cos },
            { x: cx - w/2*cos - h/2*sin, y: cy - w/2*sin + h/2*cos }
        ];
        this.raftGfx.fillPoints(pts, true);

        // Plank lines
        this.raftGfx.lineStyle(1, 0x4A2000, 0.7);
        for (var pi = -2; pi <= 2; pi++) {
            var off = pi * (w / 5);
            this.raftGfx.lineBetween(
                cx + off*cos + h/2*sin, cy + off*sin - h/2*cos,
                cx + off*cos - h/2*sin, cy + off*sin + h/2*cos
            );
        }
    }

    _updateItems(delta) {
        var cx  = this.raftCX;
        var cy  = this.raftCY;
        var t   = this.tilt;
        var cos = Math.cos(t), sin = Math.sin(t);

        this.items.forEach(function (item, i) {
            if (item.caught || item.fallen) {
                return;
            }

            // Slide toward lower end
            item.offsetX += t * 2.8 * (delta / 1000) * 60;

            // World position
            var wx = cx + item.offsetX * cos - 14 * sin;
            var wy = cy + item.offsetX * sin - 14 * cos - 25;

            this.itemSprites[i].setPosition(wx, wy);
            this.itemZones[i].setPosition(wx, wy);

            // Fell off raft
            if (Math.abs(item.offsetX) > this.raftW / 2 + 10) {
                item.fallen = true;
                this.itemSprites[i].setVisible(false);
                this.itemZones[i].setActive(false);
                this.lostItems++;
                SFX.lose();
                this._updateHUD();
            }
        }, this);
    }

    _doEnd() {
        if (!this._running) return;
        this._running = false;

        var safe = this.items.filter(function (it) { return it.caught; }).length;
        var won  = safe >= 3;
        var scene = this;

        if (won) {
            SFX.win();
            var stars = safe === 5 ? 3 : safe === 4 ? 2 : 1;
            completeLocation(this.locationIndex, stars);
            this.time.delayedCall(300, function () {
                scene.scene.start('WinScene', {
                    locationIndex: scene.locationIndex, stars: stars,
                    name1: scene.name1, name2: scene.name2
                });
            });
        } else {
            SFX.lose();
            this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6).setOrigin(0);
            bodyText(this, GAME_HEIGHT / 2 - 40, 'Oeps! Te veel spullen zijn gevallen!\nProbeer het opnieuw!', '#FF8888', 18);
            var btn = makeButton(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, 220, 52, COLORS.orange, '🔄 Opnieuw', 20);
            buttonInteractive(this, btn, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, 220, 52, function () {
                scene.scene.restart();
            });
        }
    }

    update(time, delta) {
        if (!this._running) return;

        // Smooth tilt
        var target = 0.20 * Math.sin(time * 0.00072) + this._jerk;
        this.tilt += (target - this.tilt) * 0.06;

        updateWater(this.waterGfx, time);
        this._drawRaft();
        this._updateItems(delta);

        this.elapsed += delta / 1000;
        var remaining = Math.ceil(this.gameTime - this.elapsed);
        this._timerText.setText('⏱ ' + remaining + 's');

        if (this.elapsed >= this.gameTime) {
            this._doEnd();
        }
    }
}

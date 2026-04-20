class MapScene extends Phaser.Scene {
    constructor() { super({ key: 'MapScene' }); }

    init(data) {
        this.saveData = data.saveData || loadSave();
    }

    create() {
        var scene = this;
        var save  = this.saveData;

        this._pulseTime = 0;

        // ── Background ─────────────────────────────────────────────────────
        // Sky
        var sky = this.add.graphics();
        sky.fillGradientStyle(0x0D1B4B, 0x0D1B4B, 0x0A3050, 0x0A3050, 1);
        sky.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Ocean around the map
        var ocean = this.add.graphics();
        ocean.fillStyle(0x054D6B, 0.7);
        ocean.fillRect(MAP_X - 10, MAP_Y - 10, MAP_W + 20, MAP_H + 20);

        // ── Thailand land polygon ──────────────────────────────────────────
        var land = this.add.graphics();
        land.fillStyle(0x1B4A1B, 1);
        var pts = THAILAND_POLY.map(function (p) {
            return { x: MAP_X + p[0] * MAP_W, y: MAP_Y + p[1] * MAP_H };
        });
        land.fillPoints(pts, true);
        land.lineStyle(1.5, 0x2E7D32, 1);
        land.strokePoints(pts, true);

        // Gulf of Thailand highlight (right of peninsula)
        var gulf = this.add.graphics();
        gulf.fillStyle(0x0277BD, 0.35);
        gulf.fillRect(MAP_X + 0.55 * MAP_W, MAP_Y + 0.45 * MAP_H,
                      MAP_W * 0.40, MAP_H * 0.35);

        // Koh Samui island dot
        var islandX = MAP_X + 0.76 * MAP_W;
        var islandY = MAP_Y + 0.70 * MAP_H;
        var island = this.add.graphics();
        island.fillStyle(0x1B4A1B, 1);
        island.fillCircle(islandX, islandY, 12);
        island.lineStyle(1, 0x2E7D32, 1);
        island.strokeCircle(islandX, islandY, 12);

        // ── Route line ────────────────────────────────────────────────────
        var routeGfx = this.add.graphics();
        routeGfx.lineStyle(2, 0xE8A020, 0.55);
        var routePts = LOCATIONS.map(function (loc) {
            return { x: MAP_X + loc.mapX * MAP_W, y: MAP_Y + loc.mapY * MAP_H };
        });
        for (var i = 0; i < routePts.length - 1; i++) {
            if (i === 6) continue; // Bangkok Return overlaps Bangkok
            routeGfx.lineBetween(
                routePts[i].x, routePts[i].y,
                routePts[i+1].x, routePts[i+1].y
            );
        }

        // ── Location dots ─────────────────────────────────────────────────
        this._dotGraphics = [];
        this._zones = [];

        LOCATIONS.forEach(function (loc, idx) {
            var locSave = save.locations[idx];
            var cx = MAP_X + loc.mapX * MAP_W;
            var cy = MAP_Y + loc.mapY * MAP_H;

            // Glow ring (only for available)
            var glow = scene.add.graphics();
            glow.setVisible(false);
            scene._dotGraphics.push({ glow: glow, cx: cx, cy: cy, idx: idx });

            // Main dot
            var dot = scene.add.graphics();
            if (locSave.completed) {
                dot.fillStyle(loc.color, 1);
                dot.fillCircle(cx, cy, 14);
                dot.lineStyle(2, 0xFFFFFF, 0.6);
                dot.strokeCircle(cx, cy, 14);
            } else if (locSave.unlocked) {
                dot.fillStyle(loc.color, 1);
                dot.fillCircle(cx, cy, 14);
                dot.lineStyle(3, 0xFFFFFF, 0.9);
                dot.strokeCircle(cx, cy, 14);
            } else {
                dot.fillStyle(COLORS.gray, 1);
                dot.fillCircle(cx, cy, 10);
            }

            // Stamp text on completed / available dots
            if (locSave.unlocked) {
                scene.add.text(cx, cy, loc.stamp, {
                    fontSize: locSave.completed ? '16px' : '14px'
                }).setOrigin(0.5);
            }

            // Location name label
            var labelX = cx + (loc.mapX > 0.6 ? -18 : 18);
            var labelAnchor = loc.mapX > 0.6 ? 1 : 0;
            scene.add.text(labelX, cy + 16, loc.name, {
                fontFamily: 'Arial, sans-serif',
                fontSize: '10px',
                color: locSave.unlocked ? '#E8A020' : '#555555',
                stroke: '#000', strokeThickness: 2
            }).setOrigin(labelAnchor, 0);

            // Interactive zone
            var zone = scene.add.zone(cx, cy, 40, 40).setInteractive();
            zone._locIdx = idx;
            scene._zones.push(zone);

            zone.on('pointerdown', function () {
                scene._onLocationTap(this._locIdx);
            });
        });

        // Bring available (unlocked, not completed) zones to top so they aren't
        // obscured by later-added zones at the same map position (e.g. Bangkok Return)
        LOCATIONS.forEach(function (loc, idx) {
            if (save.locations[idx].unlocked && !save.locations[idx].completed) {
                scene.children.bringToTop(scene._zones[idx]);
            }
        });

        // ── Toast message ──────────────────────────────────────────────────
        this._toast = this.add.text(GAME_WIDTH / 2, MAP_Y - 30, '', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 10, y: 6 },
            align: 'center'
        }).setOrigin(0.5).setAlpha(0).setDepth(10);

        // ── Top UI bar ─────────────────────────────────────────────────────
        // Background strip
        var topBar = this.add.graphics();
        topBar.fillStyle(0x000000, 0.5);
        topBar.fillRect(0, 0, GAME_WIDTH, 56);

        // Title
        this.add.text(GAME_WIDTH / 2, 28, '🌴 Thailand Avontuur', {
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: '#E8A020',
            stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5);

        // Player names (bottom of canvas)
        var bottomBar = this.add.graphics();
        bottomBar.fillStyle(0x000000, 0.5);
        bottomBar.fillRect(0, GAME_HEIGHT - 50, GAME_WIDTH, 50);

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 25, '👤 ' + save.players.name1 + '  &  ' + save.players.name2, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '15px',
            color: '#C49050'
        }).setOrigin(0.5);

        // Stars count
        this.add.text(20, GAME_HEIGHT - 25, '⭐ ' + save.totalStars, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '15px',
            color: '#FFD700'
        }).setOrigin(0, 0.5);

        // Passport button (top-right)
        var passBtn = makeButton(this, GAME_WIDTH - 55, 28, 80, 36, COLORS.gold, '🛂 Pas', 15);
        buttonInteractive(this, passBtn, GAME_WIDTH - 55, 28, 80, 36, function () {
            SFX.tap();
            scene.scene.launch('PassportScene', { saveData: save });
            scene.scene.bringToTop('PassportScene');
        });
    }

    _onLocationTap(idx) {
        var scene   = this;
        var locSave = this.saveData.locations[idx];
        var loc     = LOCATIONS[idx];

        SFX.tap();

        if (locSave.completed) {
            // Re-show passport for this loc
            this.scene.launch('PassportScene', { saveData: this.saveData });
            this.scene.bringToTop('PassportScene');
            return;
        }

        if (locSave.unlocked) {
            this.scene.start('StoryScene', {
                locationIndex: idx,
                name1: this.saveData.players.name1,
                name2: this.saveData.players.name2,
                saveData: this.saveData
            });
            return;
        }

        // Locked: show toast
        var prevName = idx > 0 ? LOCATIONS[idx - 1].name : '';
        var msg = prevName ? 'Maak eerst ' + prevName + ' af!' : 'Nog niet beschikbaar';
        this._showToast(msg);
    }

    _showToast(msg) {
        var scene = this;
        this._toast.setText(msg).setAlpha(1);
        this.tweens.add({
            targets: this._toast,
            alpha: 0,
            delay: 1800,
            duration: 400
        });
    }

    update(time) {
        var save  = this.saveData;
        var pulse = 0.4 + 0.35 * Math.sin(time * 0.004);

        this._dotGraphics.forEach(function (entry) {
            var lSave = save.locations[entry.idx];
            entry.glow.clear();
            if (lSave.unlocked && !lSave.completed) {
                entry.glow.setVisible(true);
                entry.glow.lineStyle(3, 0xFFFFFF, pulse);
                entry.glow.strokeCircle(entry.cx, entry.cy, 18);
            }
        });
    }
}

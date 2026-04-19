class WinScene extends Phaser.Scene {
    constructor() { super({ key: 'WinScene' }); }

    init(data) {
        this.locationIndex = data.locationIndex;
        this.stars         = data.stars;
        this.name1         = data.name1;
        this.name2         = data.name2;
    }

    create() {
        var scene = this;
        var loc   = LOCATIONS[this.locationIndex];
        var save  = loadSave();

        // Background
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0A2010).setOrigin(0);

        // Confetti
        this._confetti = [];
        var colors = [0xE8A020, 0xD84315, 0x00897B, 0x1A237E, 0xFFD700, 0xFF6F00];
        for (var i = 0; i < 40; i++) {
            var gfx = this.add.graphics();
            var c   = colors[Math.floor(Math.random() * colors.length)];
            gfx.fillStyle(c, 1);
            gfx.fillRect(-4, -4, 8, 8);
            gfx.x = Math.random() * GAME_WIDTH;
            gfx.y = -20 - Math.random() * 200;
            gfx._speed = 1.5 + Math.random() * 2;
            gfx._sway  = (Math.random() - 0.5) * 1.5;
            this._confetti.push(gfx);
        }

        // Passport page background
        var page = this.add.graphics();
        page.fillStyle(0xFFF8E1, 1);
        page.fillRoundedRect(GAME_WIDTH/2 - 140, 180, 280, 300, 16);
        page.lineStyle(3, loc.color, 1);
        page.strokeRoundedRect(GAME_WIDTH/2 - 140, 180, 280, 300, 16);

        // Stamp emoji (starts small, grows)
        var stamp = this.add.text(GAME_WIDTH / 2, 310, loc.stamp, {
            fontSize: '80px'
        }).setOrigin(0.5).setScale(0);
        SFX.stamp();
        this.tweens.add({ targets: stamp, scaleX: 1.2, scaleY: 1.2, duration: 300,
            ease: 'Back.easeOut', onComplete: function () {
                scene.tweens.add({ targets: stamp, scaleX: 1, scaleY: 1, duration: 100 });
            }
        });

        // Location name on page
        this.add.text(GAME_WIDTH / 2, 400, loc.name, {
            fontFamily: 'Georgia, serif', fontSize: '20px',
            color: '#3D2800', stroke: '#3D2800', strokeThickness: 0
        }).setOrigin(0.5);

        // Stars (animate in one by one)
        var starGfx = this.add.graphics();
        var s = this.stars;
        for (var j = 0; j < 3; j++) {
            (function (idx) {
                scene.time.delayedCall(400 + idx * 200, function () {
                    drawStar(starGfx, GAME_WIDTH/2 - 36 + idx*36, 450, 14,
                        idx < s ? 0xFFD700 : 0x888888);
                    if (idx < s) SFX.collect();
                });
            })(j);
        }

        // Win message
        var winMsg = loc.winText
            .replace(/\[Naam1\]/g, this.name1)
            .replace(/\[Naam2\]/g, this.name2);

        this.add.text(GAME_WIDTH / 2, 530, winMsg, {
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            color: '#E8A020',
            align: 'center',
            wordWrap: { width: GAME_WIDTH - 60 },
            stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5);

        // Win sound
        this.time.delayedCall(600, function () { SFX.win(); });

        // "Terug naar de kaart" button
        var btn = makeButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 90, 280, 56, loc.color, 'Terug naar de kaart 🗺️', 20);
        buttonInteractive(this, btn, GAME_WIDTH / 2, GAME_HEIGHT - 90, 280, 56, function () {
            SFX.tap();
            if (window._onReturnToMap) {
                window._onReturnToMap();
            } else {
                scene.scene.start('MapScene', { saveData: loadSave() });
            }
        });
    }

    update() {
        this._confetti.forEach(function (g) {
            g.y += g._speed;
            g.x += g._sway;
            g.rotation += 0.04;
            if (g.y > GAME_HEIGHT + 20) g.y = -20;
        });
    }
}

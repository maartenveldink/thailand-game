class SamuiBeachGame extends Phaser.Scene {
    constructor() { super({ key: 'SamuiBeachGame' }); }

    init(data) {
        this.locationIndex = data.locationIndex;
        this.name1 = data.name1;
        this.name2 = data.name2;
    }

    create() {
        this.subIndex = 0;
        this.results  = [];
        this._running = true;
        this._startSubGame(0);
    }

    _clearScene() {
        this.children.list.slice().forEach(function (child) {
            child.destroy();
        });
        // Remove scene-level input listeners (coconut game uses these)
        this.input.off('pointerdown');
        if (this._updateFn) { this._updateFn = null; }
        if (this._spawnEvent) { this._spawnEvent.remove(); this._spawnEvent = null; }
        if (this._timerEvent) { this._timerEvent.remove(); this._timerEvent = null; }
        // Null out references to destroyed Phaser objects so update() doesn't call on them
        this._fishGlows = null;
        this._basketGfx = null;
        this._nutsArr = [];
    }

    _startSubGame(idx) {
        var scene = this;
        this._clearScene();
        switch (idx) {
            case 0: this._createCoconut(); break;
            case 1: this._createShells();  break;
            case 2: this._createSnorkel(); break;
        }
    }

    _endSubGame(won) {
        var scene = this;
        this.results.push(won);
        this.subIndex++;

        if (this.subIndex >= 3) {
            this._doFinalEnd();
            return;
        }

        // Transition
        var msg = won ? '🎉 Geweldig!\nVolgende uitdaging...' : '😅 Bijna!\nVolgende uitdaging...';
        this._clearScene();
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x001A30).setOrigin(0);
        bodyText(this, GAME_HEIGHT / 2 - 20, msg, won ? '#88FF88' : '#FF8888', 22);

        this.time.delayedCall(1600, function () {
            scene._startSubGame(scene.subIndex);
        });
    }

    // ── Sub-game A: Coconut Catch ────────────────────────────────────────
    _createCoconut() {
        var scene    = this;
        this._caught = 0;
        this._missed = 0;
        this._catchNeeded = 10;
        this._missLimit   = 5;
        this._basketX = GAME_WIDTH / 2;
        this._nutsArr = [];

        // Beach background
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x87CEEB).setOrigin(0); // sky
        this.add.rectangle(0, GAME_HEIGHT * 0.6, GAME_WIDTH, GAME_HEIGHT * 0.4, 0xF5DEB3).setOrigin(0); // sand

        // Palm tree
        var palm = this.add.graphics();
        palm.fillStyle(0x8B4513, 1); palm.fillRect(320, 200, 18, 200);
        palm.fillStyle(0x2E7D32, 1);
        palm.fillTriangle(290, 240, 360, 220, 340, 300);
        palm.fillTriangle(260, 220, 350, 240, 300, 310);
        palm.fillTriangle(310, 200, 370, 260, 290, 290);
        palm.fillStyle(0xE8A020, 1);
        for (var ci = 0; ci < 4; ci++) { palm.fillCircle(318 + ci * 5, 255, 7); }

        // Wave
        var wave = this.add.graphics();
        wave.fillStyle(0x0288D1, 0.7);
        wave.fillRect(0, Math.floor(GAME_HEIGHT * 0.6) - 20, GAME_WIDTH, 28);

        // Title bar
        this.add.rectangle(0, 0, GAME_WIDTH, 70, 0x000000, 0.6).setOrigin(0);
        titleText(this, 26, 'Koh Samui – Vang de Kokosnoten! 🥥', '#00897B');
        this.add.text(GAME_WIDTH / 2, 54, 'Tik LINKS of RECHTS van het scherm om te bewegen', {
            fontFamily: 'Arial', fontSize: '12px', color: '#80D8FF'
        }).setOrigin(0.5);

        // Basket
        this._basketGfx = this.add.graphics();
        this._drawBasket();

        // HUD
        this.add.rectangle(0, GAME_HEIGHT - 52, GAME_WIDTH, 52, 0x000000, 0.7).setOrigin(0);
        this._cText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 26, '', {
            fontFamily: 'Arial', fontSize: '15px', color: '#E8A020'
        }).setOrigin(0.5);
        this._updateCoconutHUD();

        // Touch input: tap left or right half
        this.input.on('pointerdown', function (ptr) {
            if (ptr.y < 70 || ptr.y > GAME_HEIGHT - 52) return;
            if (ptr.x < GAME_WIDTH / 2) {
                scene._basketX = Math.max(40, scene._basketX - 80);
            } else {
                scene._basketX = Math.min(GAME_WIDTH - 40, scene._basketX + 80);
            }
            scene._drawBasket();
            SFX.tap();
        });

        // Spawn coconuts
        this._spawnEvent = this.time.addEvent({
            delay: 1100, loop: true, callback: function () {
                if (!scene._running) return;
                var nx = 290 + (Math.random() - 0.5) * 60;
                var nut = scene.add.text(nx, 220, '🥥', { fontSize: '32px' }).setOrigin(0.5);
                scene._nutsArr.push({ sprite: nut, x: nx, y: 220 });
            }
        });

        this._updateFn = function (_, delta) {
            if (!scene._running) return;
            scene._nutsArr = scene._nutsArr.filter(function (nut) {
                nut.y += 4.5 * (delta / 16);
                nut.sprite.y = nut.y;
                var bY = GAME_HEIGHT - 90;
                if (nut.y >= bY) {
                    nut.sprite.destroy();
                    var hit = Math.abs(nut.x - scene._basketX) < 50;
                    if (hit) {
                        SFX.collect(); scene._caught++;
                    } else {
                        SFX.lose(); scene._missed++;
                    }
                    scene._updateCoconutHUD();
                    if (scene._caught >= scene._catchNeeded) { scene._endSubGame(true); }
                    if (scene._missed >= scene._missLimit)   { scene._endSubGame(false); }
                    return false;
                }
                return true;
            });
        };
    }

    _drawBasket() {
        this._basketGfx.clear();
        var bx = this._basketX;
        var by = GAME_HEIGHT - 100;
        this._basketGfx.fillStyle(0x8B4513, 1);
        this._basketGfx.fillRect(bx - 40, by, 80, 40);
        this._basketGfx.lineStyle(3, 0x6D3B1A, 1);
        this._basketGfx.strokeRect(bx - 40, by, 80, 40);
    }

    _updateCoconutHUD() {
        this._cText.setText(
            '🥥 Gevangen: ' + this._caught + '/' + this._catchNeeded +
            '   ❌ Gemist: ' + this._missed + '/' + this._missLimit
        );
    }

    // ── Sub-game B: Shell Memory ─────────────────────────────────────────
    _createShells() {
        var scene       = this;
        this._shellRound = 0;
        this._shellWins  = 0;
        this._shellTotal = 3;
        this._shellPhase = 'show'; // show | guess
        this._selectedPositions = [];
        this._shellAnswers = [];

        // Beach background
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x87CEEB).setOrigin(0);
        this.add.rectangle(0, GAME_HEIGHT * 0.45, GAME_WIDTH, GAME_HEIGHT * 0.55, 0xF5DEB3).setOrigin(0);
        wave2(this);

        titleText(this, 36, 'Koh Samui – Schelpen Onthouden! 🐚', '#00897B');
        this.add.text(GAME_WIDTH / 2, 62, 'Onthoud de schelpenposities en tik ze aan!', {
            fontFamily: 'Arial', fontSize: '12px', color: '#00897B'
        }).setOrigin(0.5);

        this._shellStatusText = this.add.text(GAME_WIDTH / 2, 95, '', {
            fontFamily: 'Arial', fontSize: '15px', color: '#E8A020', align: 'center'
        }).setOrigin(0.5);

        // 8 possible sand hole positions (in 2 rows)
        this._holePositions = [
            {x:60,y:520},{x:130,y:520},{x:200,y:520},{x:270,y:520},{x:330,y:520},
            {x:90,y:600},{x:170,y:600},{x:250,y:600},{x:320,y:600}
        ];

        this._holeGfx = this.add.graphics();
        this._shellSprites = [];

        this._shellRound = 0;
        this._startShellRound();
    }

    _startShellRound() {
        var scene = this;
        var numShells = 3 + this._shellRound; // 3, 4, 5
        this._shellAnswers = Phaser.Utils.Array.Shuffle(this._holePositions.slice()).slice(0, numShells).map(function(p){return p;});
        this._selectedPositions = [];
        this._shellPhase = 'show';

        // Clear previous
        this._shellSprites.forEach(function(s){ s.destroy(); });
        this._shellSprites = [];
        this._holeGfx.clear();

        // Draw sand holes
        this._holeGfx.fillStyle(0xC4A882, 0.6);
        this._holePositions.forEach(function(h){
            scene._holeGfx.fillCircle(h.x, h.y, 22);
        });

        // Show shells
        this._shellAnswers.forEach(function(pos){
            var s = scene.add.text(pos.x, pos.y, '🐚', { fontSize: '36px' }).setOrigin(0.5);
            scene._shellSprites.push(s);
        });

        this._shellStatusText.setText('Rondje ' + (this._shellRound+1) + ' / ' + this._shellTotal + ' – Onthoud de schelpen!');

        // After 2.5s, hide shells
        this.time.delayedCall(2500, function() {
            if (!scene._running) return;
            scene._shellSprites.forEach(function(s){ s.destroy(); });
            scene._shellSprites = [];
            scene._shellPhase = 'guess';
            scene._shellStatusText.setText('Rondje ' + (scene._shellRound+1) + ' – Waar waren de schelpen?');
            scene._shellRemaining = scene._shellAnswers.length;
            scene._setupShellTaps();
        });
    }

    _setupShellTaps() {
        var scene = this;
        this._holeZones = this._holePositions.map(function(pos, idx) {
            var z = scene.add.zone(pos.x, pos.y, 44, 44).setInteractive();
            z.on('pointerdown', function() {
                if (scene._shellPhase !== 'guess') return;
                var isCorrect = scene._shellAnswers.some(function(a){ return a.x===pos.x && a.y===pos.y; });
                var alreadySelected = scene._selectedPositions.some(function(s){ return s.x===pos.x && s.y===pos.y; });
                if (alreadySelected) return;

                scene._selectedPositions.push(pos);
                SFX.tap();

                if (isCorrect) {
                    SFX.correct();
                    var s = scene.add.text(pos.x, pos.y, '🐚', { fontSize: '36px' }).setOrigin(0.5);
                    scene._shellSprites.push(s);
                    scene._shellRemaining--;
                    if (scene._shellRemaining <= 0) {
                        scene._shellWins++;
                        SFX.match();
                        scene.time.delayedCall(600, function() {
                            if (!scene._running) return;
                            scene._shellRound++;
                            if (scene._shellRound >= scene._shellTotal) {
                                scene._endSubGame(scene._shellWins >= 2);
                            } else {
                                scene._startShellRound();
                            }
                        });
                    }
                } else {
                    var x = scene.add.text(pos.x, pos.y, '❌', { fontSize: '28px' }).setOrigin(0.5);
                    scene._shellSprites.push(x);
                    // Reveal where they were
                    scene._shellAnswers.forEach(function(a) {
                        var already = scene._selectedPositions.some(function(s){return s.x===a.x&&s.y===a.y;});
                        if (!already) {
                            var hint = scene.add.text(a.x, a.y, '🐚', { fontSize: '36px', alpha: 0.5 }).setOrigin(0.5);
                            scene._shellSprites.push(hint);
                        }
                    });
                    scene.time.delayedCall(1200, function() {
                        if (!scene._running) return;
                        scene._shellRound++;
                        if (scene._shellRound >= scene._shellTotal) {
                            scene._endSubGame(scene._shellWins >= 2);
                        } else {
                            scene._startShellRound();
                        }
                    });
                }
            });
            return z;
        });
    }

    // ── Sub-game C: Snorkel Fish Find ─────────────────────────────────────
    _createSnorkel() {
        var scene      = this;
        this._fishFound = 0;
        this._fishTotal = 6;
        this._snorkelTime = 90;
        this._snorkelElapsed = 0;

        // Underwater background
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x013A63).setOrigin(0);

        // Coral
        var coral = this.add.graphics();
        var coralColors = [0xE91E63, 0xFF5722, 0x9C27B0, 0xF44336];
        for (var ci = 0; ci < 12; ci++) {
            var cx = 20 + ci * 32, ch = 60 + Math.random() * 80;
            coral.fillStyle(coralColors[ci % 4], 0.8);
            coral.fillTriangle(cx, GAME_HEIGHT - 40, cx + 12, GAME_HEIGHT - 40 - ch, cx + 24, GAME_HEIGHT - 40);
        }

        // Bubbles (decorative)
        var bubbles = this.add.graphics();
        bubbles.lineStyle(1, 0x80D8FF, 0.4);
        for (var bi = 0; bi < 20; bi++) {
            bubbles.strokeCircle(Math.random() * GAME_WIDTH, 100 + Math.random() * 600, 4 + Math.random() * 10);
        }

        titleText(this, 36, 'Koh Samui – Zoek de Visjes! 🐠', '#00BCD4');
        this.add.text(GAME_WIDTH / 2, 62, 'Vind alle 6 tropische vissen in het koraal!', {
            fontFamily: 'Arial', fontSize: '13px', color: '#80D8FF'
        }).setOrigin(0.5);

        // Fish (hidden – slightly shimmering)
        var fishPositions = [
            {x:75,y:350},{x:180,y:550},{x:290,y:420},{x:130,y:680},
            {x:250,y:300},{x:340,y:600}
        ];
        this._fishFoundFlags = new Array(6).fill(false);
        this._fishGlows = [];

        fishPositions.forEach(function(pos, fi) {
            var fishIcons = ['🐠','🐡','🐟','🦈','🦀','🐙'];
            var glow = scene.add.graphics();
            scene._fishGlows.push({gfx:glow, x:pos.x, y:pos.y});

            var fish = scene.add.text(pos.x, pos.y, fishIcons[fi], {
                fontSize: '30px', alpha: 0.35
            }).setOrigin(0.5);

            var z = scene.add.zone(pos.x, pos.y, 55, 55).setInteractive();
            z.on('pointerdown', function() {
                if (scene._fishFoundFlags[fi]) return;
                scene._fishFoundFlags[fi] = true;
                fish.setAlpha(1);
                SFX.collect();
                scene._fishFound++;
                scene._updateSnorkelHUD();
                scene.tweens.add({ targets: fish, scaleX: 1.5, scaleY: 1.5, duration: 150, yoyo: true });
                if (scene._fishFound >= scene._fishTotal) {
                    scene.time.delayedCall(500, function() { scene._endSubGame(true); });
                }
            });
        });

        // HUD
        this.add.rectangle(0, GAME_HEIGHT - 52, GAME_WIDTH, 52, 0x000000, 0.8).setOrigin(0);
        this._fishText  = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 35, '', {
            fontFamily: 'Arial', fontSize: '15px', color: '#80D8FF'
        }).setOrigin(0.5);
        this._fishTimer = this.add.text(GAME_WIDTH - 20, GAME_HEIGHT - 18, '', {
            fontFamily: 'Arial', fontSize: '13px', color: '#ffffff'
        }).setOrigin(1, 0.5);
        this._updateSnorkelHUD();

        this._updateFn = function(_, delta) {
            if (!scene._running) return;
            scene._snorkelElapsed += delta / 1000;
            var rem = Math.ceil(scene._snorkelTime - scene._snorkelElapsed);
            scene._fishTimer.setText('⏱ ' + rem + 's');
            if (scene._snorkelElapsed >= scene._snorkelTime) {
                scene._endSubGame(scene._fishFound >= 4); // 4 of 6 is ok
            }
        };
    }

    _updateSnorkelHUD() {
        this._fishText.setText('🐠 Gevonden: ' + this._fishFound + ' / ' + this._fishTotal);
    }

    // ── Final ─────────────────────────────────────────────────────────────
    _doFinalEnd() {
        var scene = this;
        var wins  = this.results.filter(function(r){ return r; }).length;
        var won   = wins >= 2;

        this._clearScene();
        this._running = false;

        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x001A30).setOrigin(0);

        if (won) {
            SFX.win();
            this.add.text(GAME_WIDTH/2, 220, '🏖️', { fontSize: '80px' }).setOrigin(0.5);
            var stars = wins === 3 ? 3 : 2;
            completeLocation(this.locationIndex, stars);
            bodyText(this, 340, 'Jullie hebben ' + wins + ' van de 3\nstrandspelletjes gewonnen!\nKoh Samui was fantastisch!', '#88FF88', 18);
            var btn = makeButton(this, GAME_WIDTH/2, 480, 250, 54, COLORS.teal, 'Verder ▶', 22);
            buttonInteractive(this, btn, GAME_WIDTH/2, 480, 250, 54, function() {
                scene.scene.start('WinScene', {
                    locationIndex: scene.locationIndex, stars: stars,
                    name1: scene.name1, name2: scene.name2
                });
            });
        } else {
            SFX.lose();
            this.add.text(GAME_WIDTH/2, 220, '🌊', { fontSize: '80px' }).setOrigin(0.5);
            bodyText(this, 340, 'Bijna! Jullie wonnen ' + wins + ' van de 3 spelletjes.\nProbeer het nog eens!', '#FF8888', 18);
            var retryBtn = makeButton(this, GAME_WIDTH/2, 480, 220, 52, COLORS.orange, '🔄 Opnieuw', 20);
            buttonInteractive(this, retryBtn, GAME_WIDTH/2, 480, 220, 52, function() {
                scene.scene.restart();
            });
        }
    }

    update(time, delta) {
        if (!this._running) return;
        if (this._updateFn) this._updateFn(time, delta);

        // Pulse fish glows if in snorkel game
        if (this._fishGlows) {
            var pulse = 0.2 + 0.18 * Math.sin(time * 0.005);
            this._fishGlows.forEach(function(entry, fi) {
                entry.gfx.clear();
                if (!this._fishFoundFlags || !this._fishFoundFlags[fi]) {
                    entry.gfx.lineStyle(2, 0x80D8FF, pulse);
                    entry.gfx.strokeCircle(entry.x, entry.y, 30);
                }
            }, this);
        }
    }
}

function wave2(scene) {
    var w = scene.add.graphics();
    w.fillStyle(0x0288D1, 0.5);
    w.fillRect(0, Math.floor(GAME_HEIGHT * 0.45) - 15, GAME_WIDTH, 22);
}

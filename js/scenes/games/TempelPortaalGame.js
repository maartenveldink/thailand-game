// Tempel Portaal — reken je weg door Thaise tempelpoorten
class TempelPortaalGame extends Phaser.Scene {
    constructor() {
        super({ key: 'TempelPortaalGame' });
    }

    init(data) {
        this.name1       = data.name1 || '';
        this._count      = 10;
        this._shadowCount = 10; // theoretisch maximaal haalbaar getal (altijd beste keuze)
        this._round      = 0;
        this._score      = 0;
        this._bossNum    = 0;
        this._running    = false;
        this._waitingToStart = true;
        this._spawning   = false;
        this._portals    = [];
        this._combo      = null; // dubbel-blok ronde
    }

    create() {
        this._highscore = window.getHighscore ? window.getHighscore('tempel_portaal') : 0;
        this._W = 390; this._H = 844;
        var W = this._W, H = this._H;
        this._runnerX = W / 2;
        this._runnerY = 660;

        var s = window.loadSettings ? window.loadSettings() : {};
        this._minSpeed = s.tempelMinSpeed !== undefined ? s.tempelMinSpeed : 180;
        this._maxSpeed = s.tempelMaxSpeed !== undefined ? s.tempelMaxSpeed : 380;
        this._speed    = this._minSpeed;

        // ── Achtergrond ──────────────────────────────────────────────────────────
        this.add.rectangle(W/2, H*0.35, W, H*0.7, 0x1A0A00).setDepth(0);
        this.add.rectangle(W/2, H*0.85, W, H*0.3, 0x3D0C02).setDepth(0);

        var deco = this.add.graphics().setDepth(1);
        deco.fillStyle(0x5D1A00, 0.5);
        deco.fillRect(0, 80, 28, H - 80);
        deco.fillRect(W - 28, 80, 28, H - 80);
        deco.fillStyle(0xB8860B, 0.18);
        for (var i = 0; i < 12; i++) {
            deco.fillRect(4, 80 + i * 65, 20, 3);
            deco.fillRect(W - 24, 80 + i * 65, 20, 3);
        }

        // ── Runner ────────────────────────────────────────────────────────────────
        this._runnerGfx = this.add.graphics().setDepth(6);
        this._runnerTxt = this.add.text(this._runnerX, this._runnerY, '10', {
            fontFamily: 'Georgia, serif', fontSize: '28px', color: '#1A0A00',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(7);
        this._drawRunner();

        var track = this.add.graphics().setDepth(1);
        track.lineStyle(1, 0xFFD700, 0.12);
        track.lineBetween(W/2, 80, W/2, this._runnerY - 50);

        // ── HUD ───────────────────────────────────────────────────────────────────
        this._scoreTxt = this.add.text(14, 14, 'Score: 0', {
            fontFamily: 'Arial', fontSize: '18px', color: '#FFD700',
            stroke: '#000', strokeThickness: 2
        }).setDepth(10);

        this._hsTxt = this.add.text(W - 14, 14, 'Best: ' + this._highscore, {
            fontFamily: 'Arial', fontSize: '15px', color: '#FFD700',
            stroke: '#000', strokeThickness: 2
        }).setOrigin(1, 0).setDepth(10);

        this._roundTxt = this.add.text(W/2, 14, 'Ronde 0', {
            fontFamily: 'Arial', fontSize: '15px', color: 'rgba(255,255,255,0.6)'
        }).setOrigin(0.5, 0).setDepth(10);

        // ── Terugknop ─────────────────────────────────────────────────────────────
        backArrow(this, () => {
            this._running = false;
            if (window._onReturnToMap) window._onReturnToMap();
        });

        // ── Start cirkel ─────────────────────────────────────────────────────────
        var cy = this._runnerY - 140, cr = 44;
        this._startGfx = this.add.graphics().setDepth(10);
        this._startGfx.fillStyle(0xFFD700, 0.92);
        this._startGfx.fillCircle(W/2, cy, cr);
        this._startGfx.lineStyle(3, 0xffffff, 0.8);
        this._startGfx.strokeCircle(W/2, cy, cr);
        this._startTxt = this.add.text(W/2, cy, 'Start', {
            fontFamily: 'Georgia, serif', fontSize: '24px', color: '#000',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(11);

        // ── Input ─────────────────────────────────────────────────────────────────
        this.input.on('pointermove', (ptr) => {
            this._runnerX = Phaser.Math.Clamp(ptr.x, 50, W - 50);
            this._drawRunner();
        });

        this.input.on('pointerdown', () => {
            if (this._waitingToStart) {
                this._waitingToStart = false;
                this._running = true;
                this._startGfx.setVisible(false);
                this._startTxt.setVisible(false);
                this._spawnNext();
            }
        });
    }

    // ── Tekenen ───────────────────────────────────────────────────────────────────

    _drawRunner() {
        this._runnerGfx.clear();
        var x = this._runnerX, y = this._runnerY, r = 36;
        this._runnerGfx.fillStyle(0x000000, 0.3);
        this._runnerGfx.fillCircle(x + 3, y + 4, r);
        this._runnerGfx.fillStyle(0xFFD700, 1);
        this._runnerGfx.fillCircle(x, y, r);
        this._runnerGfx.lineStyle(3, 0xffffff, 0.8);
        this._runnerGfx.strokeCircle(x, y, r);
        this._runnerTxt.setPosition(x, y);
        this._runnerTxt.setText(String(this._count));
    }

    _drawPortalAt(gfx, txt, x, y, w, h, color) {
        gfx.clear();
        gfx.fillStyle(0x000000, 0.35);
        gfx.fillRoundedRect(x - w/2 + 4, y - h/2 + 5, w, h, 14);
        gfx.fillStyle(color, 1);
        gfx.fillRoundedRect(x - w/2, y - h/2, w, h, 14);
        gfx.lineStyle(3, 0xffffff, 0.55);
        gfx.strokeRoundedRect(x - w/2, y - h/2, w, h, 14);
        txt.setPosition(x, y);
    }

    _portalColor(op, neutral) {
        if (neutral) return 0x4A5568;
        return (op.op === '+' || op.op === '×') ? 0x1565C0 : 0xB71C1C;
    }

    // ── Spawning ──────────────────────────────────────────────────────────────────

    _spawnNext() {
        if (this._spawning || !this._running) return;
        this._spawning = true;
        this.time.delayedCall(300, () => {
            if (!this._running) return;
            this._spawning = false;
            this._round++;
            this._roundTxt.setText('Ronde ' + this._round);

            if (this._round > 1 && (this._round - 1) % 5 === 0) {
                this._spawnBoss();
            } else if (this._round >= 8 && Math.random() < 0.25) {
                this._spawnDoublePortals();
            } else {
                this._spawnPortals();
            }
        });
    }

    _spawnPortals() {
        var W = this._W;
        var ops = this._generateOps();
        if (Math.random() < 0.5) ops = [ops[1], ops[0]];

        // Neutraal: dezelfde kleur zodat je niet zomaar op kleur kunt gokken
        var neutral = this._round >= 6 && Math.random() < (this._round >= 12 ? 0.35 : 0.20);

        var pW = 155, pH = 70;
        var xs = [98, W - 98];
        this._portals = [];
        var scene = this;

        xs.forEach(function(px, i) {
            var op = ops[i];
            var color = scene._portalColor(op, neutral);
            var gfx = scene.add.graphics().setDepth(4);
            var txt = scene.add.text(px, -pH/2, op.op + op.val, {
                fontFamily: 'Georgia, serif', fontSize: '30px', color: '#ffffff',
                fontStyle: 'bold', stroke: '#000', strokeThickness: 3
            }).setOrigin(0.5).setDepth(5);
            var obj = { gfx: gfx, txt: txt, x: px, y: -pH/2, w: pW, h: pH, color: color, op: op, passed: false };
            scene._drawPortalAt(gfx, txt, px, -pH/2, pW, pH, color);
            scene._portals.push(obj);
        });

        // Shadow: altijd beste optie bijhouden
        this._updateShadow(ops);
    }

    _spawnDoublePortals() {
        // Twee rijen blokken, speler kiest kolom (links of rechts), krijgt beide effecten
        var W = this._W;
        var neutral = this._round >= 10 && Math.random() < 0.25;
        var pW = 155, pH = 62, gap = 14;
        var xs = [98, W - 98];
        var topY  = -(pH + gap + pH/2); // bovenste rij midden
        var botY  = -pH/2;              // onderste rij midden

        // Genereer 2 paren: [linksTop, rechtsTop] en [linksBot, rechtsBot]
        var opsTop = this._generateOps();
        var opsBот = this._generateOps();
        if (Math.random() < 0.5) { opsTop = [opsTop[1], opsTop[0]]; }
        if (Math.random() < 0.5) { opsBот = [opsBот[1], opsBот[0]]; }

        var combo = {
            blocks: [],
            leftOps:  [opsTop[0], opsBот[0]],
            rightOps: [opsTop[1], opsBот[1]],
            botY: botY,
            passed: false
        };

        var scene = this;
        [[xs[0], topY, opsTop[0]], [xs[1], topY, opsTop[1]],
         [xs[0], botY, opsBот[0]], [xs[1], botY, opsBот[1]]].forEach(function(entry) {
            var px = entry[0], py = entry[1], op = entry[2];
            var color = scene._portalColor(op, neutral);
            var gfx = scene.add.graphics().setDepth(4);
            var txt = scene.add.text(px, py, op.op + op.val, {
                fontFamily: 'Georgia, serif', fontSize: '26px', color: '#ffffff',
                fontStyle: 'bold', stroke: '#000', strokeThickness: 3
            }).setOrigin(0.5).setDepth(5);
            scene._drawPortalAt(gfx, txt, px, py, pW, pH, color);
            combo.blocks.push({ gfx: gfx, txt: txt, x: px, initY: py, pW: pW, pH: pH, color: color, op: op });
        });

        this._combo = combo;

        // Shadow: beste gecombineerde kolom
        var leftSim  = this._simulateOp(opsBот[0], this._simulateOp(opsTop[0], this._shadowCount));
        var rightSim = this._simulateOp(opsBот[1], this._simulateOp(opsTop[1], this._shadowCount));
        this._shadowCount = Math.max(leftSim, rightSim);
    }

    _spawnBoss() {
        this._bossNum++;
        var threshold = this._bossThreshold();
        var W = this._W;
        var bossH = 64;

        var gfx = this.add.graphics().setDepth(4);
        var txt = this.add.text(W/2, -bossH/2, 'Min: ' + threshold, {
            fontFamily: 'Georgia, serif', fontSize: '28px', color: '#ffffff',
            fontStyle: 'bold', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(5);
        var label = this.add.text(W/2, -bossH/2 - 24, '⚔ BAAS ⚔', {
            fontFamily: 'Arial', fontSize: '14px', color: '#FFD700',
            stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(5);

        var obj = { gfx: gfx, txt: txt, label: label, x: W/2, y: -bossH/2,
                    w: W - 20, h: bossH, isBoss: true, threshold: threshold, passed: false };
        this._portals = [obj];
        this._redrawBoss(obj);
    }

    _redrawBoss(obj) {
        var W = this._W, h = obj.h;
        obj.gfx.clear();
        obj.gfx.fillStyle(0x000000, 0.35);
        obj.gfx.fillRoundedRect(13, obj.y - h/2 + 4, W - 20, h, 10);
        obj.gfx.fillStyle(0xB8860B, 1);
        obj.gfx.fillRoundedRect(10, obj.y - h/2, W - 20, h, 10);
        obj.gfx.lineStyle(3, 0xFFD700, 0.9);
        obj.gfx.strokeRoundedRect(10, obj.y - h/2, W - 20, h, 10);
        obj.txt.setPosition(obj.x, obj.y);
        obj.label.setPosition(obj.x, obj.y - h/2 - 24);
    }

    // ── Operaties & shadow ────────────────────────────────────────────────────────

    _generateOps() {
        var r = this._round;
        var weights = r <= 5  ? [0.70, 0.20, 0.10]
                    : r <= 15 ? [0.50, 0.25, 0.25]
                    :           [0.34, 0.33, 0.33];
        var roll = Math.random();
        var type = roll < weights[0] ? 'mixed'
                 : roll < weights[0] + weights[1] ? 'goed'
                 : 'slecht';

        var pools = {
            mixed: r <= 5 ? [
                [{ op: '+', val: 3 },  { op: '−', val: 2 }],
                [{ op: '+', val: 5 },  { op: '−', val: 3 }],
                [{ op: '+', val: 7 },  { op: '÷', val: 2 }],
                [{ op: '×', val: 2 },  { op: '−', val: 2 }],
                [{ op: '+', val: 10 }, { op: '−', val: 4 }],
            ] : r <= 15 ? [
                [{ op: '×', val: 2 },  { op: '−', val: 5 }],
                [{ op: '+', val: 8 },  { op: '÷', val: 2 }],
                [{ op: '×', val: 3 },  { op: '−', val: 6 }],
                [{ op: '+', val: 12 }, { op: '÷', val: 2 }],
                [{ op: '×', val: 2 },  { op: '−', val: 8 }],
            ] : [
                [{ op: '×', val: 3 },  { op: '÷', val: 2 }],
                [{ op: '+', val: 15 }, { op: '−', val: 10 }],
                [{ op: '×', val: 4 },  { op: '÷', val: 3 }],
                [{ op: '+', val: 20 }, { op: '÷', val: 2 }],
                [{ op: '×', val: 2 },  { op: '−', val: 12 }],
            ],
            goed: r <= 5 ? [
                [{ op: '+', val: 5 },  { op: '+', val: 10 }],
                [{ op: '×', val: 2 },  { op: '+', val: 4 }],
                [{ op: '+', val: 3 },  { op: '+', val: 8 }],
            ] : r <= 15 ? [
                [{ op: '×', val: 2 },  { op: '+', val: 12 }],
                [{ op: '×', val: 3 },  { op: '×', val: 2 }],
                [{ op: '+', val: 10 }, { op: '+', val: 15 }],
            ] : [
                [{ op: '×', val: 3 },  { op: '×', val: 4 }],
                [{ op: '+', val: 20 }, { op: '×', val: 2 }],
                [{ op: '×', val: 2 },  { op: '+', val: 25 }],
            ],
            slecht: r <= 5 ? [
                [{ op: '−', val: 2 },  { op: '−', val: 4 }],
                [{ op: '÷', val: 2 },  { op: '−', val: 3 }],
            ] : r <= 15 ? [
                [{ op: '−', val: 5 },  { op: '÷', val: 2 }],
                [{ op: '−', val: 6 },  { op: '−', val: 10 }],
                [{ op: '÷', val: 2 },  { op: '÷', val: 3 }],
            ] : [
                [{ op: '÷', val: 2 },  { op: '÷', val: 3 }],
                [{ op: '−', val: 10 }, { op: '÷', val: 2 }],
                [{ op: '−', val: 12 }, { op: '−', val: 18 }],
            ],
        };
        var pool = pools[type];
        return pool[Math.floor(Math.random() * pool.length)];
    }

    _simulateOp(op, count) {
        if (op.op === '+') return count + op.val;
        if (op.op === '−') return Math.max(1, count - op.val);
        if (op.op === '×') return count * op.val;
        if (op.op === '÷') return Math.max(1, Math.floor(count / op.val));
        return count;
    }

    _updateShadow(ops) {
        // Altijd de beste keuze simuleren voor de shadow count
        var a = this._simulateOp(ops[0], this._shadowCount);
        var b = this._simulateOp(ops[1], this._shadowCount);
        this._shadowCount = Math.max(a, b);
    }

    _bossThreshold() {
        // Vereist percentage van shadow groeit mee met score: 62% bij 0, 88% bij score 300+
        var pct = Math.min(0.88, 0.62 + this._score * 0.00087);
        return Math.max(15, Math.floor(this._shadowCount * pct));
    }

    _applyOperation(op) {
        this._count = this._simulateOp(op, this._count);
    }

    // ── Update ────────────────────────────────────────────────────────────────────

    update(time, delta) {
        if (!this._running) return;
        var dt = delta / 1000;
        var dy = this._speed * dt;
        var runnerY = this._runnerY;
        var W = this._W;
        var scene = this;

        // Normale portalen
        if (this._portals.length > 0) {
            var allPassed = true;
            this._portals.forEach(function(obj) {
                if (obj.passed) return;
                allPassed = false;
                obj.y += dy;
                if (obj.isBoss) {
                    scene._redrawBoss(obj);
                } else {
                    scene._drawPortalAt(obj.gfx, obj.txt, obj.x, obj.y, obj.w, obj.h, obj.color);
                }
            });

            // Collision
            for (var i = 0; i < this._portals.length; i++) {
                var obj = this._portals[i];
                if (obj.passed || obj.y < runnerY - 10) continue;

                if (obj.isBoss) {
                    obj.passed = true;
                    if (this._count >= obj.threshold) {
                        this._score += 5;
                        var deductPct = Math.min(0.85, 0.50 + this._score * 0.001);
                        var deduct = Math.floor(obj.threshold * deductPct);
                        this._count = Math.max(1, this._count - deduct);
                        this._shadowCount = Math.max(1, this._shadowCount - deduct);
                        this._drawRunner();
                        this._scoreTxt.setText('Score: ' + this._score);
                        this._flashRunner(0x00E676);
                        if (window.SFX) SFX.collect();
                        this._destroyPortals();
                        this._speedUp();
                        this._spawnNext();
                    } else {
                        this._running = false;
                        this._destroyPortals();
                        this.time.delayedCall(400, () => this._showGameOver());
                    }
                    break;
                }

                // Normaal: kies dichtste portaal
                var closest = this._portals.reduce(function(a, b) {
                    if (b.passed || b.isBoss) return a;
                    return Math.abs(b.x - scene._runnerX) < Math.abs(a.x - scene._runnerX) ? b : a;
                }, obj);
                this._portals.forEach(function(p) { p.passed = true; });

                var oldCount = this._count;
                this._applyOperation(closest.op);
                this._score++;
                this._scoreTxt.setText('Score: ' + this._score);
                this._hsTxt.setText('Best: ' + Math.max(this._highscore, this._score));
                this._flashRunner(this._count > oldCount ? 0x00E676 : 0xFF5252);
                this._drawRunner();
                if (window.SFX) SFX.tap();
                this._destroyPortals();
                this._speedUp();
                this._spawnNext();
                break;
            }

            // Gemist: willekeurig toepassen
            for (var j = 0; j < this._portals.length; j++) {
                var p = this._portals[j];
                if (!p.passed && p.y > runnerY + 80) {
                    this._portals.forEach(function(q) { q.passed = true; });
                    if (!p.isBoss) {
                        this._applyOperation(p.op);
                        this._score++;
                        this._scoreTxt.setText('Score: ' + this._score);
                        this._drawRunner();
                    }
                    this._destroyPortals();
                    this._spawnNext();
                    break;
                }
            }
        }

        // Dubbel-blok
        if (this._combo && !this._combo.passed) {
            // Beweeg alle blokken
            this._combo.botY += dy;
            var offset = this._combo.botY;
            this._combo.blocks.forEach(function(b, idx) {
                var rowOffset = idx < 2 ? -(b.pH + 14) : 0; // top-rij zit hoger
                var newY = offset + rowOffset;
                scene._drawPortalAt(b.gfx, b.txt, b.x, newY, b.pW, b.pH, b.color);
            });

            // Collision op onderste rij
            if (this._combo.botY >= runnerY - 10) {
                this._combo.passed = true;
                var isLeft = this._runnerX < W / 2;
                var chosenOps = isLeft ? this._combo.leftOps : this._combo.rightOps;
                var old = this._count;
                chosenOps.forEach((op) => this._applyOperation(op));
                this._score += 2; // dubbel blok = 2 punten
                this._scoreTxt.setText('Score: ' + this._score);
                this._hsTxt.setText('Best: ' + Math.max(this._highscore, this._score));
                this._flashRunner(this._count > old ? 0x00E676 : 0xFF5252);
                this._drawRunner();
                if (window.SFX) SFX.tap();
                this._destroyCombo();
                this._speedUp();
                this._spawnNext();
            }

            // Gemist
            if (this._combo && this._combo.botY > runnerY + 80) {
                var fallbackOps = this._combo.leftOps;
                fallbackOps.forEach((op) => this._applyOperation(op));
                this._score += 2;
                this._scoreTxt.setText('Score: ' + this._score);
                this._drawRunner();
                this._destroyCombo();
                this._spawnNext();
            }
        }
    }

    _speedUp() {
        // Geleidelijke toename: sneller in latere rondes
        var step = 3 + Math.floor(this._round / 10);
        this._speed = Math.min(this._speed + step, this._maxSpeed);
    }

    _destroyPortals() {
        this._portals.forEach(function(obj) {
            obj.gfx.destroy(); obj.txt.destroy();
            if (obj.label) obj.label.destroy();
        });
        this._portals = [];
    }

    _destroyCombo() {
        if (!this._combo) return;
        this._combo.blocks.forEach(function(b) { b.gfx.destroy(); b.txt.destroy(); });
        this._combo = null;
    }

    _flashRunner(color) {
        var scene = this;
        this.tweens.add({
            targets: this._runnerGfx, alpha: 0.4, duration: 80,
            yoyo: true, repeat: 2,
            onComplete: function() { scene._runnerGfx.setAlpha(1); }
        });
        this.tweens.add({
            targets: [this._runnerGfx, this._runnerTxt],
            scaleX: 1.25, scaleY: 1.25, duration: 100, yoyo: true
        });
    }

    // ── Game over ─────────────────────────────────────────────────────────────────

    _showGameOver() {
        if (window.setHighscore) window.setHighscore('tempel_portaal', this._score);
        var hs = Math.max(this._highscore, this._score);
        var W = this._W, H = this._H, D = 20;

        this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.75).setDepth(D);
        this.add.text(W/2, H/2 - 200, '⚔ Verslagen! ⚔', {
            fontFamily: 'Georgia, serif', fontSize: '34px', color: '#FFD700',
            stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(D+1);
        this.add.text(W/2, H/2 - 130, 'Getal: ' + this._count, {
            fontFamily: 'Georgia, serif', fontSize: '26px', color: '#ffffff',
            stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(D+1);
        this.add.text(W/2, H/2 - 80, 'Score: ' + this._score, {
            fontFamily: 'Georgia, serif', fontSize: '32px', color: '#ffffff',
            stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(D+1);
        this.add.text(W/2, H/2 - 30, (this._score >= this._highscore && this._score > 0 ? '🏆 Nieuw record!' : 'Highscore: ' + hs), {
            fontFamily: 'Arial', fontSize: '20px', color: '#FFD700',
            stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(D+1);

        var b1 = makeButton(this, W/2, H/2 + 60, 170, 52, 0x2E7D32, '🔄 Opnieuw', 20);
        b1.bg.setDepth(D+1); b1.text.setDepth(D+2);
        buttonInteractive(this, b1, W/2, H/2 + 60, 170, 52, () => { this.scene.restart(); });

        var b2 = makeButton(this, W/2, H/2 + 130, 170, 52, 0x424242, '← Terug', 20);
        b2.bg.setDepth(D+1); b2.text.setDepth(D+2);
        buttonInteractive(this, b2, W/2, H/2 + 130, 170, 52, () => {
            if (window._onReturnToMap) window._onReturnToMap();
        });
    }
}

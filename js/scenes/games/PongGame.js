// Strand Pong — 1 speler vs AI, kokosnoot bal, aap-hand batjes, beach achtergrond
class PongGame extends Phaser.Scene {
    constructor() {
        super({ key: 'PongGame' });
    }

    init(data) {
        this.name1 = data.name1 || '';
        this.name2 = data.name2 || '';
        this._lives = 3;
        this._score = 0;
        this._running = false;
        this._waitingToStart = true;
    }

    preload() {
        var base = window.ASSET_BASE || '/';
        this.load.image('pong_coconut', base + 'img/coconut.small.png');
        this.load.image('pong_beach',   base + 'img/beach.png');
        this.load.image('pong_hand',    base + 'img/monkey.hand.png');
    }

    create() {
        var s = window.loadSettings ? window.loadSettings() : {};
        this._baseSpeed = s.pongBaseSpeed       !== undefined ? s.pongBaseSpeed       : 220;
        this._maxSpeed  = (s.pongMaxSpeedFactor !== undefined ? s.pongMaxSpeedFactor  : 2) * this._baseSpeed;
        this._highscore = window.getHighscore   ? window.getHighscore('pong')         : 0;

        this._W = 390; this._H = 844;
        var W = this._W, H = this._H;

        // ── Achtergrond ──────────────────────────────────────────────────────────
        if (this.textures.exists('pong_beach')) {
            this.add.image(W/2, H/2, 'pong_beach').setDisplaySize(W, H).setDepth(0);
        } else {
            this.add.rectangle(W/2, H/2, W, H, 0x1A8FCC).setDepth(0);
        }

        // Speelveldbegrenzing
        this._fieldTop    = 82;
        this._fieldBottom = H - 82;
        var FT = this._fieldTop, FB = this._fieldBottom;

        // Lichte donkere laag in speelveld voor leesbaarheid
        this.add.rectangle(W/2, (FT + FB)/2, W, FB - FT, 0x000000, 0.28).setDepth(2);

        // Speelveld grenzen
        var fieldLines = this.add.graphics().setDepth(3);
        fieldLines.lineStyle(1, 0xffffff, 0.25);
        fieldLines.lineBetween(0, FT, W, FT);
        fieldLines.lineBetween(0, FB, W, FB);

        // Middellijn
        fieldLines.lineStyle(1, 0xffffff, 0.10);
        fieldLines.lineBetween(0, (FT + FB)/2, W, (FT + FB)/2);

        // Controlbalk onderaan
        this.add.rectangle(W/2, H - 41, W, 82, 0x000000, 0.35).setDepth(3);
        this.add.text(W/2, H - 41, '← schuif hier →', {
            fontFamily: 'Arial', fontSize: '13px', color: 'rgba(255,255,255,0.45)'
        }).setOrigin(0.5).setDepth(4);

        // ── Batjes ───────────────────────────────────────────────────────────────
        this._paddleW = 110;
        this._playerY = FB - 28;
        this._aiY     = FT + 28;
        this._playerX = W / 2;
        this._aiX     = W / 2;

        var handKey = this.textures.exists('pong_hand') ? 'pong_hand' : null;

        if (handKey) {
            // Schaal naar breedte 110, hoogte volgt aspect ratio
            this._playerPaddle = this.add.image(this._playerX, this._playerY, handKey).setDepth(4);
            var aspect = this._playerPaddle.height / this._playerPaddle.width;
            this._paddleH = Math.round(this._paddleW * aspect);
            this._playerPaddle.setDisplaySize(this._paddleW, this._paddleH);

            this._aiPaddle = this.add.image(this._aiX, this._aiY, handKey)
                .setDisplaySize(this._paddleW, this._paddleH).setFlipY(true).setDepth(4);
            this._handPaddles = true;
        } else {
            this._paddleH = 18;
            this._playerPaddle = this.add.graphics().setDepth(4);
            this._aiPaddle     = this.add.graphics().setDepth(4);
            this._drawTowel(this._playerPaddle, this._playerX, this._playerY);
            this._drawTowel(this._aiPaddle,     this._aiX,     this._aiY);
            this._handPaddles = false;
        }

        // ── Bal ──────────────────────────────────────────────────────────────────
        this._ballR  = 27;
        this._ballX  = W / 2;
        this._ballY  = (FT + FB) / 2;
        this._ballVX = 0;
        this._ballVY = 0;

        if (this.textures.exists('pong_coconut')) {
            this._ball    = this.add.image(this._ballX, this._ballY, 'pong_coconut')
                .setDisplaySize(this._ballR * 2, this._ballR * 2).setDepth(5);
            this._ballGfx = null;
        } else {
            this._ball    = null;
            this._ballGfx = this.add.graphics().setDepth(5);
        }
        this._updateBallVisual();

        // ── HUD ──────────────────────────────────────────────────────────────────
        // Score gecentreerd bovenin
        this._scoreText = this.add.text(W/2, 14, '', {
            fontFamily: 'Arial', fontSize: '20px', color: '#ffffff',
            stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5, 0).setDepth(10);

        // Hartjes gecentreerd onder score
        this._livesText = this.add.text(W/2, 40, '', {
            fontFamily: 'Arial', fontSize: '18px'
        }).setOrigin(0.5, 0).setDepth(10);

        // Highscore rechts
        this._hsText = this.add.text(W - 12, 14, '', {
            fontFamily: 'Arial', fontSize: '15px', color: '#FFD700',
            stroke: '#000', strokeThickness: 2
        }).setOrigin(1, 0).setDepth(10);

        this._updateHUD();

        // ── Terugknop ────────────────────────────────────────────────────────────
        backArrow(this, () => {
            this._running = false;
            if (window._onReturnToMap) window._onReturnToMap();
        });

        // ── Start cirkel ─────────────────────────────────────────────────────────
        var cx = W/2, cy = (FT + FB)/2, cr = 44;
        this._startGfx = this.add.graphics().setDepth(10);
        this._startGfx.fillStyle(0xFFD700, 0.92);
        this._startGfx.fillCircle(cx, cy, cr);
        this._startGfx.lineStyle(3, 0xffffff, 0.9);
        this._startGfx.strokeCircle(cx, cy, cr);
        this._startTxt = this.add.text(cx, cy, 'Start', {
            fontFamily: 'Georgia, serif', fontSize: '26px', color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(11);

        // ── Input ─────────────────────────────────────────────────────────────────
        this.input.on('pointermove', (ptr) => {
            var nx = Phaser.Math.Clamp(ptr.x, this._paddleW/2, W - this._paddleW/2);
            this._playerX = nx;
            this._movePaddle(this._playerPaddle, this._playerX, this._playerY);
        });

        this.input.on('pointerdown', () => {
            if (this._waitingToStart) {
                this._waitingToStart = false;
                this._running = true;
                this._startGfx.setVisible(false);
                this._startTxt.setVisible(false);
                this._launchBall();
            }
        });
    }

    // ── Tekenen ───────────────────────────────────────────────────────────────────

    _drawTowel(gfx, x, y) {
        gfx.clear();
        var w = this._paddleW, h = this._paddleH;
        var stripeColors = [0xF5DEB3, 0x29B6F6, 0xF5DEB3, 0x29B6F6, 0xF5DEB3];
        var sh = h / stripeColors.length;
        stripeColors.forEach(function(c, i) {
            gfx.fillStyle(c, 1);
            gfx.fillRect(x - w/2, y - h/2 + i * sh, w, sh + 1);
        });
        gfx.lineStyle(1, 0xffffff, 0.5);
        gfx.strokeRect(x - w/2, y - h/2, w, h);
    }

    _movePaddle(paddle, x, y) {
        if (this._handPaddles) {
            paddle.setPosition(x, y);
        } else {
            this._drawTowel(paddle, x, y);
        }
    }

    _updateBallVisual() {
        if (this._ball) {
            this._ball.setPosition(this._ballX, this._ballY);
        } else if (this._ballGfx) {
            this._ballGfx.clear();
            this._ballGfx.fillStyle(0x6B3A1F, 1);
            this._ballGfx.fillCircle(this._ballX, this._ballY, this._ballR);
            this._ballGfx.fillStyle(0x4A2610, 0.6);
            this._ballGfx.fillCircle(this._ballX - 4, this._ballY - 4, 5);
            this._ballGfx.fillCircle(this._ballX + 4, this._ballY + 2, 4);
        }
    }

    _updateHUD() {
        this._scoreText.setText('Score: ' + this._score);
        var hearts = '';
        for (var i = 0; i < this._lives; i++) hearts += '❤️';
        this._livesText.setText(hearts);
        this._hsText.setText('Best: ' + Math.max(this._highscore, this._score));
    }

    // ── Spel logica ───────────────────────────────────────────────────────────────

    _launchBall() {
        var angleDeg = Phaser.Math.Between(-40, 40);
        var rad = angleDeg * (Math.PI / 180);
        this._ballX = this._W / 2;
        this._ballY = (this._fieldTop + this._fieldBottom) / 2;
        this._ballVX = Math.sin(rad) * this._baseSpeed;
        this._ballVY = -Math.cos(rad) * this._baseSpeed;
        this._updateBallVisual();
    }

    _resetBall() {
        this._ballX  = this._W / 2;
        this._ballY  = (this._fieldTop + this._fieldBottom) / 2;
        this._ballVX = 0;
        this._ballVY = 0;
        this._updateBallVisual();
        this._waitingToStart = true;
        this._running = false;
        if (this._lives > 0) {
            this._startGfx.setVisible(true);
            this._startTxt.setVisible(true);
        }
    }

    _speedUp() {
        var speed = Math.sqrt(this._ballVX * this._ballVX + this._ballVY * this._ballVY);
        var newSpeed = Math.min(speed + 6, this._maxSpeed);
        if (speed > 0) {
            var ratio = newSpeed / speed;
            this._ballVX *= ratio;
            this._ballVY *= ratio;
        }
    }

    update(time, delta) {
        if (!this._running) return;

        var dt = delta / 1000;
        var W = this._W, r = this._ballR;

        this._ballX += this._ballVX * dt;
        this._ballY += this._ballVY * dt;

        // Wand stuiteren links/rechts
        if (this._ballX < r) {
            this._ballX = r;
            this._ballVX = Math.abs(this._ballVX);
        } else if (this._ballX > W - r) {
            this._ballX = W - r;
            this._ballVX = -Math.abs(this._ballVX);
        }

        // AI beweegt naar bal
        var ballSpeed = Math.sqrt(this._ballVX * this._ballVX + this._ballVY * this._ballVY);
        var aiDiff = this._ballX - this._aiX;
        this._aiX += Phaser.Math.Clamp(aiDiff, -ballSpeed * 0.78 * dt, ballSpeed * 0.78 * dt);
        this._aiX = Phaser.Math.Clamp(this._aiX, this._paddleW/2, W - this._paddleW/2);
        this._movePaddle(this._aiPaddle, this._aiX, this._aiY);

        // Speler batje stuiteren (onderaan)
        if (this._ballVY > 0) {
            var pTop = this._playerY - this._paddleH/2;
            if (this._ballY + r >= pTop && this._ballY - r <= this._playerY + this._paddleH/2) {
                if (this._ballX >= this._playerX - this._paddleW/2 - r &&
                    this._ballX <= this._playerX + this._paddleW/2 + r) {
                    this._ballY = pTop - r;
                    var hit = Phaser.Math.Clamp((this._ballX - this._playerX) / (this._paddleW / 2), -0.95, 0.95);
                    this._speedUp();
                    var sp = Math.sqrt(this._ballVX * this._ballVX + this._ballVY * this._ballVY);
                    this._ballVX = Math.sin(hit * 55 * Math.PI / 180) * sp;
                    this._ballVY = -Math.cos(hit * 55 * Math.PI / 180) * sp;
                    this._score++;
                    this._updateHUD();
                    if (window.SFX && SFX.tap) SFX.tap();
                }
            }
        }

        // AI batje stuiteren (bovenaan)
        if (this._ballVY < 0) {
            var aBot = this._aiY + this._paddleH/2;
            if (this._ballY - r <= aBot && this._ballY + r >= this._aiY - this._paddleH/2) {
                if (this._ballX >= this._aiX - this._paddleW/2 - r &&
                    this._ballX <= this._aiX + this._paddleW/2 + r) {
                    this._ballY = aBot + r;
                    var hit = Phaser.Math.Clamp((this._ballX - this._aiX) / (this._paddleW / 2), -0.95, 0.95);
                    var sp = Math.sqrt(this._ballVX * this._ballVX + this._ballVY * this._ballVY);
                    this._ballVX = Math.sin(hit * 45 * Math.PI / 180) * sp;
                    this._ballVY = Math.cos(hit * 45 * Math.PI / 180) * sp;
                }
            }
        }

        // Bal voorbij onderkant = speler mist
        if (this._ballY > this._fieldBottom + r) {
            this._lives--;
            this._updateHUD();
            if (this._lives <= 0) {
                this._running = false;
                this._showGameOver();
                return;
            }
            this._resetBall();
        }

        // Bal voorbij bovenkant = AI mist
        if (this._ballY < this._fieldTop - r * 2) {
            this._resetBall();
        }

        this._updateBallVisual();
    }

    // ── Game over ─────────────────────────────────────────────────────────────────

    _showGameOver() {
        if (window.setHighscore) window.setHighscore('pong', this._score);
        var hs = window.getHighscore ? window.getHighscore('pong') : this._score;
        var W = this._W, H = this._H, D = 20;

        this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.72).setDepth(D);

        this.add.text(W/2, H/2 - 180, 'Game Over', {
            fontFamily: 'Georgia, serif', fontSize: '42px', color: '#FFD700',
            stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(D+1);

        this.add.text(W/2, H/2 - 100, '🥥 Score: ' + this._score, {
            fontFamily: 'Georgia, serif', fontSize: '34px', color: '#ffffff',
            stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(D+1);

        this.add.text(W/2, H/2 - 48, (this._score >= hs && this._score > 0 ? '🏆 Nieuw record!' : 'Highscore: ' + hs), {
            fontFamily: 'Arial', fontSize: '20px', color: '#FFD700',
            stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(D+1);

        var b1 = makeButton(this, W/2, H/2 + 40, 170, 52, 0x2E7D32, '🔄 Opnieuw', 20);
        b1.bg.setDepth(D+1); b1.text.setDepth(D+2);
        buttonInteractive(this, b1, W/2, H/2 + 40, 170, 52, () => { this.scene.restart(); });

        var b2 = makeButton(this, W/2, H/2 + 112, 170, 52, 0x424242, '← Terug', 20);
        b2.bg.setDepth(D+1); b2.text.setDepth(D+2);
        buttonInteractive(this, b2, W/2, H/2 + 112, 170, 52, () => {
            if (window._onReturnToMap) window._onReturnToMap();
        });
    }
}

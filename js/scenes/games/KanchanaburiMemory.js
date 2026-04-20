class KanchanaburiMemory extends Phaser.Scene {
    constructor() { super({ key: 'KanchanaburiMemory' }); }

    init(data) {
        this.locationIndex = data.locationIndex;
        this.name1 = data.name1;
        this.name2 = data.name2;
    }

    preload() {
        if (!this.textures.exists('memoryCard')) {
            this.load.image('memoryCard', '/img/memory.card.jpg');
        }
    }

    create() {
        var scene = this;
        var settings = window.loadSettings ? window.loadSettings() : {};
        this._numPairs     = settings.memoryPairs     || 8;
        this._cardsPerTurn = settings.memoryCardsPerTurn || 2;

        this.moves    = 0;
        this.pairs    = 0;
        this.flipped  = [];
        this.canFlip  = true;

        // Background
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0D2010).setOrigin(0);

        // Jungle decoration
        var jungle = this.add.graphics();
        jungle.fillStyle(0x1B4A1B, 0.4);
        for (var i = 0; i < 8; i++) {
            jungle.fillTriangle(
                i * 55 - 10, GAME_HEIGHT,
                i * 55 + 25, GAME_HEIGHT - 60 - Math.random() * 40,
                i * 55 + 55, GAME_HEIGHT
            );
        }

        // Header bar — taller for breathing room
        this.add.rectangle(0, 0, GAME_WIDTH, 104, 0x000000, 0.7).setOrigin(0);
        titleText(this, 44, 'Kanchanaburi Geheugenspel', '#2E7D32');
        this.add.text(GAME_WIDTH / 2, 84, 'Vind alle gelijke dieren!', {
            fontFamily: 'Arial', fontSize: '14px', color: '#AAAAAA',
            stroke: '#000000', strokeThickness: 1
        }).setOrigin(0.5);

        // Back arrow + settings button
        backArrow(this, function () {
            if (window._onReturnToMap) window._onReturnToMap();
        });
        this._addSettingsButton();

        // Build grid
        this._buildGrid();

        // Bottom bar
        this.add.rectangle(0, GAME_HEIGHT - 52, GAME_WIDTH, 52, 0x000000, 0.7).setOrigin(0);
        this._movesText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 26, 'Zetten: 0', {
            fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#E8A020'
        }).setOrigin(0.5);
    }

    _addSettingsButton() {
        var scene = this;
        var bx = GAME_WIDTH - 28, by = 59;
        scene.add.graphics().fillStyle(0x333333, 1).fillRoundedRect(bx - 18, by - 18, 36, 36, 10);
        scene.add.text(bx, by + 1, '⚙️', { fontSize: '20px' }).setOrigin(0.5);
        var z = scene.add.zone(bx, by, 36, 36).setInteractive();
        z.on('pointerdown', function () { scene._showSettings(); });
    }

    _buildGrid() {
        var scene = this;
        var totalCards = this._numPairs * this._cardsPerTurn;

        // Grid dimensions and card size based on total cards
        var cols, cardW, cardH, gapX, gapY;
        if (totalCards <= 16) {
            cols = 4; cardW = 78; cardH = 88; gapX = 8;  gapY = 10;
        } else if (totalCards <= 20) {
            cols = 5; cardW = 62; cardH = 74; gapX = 6;  gapY = 8;
        } else if (totalCards <= 24) {
            cols = 6; cardW = 52; cardH = 63; gapX = 5;  gapY = 7;
        } else if (totalCards <= 30) {
            cols = 6; cardW = 52; cardH = 62; gapX = 4;  gapY = 6;
        } else if (totalCards <= 36) {
            cols = 6; cardW = 50; cardH = 60; gapX = 3;  gapY = 5;
        } else {
            cols = 6; cardW = 48; cardH = 58; gapX = 3;  gapY = 4;
        }

        var totalW = cols * cardW + (cols - 1) * gapX;
        var startX = (GAME_WIDTH - totalW) / 2;
        var startY = 112;

        // Build deck: each animal repeated cardsPerTurn times
        var ALL_ANIMALS = ['🐘','🐯','🦋','🐊','🦜','🌸','🌉','🐒','🦁','🐆','🦒','🐍'];
        var animals = ALL_ANIMALS.slice(0, this._numPairs);
        var deck = [];
        animals.forEach(function (a) {
            for (var k = 0; k < scene._cardsPerTurn; k++) deck.push(a);
        });
        Phaser.Utils.Array.Shuffle(deck);

        this.cards = [];
        deck.forEach(function (animal, i) {
            var col = i % cols;
            var row = Math.floor(i / cols);
            var cx  = startX + col * (cardW + gapX) + cardW / 2;
            var cy  = startY + row * (cardH + gapY) + cardH / 2;
            scene.cards.push(scene._createCard(cx, cy, cardW, cardH, animal, i));
        });
    }

    _createCard(cx, cy, w, h, animal, index) {
        var scene    = this;
        var container = scene.add.container(cx, cy);
        var fontSize  = Math.max(18, Math.floor(h * 0.43)) + 'px';

        // Card back — use jpg image if loaded, else procedural fallback
        var back;
        if (scene.textures.exists('memoryCard')) {
            back = scene.add.image(0, 0, 'memoryCard').setDisplaySize(w, h).setOrigin(0.5);
        } else {
            back = scene.add.rectangle(0, 0, w, h, 0x6D3B1A).setOrigin(0.5);
            var backLines = scene.add.graphics();
            backLines.lineStyle(1, 0x8B4513, 0.5);
            for (var ln = 1; ln < 4; ln++) {
                backLines.lineBetween(-w/2, -h/2 + ln*(h/4), w/2, -h/2 + ln*(h/4));
            }
            backLines.lineStyle(1, 0x4A2000, 0.4);
            backLines.strokeRect(-w/2, -h/2, w, h);
            container.add(backLines);
        }

        // Card front
        var front = scene.add.rectangle(0, 0, w, h, 0xFFF8DC).setOrigin(0.5).setVisible(false);
        var frontBorder = scene.add.graphics().setVisible(false);
        frontBorder.lineStyle(3, 0x2E7D32, 1);
        frontBorder.strokeRect(-w/2, -h/2, w, h);
        var faceText = scene.add.text(0, 0, animal, { fontSize: fontSize }).setOrigin(0.5).setVisible(false);

        container.add([back, front, frontBorder, faceText]);

        var hitZone = scene.add.zone(cx, cy, w, h).setInteractive();
        hitZone.on('pointerdown', function () { scene._flipCard(index); });

        return {
            container: container, hitZone: hitZone,
            back: back, front: front, frontBorder: frontBorder, faceText: faceText,
            animal: animal, flipped: false, matched: false,
            w: w, h: h
        };
    }

    _flipCard(index) {
        if (!this.canFlip) return;
        var card = this.cards[index];
        if (card.flipped || card.matched) return;

        SFX.tap();
        this._doFlip(card, true);
        this.flipped.push(index);

        if (this.flipped.length === this._cardsPerTurn) {
            this.canFlip = false;
            this.moves++;
            this._movesText.setText('Zetten: ' + this.moves);
            this.time.delayedCall(700, this._checkMatch, [], this);
        }
    }

    _doFlip(card, toFront) {
        var scene = this;
        card.container.setAlpha(1);
        this.tweens.add({
            targets: card.container, scaleX: 0, duration: 110,
            onComplete: function () {
                card.back.setVisible(!toFront);
                card.front.setVisible(toFront);
                card.frontBorder.setVisible(toFront);
                card.faceText.setVisible(toFront);
                card.flipped = toFront;
                scene.tweens.add({ targets: card.container, scaleX: 1, duration: 110 });
            }
        });
    }

    _checkMatch() {
        var scene = this;
        var indices = this.flipped.slice();
        this.flipped = [];

        var firstAnimal = this.cards[indices[0]].animal;
        var allMatch = indices.every(function (i) { return scene.cards[i].animal === firstAnimal; });

        if (allMatch) {
            SFX.match();
            indices.forEach(function (i) {
                var c = scene.cards[i];
                c.matched = true;
                c.hitZone.disableInteractive();
                scene.tweens.add({ targets: c.container, alpha: 0.55, duration: 350 });
                // Gold border to mark as matched
                c.frontBorder.clear();
                c.frontBorder.lineStyle(3, 0xFFD700, 1);
                c.frontBorder.strokeRect(-c.w/2, -c.h/2, c.w, c.h);
            });
            this.pairs++;
            if (this.pairs >= this._numPairs) {
                this.time.delayedCall(500, this._doWin, [], this);
            }
        } else {
            SFX.wrong();
            indices.forEach(function (i) { scene._doFlip(scene.cards[i], false); });
        }
        this.canFlip = true;
    }

    _doWin() {
        SFX.win();
        var threshold3 = Math.floor(this._numPairs * 1.5);
        var threshold2 = Math.floor(this._numPairs * 2.5);
        var stars = this.moves <= threshold3 ? 3 : this.moves <= threshold2 ? 2 : 1;
        completeLocation(this.locationIndex, stars);
        this.scene.start('WinScene', {
            locationIndex: this.locationIndex, stars: stars,
            name1: this.name1, name2: this.name2
        });
    }

    // ── In-game settings overlay ──────────────────────────────────────────────
    _showSettings() {
        var scene = this;
        scene.canFlip = false;

        var els = [];

        function close() {
            els.forEach(function (e) { try { e.destroy(); } catch (_) {} });
            scene.canFlip = true;
        }

        function applyAndRestart(key, val) {
            els.forEach(function (e) { try { e.destroy(); } catch (_) {} });
            var s = window.loadSettings ? window.loadSettings() : {};
            s[key] = val;
            if (window.writeSettings) window.writeSettings(s);
            scene.scene.restart({ locationIndex: scene.locationIndex, name1: scene.name1, name2: scene.name2 });
        }

        var panelW = 330, panelH = 220;
        var px = Math.round((GAME_WIDTH - panelW) / 2);
        var py = Math.round((GAME_HEIGHT - panelH) / 2);

        var overlay = scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.72).setOrigin(0).setInteractive();
        overlay.on('pointerdown', close);
        var panel = scene.add.rectangle(px, py, panelW, panelH, 0x1A0A00, 1).setOrigin(0);
        var border = scene.add.graphics();
        border.lineStyle(2, 0xFFD700, 1); border.strokeRect(px, py, panelW, panelH);
        var titleTxt = scene.add.text(GAME_WIDTH / 2, py + 14, '⚙️ Moeilijkheid', {
            fontFamily: 'Georgia', fontSize: '16px', color: '#FFD700',
            stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5, 0);
        var note = scene.add.text(GAME_WIDTH / 2, py + panelH - 22, 'Wijzigen herstart het spel', {
            fontFamily: 'Arial', fontSize: '11px', color: 'rgba(255,255,255,0.4)'
        }).setOrigin(0.5, 0);
        els.push(overlay, panel, border, titleTxt, note);

        // Row: Paren
        var lbl1 = scene.add.text(px + 12, py + 52, 'Paren:', {
            fontFamily: 'Arial', fontSize: '13px', color: 'rgba(255,255,255,0.7)'
        }).setOrigin(0, 0);
        els.push(lbl1);
        var pairOpts = [4, 6, 8, 10, 12];
        pairOpts.forEach(function (n, ci) {
            var bx = px + 78 + ci * 50, by = py + 48;
            var sel = n === scene._numPairs;
            var bg = scene.add.rectangle(bx + 22, by + 14, 44, 28, sel ? 0xE8A020 : 0x444444).setOrigin(0.5);
            var tx = scene.add.text(bx + 22, by + 14, String(n), {
                fontFamily: 'Arial', fontSize: '13px', color: sel ? '#000' : '#fff', fontStyle: sel ? 'bold' : ''
            }).setOrigin(0.5);
            var z = scene.add.zone(bx + 22, by + 14, 44, 28).setInteractive();
            z.on('pointerdown', function () { applyAndRestart('memoryPairs', n); });
            els.push(bg, tx, z);
        });

        // Row: Per beurt
        var lbl2 = scene.add.text(px + 12, py + 102, 'Per beurt:', {
            fontFamily: 'Arial', fontSize: '13px', color: 'rgba(255,255,255,0.7)'
        }).setOrigin(0, 0);
        els.push(lbl2);
        var cptOpts = [2, 3, 4];
        cptOpts.forEach(function (n, ci) {
            var bx = px + 100 + ci * 66, by = py + 98;
            var lbl = n + ' kaartjes';
            var sel = n === scene._cardsPerTurn;
            var bg = scene.add.rectangle(bx + 30, by + 14, 58, 28, sel ? 0xE8A020 : 0x444444).setOrigin(0.5);
            var tx = scene.add.text(bx + 30, by + 14, lbl, {
                fontFamily: 'Arial', fontSize: '11px', color: sel ? '#000' : '#fff', fontStyle: sel ? 'bold' : ''
            }).setOrigin(0.5);
            var z = scene.add.zone(bx + 30, by + 14, 58, 28).setInteractive();
            z.on('pointerdown', function () { applyAndRestart('memoryCardsPerTurn', n); });
            els.push(bg, tx, z);
        });

        // Close button
        var closeZ = scene.add.zone(px + panelW - 14, py + 14, 28, 28).setInteractive();
        var closeTx = scene.add.text(px + panelW - 14, py + 14, '✕', {
            fontFamily: 'Arial', fontSize: '20px', color: '#fff', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5);
        closeZ.on('pointerdown', close);
        els.push(closeZ, closeTx);
    }
}

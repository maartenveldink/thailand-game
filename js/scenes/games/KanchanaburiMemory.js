class KanchanaburiMemory extends Phaser.Scene {
    constructor() { super({ key: 'KanchanaburiMemory' }); }

    init(data) {
        this.locationIndex = data.locationIndex;
        this.name1 = data.name1;
        this.name2 = data.name2;
    }

    create() {
        var scene   = this;
        this.moves  = 0;
        this.pairs  = 0;
        this.flipped  = [];
        this.canFlip  = true;

        // Background
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0D2010).setOrigin(0);

        // Jungle decorations (simple)
        var jungle = this.add.graphics();
        jungle.fillStyle(0x1B4A1B, 0.4);
        for (var i = 0; i < 8; i++) {
            jungle.fillTriangle(
                i * 55 - 10, GAME_HEIGHT,
                i * 55 + 25, GAME_HEIGHT - 60 - Math.random() * 40,
                i * 55 + 55, GAME_HEIGHT
            );
        }

        // Title bar
        this.add.rectangle(0, 0, GAME_WIDTH, 72, 0x000000, 0.7).setOrigin(0);
        titleText(this, 28, 'Kanchanaburi – Geheugenspel', '#2E7D32');
        this.add.text(GAME_WIDTH / 2, 55, 'Vind alle gelijke dieren!', {
            fontFamily: 'Arial', fontSize: '13px', color: '#888888'
        }).setOrigin(0.5);

        // Cards: 4×4 grid = 8 pairs
        var animals = ['🐘','🐯','🦋','🐊','🦜','🌸','🌉','🐒'];
        var pairs = animals.concat(animals);
        Phaser.Utils.Array.Shuffle(pairs);

        var cols   = 4;
        var cardW  = 78;
        var cardH  = 88;
        var gapX   = 8;
        var gapY   = 10;
        var totalW = cols * cardW + (cols - 1) * gapX;
        var startX = (GAME_WIDTH - totalW) / 2;
        var startY = 95;

        this.cards = [];

        pairs.forEach(function (animal, i) {
            var col = i % cols;
            var row = Math.floor(i / cols);
            var cx  = startX + col * (cardW + gapX) + cardW / 2;
            var cy  = startY + row * (cardH + gapY) + cardH / 2;

            var card = scene._createCard(cx, cy, cardW, cardH, animal, i);
            scene.cards.push(card);
        });

        // Bottom bar
        this.add.rectangle(0, GAME_HEIGHT - 52, GAME_WIDTH, 52, 0x000000, 0.7).setOrigin(0);
        this._movesText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 26, 'Zetten: 0', {
            fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#E8A020'
        }).setOrigin(0.5);

        // Back
        var bz = this.add.zone(42, 30, 70, 30).setInteractive();
        makeButton(this, 42, 30, 70, 30, 0x333333, '← Terug', 13);
        bz.on('pointerdown', function () {
            scene.scene.start('MapScene', { saveData: loadSave() });
        });
    }

    _createCard(cx, cy, w, h, animal, index) {
        var scene = this;

        // Container
        var container = this.add.container(cx, cy);
        container.setSize(w, h);
        container.setInteractive(
            new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h),
            Phaser.Geom.Rectangle.Contains
        );

        // Card back (wooden look)
        var back = this.add.rectangle(0, 0, w, h, 0x6D3B1A).setOrigin(0.5);
        var backLines = this.add.graphics();
        backLines.lineStyle(1, 0x8B4513, 0.5);
        for (var ln = 1; ln < 4; ln++) {
            backLines.lineBetween(-w/2, -h/2 + ln*(h/4), w/2, -h/2 + ln*(h/4));
        }
        backLines.lineStyle(1, 0x4A2000, 0.4);
        backLines.strokeRect(-w/2, -h/2, w, h);

        // Card front
        var front = this.add.rectangle(0, 0, w, h, 0xFFF8DC).setOrigin(0.5).setVisible(false);
        var frontBorder = this.add.graphics().setVisible(false);
        frontBorder.lineStyle(3, 0x2E7D32, 1);
        frontBorder.strokeRect(-w/2, -h/2, w, h);
        var faceText = this.add.text(0, 0, animal, { fontSize: '38px' }).setOrigin(0.5).setVisible(false);

        container.add([back, backLines, front, frontBorder, faceText]);

        container.on('pointerdown', function () { scene._flipCard(index); });

        return {
            container: container, back: back, backLines: backLines,
            front: front, frontBorder: frontBorder, faceText: faceText,
            animal: animal, flipped: false, matched: false
        };
    }

    _flipCard(index) {
        if (!this.canFlip) return;
        var card = this.cards[index];
        if (card.flipped || card.matched) return;

        SFX.tap();
        this._doFlip(card, true);
        this.flipped.push(index);

        if (this.flipped.length === 2) {
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
                card.backLines.setVisible(!toFront);
                card.front.setVisible(toFront);
                card.frontBorder.setVisible(toFront);
                card.faceText.setVisible(toFront);
                card.flipped = toFront;
                scene.tweens.add({ targets: card.container, scaleX: 1, duration: 110 });
            }
        });
    }

    _checkMatch() {
        var i1 = this.flipped[0], i2 = this.flipped[1];
        var c1 = this.cards[i1], c2 = this.cards[i2];
        this.flipped = [];

        if (c1.animal === c2.animal) {
            SFX.match();
            c1.matched = true; c2.matched = true;
            this.tweens.add({ targets: [c1.container, c2.container], alpha: 0.55, duration: 350 });
            c1.frontBorder.lineStyle(3, 0xFFD700, 1).strokeRect(-39, -44, 78, 88);
            c2.frontBorder.lineStyle(3, 0xFFD700, 1).strokeRect(-39, -44, 78, 88);
            this.pairs++;
            if (this.pairs >= 8) {
                this.time.delayedCall(500, this._doWin, [], this);
            }
        } else {
            SFX.wrong();
            this._doFlip(c1, false);
            this._doFlip(c2, false);
        }
        this.canFlip = true;
    }

    _doWin() {
        SFX.win();
        var stars = this.moves <= 12 ? 3 : this.moves <= 22 ? 2 : 1;
        completeLocation(this.locationIndex, stars);
        this.scene.start('WinScene', {
            locationIndex: this.locationIndex, stars: stars,
            name1: this.name1, name2: this.name2
        });
    }
}

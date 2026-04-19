class KhaoSokPuzzle extends Phaser.Scene {
    constructor() { super({ key: 'KhaoSokPuzzle' }); }

    init(data) {
        this.locationIndex = data.locationIndex;
        this.name1 = data.name1;
        this.name2 = data.name2;
    }

    create() {
        var scene   = this;
        this.qIndex = 0;
        this.correct = 0;
        this.total  = 7;
        this.needed = 5;
        this._answering = false;

        this._questions = [
            { q: 'Hoe oud is het regenwoud\nvan Khao Sok?',
              opts: ['160 miljoen jaar', '1.000 jaar', '50 miljoen jaar'], ans: 0 },
            { q: 'Wat is de GROOTSTE\nbloem ter wereld?',
              opts: ['Rafflesia', 'Zonnebloem', 'Orchidee'], ans: 0 },
            { q: 'Welk groot dier leeft\nin de jungle van Thailand?',
              opts: ['Olifant', 'Nijlpaard', 'Giraf'], ans: 0 },
            { q: 'Hoe heet het meer\nin Khao Sok?',
              opts: ['Cheow Lan meer', 'Songkhla meer', 'Samui meer'], ans: 0 },
            { q: 'Wat eten gibbons\n(apen) het liefst?',
              opts: ['Fruit', 'Vis', 'Gras'], ans: 0 },
            { q: 'Hoe ruikt de\nRafflesia bloem?',
              opts: ['Naar rottend vlees', 'Heerlijk zoet', 'Naar de zee'], ans: 0 },
            { q: 'Hoe oud is het\nregenwoud van Amazone?',
              opts: ['65 miljoen jaar', '200 miljoen jaar', '10.000 jaar'], ans: 0 }
        ];

        // Background: jungle
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0D2010).setOrigin(0);

        // Jungle trees (decorative)
        var trees = this.add.graphics();
        trees.fillStyle(0x1B4A1B, 0.6);
        var treePos = [0,55,120,180,240,300,350];
        treePos.forEach(function (tx) {
            trees.fillTriangle(tx, GAME_HEIGHT, tx + 35, GAME_HEIGHT - 80, tx + 70, GAME_HEIGHT);
            trees.fillTriangle(tx + 10, GAME_HEIGHT - 60, tx + 35, GAME_HEIGHT - 130, tx + 65, GAME_HEIGHT - 60);
        });

        // Title bar
        this.add.rectangle(0, 0, GAME_WIDTH, 72, 0x000000, 0.75).setOrigin(0);
        titleText(this, 28, 'Khao Sok – Jungle Quiz', '#388E3C');
        this.add.text(GAME_WIDTH / 2, 54, 'Beantwoord ' + this.needed + ' van de ' + this.total + ' vragen goed!', {
            fontFamily: 'Arial', fontSize: '13px', color: '#888888'
        }).setOrigin(0.5);

        // Progress dots
        this._progressDots = [];
        for (var pi = 0; pi < this.total; pi++) {
            var dot = this.add.graphics();
            dot.fillStyle(0x555555, 1);
            dot.fillCircle((GAME_WIDTH / (this.total + 1)) * (pi + 1), 82, 7);
            this._progressDots.push(dot);
        }

        // Question card container
        this._qContainer = this.add.container(0, 0);
        this._showQuestion(0);

        // Back
        var bz = this.add.zone(42, 32, 70, 30).setInteractive();
        makeButton(this, 42, 32, 70, 30, 0x333333, '← Terug', 13);
        bz.on('pointerdown', function () {
            scene.scene.start('MapScene', { saveData: loadSave() });
        });
    }

    _showQuestion(idx) {
        var scene = this;
        this._answering = false;
        this._qContainer.removeAll(true);

        var q = this._questions[idx];

        // Question card
        var card = scene.add.graphics();
        card.fillStyle(0x1A3D1A, 1);
        card.fillRoundedRect(20, 110, GAME_WIDTH - 40, 160, 16);
        card.lineStyle(2, 0x2E7D32, 1);
        card.strokeRoundedRect(20, 110, GAME_WIDTH - 40, 160, 16);

        // Question number
        var qNum = scene.add.text(GAME_WIDTH / 2, 130, 'Vraag ' + (idx + 1) + ' / ' + this.total, {
            fontFamily: 'Arial', fontSize: '13px', color: '#2E7D32'
        }).setOrigin(0.5);

        // Question text
        var qText = scene.add.text(GAME_WIDTH / 2, 190, q.q, {
            fontFamily: 'Georgia, serif', fontSize: '19px', color: '#ffffff',
            align: 'center', wordWrap: { width: GAME_WIDTH - 60 },
            stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5);

        this._qContainer.add([card, qNum, qText]);

        // Answer buttons
        var btnColors  = [0x1B5E20, 0x1B5E20, 0x1B5E20];
        var btnStartY  = 310;
        var btnH       = 66;
        var btnGap     = 14;

        q.opts.forEach(function (opt, oi) {
            var by = btnStartY + oi * (btnH + btnGap);
            var btnBg = scene.add.graphics();
            btnBg.fillStyle(btnColors[oi], 1);
            btnBg.fillRoundedRect(30, by, GAME_WIDTH - 60, btnH, 12);
            btnBg.lineStyle(2, 0x4CAF50, 1);
            btnBg.strokeRoundedRect(30, by, GAME_WIDTH - 60, btnH, 12);

            var btnTxt = scene.add.text(GAME_WIDTH / 2, by + btnH / 2, opt, {
                fontFamily: 'Arial', fontSize: '17px', color: '#ffffff',
                align: 'center', wordWrap: { width: GAME_WIDTH - 100 }
            }).setOrigin(0.5);

            var zone = scene.add.zone(GAME_WIDTH / 2, by + btnH / 2, GAME_WIDTH - 60, btnH).setInteractive();
            zone.on('pointerdown', function () {
                if (scene._answering) return;
                scene._answering = true;
                scene._answer(oi, btnBg, q.ans);
            });

            scene._qContainer.add([btnBg, btnTxt, zone]);
        });

        // Feedback text (hidden initially)
        this._feedbackText = scene.add.text(GAME_WIDTH / 2, 575, '', {
            fontFamily: 'Arial', fontSize: '16px', color: '#ffffff',
            align: 'center', wordWrap: { width: GAME_WIDTH - 40 }
        }).setOrigin(0.5);
        this._qContainer.add(this._feedbackText);
    }

    _answer(chosen, btnBg, correct) {
        var scene   = this;
        var isRight = chosen === correct;

        if (isRight) {
            SFX.correct();
            this.correct++;
            btnBg.clear();
            btnBg.fillStyle(0x2E7D32, 1);
            btnBg.fillRoundedRect(30, btnBg.y, GAME_WIDTH - 60, 66, 12);
            this._feedbackText.setText('✅ Goed zo!').setColor('#88FF88');
        } else {
            SFX.wrong();
            btnBg.clear();
            btnBg.fillStyle(0x7B1010, 1);
            btnBg.fillRoundedRect(30, btnBg.y, GAME_WIDTH - 60, 66, 12);
            var corrOpt = this._questions[this.qIndex].opts[correct];
            this._feedbackText.setText('❌ Het goede antwoord was:\n"' + corrOpt + '"').setColor('#FF8888');
        }

        // Update progress dot
        var dot = this._progressDots[this.qIndex];
        dot.clear();
        dot.fillStyle(isRight ? 0x4CAF50 : 0xF44336, 1);
        dot.fillCircle((GAME_WIDTH / (this.total + 1)) * (this.qIndex + 1), 82, 7);

        this.qIndex++;
        this.time.delayedCall(1200, function () {
            if (scene.qIndex >= scene.total) {
                scene._doEnd();
            } else {
                scene._showQuestion(scene.qIndex);
            }
        });
    }

    _doEnd() {
        var scene = this;
        var won   = this.correct >= this.needed;

        this._qContainer.removeAll(true);
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.55).setOrigin(0);

        var resultIcon = won ? '🌿' : '🌱';
        this.add.text(GAME_WIDTH / 2, 280, resultIcon, { fontSize: '80px' }).setOrigin(0.5);

        var msg = won
            ? 'Wauw! ' + this.correct + ' van de ' + this.total + ' vragen goed!\nJullie zijn echte jungle-experts!'
            : 'Jullie hadden ' + this.correct + ' van de ' + this.total + ' goed.\nProbeer het nog eens!';
        bodyText(this, 400, msg, won ? '#88FF88' : '#FF8888', 18);

        if (won) {
            SFX.win();
            var stars = this.correct === this.total ? 3 : this.correct >= 6 ? 2 : 1;
            completeLocation(this.locationIndex, stars);
            var btn = makeButton(this, GAME_WIDTH / 2, 520, 250, 54, COLORS.jungle, 'Verder ▶', 22);
            buttonInteractive(this, btn, GAME_WIDTH / 2, 520, 250, 54, function () {
                scene.scene.start('WinScene', {
                    locationIndex: scene.locationIndex, stars: stars,
                    name1: scene.name1, name2: scene.name2
                });
            });
        } else {
            SFX.lose();
            var retryBtn = makeButton(this, GAME_WIDTH / 2, 520, 220, 52, COLORS.orange, '🔄 Opnieuw', 20);
            buttonInteractive(this, retryBtn, GAME_WIDTH / 2, 520, 220, 52, function () {
                scene.scene.restart();
            });
        }
    }
}

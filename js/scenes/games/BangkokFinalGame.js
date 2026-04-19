class BangkokFinalGame extends Phaser.Scene {
    constructor() { super({ key: 'BangkokFinalGame' }); }

    init(data) {
        this.locationIndex = data.locationIndex;
        this.name1 = data.name1;
        this.name2 = data.name2;
    }

    create() {
        var scene    = this;
        this.qIndex  = 0;
        this.correct = 0;
        this.needed  = 7;

        this._questions = [
            { q: 'Een tuk-tuk is een\ndriewielige taxi in Thailand.', ans: true },
            { q: 'Jullie sliepen op een vlotterij\nop de River Kwai.', ans: true },
            { q: 'De nachttrein vertrok om\nacht uur \'s avonds.', ans: false,  hint: 'Hij vertrok om 19:50 uur – bijna acht uur.' },
            { q: 'Khao Sok is ouder\ndan de Amazone.', ans: true,  hint: '160 miljoen jaar vs 65 miljoen jaar!' },
            { q: 'Koh Samui is\neen eiland.', ans: true },
            { q: 'De Rafflesia bloem ruikt\nheerlijk zoet.', ans: false, hint: 'Hij ruikt naar rottend vlees – bah!' },
            { q: 'Jullie verbleven 7 nachten\nop Koh Samui.', ans: false, hint: 'Het waren 6 nachten, van 4 tot 10 mei.' },
            { q: 'Thailand is groter\ndan Nederland.', ans: true,  hint: 'Thailand is 15 keer zo groot!' },
            { q: '\'Sawadee ka\' betekent\ngoedendag in het Thais.', ans: true },
            { q: 'Jullie reisden van Khao Sok\nnaar Koh Samui met de auto.', ans: false, hint: 'Er was ook een vlootje over het Cheow Lan meer!' }
        ];

        this._showQuestion(0);
    }

    _showQuestion(idx) {
        var scene = this;
        this.children.list.slice().forEach(function(c){ c.destroy(); });

        var q = this._questions[idx];

        // Background: night Bangkok
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0A0A1E).setOrigin(0);

        // City skyline silhouette
        var sky = this.add.graphics();
        sky.fillStyle(0x1A1A2E, 1);
        var buildings = [
            [0,80],[60,120],[110,90],[160,140],[210,100],[260,130],[300,85],[340,110],[370,95],[390,80]
        ];
        sky.fillRect(0, GAME_HEIGHT - 80, GAME_WIDTH, 80);
        buildings.forEach(function(b, i) {
            if (i < buildings.length - 1) {
                sky.fillRect(b[0], GAME_HEIGHT - b[1], buildings[i+1][0] - b[0], b[1]);
            }
        });

        // Temple spires
        sky.fillStyle(0xE8A020, 0.3);
        sky.fillTriangle(150, GAME_HEIGHT - 160, 160, GAME_HEIGHT - 80, 170, GAME_HEIGHT - 80);
        sky.fillTriangle(220, GAME_HEIGHT - 180, 232, GAME_HEIGHT - 80, 244, GAME_HEIGHT - 80);

        // Title
        this.add.rectangle(0, 0, GAME_WIDTH, 72, 0x000000, 0.8).setOrigin(0);
        titleText(this, 26, 'De Grote Thailand Quiz! ✈️', '#B71C1C');
        this.add.text(GAME_WIDTH / 2, 54, 'Vraag ' + (idx + 1) + ' van 10 – Waar of Onwaar?', {
            fontFamily: 'Arial', fontSize: '13px', color: '#888888'
        }).setOrigin(0.5);

        // Progress bar
        var progGfx = this.add.graphics();
        progGfx.fillStyle(0x333333, 1); progGfx.fillRect(0, 72, GAME_WIDTH, 6);
        progGfx.fillStyle(COLORS.gold, 1); progGfx.fillRect(0, 72, (idx / 10) * GAME_WIDTH, 6);

        // Score
        this.add.text(GAME_WIDTH - 15, 90, '✅ ' + this.correct, {
            fontFamily: 'Arial', fontSize: '16px', color: '#88FF88'
        }).setOrigin(1, 0);

        // Question card
        var cardY = 140;
        var qCard = this.add.graphics();
        qCard.fillStyle(0x1A1A3E, 1);
        qCard.fillRoundedRect(20, cardY, GAME_WIDTH - 40, 200, 16);
        qCard.lineStyle(2, COLORS.gold, 0.6);
        qCard.strokeRoundedRect(20, cardY, GAME_WIDTH - 40, 200, 16);

        // Thai flag emoji decoration
        this.add.text(GAME_WIDTH / 2, cardY + 40, '🇹🇭', { fontSize: '32px' }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, cardY + 120, q.q, {
            fontFamily: 'Georgia, serif', fontSize: '20px', color: '#ffffff',
            align: 'center', wordWrap: { width: GAME_WIDTH - 70 },
            stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5);

        // WAAR button (green, right)
        var wBtn = makeButton(this, GAME_WIDTH / 2 + 90, 420, 150, 72, 0x1B5E20, '✅\nWAAR', 20);
        buttonInteractive(this, wBtn, GAME_WIDTH / 2 + 90, 420, 150, 72, function() {
            scene._answer(true, q);
        });

        // ONWAAR button (red, left)
        var oBtn = makeButton(this, GAME_WIDTH / 2 - 90, 420, 150, 72, 0x7B1010, '❌\nONWAAR', 19);
        buttonInteractive(this, oBtn, GAME_WIDTH / 2 - 90, 420, 150, 72, function() {
            scene._answer(false, q);
        });

        // Instruction
        this.add.text(GAME_WIDTH / 2, 490, 'Tik op het goede antwoord!', {
            fontFamily: 'Arial', fontSize: '13px', color: '#666666'
        }).setOrigin(0.5);

        // Bottom bar
        this.add.rectangle(0, GAME_HEIGHT - 52, GAME_WIDTH, 52, 0x000000, 0.7).setOrigin(0);
        this._feedback = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 26, '', {
            fontFamily: 'Arial', fontSize: '14px', color: '#ffffff', align: 'center',
            wordWrap: { width: GAME_WIDTH - 30 }
        }).setOrigin(0.5);

        // Back button
        var scene2 = this;
        var bz = this.add.zone(42, 32, 70, 30).setInteractive();
        makeButton(this, 42, 32, 70, 30, 0x333333, '← Terug', 13);
        bz.on('pointerdown', function() {
            scene2.scene.start('MapScene', { saveData: loadSave() });
        });
    }

    _answer(given, q) {
        var scene = this;
        var isRight = (given === q.ans);

        if (isRight) {
            SFX.correct();
            this.correct++;
            this._feedback.setText('✅ Goed zo!').setColor('#88FF88');
        } else {
            SFX.wrong();
            var hint = q.hint || ('Het goede antwoord was: ' + (q.ans ? 'WAAR' : 'ONWAAR'));
            this._feedback.setText('❌ ' + hint).setColor('#FF8888');
        }

        this.qIndex++;
        this.time.delayedCall(1200, function() {
            if (scene.qIndex >= scene._questions.length) {
                scene._doEnd();
            } else {
                scene._showQuestion(scene.qIndex);
            }
        });
    }

    _doEnd() {
        var scene = this;
        this.children.list.slice().forEach(function(c){ c.destroy(); });

        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0A0A1E).setOrigin(0);

        var won = this.correct >= this.needed;

        if (won) {
            SFX.win();

            // Confetti
            for (var ci = 0; ci < 35; ci++) {
                var g = this.add.graphics();
                g.fillStyle([0xE8A020, 0x00897B, 0xB71C1C, 0x1A237E][ci%4], 1);
                g.fillRect(-5, -5, 10, 10);
                g.x = Math.random() * GAME_WIDTH;
                g.y = -20 - Math.random() * 100;
                g._speed = 1.5 + Math.random() * 2;
                g._sway = (Math.random() - 0.5) * 1.5;
            }

            this.add.text(GAME_WIDTH / 2, 180, '🎉', { fontSize: '80px' }).setOrigin(0.5);
            titleText(this, 290, 'GEFELICITEERD!', '#E8A020');
            bodyText(this, 340, 'Jullie hadden ' + this.correct + ' van de 10 vragen goed!\n\nJullie zijn echte Thailand-experts!\nSawasdee ka! 🇹🇭', '#ffffff', 17);

            var stars = this.correct === 10 ? 3 : this.correct >= 8 ? 2 : 1;
            completeLocation(this.locationIndex, stars);

            var btn = makeButton(this, GAME_WIDTH / 2, 520, 260, 58, COLORS.gold, '🏆 Naar de finale! ▶', 22);
            buttonInteractive(this, btn, GAME_WIDTH / 2, 520, 260, 58, function() {
                scene.scene.start('WinScene', {
                    locationIndex: scene.locationIndex, stars: stars,
                    name1: scene.name1, name2: scene.name2
                });
            });
        } else {
            SFX.lose();
            this.add.text(GAME_WIDTH / 2, 250, '📚', { fontSize: '70px' }).setOrigin(0.5);
            bodyText(this, 350, 'Jullie hadden ' + this.correct + ' van de 10 goed.\nJullie hebben ' + this.needed + ' nodig.\nProbeer het opnieuw!', '#FF8888', 18);
            var retryBtn = makeButton(this, GAME_WIDTH / 2, 480, 220, 52, COLORS.orange, '🔄 Opnieuw', 20);
            buttonInteractive(this, retryBtn, GAME_WIDTH / 2, 480, 220, 52, function() {
                scene.scene.restart();
            });
        }
    }
}

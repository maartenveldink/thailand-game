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
        this.total  = 15;
        var _s = window.loadSettings ? window.loadSettings() : {};
        this.needed = _s.quizNeeded || 10;
        this._answering = false;

        this._allQuestions = [
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
              opts: ['65 miljoen jaar', '200 miljoen jaar', '10.000 jaar'], ans: 0 },
            { q: 'Hoe oud is het\nregenwoud van Khao Sok?', opts: ['160 miljoen jaar', '10.000 jaar', '50 miljoen jaar'], ans: 0 },
            { q: 'Hoe wordt de Rafflesia\nbestoven?', opts: ['Door vliegen en insecten', 'Door bijen', 'Door de wind'], ans: 0 },
            { q: 'Wat is de diameter van\neen grote Rafflesia bloem?', opts: ['Meer dan 1 meter', '30 centimeter', '5 centimeter'], ans: 0 },
            { q: 'Hoe noemen we dieren\ndie alleen \'s nachts actief zijn?', opts: ['Nachtdieren', 'Slapdieren', 'Dovendieren'], ans: 0 },
            { q: 'Wat eten gibbons\nbijvoorkeur?', opts: ['Fruit en bladeren', 'Vis en kreeften', 'Gras en stenen'], ans: 0 },
            { q: 'Hoeveel lagen heeft\neen regenwoud?', opts: ['4 lagen', '2 lagen', '6 lagen'], ans: 0 },
            { q: 'Wat is de bovenste\nlaag van het regenwoud?', opts: ['De kroonlaag', 'De bodemlaag', 'De struiklaag'], ans: 0 },
            { q: 'Welke grote kat leeft\nin Thailand?', opts: ['De tijger', 'De leeuw', 'De jaguar'], ans: 0 },
            { q: 'Wat is een varkensneusvaraan?', opts: ['Een grote hagedis', 'Een klein zoogdier', 'Een soort aap'], ans: 0 },
            { q: 'Wat is het Cheow\nLan meer?', opts: ['Een stuwmeer', 'Een zoutmeer', 'Een bergmeer'], ans: 0 },
            { q: 'Wanneer werd de Ratchaprapha\ndam gebouwd?', opts: ['In de jaren 80', 'In de jaren 40', 'In de jaren 60'], ans: 0 },
            { q: 'Wat is een epifyt?', opts: ['Een plant die op andere planten groeit', 'Een ondergrondse schimmel', 'Een vleesetende bloem'], ans: 0 },
            { q: 'Wat eet een vleesetende\nbekerplant (Nepenthes)?', opts: ['Insecten en spinnen', 'Kleine vogels en slangen', 'Wortels van andere planten'], ans: 0 },
            { q: 'Hoe communiceert\neen gibbon?', opts: ['Door hard te zingen en roepen', 'Door te trommelen op bomen', 'Door geurtekens achter te laten'], ans: 0 },
            { q: 'Wat is het gevaarlijkste\ndier in de Thaise jungle?', opts: ['De Maleise krait (slang)', 'De olifant', 'De tijger'], ans: 0 },
            { q: 'Welke boom geeft\nde meeste vruchten in Khao Sok?', opts: ['De vijgenboom', 'De eikenboom', 'De dennenboom'], ans: 0 },
            { q: 'Hoe groot kan een\nkoning cobra worden?', opts: ['Tot 5 meter lang', 'Tot 1 meter lang', 'Tot 10 meter lang'], ans: 0 },
            { q: 'Wat is "bioluminescentie"\nin het regenwoud?', opts: ['Dieren en schimmels die licht geven', 'Planten die elektriciteit maken', 'Vuur dat spontaan ontstaat'], ans: 0 },
            { q: 'Waarom is de Rafflesia\ngeen gewone bloem?', opts: ['Ze heeft geen wortels, stengel of bladeren', 'Ze groeit onder water', 'Ze eet dieren'], ans: 0 },
            { q: 'Hoe lang bloeit\nde Rafflesia gemiddeld?', opts: ['5 tot 7 dagen', '1 jaar', '1 maand'], ans: 0 },
            { q: 'Wat is het kenmerk\nvan een hornbill (neushoornvogel)?', opts: ['Een grote snavel met uitstulping', 'Een kleurrijke staart', 'Giftige klauwen'], ans: 0 },
            { q: 'Hoeveel soorten vleermuizen\nleven er in Khao Sok?', opts: ['Meer dan 30 soorten', '2 soorten', '5 soorten'], ans: 0 },
            { q: 'Wat is een langzame\nloris?', opts: ['Een nachtelijk aapje met giftige beet', 'Een soort schildpad', 'Een grote roofdier'], ans: 0 },
            { q: 'Welk zoogdier is\nde beste zwemmer in Thailand?', opts: ['De Aziatische olifant', 'De tijger', 'De gibbon'], ans: 0 },
            { q: 'Hoe groot is\nhet Nationaal Park Khao Sok?', opts: ['739 vierkante kilometer', '100 vierkante kilometer', '5000 vierkante kilometer'], ans: 0 },
            { q: 'Wat is de gemiddelde\ntemperatuur in Khao Sok?', opts: ['Rond de 30 graden Celsius', 'Rond de 15 graden Celsius', 'Rond de 45 graden Celsius'], ans: 0 },
            { q: 'Wanneer is het\nmoesson seizoen in Thailand?', opts: ['Van mei tot oktober', 'Van januari tot april', 'Van november tot februari'], ans: 0 },
            { q: 'Wat eet een\nAziatische olifant in één dag?', opts: ['150 tot 200 kilo aan planten', '10 kilo vis', '50 kilo vlees'], ans: 0 },
            { q: 'Wat is het grootste\nverschil tussen Afrikaanse en Aziatische olifanten?', opts: ['Aziatische olifanten hebben kleinere oren', 'Aziatische olifanten zijn groter', 'Aziatische olifanten kunnen niet zwemmen'], ans: 0 },
            { q: 'Waarom is het regenwoud\nvan Khao Sok ouder dan de Amazone?', opts: ['Het overleefde de ijstijden door het klimaat', 'Het staat hoger in de bergen', 'Het heeft meer regen'], ans: 0 },
            { q: 'Wat is een "dipterocarpe"?', opts: ['Een hoge tropische boom met gevleugelde zaden', 'Een soort orchidee', 'Een vleesetende schimmel'], ans: 0 },
            { q: 'Hoe voortplant de Rafflesia\nzich?', opts: ['Via de wortels van gastheerplanten', 'Via zaden die de wind verspreidt', 'Via bessen die dieren eten'], ans: 0 },
            { q: 'Welke kleur heeft de bloem\nvan de Rafflesia?', opts: ['Rood-oranje met witte vlekken', 'Paars met gele strepen', 'Wit met blauwe stippen'], ans: 0 },
            { q: 'Wat is het netto gewicht\nvan een grote Rafflesia bloem?', opts: ['Tot 11 kilogram', 'Tot 50 gram', 'Tot 200 kilogram'], ans: 0 },
            { q: 'Waarvoor gebruiken olifanten\nhun slurf?', opts: ['Ademen, drinken, eten en communiceren', 'Alleen voor het dragen van dingen', 'Alleen voor het ruiken'], ans: 0 },
            { q: 'Wat is een "mangrove"?', opts: ['Een bos in het water langs de kust', 'Een soort jungle-aap', 'Een onderwater-plant in rivieren'], ans: 0 },
            { q: 'Welk dier maakt\nde luidste geluiden in Khao Sok?', opts: ['De gibbon', 'De tijger', 'De olifant'], ans: 0 },
            { q: 'Waarvoor wordt de Thaise\njungle bedreigd?', opts: ['Ontbossing voor palmolie en rubber', 'Overstromingen door de zee', 'Te veel toeristen'], ans: 0 },
            { q: 'Wat is de functie van\nde bekerplant (Nepenthes)?', opts: ['Insecten lokken en verteren', 'Water opslaan voor droge seizoenen', 'Andere planten voeden'], ans: 0 },
            { q: 'Hoe hoog kan\neen tropische boom worden?', opts: ['Tot 70 meter hoog', 'Tot 10 meter hoog', 'Tot 200 meter hoog'], ans: 0 },
            { q: 'Waarom is het\nregenwoud zo vochtig?', opts: ['Bomen pompen water de lucht in via transpiratie', 'Er is altijd een rivier in de buurt', 'De grond is altijd nat van ondergrondwater'], ans: 0 },
            { q: 'Welk type orchidee\ngroeit in Khao Sok?', opts: ['De epifytische orchidee op boomtakken', 'De waterorchidee in meren', 'De woestijn-orchidee'], ans: 0 },
            { q: 'Wat is "symbiose"\nin de natuur?', opts: ['Twee soorten die samenwerken en er allebei beter van worden', 'Een dier dat een ander opeet', 'Een plant die parasiteert op een ander'], ans: 0 }
        ];

        this._questions = Phaser.Utils.Array.Shuffle(this._allQuestions.slice()).slice(0, 15);

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
        this.add.rectangle(0, 0, GAME_WIDTH, 94, 0x000000, 0.75).setOrigin(0);
        titleText(this, 40, 'Khao Sok – Jungle Quiz', '#388E3C');
        this.add.text(GAME_WIDTH / 2, 76, 'Beantwoord ' + this.needed + ' van de ' + this.total + ' vragen goed!', {
            fontFamily: 'Arial', fontSize: '15px', color: '#AAAAAA',
            stroke: '#000000', strokeThickness: 1
        }).setOrigin(0.5);

        // Progress dots
        this._progressDots = [];
        for (var pi = 0; pi < this.total; pi++) {
            var dot = this.add.graphics();
            dot.fillStyle(0x555555, 1);
            dot.fillCircle((GAME_WIDTH / (this.total + 1)) * (pi + 1), 96, 7);
            this._progressDots.push(dot);
        }

        // Question card container
        this._qContainer = this.add.container(0, 0);
        this._showQuestion(0);

        // Back
        backArrow(this, function () {
            if (window._onReturnToMap) window._onReturnToMap();
            else scene.scene.start('MapScene', { saveData: loadSave() });
        });

        // Wait-for-tap after wrong answer (player must tap to proceed)
        this._waitingForTap = false;
        this.input.on('pointerdown', function () {
            if (!scene._waitingForTap) return;
            scene._waitingForTap = false;
            if (scene.qIndex >= scene.total) {
                scene._doEnd();
            } else {
                scene._showQuestion(scene.qIndex);
            }
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
        var btnStartY  = 310;
        var btnH       = 66;
        var btnGap     = 14;
        scene._btnBgs  = [];   // { bg, by, isCorrect }

        q.opts.forEach(function (opt, oi) {
            var by = btnStartY + oi * (btnH + btnGap);
            var btnBg = scene.add.graphics();
            btnBg.fillStyle(0x1B5E20, 1);
            btnBg.fillRoundedRect(30, by, GAME_WIDTH - 60, btnH, 12);
            btnBg.lineStyle(2, 0x4CAF50, 1);
            btnBg.strokeRoundedRect(30, by, GAME_WIDTH - 60, btnH, 12);

            scene._btnBgs.push({ bg: btnBg, by: by, isCorrect: oi === q.ans });

            var btnTxt = scene.add.text(GAME_WIDTH / 2, by + btnH / 2, opt, {
                fontFamily: 'Arial', fontSize: '17px', color: '#ffffff',
                align: 'center', wordWrap: { width: GAME_WIDTH - 100 },
                stroke: '#000000', strokeThickness: 2
            }).setOrigin(0.5);

            var zone = scene.add.zone(GAME_WIDTH / 2, by + btnH / 2, GAME_WIDTH - 60, btnH).setInteractive();
            zone.on('pointerdown', function () {
                if (scene._answering) return;
                scene._answering = true;
                scene._answer(oi, btnBg, q.ans, by, btnH);
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

    _answer(chosen, btnBg, correct, by, btnH) {
        var scene   = this;
        var isRight = chosen === correct;

        // Update progress dot
        var dot = this._progressDots[this.qIndex];
        dot.clear();
        dot.fillStyle(isRight ? 0x4CAF50 : 0xF44336, 1);
        dot.fillCircle((GAME_WIDTH / (this.total + 1)) * (this.qIndex + 1), 96, 7);

        if (isRight) {
            SFX.correct();
            this.correct++;
            btnBg.clear();
            btnBg.fillStyle(0x2E7D32, 1);
            btnBg.fillRoundedRect(30, by, GAME_WIDTH - 60, btnH, 12);
            this._feedbackText.setText('✅ Goed zo!').setColor('#88FF88');
            this.qIndex++;
            this.time.delayedCall(1200, function () {
                if (scene.qIndex >= scene.total) {
                    scene._doEnd();
                } else {
                    scene._showQuestion(scene.qIndex);
                }
            });
        } else {
            SFX.wrong();
            btnBg.clear();
            btnBg.fillStyle(0x7B1010, 1);
            btnBg.fillRoundedRect(30, by, GAME_WIDTH - 60, btnH, 12);

            // Animate the correct button green so the player sees the right answer
            var corrInfo = scene._btnBgs[correct];
            if (corrInfo) {
                corrInfo.bg.clear();
                corrInfo.bg.fillStyle(0x00C853, 1);
                corrInfo.bg.fillRoundedRect(30, corrInfo.by, GAME_WIDTH - 60, btnH, 12);
                corrInfo.bg.lineStyle(3, 0xB9F6CA, 1);
                corrInfo.bg.strokeRoundedRect(30, corrInfo.by, GAME_WIDTH - 60, btnH, 12);
                scene.tweens.add({ targets: corrInfo.bg, alpha: 0.35, duration: 160, yoyo: true, repeat: 2, ease: 'Sine.easeInOut' });
            }

            var corrOpt = this._questions[this.qIndex].opts[correct];
            this._feedbackText.setText('❌ Het juiste antwoord was:\n"' + corrOpt + '"\n\nTik om verder te gaan ▶').setColor('#FF8888');
            this.qIndex++;
            this._waitingForTap = true;
        }
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
            var stars = this.correct === this.total ? 3 : this.correct >= 13 ? 2 : 1;
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

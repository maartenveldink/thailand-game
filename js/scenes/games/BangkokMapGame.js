// ── Bangkok Quiz Game ──────────────────────────────────────────────────────
var QUIZ_QUESTIONS = [
    { e:'🏙️', q:'Hoe heet de hoofdstad van Thailand?',
      a:['Bangkok','Phuket','Chiang Mai','Pattaya'], c:0 },
    { e:'🐘', q:'Welk dier is hét symbool van Thailand?',
      a:['Olifant','Tijger','Draak','Aap'], c:0 },
    { e:'👋', q:'Hoe zeg je "hallo" in het Thais?',
      a:['Sawasdee','Bonjour','Konnichiwa','Hola'], c:0 },
    { e:'🌊', q:'Hoe heet de grote rivier die door Bangkok stroomt?',
      a:['Chao Phraya','Mekong','Nijl','Yangtze'], c:0 },
    { e:'🛺', q:'Wat is een tuk-tuk?',
      a:['Een driewielige taxi','Een Thais gerecht','Een heilige tempel','Een muziekinstrument'], c:0 },
    { e:'🍜', q:'Hoe heet het beroemde Thaise noedelgerecht?',
      a:['Pad Thai','Sushi','Pizza','Paella'], c:0 },
    { e:'💰', q:'Hoe heet het geld in Thailand?',
      a:['Baht','Euro','Dollar','Yen'], c:0 },
    { e:'🙏', q:'Welke godsdienst heeft Thailand de meeste mensen?',
      a:['Boeddhisme','Islam','Christendom','Hindoeïsme'], c:0 },
    { e:'🌉', q:'Welke beroemde brug staat in Kanchanaburi?',
      a:['De Rivier Kwai brug','De Gouden Poort','De Erasmusbrug','Tower Bridge'], c:0 },
    { e:'🌿', q:'Hoe oud is het regenwoud van Khao Sok?',
      a:['160 miljoen jaar','1.000 jaar','10 miljoen jaar','5.000 jaar'], c:0 },
    { e:'🏖️', q:'Hoeveel dagen bleven jullie op Koh Samui?',
      a:['6 dagen','2 dagen','10 dagen','1 dag'], c:0 },
    { e:'⭐', q:'Wat zie je \'s nachts weerspiegeld in het Cheow Lan meer?',
      a:['De sterren','De zon','Vuurtorens','Haaien'], c:0 },
    { e:'🏯', q:'Hoe heet het paleis van de Thaise koning in Bangkok?',
      a:['Grand Palace','Buckingham Palace','Versailles','Kasteel de Haar'], c:0 },
    { e:'🐒', q:'Hoe heten de apen in het regenwoud van Khao Sok?',
      a:['Gibbons','Gorilla\'s','Chimpansees','Baboons'], c:0 },
    { e:'🌺', q:'Welke kleuren heeft de Thaise vlag?',
      a:['Rood, wit en blauw','Groen en geel','Zwart en goud','Paars en wit'], c:0 },
    { e:'🌴', q:'Welke boom groeit er veel op Thaise stranden?',
      a:['Palmboom','Eikenboom','Beukenboom','Dennenboom'], c:0 },
    { e:'🍌', q:'Welk tropisch fruit eet je het meest in Thailand?',
      a:['Mango','Appel','Peer','Aardbeien'], c:0 },
    { e:'🐟', q:'Wat zie je als je snorkelt bij Koh Samui?',
      a:['Kleurrijke tropische vissen','IJsberen','Walvissen','Pinguïns'], c:0 },
    { e:'🏝️', q:'Wat betekent "Koh" in het Thais?',
      a:['Eiland','Tempel','Berg','Rivier'], c:0 },
    { e:'🌍', q:'In welk werelddeel ligt Thailand?',
      a:['Azië','Afrika','Europa','Amerika'], c:0 },
    { e:'🥥', q:'Wat zit er in een verse kokosnoot?',
      a:['Zoet water','Koemelk','Limonade','Thee'], c:0 },
    { e:'🌸', q:'Welke bloem ruikt naar rottend vlees maar ziet er prachtig uit?',
      a:['Rafflesia','Zonnebloem','Roos','Tulp'], c:0 },
    { e:'🚂', q:'Hoe laat vertrok jullie nachttrein vanuit Bangkok?',
      a:['19:50 uur','08:00 uur','12:00 uur','23:00 uur'], c:0 },
    { e:'👨‍👩‍👧‍👦', q:'Hoeveel inwoners heeft Bangkok (ongeveer)?',
      a:['10 miljoen','1 miljoen','100 miljoen','100.000'], c:0 },
    { e:'🛕', q:'Hoe heet de tempel met de reusachtige liggende Boeddha?',
      a:['Wat Pho','Wat Arun','Wat Chalong','Gouden Pagode'], c:0 },
    { e:'✨', q:'Hoe noem je lichtgevende wezentjes in het donkere water?',
      a:['Bioluminescentie','Radioactiviteit','Zonneenergie','Neonlicht'], c:0 },
    { e:'🛶', q:'Hoe heet de traditionele smalle boot met een lange motor?',
      a:['Longtailboot','Gondel','Roeiboot','Catamaran'], c:0 },
    { e:'🍚', q:'Wat eet je bij bijna elk Thais gerecht?',
      a:['Rijst','Brood','Patat','Pasta'], c:0 },
    { e:'⛵', q:'Hoe heet de zee aan de oostkant van het Thaise schiereiland?',
      a:['Golf van Thailand','Stille Oceaan','Noordzee','Middellandse Zee'], c:0 },
    { e:'🗺️', q:'Welk land grenst NIET aan Thailand?',
      a:['Japan','Myanmar','Laos','Cambodja'], c:0 },
    { e:'🎒', q:'Wat is de grootste markt in Bangkok?',
      a:['Chatuchak (15.000 kraampjes!)','IKEA','Jumbo','Aldi'], c:0 },
    { e:'🏄', q:'Hoe noem je zwemmen met een masker en adembuisje?',
      a:['Snorkelen','Duiken','Surfen','Waterpolo'], c:0 },
    { e:'🐘', q:'Hoe oud kunnen olifanten maximaal worden?',
      a:['70 jaar','5 jaar','150 jaar','10 jaar'], c:0 },
    { e:'🌿', q:'Hoe heet het grote meer midden in Khao Sok?',
      a:['Cheow Lan meer','Samui meer','Kwai meer','Bangkok meer'], c:0 },
    { e:'🍽️', q:'Wat is "street food"?',
      a:['Eten kopen bij kraampjes op straat','Eten van de grond','Vliegtuigmaaltijd','Schoollunch'], c:0 },
    { e:'🏛️', q:'Hoe heet de bekende straat in Bangkok voor toeristen?',
      a:['Khao San Road','Damrak','Baker Street','Champs-Élysées'], c:0 },
    { e:'🌺', q:'Hoe zeg je "dank je wel" in het Thais?',
      a:['Khob khun','Merci','Gracias','Arigatou'], c:0 },
    { e:'😎', q:'Wat betekent "mai pen rai" in het Thais?',
      a:['Geen probleem!','Help!','Goedenacht!','Lekker!'], c:0 },
    { e:'🦜', q:'Hoe zijn veel tropische vogels in Thailand gekleed?',
      a:['Fel van kleur: rood, groen, blauw!','Zwart en wit','Grijs','Bruin'], c:0 },
    { e:'🏖️', q:'Welke kleur heeft het zand op de stranden van Koh Samui?',
      a:['Wit zand','Zwart zand','Rood zand','Paars zand'], c:0 },
    { e:'🐊', q:'Welk gevaarlijk reptiel leeft in Thaise rivieren?',
      a:['Krokodil','Kameleon','Hagedis','Schildpad'], c:0 },
    { e:'🌴', q:'Wat hangt er ook in het oerwoud, naast bomen?',
      a:['Lianen (slingerplanten)','Cactussen','Sneeuwvlokken','Lampen'], c:0 },
    { e:'🦋', q:'Hoeveel eilanden heeft Thailand (ongeveer)?',
      a:['Meer dan 1.400!','10','3','100.000'], c:0 },
    { e:'🛖', q:'Hoe noemde jullie het drijvende huisje op de rivier Kwai?',
      a:['Vlotterij','Boomhut','Tent','Iglo'], c:0 },
    { e:'🎭', q:'Hoe heet de traditionele Thaise dans met sierlijke handbewegingen?',
      a:['Khon','Ballet','Flamenco','Salsa'], c:0 },
    { e:'🌙', q:'Wat maakten jullie midden in de nacht op de trein?',
      a:['Slapend een reis naar het zuiden','Een kaartspel','Een wedstrijd','Een film'], c:0 },
    { e:'🦅', q:'Welke grote vogel soort is indrukwekkend in het Khao Sok oerwoud?',
      a:['Hoornvogel (grote oranje snavel!)','Pinguïn','Struisvogel','Flamingo'], c:0 },
    { e:'🌟', q:'Welke kleur heeft een gouden tempel in Thailand?',
      a:['Goud en rood','Blauw en wit','Groen en paars','Roze en geel'], c:0 },
    { e:'🏆', q:'Wat vonden jullie het allerleukst aan Thailand?',
      a:['Alles was geweldig!','Niets','Alleen het vliegtuig','Alleen het hotel'], c:0 },
    { e:'🗺️', q:'Hoe heet Bangkok in het officieel Thais (de langste stadsnaam ter wereld!)?',
      a:['Krung Thep Maha Nakhon','Bangkok City','Siam Town','Thai Capital'], c:0 },
];

class BangkokMapGame extends Phaser.Scene {
    constructor() { super({ key: 'BangkokMapGame' }); }

    init(data) {
        this.locationIndex = data.locationIndex;
        this.name1 = data.name1;
        this.name2 = data.name2;
    }

    create() {
        var scene = this;

        this._correct  = 0;
        this._needed   = 5;
        this._answering = false;
        this._pool = Phaser.Utils.Array.Shuffle(QUIZ_QUESTIONS.slice());

        // ── Background ──────────────────────────────────────────────────────
        var bg = this.add.graphics();
        bg.fillGradientStyle(0x0D004D, 0x0D004D, 0x003366, 0x003366, 1);
        bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Decorative gold stars scattered
        var deco = this.add.graphics();
        for (var i = 0; i < 30; i++) {
            var sx = Phaser.Math.Between(0, GAME_WIDTH);
            var sy = Phaser.Math.Between(110, GAME_HEIGHT - 60);
            deco.fillStyle(0xE8A020, 0.15 + Math.random() * 0.1);
            deco.fillCircle(sx, sy, 2);
        }

        // Temple silhouettes
        this.add.text(8,  GAME_HEIGHT - 95, '🛕', { fontSize: '60px', alpha: 0.25 }).setAlpha(0.25);
        this.add.text(GAME_WIDTH - 72, GAME_HEIGHT - 95, '🛕', { fontSize: '60px' }).setAlpha(0.25);

        // ── Header ──────────────────────────────────────────────────────────
        this.add.rectangle(0, 0, GAME_WIDTH, 72, 0x000000, 0.65).setOrigin(0);
        this.add.text(GAME_WIDTH / 2, 22, '🇹🇭  Bangkok Quiz', {
            fontFamily: 'Georgia, serif', fontSize: '22px',
            color: '#E8A020', stroke: '#000', strokeThickness: 2,
        }).setOrigin(0.5);
        this.add.text(GAME_WIDTH / 2, 55, 'Krijg 5 vragen goed om verder te reizen!', {
            fontFamily: 'Arial', fontSize: '13px', color: '#aaaaaa',
        }).setOrigin(0.5);

        // ── Progress stars ───────────────────────────────────────────────────
        this._starGfx = this.add.graphics();
        this._drawStars();

        // ── Question container ───────────────────────────────────────────────
        this._qContainer = this.add.container(0, 0);

        // ── Feedback flash ───────────────────────────────────────────────────
        this._flash = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
            .setOrigin(0).setDepth(50).setVisible(false);

        // ── Back button ─────────────────────────────────────────────────────
        var bz = this.add.zone(42, 30, 70, 30).setInteractive();
        makeButton(this, 42, 30, 70, 30, 0x222222, '← Terug', 13);
        bz.on('pointerdown', function () {
            if (window._onReturnToMap) { window._onReturnToMap(); }
            else { scene.scene.start('MapScene', { saveData: loadSave() }); }
        });

        this._showQuestion();
    }

    _drawStars() {
        var gfx = this._starGfx;
        gfx.clear();
        var cx = GAME_WIDTH / 2;
        var y  = 90;
        var gap = 38;
        var total = this._needed;
        var startX = cx - ((total - 1) * gap) / 2;
        for (var i = 0; i < total; i++) {
            var x = startX + i * gap;
            if (i < this._correct) {
                gfx.fillStyle(0xFFD700, 1);
                gfx.lineStyle(2, 0xFFA000, 1);
            } else {
                gfx.fillStyle(0x333355, 1);
                gfx.lineStyle(1, 0x555577, 1);
            }
            // Draw 5-point star
            var r = 13, ri = 5.5;
            var pts = [];
            for (var p = 0; p < 10; p++) {
                var angle = Math.PI / 2 + (p * Math.PI) / 5;
                var radius = (p % 2 === 0) ? r : ri;
                pts.push({ x: x + radius * Math.cos(angle), y: y - radius * Math.sin(angle) });
            }
            gfx.fillPoints(pts, true);
            gfx.strokePoints(pts, true);
        }
    }

    _showQuestion() {
        var scene = this;
        this._answering = false;
        this._qContainer.removeAll(true);

        if (this._pool.length === 0) {
            // Refill pool if somehow exhausted (shouldn't happen for 50 Qs)
            this._pool = Phaser.Utils.Array.Shuffle(QUIZ_QUESTIONS.slice());
        }

        var q = this._pool.shift();

        // ── Question card ────────────────────────────────────────────────
        var cardY = 115, cardH = 185;
        var cardBg = scene.add.graphics();
        cardBg.fillStyle(0x0D1B4B, 0.97);
        cardBg.fillRoundedRect(14, cardY, GAME_WIDTH - 28, cardH, 18);
        cardBg.lineStyle(2, 0x0288D1, 1);
        cardBg.strokeRoundedRect(14, cardY, GAME_WIDTH - 28, cardH, 18);

        var emoji = scene.add.text(GAME_WIDTH / 2, cardY + 38, q.e, {
            fontSize: '40px',
        }).setOrigin(0.5);

        var qText = scene.add.text(GAME_WIDTH / 2, cardY + 130, q.q, {
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: GAME_WIDTH - 55 },
            stroke: '#000', strokeThickness: 2,
        }).setOrigin(0.5);

        // Vertically center question text in card
        var textH = qText.height;
        qText.setY(cardY + cardH - textH / 2 - 24);

        this._qContainer.add([cardBg, emoji, qText]);

        // ── Shuffle answers, track correct ───────────────────────────────
        var shuffled = q.a.slice();
        var correctText = shuffled[q.c];
        Phaser.Utils.Array.Shuffle(shuffled);
        var correctIdx = shuffled.indexOf(correctText);

        // ── Answer buttons ───────────────────────────────────────────────
        var btnY0 = 325, btnH2 = 100, btnGap = 10;

        shuffled.forEach(function (answer, i) {
            var by      = btnY0 + i * (btnH2 + btnGap);
            var isCor   = (i === correctIdx);

            var bg2 = scene.add.graphics();
            bg2.fillStyle(0x01579B, 1);
            bg2.fillRoundedRect(14, by, GAME_WIDTH - 28, btnH2, 16);
            bg2.lineStyle(2, 0x29B6F6, 0.5);
            bg2.strokeRoundedRect(14, by, GAME_WIDTH - 28, btnH2, 16);

            var txt = scene.add.text(GAME_WIDTH / 2, by + btnH2 / 2, answer, {
                fontFamily: 'Arial, sans-serif',
                fontSize: '17px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: GAME_WIDTH - 65 },
            }).setOrigin(0.5);

            var zone = scene.add.zone(GAME_WIDTH / 2, by + btnH2 / 2, GAME_WIDTH - 28, btnH2)
                .setInteractive();
            zone.on('pointerdown', function () {
                if (scene._answering) return;
                scene._answering = true;
                scene._onAnswer(isCor, bg2, by, btnH2);
            });

            scene._qContainer.add([bg2, txt, zone]);
        });

        // Slide in from right
        this._qContainer.setX(GAME_WIDTH);
        this.tweens.add({ targets: this._qContainer, x: 0, duration: 220, ease: 'Cubic.easeOut' });
    }

    _onAnswer(isCorrect, btnBg, by, h) {
        var scene = this;

        // Colour feedback on the tapped button
        btnBg.clear();
        btnBg.fillStyle(isCorrect ? 0x1B5E20 : 0x7B1010, 1);
        btnBg.fillRoundedRect(14, by, GAME_WIDTH - 28, h, 16);
        btnBg.lineStyle(3, isCorrect ? 0x69F0AE : 0xFF5252, 1);
        btnBg.strokeRoundedRect(14, by, GAME_WIDTH - 28, h, 16);

        // Screen flash
        this._flash.setVisible(true).setFillStyle(isCorrect ? 0x00FF00 : 0xFF0000, 0.12);
        this.tweens.add({ targets: this._flash, alpha: 0, duration: 400, onComplete: function () {
            scene._flash.setVisible(false).setAlpha(1);
        }});

        if (isCorrect) {
            SFX.correct();
            this._correct++;
            this._drawStars();

            // Animate the newly filled star
            this.tweens.add({ targets: this._starGfx, scaleX: 1.2, scaleY: 1.2, duration: 120, yoyo: true });

            if (this._correct >= this._needed) {
                this.time.delayedCall(800, function () { scene._doWin(); });
                return;
            }
        } else {
            SFX.wrong();
        }

        this.time.delayedCall(950, function () {
            scene._showQuestion();
        });
    }

    _doWin() {
        SFX.win();
        // Stars: fewer questions needed = more stars
        var asked = QUIZ_QUESTIONS.length - this._pool.length;
        var stars = asked <= 6 ? 3 : asked <= 10 ? 2 : 1;
        completeLocation(this.locationIndex, stars);
        this.scene.start('WinScene', {
            locationIndex: this.locationIndex, stars: stars,
            name1: this.name1, name2: this.name2,
        });
    }
}

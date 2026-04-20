// BangkokFinalGame — Anagram / word-scramble game ("Wat is het woord?")
// 8 random words from pool of 20, need 6/8 correct to win.
// Stars: 8/8=3, 7/8=2, 6/8=1.

class BangkokFinalGame extends Phaser.Scene {
    constructor() { super({ key: 'BangkokFinalGame' }); }

    init(data) {
        this.locationIndex = data.locationIndex !== undefined ? data.locationIndex : (this.locationIndex !== undefined ? this.locationIndex : 6);
        this.name1 = data.name1 || this.name1 || '';
        this.name2 = data.name2 || this.name2 || '';
    }

    create() {
        var scene = this;
        this.score = 0;
        this.needed = 6;
        this.wordIndex = 0;
        this._attempts = 0;

        // Per-word display objects (destroyed and rebuilt each round)
        this._wordObjs = [];

        // Pick 8 random words
        var pool = Phaser.Utils.Array.Shuffle(this._wordPool.slice());
        this._session = pool.slice(0, 8);

        // --- Static background (drawn once) ---
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0A0A1E).setOrigin(0);

        var sky = this.add.graphics();
        sky.fillStyle(0x12123A, 1);
        var bldgs = [
            [0,60],[50,100],[100,70],[150,130],[200,85],
            [250,110],[290,80],[330,95],[360,75]
        ];
        for (var bi = 0; bi < bldgs.length - 1; bi++) {
            sky.fillRect(bldgs[bi][0], GAME_HEIGHT - bldgs[bi][1], bldgs[bi+1][0] - bldgs[bi][0], bldgs[bi][1]);
        }
        sky.fillRect(bldgs[bldgs.length-1][0], GAME_HEIGHT - bldgs[bldgs.length-1][1], GAME_WIDTH - bldgs[bldgs.length-1][0], bldgs[bldgs.length-1][1]);
        // Temple spires
        sky.fillStyle(0xE8A020, 0.25);
        sky.fillTriangle(140, GAME_HEIGHT-160, 152, GAME_HEIGHT-80, 164, GAME_HEIGHT-80);
        sky.fillTriangle(210, GAME_HEIGHT-185, 224, GAME_HEIGHT-80, 238, GAME_HEIGHT-80);

        // Stars
        for (var s = 0; s < 25; s++) {
            var sx = Math.random() * GAME_WIDTH;
            var sy = 80 + Math.random() * 280;
            this.add.circle(sx, sy, 1.5, 0xffffff, 0.7);
        }

        // Title bar
        this.add.rectangle(0, 0, GAME_WIDTH, 86, 0x000000, 0.8).setOrigin(0);
        titleText(this, 40, 'Wat is het woord?', '#E8A020');

        // Back button
        backArrow(this, function () {
            if (window._onReturnToMap) window._onReturnToMap();
            else scene.scene.start('MapScene', { saveData: loadSave() });
        });

        this._showWord(0);
    }

    // ── Per-word UI ─────────────────────────────────────────────────────────

    _showWord(idx) {
        var scene = this;

        // Destroy all per-word objects from previous round
        for (var di = 0; di < this._wordObjs.length; di++) {
            if (this._wordObjs[di] && this._wordObjs[di].destroy) {
                this._wordObjs[di].destroy();
            }
        }
        this._wordObjs = [];

        this._attempts = 0;
        this._answer = [];      // { letter, tileObj }
        this._tileBtns = [];
        this._slotTexts = [];
        this._slotBgs = [];

        var entry = this._session[idx];
        var word = entry.word;
        var letters = word.split('');
        var n = letters.length;
        var scrambled = Phaser.Utils.Array.Shuffle(letters.slice());

        // Helper to track objects
        function track(obj) {
            scene._wordObjs.push(obj);
            return obj;
        }

        // Progress bar
        var prog = track(this.add.graphics());
        prog.fillStyle(0x333333, 1);
        prog.fillRect(0, 72, GAME_WIDTH, 5);
        prog.fillStyle(COLORS.gold, 1);
        prog.fillRect(0, 72, (idx / 8) * GAME_WIDTH, 5);

        // Counter
        track(this.add.text(GAME_WIDTH / 2, 90, 'Woord ' + (idx + 1) + ' van 8  \u2713 ' + this.score, {
            fontFamily: 'Arial', fontSize: '14px', color: '#aaaaaa'
        }).setOrigin(0.5));

        // Clue card
        var clueCard = track(this.add.graphics());
        clueCard.fillStyle(0x1A1040, 1);
        clueCard.fillRoundedRect(20, 108, GAME_WIDTH - 40, 96, 14);
        clueCard.lineStyle(2, COLORS.gold, 0.5);
        clueCard.strokeRoundedRect(20, 108, GAME_WIDTH - 40, 96, 14);

        track(this.add.text(GAME_WIDTH / 2, 146, '\uD83C\uDDF9\uD83C\uDDED', { fontSize: '24px' }).setOrigin(0.5));

        track(this.add.text(GAME_WIDTH / 2, 182, entry.clue, {
            fontFamily: 'Georgia, serif', fontSize: '18px', color: '#ffffff',
            align: 'center', wordWrap: { width: GAME_WIDTH - 70 },
            stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5));

        // ── Scrambled letter tiles ───────────────────────────────────────────
        // Determine tile size and layout (up to 2 rows for long words)
        var maxCols = Math.min(n, 7);
        var tileW = Math.min(46, Math.floor((GAME_WIDTH - 32 - (maxCols - 1) * 6) / maxCols));
        tileW = Math.max(tileW, 30);
        var tileH = tileW;
        var tileGap = 6;
        var tilesPerRow = Math.ceil(n / (n > 7 ? 2 : 1));
        tilesPerRow = Math.min(tilesPerRow, maxCols);

        var tileRows = Math.ceil(n / tilesPerRow);
        var tileAreaStartY = 232;

        scrambled.forEach(function (letter, ti) {
            var col = ti % tilesPerRow;
            var row = Math.floor(ti / tilesPerRow);
            var rowCount = (row < tileRows - 1) ? tilesPerRow : (n - row * tilesPerRow);
            var rowW = rowCount * tileW + (rowCount - 1) * tileGap;
            var rowStartX = (GAME_WIDTH - rowW) / 2 + tileW / 2;
            var tx = rowStartX + col * (tileW + tileGap);
            var ty = tileAreaStartY + row * (tileH + 8) + tileH / 2;

            var tGfx = track(scene.add.graphics());
            tGfx.fillStyle(COLORS.gold, 1);
            tGfx.fillRoundedRect(tx - tileW / 2, ty - tileH / 2, tileW, tileH, 8);
            tGfx.lineStyle(1, 0xFFFFFF, 0.3);
            tGfx.strokeRoundedRect(tx - tileW / 2, ty - tileH / 2, tileW, tileH, 8);

            var tTxt = track(scene.add.text(tx, ty, letter, {
                fontFamily: 'Arial Black, Arial', fontSize: Math.floor(tileH * 0.52) + 'px',
                color: '#000000', fontStyle: 'bold'
            }).setOrigin(0.5));

            var tZone = track(scene.add.zone(tx, ty, tileW, tileH).setInteractive());
            var tileObj = { gfx: tGfx, txt: tTxt, zone: tZone, letter: letter, used: false, tx: tx, ty: ty, tileW: tileW, tileH: tileH };
            tZone.on('pointerdown', function () { scene._tapTile(tileObj); });
            scene._tileBtns.push(tileObj);
        });

        // ── Answer slots ─────────────────────────────────────────────────────
        var slotW = Math.min(38, Math.floor((GAME_WIDTH - 24 - (n - 1) * 4) / n));
        slotW = Math.max(slotW, 22);
        var slotH = Math.max(slotW, 30);
        var slotGap = Math.min(4, Math.floor((GAME_WIDTH - 24 - n * slotW) / Math.max(n - 1, 1)));
        var totalSlotW = n * slotW + (n - 1) * slotGap;
        var slotStartX = (GAME_WIDTH - totalSlotW) / 2 + slotW / 2;
        var slotY = tileAreaStartY + tileRows * (tileH + 8) + tileH / 2 + 30;

        for (var si = 0; si < n; si++) {
            var slotX = slotStartX + si * (slotW + slotGap);

            var sGfx = track(this.add.graphics());
            sGfx.fillStyle(0x1A1A3E, 1);
            sGfx.fillRoundedRect(slotX - slotW / 2, slotY - slotH / 2, slotW, slotH, 6);
            sGfx.lineStyle(2, COLORS.gold, 0.7);
            sGfx.strokeRoundedRect(slotX - slotW / 2, slotY - slotH / 2, slotW, slotH, 6);

            var sTxt = track(this.add.text(slotX, slotY, '', {
                fontFamily: 'Arial Black, Arial', fontSize: Math.floor(slotH * 0.55) + 'px',
                color: '#E8A020', fontStyle: 'bold'
            }).setOrigin(0.5));

            this._slotTexts.push(sTxt);
            this._slotBgs.push({ gfx: sGfx, x: slotX, y: slotY, w: slotW, h: slotH });
        }

        // ── Wis (backspace) button ───────────────────────────────────────────
        var wisY = slotY + slotH / 2 + 30;
        var wisGfx = track(this.add.graphics());
        wisGfx.fillStyle(0x333355, 1);
        wisGfx.fillRoundedRect(GAME_WIDTH / 2 - 60, wisY - 20, 120, 40, 10);
        wisGfx.lineStyle(1, 0x8888aa, 0.7);
        wisGfx.strokeRoundedRect(GAME_WIDTH / 2 - 60, wisY - 20, 120, 40, 10);

        track(this.add.text(GAME_WIDTH / 2, wisY, '\u2190 Wis', {
            fontFamily: 'Arial', fontSize: '17px', color: '#ccccff'
        }).setOrigin(0.5));

        var wisZone = track(this.add.zone(GAME_WIDTH / 2, wisY, 120, 40).setInteractive());
        wisZone.on('pointerdown', function () { scene._removeLast(); });

        // ── Feedback text ────────────────────────────────────────────────────
        this._feedbackTxt = track(this.add.text(GAME_WIDTH / 2, wisY + 42, '', {
            fontFamily: 'Arial', fontSize: '15px', color: '#ff8888', align: 'center',
            wordWrap: { width: GAME_WIDTH - 40 }
        }).setOrigin(0.5));

        this._currentWord = word;
    }

    // ── Tile interaction ──────────────────────────────────────────────────────

    _tapTile(tileObj) {
        if (tileObj.used) return;
        if (this._answer.length >= this._currentWord.length) return;

        tileObj.used = true;
        // Dim the tile
        tileObj.gfx.clear();
        tileObj.gfx.fillStyle(0x555533, 1);
        tileObj.gfx.fillRoundedRect(
            tileObj.tx - tileObj.tileW / 2,
            tileObj.ty - tileObj.tileH / 2,
            tileObj.tileW, tileObj.tileH, 8
        );
        tileObj.txt.setColor('#888866');

        var slotIdx = this._answer.length;
        this._answer.push(tileObj);
        this._slotTexts[slotIdx].setText(tileObj.letter);
        SFX.tap();

        if (this._answer.length === this._currentWord.length) {
            this.time.delayedCall(200, this._checkAnswer, [], this);
        }
    }

    _removeLast() {
        if (this._answer.length === 0) return;
        var tileObj = this._answer.pop();
        tileObj.used = false;

        // Restore tile appearance
        tileObj.gfx.clear();
        tileObj.gfx.fillStyle(COLORS.gold, 1);
        tileObj.gfx.fillRoundedRect(
            tileObj.tx - tileObj.tileW / 2,
            tileObj.ty - tileObj.tileH / 2,
            tileObj.tileW, tileObj.tileH, 8
        );
        tileObj.gfx.lineStyle(1, 0xFFFFFF, 0.3);
        tileObj.gfx.strokeRoundedRect(
            tileObj.tx - tileObj.tileW / 2,
            tileObj.ty - tileObj.tileH / 2,
            tileObj.tileW, tileObj.tileH, 8
        );
        tileObj.txt.setColor('#000000');

        this._slotTexts[this._answer.length].setText('');
        SFX.tap();
    }

    // ── Answer checking ───────────────────────────────────────────────────────

    _checkAnswer() {
        var scene = this;
        var given = this._answer.map(function (t) { return t.letter; }).join('');
        var correct = (given === this._currentWord);

        if (correct) {
            SFX.correct();
            this.score++;
            // Flash slots green
            this._slotBgs.forEach(function (s) {
                s.gfx.clear();
                s.gfx.fillStyle(0x1B5E20, 1);
                s.gfx.fillRoundedRect(s.x - s.w / 2, s.y - s.h / 2, s.w, s.h, 6);
            });
            this._feedbackTxt.setText('\u2705 Goed zo!').setColor('#88FF88');
            this.time.delayedCall(900, function () { scene._nextWord(); });
        } else {
            SFX.wrong();
            this._attempts++;
            // Flash slots red
            this._slotBgs.forEach(function (s) {
                s.gfx.clear();
                s.gfx.fillStyle(0x7B1010, 1);
                s.gfx.fillRoundedRect(s.x - s.w / 2, s.y - s.h / 2, s.w, s.h, 6);
            });

            if (this._attempts >= 3) {
                // Show correct letters in the slots with a gold pulse
                var word = scene._currentWord;
                scene._slotTexts.forEach(function (t, si) {
                    t.setText(word[si] || '');
                });
                scene._slotBgs.forEach(function (s) {
                    s.gfx.clear();
                    s.gfx.fillStyle(0xE8A020, 1);
                    s.gfx.fillRoundedRect(s.x - s.w / 2, s.y - s.h / 2, s.w, s.h, 6);
                    s.gfx.lineStyle(2, 0xFFD700, 1);
                    s.gfx.strokeRoundedRect(s.x - s.w / 2, s.y - s.h / 2, s.w, s.h, 6);
                    scene.tweens.add({ targets: s.gfx, alpha: 0.3, duration: 180, yoyo: true, repeat: 2, ease: 'Sine.easeInOut' });
                });
                this._feedbackTxt.setText('\u274C Het woord was: ' + this._currentWord).setColor('#FFAA44');
                var skipBtn = makeButton(scene, GAME_WIDTH / 2, 590, 200, 48, COLORS.orange, 'Sla over \u25ba', 18);
                var skipZone = scene.add.zone(GAME_WIDTH / 2, 590, 200, 48).setInteractive();
                skipZone.once('pointerdown', function () {
                    skipBtn.bg.destroy(); skipBtn.text.destroy(); skipZone.destroy();
                    scene._nextWord();
                });
            } else {
                this._feedbackTxt.setText('\u274C Probeer het nog eens!').setColor('#FF8888');
                this.time.delayedCall(900, function () { scene._clearAnswer(); });
            }
        }
    }

    _clearAnswer() {
        var scene = this;
        // Re-enable all used tiles
        this._tileBtns.forEach(function (t) {
            if (t.used) {
                t.used = false;
                t.gfx.clear();
                t.gfx.fillStyle(COLORS.gold, 1);
                t.gfx.fillRoundedRect(t.tx - t.tileW / 2, t.ty - t.tileH / 2, t.tileW, t.tileH, 8);
                t.gfx.lineStyle(1, 0xFFFFFF, 0.3);
                t.gfx.strokeRoundedRect(t.tx - t.tileW / 2, t.ty - t.tileH / 2, t.tileW, t.tileH, 8);
                t.txt.setColor('#000000');
            }
        });
        // Restore slot appearance
        this._slotBgs.forEach(function (s) {
            s.gfx.clear();
            s.gfx.fillStyle(0x1A1A3E, 1);
            s.gfx.fillRoundedRect(s.x - s.w / 2, s.y - s.h / 2, s.w, s.h, 6);
            s.gfx.lineStyle(2, COLORS.gold, 0.7);
            s.gfx.strokeRoundedRect(s.x - s.w / 2, s.y - s.h / 2, s.w, s.h, 6);
        });
        this._slotTexts.forEach(function (t) { t.setText(''); });
        this._answer = [];
        this._feedbackTxt.setText('');
    }

    // ── Word progression ──────────────────────────────────────────────────────

    _nextWord() {
        this.wordIndex++;
        if (this.wordIndex >= 8) {
            this._doEnd();
        } else {
            this._showWord(this.wordIndex);
        }
    }

    // ── End screen ────────────────────────────────────────────────────────────

    _doEnd() {
        var scene = this;

        // Destroy per-word UI
        for (var di = 0; di < this._wordObjs.length; di++) {
            if (this._wordObjs[di] && this._wordObjs[di].destroy) {
                this._wordObjs[di].destroy();
            }
        }
        this._wordObjs = [];

        var won = this.score >= this.needed;

        // Dark overlay on top of skyline BG
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75).setOrigin(0);

        if (won) {
            SFX.win();
            var stars = this.score === 8 ? 3 : this.score >= 7 ? 2 : 1;
            completeLocation(this.locationIndex, stars);

            this.add.text(GAME_WIDTH / 2, 200, '\uD83C\uDF89', { fontSize: '80px' }).setOrigin(0.5);
            titleText(this, 320, 'GEFELICITEERD!', '#E8A020', 0);
            bodyText(this, 390, 'Jullie hadden ' + this.score + ' van de 8 woorden goed!\nEchte Thailand-kenners!', '#ffffff', 17);

            var starsRow = stars === 3 ? '\u2B50\u2B50\u2B50' : stars === 2 ? '\u2B50\u2B50' : '\u2B50';
            this.add.text(GAME_WIDTH / 2, 450, starsRow, { fontSize: '40px' }).setOrigin(0.5);

            var btn = makeButton(this, GAME_WIDTH / 2, 530, 260, 56, COLORS.gold, '\uD83C\uDFC6 Verder! \u25B6', 22);
            buttonInteractive(this, btn, GAME_WIDTH / 2, 530, 260, 56, function () {
                scene.scene.start('WinScene', {
                    locationIndex: scene.locationIndex,
                    stars: stars,
                    name1: scene.name1,
                    name2: scene.name2
                });
            });
        } else {
            SFX.lose();
            this.add.text(GAME_WIDTH / 2, 240, '\uD83D\uDCDA', { fontSize: '70px' }).setOrigin(0.5);
            bodyText(this, 360, 'Jullie hadden ' + this.score + ' van de 8 goed.\nJullie hebben ' + this.needed + ' nodig.\nProbeer het opnieuw!', '#FF8888', 18);
            var retryBtn = makeButton(this, GAME_WIDTH / 2, 490, 220, 52, COLORS.orange, '\uD83D\uDD04 Opnieuw', 20);
            buttonInteractive(this, retryBtn, GAME_WIDTH / 2, 490, 220, 52, function () {
                scene.scene.restart({
                    locationIndex: scene.locationIndex,
                    name1: scene.name1,
                    name2: scene.name2
                });
            });
        }
    }

    // ── Word pool ─────────────────────────────────────────────────────────────

    get _wordPool() {
        return [
            { clue: 'Driewielige taxi in Bangkok',          word: 'TUKTUK' },
            { clue: 'Goedendag in het Thais',               word: 'SAWADEE' },
            { clue: 'Grootste bloem ter wereld',            word: 'RAFFLESIA' },
            { clue: 'Zingende aap uit Khao Sok',            word: 'GIBBON' },
            { clue: 'Thaise munt',                          word: 'BAHT' },
            { clue: 'Eiland in de Golf van Thailand',       word: 'SAMUI' },
            { clue: 'Groot grijs dier, Thais symbool',      word: 'OLIFANT' },
            { clue: 'Zoete tropische vrucht',               word: 'MANGO' },
            { clue: 'Heilig gebouw met spits dak',          word: 'TEMPEL' },
            { clue: 'Grote hagedis in Thailand',            word: 'VARAAN' },
            { clue: 'Oranje tropisch fruit',                word: 'PAPAYA' },
            { clue: 'Trein die s nachts rijdt',             word: 'NACHTTREIN' },
            { clue: 'Stad bij de River Kwai',               word: 'KANCHANABURI' },
            { clue: 'Tropisch woud',                        word: 'JUNGLE' },
            { clue: 'Kleurrijke structuur op de zeebodem',  word: 'KORAAL' },
            { clue: 'Mooie bloem in het regenwoud',         word: 'ORCHIDEE' },
            { clue: 'Smalle snelle houten boot',            word: 'LONGTAIL' },
            { clue: 'Grote slang in de jungle',             word: 'PYTHON' },
            { clue: 'Heilig beeld in Thaise tempels',       word: 'BUDDHA' },
            { clue: 'Rivier bij Kanchanaburi',              word: 'KWAI' },
        ];
    }
}

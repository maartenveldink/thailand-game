class PassportScene extends Phaser.Scene {
    constructor() { super({ key: 'PassportScene' }); }

    init(data) {
        this.saveData = data.saveData;
    }

    create() {
        var scene    = this;
        var save     = this.saveData;

        // Semi-transparent overlay
        var overlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75).setOrigin(0);
        overlay.setInteractive();

        // Passport cover
        var cover = this.add.graphics();
        cover.fillStyle(0x2D1800, 1);
        cover.fillRoundedRect(30, 60, GAME_WIDTH - 60, GAME_HEIGHT - 120, 20);
        cover.lineStyle(3, COLORS.gold, 1);
        cover.strokeRoundedRect(30, 60, GAME_WIDTH - 60, GAME_HEIGHT - 120, 20);

        // Header
        this.add.text(GAME_WIDTH / 2, 100, '🛂  Paspoort', {
            fontFamily: 'Georgia, serif', fontSize: '24px',
            color: '#E8A020', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5);

        var names = save.players.name1 + ' & ' + save.players.name2;
        this.add.text(GAME_WIDTH / 2, 132, names, {
            fontFamily: 'Arial, sans-serif', fontSize: '15px', color: '#C49050'
        }).setOrigin(0.5);

        // Star total
        this.add.text(GAME_WIDTH / 2, 158, '⭐ ' + save.totalStars + ' sterren', {
            fontFamily: 'Arial, sans-serif', fontSize: '15px', color: '#FFD700'
        }).setOrigin(0.5);

        // Location stamps grid
        var cols   = 2;
        var startX = 70;
        var startY = 200;
        var colW   = 130;
        var rowH   = 95;

        save.locations.forEach(function (locSave, idx) {
            var col = idx % cols;
            var row = Math.floor(idx / cols);
            var x   = startX + col * colW + colW / 2;
            var y   = startY + row * rowH;
            var loc = LOCATIONS[idx];

            var alpha = locSave.completed ? 1 : 0.3;

            // Stamp box
            var box = scene.add.graphics();
            box.fillStyle(0x3D2400, 1);
            box.fillRoundedRect(x - 55, y - 35, 110, 80, 10);
            box.lineStyle(2, locSave.completed ? loc.color : 0x555555, 1);
            box.strokeRoundedRect(x - 55, y - 35, 110, 80, 10);

            // Stamp
            scene.add.text(x, y + 2, loc.stamp, {
                fontSize: locSave.completed ? '34px' : '24px', alpha: alpha
            }).setOrigin(0.5).setAlpha(alpha);

            // Location name
            scene.add.text(x, y + 38, loc.name, {
                fontFamily: 'Arial, sans-serif', fontSize: '10px',
                color: locSave.completed ? '#E8A020' : '#555555',
                align: 'center', wordWrap: { width: 100 }
            }).setOrigin(0.5);

            // Stars
            if (locSave.completed && locSave.stars > 0) {
                var starStr = '★'.repeat(locSave.stars) + '☆'.repeat(3 - locSave.stars);
                scene.add.text(x, y - 28, starStr, {
                    fontFamily: 'Arial', fontSize: '12px', color: '#FFD700'
                }).setOrigin(0.5);
            }
        });

        // Close button
        var closeBtn = makeButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 72, 200, 46, COLORS.red, '✕  Sluiten', 18);
        buttonInteractive(this, closeBtn, GAME_WIDTH / 2, GAME_HEIGHT - 72, 200, 46, function () {
            SFX.tap();
            scene.scene.stop('PassportScene');
        });
    }
}

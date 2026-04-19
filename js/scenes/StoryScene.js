class StoryScene extends Phaser.Scene {
    constructor() { super({ key: 'StoryScene' }); }

    init(data) {
        this.locationIndex = data.locationIndex;
        this.name1         = data.name1;
        this.name2         = data.name2;
        this.saveData      = data.saveData;
    }

    create() {
        var loc   = LOCATIONS[this.locationIndex];
        var n1    = this.name1;
        var n2    = this.name2;
        var scene = this;

        // Background
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.bg).setOrigin(0);

        // Decorative top bar
        var bar = this.add.graphics();
        bar.fillStyle(loc.color, 1);
        bar.fillRect(0, 0, GAME_WIDTH, 8);

        // Location stamp / emoji (large)
        this.add.text(GAME_WIDTH / 2, 80, loc.stamp, {
            fontSize: '70px'
        }).setOrigin(0.5);

        // Date label
        this.add.text(GAME_WIDTH / 2, 145, loc.dateLabel, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            color: '#888888'
        }).setOrigin(0.5);

        // Title
        titleText(this, 190, loc.storyTitle, '#' + loc.color.toString(16).padStart(6, '0'));

        // Story text — replace name placeholders
        var txt = loc.storyText
            .replace(/\[Naam1\]/g, n1)
            .replace(/\[Naam2\]/g, n2);

        bodyText(this, 360, txt, '#ffffff', 16);

        // "Speel nu!" button
        var btn = makeButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 100, 260, 56, loc.color, 'Speel nu! ▶', 22);
        buttonInteractive(this, btn, GAME_WIDTH / 2, GAME_HEIGHT - 100, 260, 56, function () {
            SFX.tap();
            scene.scene.start(loc.scene, {
                locationIndex: scene.locationIndex,
                name1: scene.name1,
                name2: scene.name2,
                saveData: scene.saveData
            });
        });

        // Back arrow
        var backBtn = makeButton(this, 55, 30, 90, 36, 0x333333, '← Kaart', 15);
        buttonInteractive(this, backBtn, 55, 30, 90, 36, function () {
            scene.scene.start('MapScene', { saveData: scene.saveData });
        });
    }
}

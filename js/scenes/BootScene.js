class BootScene extends Phaser.Scene {
    constructor() { super({ key: 'BootScene' }); }

    create() {
        var save = loadSave();
        this.scene.start('MapScene', { saveData: save });
    }
}

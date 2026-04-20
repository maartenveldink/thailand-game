// ── Thailand Avontuur – Phaser 3 entry point ───────────────────────────────

var _game = null;

window._startGame = function () {
    if (_game) return; // already started

    var config = {
        type: Phaser.AUTO,
        width:  GAME_WIDTH,
        height: GAME_HEIGHT,
        backgroundColor: '#1A0A00',
        parent: 'game-container',
        resolution: window.devicePixelRatio || 1,
        scale: {
            mode:       Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: [
            BootScene,
            MapScene,
            StoryScene,
            WinScene,
            PassportScene,
            BangkokMapGame,
            KanchanaburiMemory,
            TrainReflexGame,
            KhaoSokPuzzle,
            LakeRaftGame,
            SamuiBeachGame,
            BangkokFinalGame
        ]
    };

    _game = new Phaser.Game(config);
};

// Register service worker for offline PWA support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').catch(function () {
            // Service worker only works over HTTPS or localhost; silent fail is fine
        });
    });
}

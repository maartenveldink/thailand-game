// Piece definitions (module-level globals, referenced by class methods without `this.`)
var PIECE_KEYS = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
var PIECES = {
    I: { cells: [[0,1],[1,1],[2,1],[3,1]], color: 0xFFD700 },
    O: { cells: [[0,0],[1,0],[0,1],[1,1]], color: 0xFF1744 },
    T: { cells: [[1,0],[0,1],[1,1],[2,1]], color: 0x00B0FF },
    S: { cells: [[1,0],[2,0],[0,1],[1,1]], color: 0x00E676 },
    Z: { cells: [[0,0],[1,0],[1,1],[2,1]], color: 0xFF6D00 },
    J: { cells: [[0,0],[0,1],[1,1],[2,1]], color: 0xE040FB },
    L: { cells: [[2,0],[0,1],[1,1],[2,1]], color: 0x00E5FF },
};

class TetrisGame extends Phaser.Scene {
    constructor() { super({ key: 'TetrisGame' }); }

    init(data) {
        this.name1 = data.name1 || '';
        this.name2 = data.name2 || '';
    }

    create() {
        var scene = this;

        // Game state
        this.board = [];
        for (var r = 0; r < 20; r++) {
            this.board.push(new Array(10).fill(0));
        }
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this._running = true;
        this._currentPiece = null;
        this._nextType = this._randomType();

        // Board pixel constants
        this.BOARD_X = 25;   // left edge of board
        this.BOARD_Y = 78;   // top edge of board
        this.CELL = 28;      // cell size

        // ── Background: tropisch zeeblauw ─────────────────────────────
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0288D1).setOrigin(0);
        // Lichtere bovenhelft voor luchtgevoel
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT * 0.45, 0x4FC3F7, 0.35).setOrigin(0);

        // Tempel silhouet — goudkleurig
        var temple = this.add.graphics();
        temple.fillStyle(0x0277BD, 1);
        temple.fillTriangle(195, 78, 155, 200, 235, 200);
        temple.fillRect(160, 200, 70, 60);
        temple.fillTriangle(120, 160, 95, 220, 145, 220);
        temple.fillRect(100, 220, 45, 40);
        temple.fillTriangle(270, 160, 245, 220, 295, 220);
        temple.fillRect(245, 220, 45, 40);

        // ── Title bar ─────────────────────────────────────────────────
        this.add.rectangle(0, 0, GAME_WIDTH, 86, 0x01579B, 0.9).setOrigin(0);
        titleText(this, 40, '🏯 Thailand Tetris', '#FFD700');

        // ── Board border: heldere cyaan ───────────────────────────────
        var border = this.add.graphics();
        border.lineStyle(2, 0x00E5FF, 0.8);
        border.strokeRect(this.BOARD_X - 2, this.BOARD_Y - 2, 10 * this.CELL + 4, 20 * this.CELL + 4);

        // ── Board graphics (redrawn each update) ──────────────────────
        this._boardGfx = this.add.graphics();

        // ── Right panel ───────────────────────────────────────────────
        var panelX = this.BOARD_X + 10 * this.CELL + 12;
        this.add.text(panelX, 85, 'Volgend:', { fontFamily: 'Arial', fontSize: '13px', color: '#B3E5FC' });
        this._nextGfx = this.add.graphics();
        this._scoreText = this.add.text(panelX, 175, 'Score\n0', { fontFamily: 'Arial', fontSize: '13px', color: '#FFD700', align: 'left' });
        this._levelText = this.add.text(panelX, 230, 'Level\n1', { fontFamily: 'Arial', fontSize: '13px', color: '#00E5FF', align: 'left' });
        this._linesText = this.add.text(panelX, 285, 'Lijnen\n0', { fontFamily: 'Arial', fontSize: '13px', color: '#69F0AE', align: 'left' });
        this._highText  = this.add.text(panelX, 340, '🏆\n' + getHighscore('tetris'), { fontFamily: 'Arial', fontSize: '13px', color: '#FFAB40', align: 'left' });

        // ── Knoppen met kleur-flash animatie ──────────────────────────
        var btnY = 725;
        var BTN_COLOR  = 0xFF6D00;  // tropisch oranje
        var BTN_FLASH  = 0xFFD740;  // geel-goud flash bij tap
        var btns = [
            { label: '←',  x: 50,  cb: function(){ scene._moveH(-1); } },
            { label: '↻',  x: 143, cb: function(){ scene._rotate(); } },
            { label: '→',  x: 236, cb: function(){ scene._moveH(1); } },
            { label: '⬇',  x: 330, cb: function(){ scene._hardDrop(); } },
        ];
        btns.forEach(function(b) {
            var gfx = scene.add.graphics();
            function drawBtn(col) {
                gfx.clear();
                gfx.fillStyle(col, 1);
                gfx.fillRoundedRect(b.x - 37, btnY - 28, 75, 56, 12);
            }
            drawBtn(BTN_COLOR);
            scene.add.text(b.x, btnY, b.label, {
                fontFamily: 'Arial', fontSize: '26px', color: '#fff',
                stroke: '#000', strokeThickness: 2
            }).setOrigin(0.5);
            var zone = scene.add.zone(b.x, btnY, 75, 56).setInteractive();
            zone.on('pointerdown', function() {
                drawBtn(BTN_FLASH);
                b.cb();
                scene.time.delayedCall(130, function() { drawBtn(BTN_COLOR); });
            });
        });

        // ── Back button ───────────────────────────────────────────────
        backArrow(this, function () {
            scene._running = false;
            if (scene._gravityEvent) scene._gravityEvent.remove();
            if (window._onReturnToMap) window._onReturnToMap();
            else scene.scene.start('MapScene', { saveData: loadSave() });
        });

        // ── Start ─────────────────────────────────────────────────────
        this._spawnPiece();
        this._startGravity();
    }

    _randomType() {
        return PIECE_KEYS[Phaser.Math.Between(0, 6)];
    }

    _spawnPiece() {
        var type = this._nextType;
        this._nextType = this._randomType();
        var template = PIECES[type];
        this._currentPiece = {
            type: type,
            color: template.color,
            cells: template.cells.map(function(c){ return [c[0], c[1]]; }),
            x: 3,  // board column offset
            y: 0,  // board row offset
        };
        this._drawNext();

        // Check game over
        if (!this._canPlace(this._currentPiece.cells, this._currentPiece.x, this._currentPiece.y)) {
            this._gameOver();
        }
    }

    _startGravity() {
        if (this._gravityEvent) this._gravityEvent.remove();
        var ms = Math.max(100, 800 - (this.level - 1) * 50);
        var scene = this;
        this._gravityEvent = this.time.addEvent({
            delay: ms, loop: true,
            callback: function() { if (scene._running) scene._moveDown(); }
        });
    }

    _canPlace(cells, ox, oy) {
        for (var i = 0; i < cells.length; i++) {
            var c = cells[i][0] + ox;
            var r = cells[i][1] + oy;
            if (c < 0 || c >= 10 || r >= 20) return false;
            if (r >= 0 && this.board[r][c] !== 0) return false;
        }
        return true;
    }

    _moveH(dir) {
        if (!this._running || !this._currentPiece) return;
        var p = this._currentPiece;
        if (this._canPlace(p.cells, p.x + dir, p.y)) {
            p.x += dir;
            SFX.tap();
            this._drawBoard();
        }
    }

    _moveDown() {
        if (!this._running || !this._currentPiece) return;
        var p = this._currentPiece;
        if (this._canPlace(p.cells, p.x, p.y + 1)) {
            p.y++;
        } else {
            this._lockPiece();
        }
        this._drawBoard();
    }

    _hardDrop() {
        if (!this._running || !this._currentPiece) return;
        var p = this._currentPiece;
        while (this._canPlace(p.cells, p.x, p.y + 1)) { p.y++; }
        this._lockPiece();
        this._drawBoard();
        SFX.tap();
    }

    _rotate() {
        if (!this._running || !this._currentPiece) return;
        var p = this._currentPiece;
        // 90° clockwise: [c,r] → [maxR-r, c]
        var maxR = 0;
        p.cells.forEach(function(c){ if (c[1] > maxR) maxR = c[1]; });
        var rotated = p.cells.map(function(c){ return [maxR - c[1], c[0]]; });
        // Try placement with wall-kicks
        var offsets = [0, -1, 1, -2, 2];
        for (var i = 0; i < offsets.length; i++) {
            if (this._canPlace(rotated, p.x + offsets[i], p.y)) {
                p.cells = rotated;
                p.x += offsets[i];
                SFX.tap();
                this._drawBoard();
                return;
            }
        }
    }

    _lockPiece() {
        var p = this._currentPiece;
        var scene = this;
        p.cells.forEach(function(c) {
            var col = c[0] + p.x;
            var row = c[1] + p.y;
            if (row >= 0) scene.board[row][col] = p.color;
        });
        this._currentPiece = null;
        this._clearLines();
    }

    _clearLines() {
        var cleared = 0;
        for (var r = 19; r >= 0; r--) {
            if (this.board[r].every(function(c){ return c !== 0; })) {
                this.board.splice(r, 1);
                this.board.unshift(new Array(10).fill(0));
                cleared++;
                r++; // recheck same row index
            }
        }
        if (cleared > 0) {
            var pts = [0, 100, 300, 500, 800][cleared] * this.level;
            this.score += pts;
            this.lines += cleared;
            SFX.collect();
            // Level up every 10 lines
            var newLevel = Math.floor(this.lines / 10) + 1;
            if (newLevel > this.level) {
                this.level = newLevel;
                this._startGravity();
                SFX.correct();
            }
            this._updateHUD();
        }
        this._spawnPiece();
    }

    _updateHUD() {
        this._scoreText.setText('Score\n' + this.score);
        this._levelText.setText('Level\n' + this.level);
        this._linesText.setText('Lijnen\n' + this.lines);
    }

    _drawBoard() {
        var gfx = this._boardGfx;
        gfx.clear();
        var bx = this.BOARD_X, by = this.BOARD_Y, cs = this.CELL;

        // Draw locked cells
        for (var r = 0; r < 20; r++) {
            for (var c = 0; c < 10; c++) {
                if (this.board[r][c] !== 0) {
                    gfx.fillStyle(this.board[r][c], 1);
                    gfx.fillRoundedRect(bx + c*cs + 1, by + r*cs + 1, cs - 2, cs - 2, 3);
                    gfx.lineStyle(1, 0xFFFFFF, 0.2);
                    gfx.strokeRoundedRect(bx + c*cs + 1, by + r*cs + 1, cs - 2, cs - 2, 3);
                }
            }
        }

        // Grid lines (subtle)
        gfx.lineStyle(1, 0x0369A1, 0.5);
        for (var gc = 1; gc < 10; gc++) gfx.lineBetween(bx + gc*cs, by, bx + gc*cs, by + 20*cs);
        for (var gr = 1; gr < 20; gr++) gfx.lineBetween(bx, by + gr*cs, bx + 10*cs, by + gr*cs);

        // Ghost piece (where current piece would land)
        if (this._currentPiece) {
            var p = this._currentPiece;
            var ghostY = p.y;
            while (this._canPlace(p.cells, p.x, ghostY + 1)) ghostY++;
            if (ghostY !== p.y) {
                gfx.fillStyle(p.color, 0.2);
                p.cells.forEach(function(c) {
                    var gc2 = c[0] + p.x, gr2 = c[1] + ghostY;
                    if (gr2 >= 0) gfx.fillRoundedRect(bx + gc2*cs + 1, by + gr2*cs + 1, cs - 2, cs - 2, 3);
                });
            }

            // Current piece
            gfx.fillStyle(p.color, 1);
            p.cells.forEach(function(c) {
                var pc = c[0] + p.x, pr = c[1] + p.y;
                if (pr >= 0) {
                    gfx.fillRoundedRect(bx + pc*cs + 1, by + pr*cs + 1, cs - 2, cs - 2, 3);
                    gfx.lineStyle(2, 0xFFFFFF, 0.4);
                    gfx.strokeRoundedRect(bx + pc*cs + 1, by + pr*cs + 1, cs - 2, cs - 2, 3);
                }
            });
        }
    }

    _drawNext() {
        var gfx = this._nextGfx;
        gfx.clear();
        var type = this._nextType;
        var template = PIECES[type];
        var cs = 18;
        var panelX = this.BOARD_X + 10 * this.CELL + 12;
        var startX = panelX;
        var startY = 103;
        gfx.fillStyle(template.color, 1);
        template.cells.forEach(function(c) {
            gfx.fillRoundedRect(startX + c[0]*cs, startY + c[1]*cs, cs-2, cs-2, 3);
        });
    }

    _gameOver() {
        var scene = this;
        this._running = false;
        if (this._gravityEvent) this._gravityEvent.remove();
        setHighscore('tetris', this.score);

        this.time.delayedCall(400, function() {
            // Overlay
            scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.8).setOrigin(0);
            scene.add.text(GAME_WIDTH/2, 220, '💀', { fontSize: '70px' }).setOrigin(0.5);
            bodyText(scene, 320, 'Spel voorbij!\nScore: ' + scene.score + '\n🏆 Record: ' + getHighscore('tetris'), '#FFFFFF', 18);

            var retryBtn = makeButton(scene, GAME_WIDTH/2, 470, 200, 52, 0xE8A020, '🔄 Opnieuw', 20);
            buttonInteractive(scene, retryBtn, GAME_WIDTH/2, 470, 200, 52, function() {
                scene.scene.restart({ name1: scene.name1, name2: scene.name2 });
            });

            var backBtn = makeButton(scene, GAME_WIDTH/2, 540, 200, 52, 0x333333, '← Terug', 18);
            buttonInteractive(scene, backBtn, GAME_WIDTH/2, 540, 200, 52, function() {
                if (window._onReturnToMap) window._onReturnToMap();
                else scene.scene.start('MapScene', { saveData: loadSave() });
            });
        });
    }

    update() {
        if (!this._running) return;
        this._drawBoard();
    }
}

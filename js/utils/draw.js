// ── Reusable Phaser drawing helpers ────────────────────────────────────────

// Draw a rounded-rect button; returns { bg, text }
function makeButton(scene, x, y, w, h, color, label, fontSize) {
    fontSize = fontSize || 20;
    var gfx = scene.add.graphics();
    gfx.fillStyle(color, 1);
    gfx.fillRoundedRect(x - w / 2, y - h / 2, w, h, 12);
    var txt = scene.add.text(x, y, label, {
        fontFamily: 'Georgia, serif',
        fontSize: fontSize + 'px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center',
        wordWrap: { width: w - 16 }
    }).setOrigin(0.5);
    return { bg: gfx, text: txt };
}

// Make a button interactive
function buttonInteractive(scene, bg, x, y, w, h, callback) {
    var zone = scene.add.zone(x, y, w, h).setInteractive();
    zone.on('pointerdown', function () {
        scene.tweens.add({ targets: [bg.bg, bg.text], scaleX: 0.94, scaleY: 0.94, duration: 80,
            yoyo: true, onComplete: callback });
    });
    return zone;
}

// Draw a 5-pointed star on a Graphics object
function drawStar(gfx, cx, cy, r, color) {
    var pts = [];
    for (var i = 0; i < 5; i++) {
        var a  = (i * 4 * Math.PI / 5) - Math.PI / 2;
        var a2 = a + (2 * Math.PI / 5);
        pts.push({ x: cx + Math.cos(a)  * r,       y: cy + Math.sin(a)  * r });
        pts.push({ x: cx + Math.cos(a2) * (r * 0.38), y: cy + Math.sin(a2) * (r * 0.38) });
    }
    gfx.fillStyle(color, 1);
    gfx.fillPoints(pts, true);
}

// Draw row of N stars (filled = gold, empty = gray)
function drawStars(scene, x, y, total, filled, size) {
    size = size || 18;
    var gfx = scene.add.graphics();
    var spacing = size * 2.4;
    var startX = x - ((total - 1) * spacing) / 2;
    for (var i = 0; i < total; i++) {
        var c = i < filled ? 0xFFD700 : 0x444444;
        drawStar(gfx, startX + i * spacing, y, size, c);
    }
    return gfx;
}

// Sine-wave water fill; call updateWater in scene update
function createWater(scene, surfaceY, waterColor) {
    var gfx = scene.add.graphics();
    gfx._wy = surfaceY;
    gfx._wc = waterColor;
    return gfx;
}

function updateWater(gfx, time) {
    gfx.clear();
    gfx.fillStyle(gfx._wc, 0.85);
    var y  = gfx._wy;
    var w  = GAME_WIDTH;
    var h  = GAME_HEIGHT - y + 20;
    var pts = [{ x: 0, y: y }];
    for (var x = 0; x <= w; x += 10) {
        pts.push({ x: x, y: y + Math.sin((x / 45) + time * 0.0022) * 9 });
    }
    pts.push({ x: w, y: y + h });
    pts.push({ x: 0, y: y + h });
    gfx.fillPoints(pts, true);
}

// Simple title text helper
function titleText(scene, y, label, color) {
    return scene.add.text(GAME_WIDTH / 2, y, label, {
        fontFamily: 'Georgia, serif',
        fontSize: '26px',
        color: color || '#E8A020',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center'
    }).setOrigin(0.5);
}

// Body text helper
function bodyText(scene, y, label, color, size) {
    return scene.add.text(GAME_WIDTH / 2, y, label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: (size || 17) + 'px',
        color: color || '#ffffff',
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 40 },
        lineSpacing: 4
    }).setOrigin(0.5);
}

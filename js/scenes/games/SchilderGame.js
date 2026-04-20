// ── SchilderGame: Paint-by-Number Thailand bonus game ───────────────────────
// 5 Thailand-themed illustrations; tap a numbered palette color then a region.
// No locationIndex / WinScene — standalone bonus game like TetrisGame.

class SchilderGame extends Phaser.Scene {
    constructor() { super({ key: 'SchilderGame' }); }

    init(data) {
        this.name1 = data.name1 || '';
        this.name2 = data.name2 || '';
    }

    create() {
        this._round       = 0;          // 0-4 (5 illustrations)
        this._perfects    = 0;          // rounds completed without any wrong fill on first check
        this._selectedColor = null;     // currently selected palette color (hex int)
        this._selectedIdx   = -1;       // index into current palette array
        this._regions     = [];         // current round's region objects
        this._swatches    = [];         // current palette swatch objects
        this._checkBtn    = null;       // { bg, text, zone }
        this._checkActive = false;

        this._buildRound();
    }

    // ── Round builder ─────────────────────────────────────────────────────────

    _buildRound() {
        this.children.list.slice().forEach(function(c) { c.destroy(); });
        this._regions   = [];
        this._swatches  = [];
        this._checkBtn  = null;
        this._checkActive = false;
        this._selectedColor = null;
        this._selectedIdx   = -1;

        var ill = this._illustrations()[this._round];

        // Background
        var bg = this.add.graphics();
        bg.fillStyle(0x1A1A2E, 1);
        bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Decorative header bar
        var hdr = this.add.graphics();
        hdr.fillStyle(0x0D0D1A, 1);
        hdr.fillRect(0, 0, GAME_WIDTH, 72);

        // Back arrow
        var scene = this;
        backArrow(this, function() {
            if (window._onReturnToMap) window._onReturnToMap();
        });

        // Title
        titleText(this, 36, '🎨 Schilder Thailand', '#E8A020');

        // Round indicator
        this.add.text(GAME_WIDTH - 16, 36, (this._round + 1) + '/5', {
            fontFamily: 'Arial, sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.55)',
        }).setOrigin(1, 0.5);

        // Illustration name
        this.add.text(GAME_WIDTH / 2, 84, ill.name, {
            fontFamily: 'Georgia, serif', fontSize: '20px', color: '#FFD700',
            stroke: '#000', strokeThickness: 2,
        }).setOrigin(0.5);

        // Drawing area (y=100..590)
        this._drawIllustration(ill);

        // Palette
        this._buildPalette(ill.palette);

        // Controleer button (initially dim)
        this._buildCheckButton();

        // Instruction hint
        this.add.text(GAME_WIDTH / 2, 598, 'Kies een kleur, klik dan een vlak', {
            fontFamily: 'Arial, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.4)',
        }).setOrigin(0.5);
    }

    // ── Illustration data ─────────────────────────────────────────────────────

    _illustrations() {
        var CX = GAME_WIDTH / 2;   // 195
        return [
            {
                name: '🐘 Olifant',
                palette: [
                    { color: 0x9E9E9E, label: '1' },   // gray body
                    { color: 0xBDBDBD, label: '2' },   // light gray belly
                    { color: 0xF48FB1, label: '3' },   // pink ear
                    { color: 0x757575, label: '4' },   // dark gray legs/trunk
                    { color: 0xFFF9C4, label: '5' },   // ivory tusk
                    { color: 0x4E342E, label: '6' },   // dark eye
                ],
                regions: [
                    // body — big ellipse (drawn as squished circle)
                    { id:1, number:1, target:0x9E9E9E,  shape:'ellipse', x:CX+20,  y:340, w:145, h:105, label:{x:CX+20,  y:340} },
                    // belly highlight
                    { id:2, number:2, target:0xBDBDBD,  shape:'ellipse', x:CX+30,  y:360, w:80,  h:60,  label:{x:CX+30,  y:360} },
                    // head
                    { id:3, number:1, target:0x9E9E9E,  shape:'circle',  x:CX-75, y:290, r:52,       label:{x:CX-75, y:290} },
                    // ear
                    { id:4, number:3, target:0xF48FB1,  shape:'ellipse', x:CX-118,y:292, w:55, h:70,  label:{x:CX-118,y:292} },
                    // trunk
                    { id:5, number:4, target:0x757575,  shape:'rect',    x:CX-78, y:356, w:22, h:75,  label:{x:CX-78, y:370} },
                    // tusk
                    { id:6, number:5, target:0xFFF9C4,  shape:'rect',    x:CX-62, y:342, w:8,  h:42,  angle:20, label:{x:CX-55, y:348} },
                    // front leg
                    { id:7, number:4, target:0x757575,  shape:'rect',    x:CX-10, y:422, w:32, h:58,  label:{x:CX-10, y:440} },
                    // back leg
                    { id:8, number:4, target:0x757575,  shape:'rect',    x:CX+50, y:422, w:32, h:58,  label:{x:CX+50, y:440} },
                    // eye
                    { id:9, number:6, target:0x4E342E,  shape:'circle',  x:CX-62, y:272, r:7,        label:{x:CX-62, y:272} },
                ],
            },
            {
                name: '🛺 Tuk-tuk',
                palette: [
                    { color: 0xFFD600, label: '1' },   // yellow body
                    { color: 0xFF6F00, label: '2' },   // orange roof
                    { color: 0x81D4FA, label: '3' },   // blue windscreen
                    { color: 0x212121, label: '4' },   // black wheels
                    { color: 0xF44336, label: '5' },   // red stripe
                    { color: 0x4CAF50, label: '6' },   // green trim
                ],
                regions: [
                    // cabin body
                    { id:1, number:1, target:0xFFD600, shape:'rect', x:CX-10, y:320, w:140, h:85, label:{x:CX-10,y:320} },
                    // roof/canopy
                    { id:2, number:2, target:0xFF6F00, shape:'rect', x:CX-5,  y:265, w:160, h:32, label:{x:CX-5, y:265} },
                    // windscreen
                    { id:3, number:3, target:0x81D4FA, shape:'rect', x:CX-60, y:305, w:52,  h:36, label:{x:CX-60,y:305} },
                    // cargo area
                    { id:4, number:1, target:0xFFD600, shape:'rect', x:CX+70, y:325, w:95,  h:70, label:{x:CX+70,y:325} },
                    // stripe
                    { id:5, number:5, target:0xF44336, shape:'rect', x:CX-10, y:362, w:140, h:10, label:{x:CX-10,y:362} },
                    // front wheel
                    { id:6, number:4, target:0x212121, shape:'circle', x:CX-55, y:408, r:24, label:{x:CX-55,y:408} },
                    // rear wheel
                    { id:7, number:4, target:0x212121, shape:'circle', x:CX+85, y:408, r:24, label:{x:CX+85,y:408} },
                    // green trim line
                    { id:8, number:6, target:0x4CAF50, shape:'rect', x:CX-5,  y:295, w:160, h:8,  label:{x:CX-5, y:295} },
                ],
            },
            {
                name: '🛕 Thaise Tempel',
                palette: [
                    { color: 0xFFD700, label: '1' },   // gold tower
                    { color: 0xFF8F00, label: '2' },   // orange tier
                    { color: 0xFFF8E1, label: '3' },   // white columns
                    { color: 0xBDBDBD, label: '4' },   // stone steps
                    { color: 0xE53935, label: '5' },   // red accents
                    { color: 0x1565C0, label: '6' },   // blue sky
                ],
                regions: [
                    // sky background
                    { id:1, number:6, target:0x1565C0, shape:'rect', x:CX, y:290, w:340, h:360, label:{x:CX-120,y:180} },
                    // main tower
                    { id:2, number:1, target:0xFFD700, shape:'rect', x:CX, y:300, w:78, h:150, label:{x:CX, y:300} },
                    // spire (triangle approximated as tall thin rect)
                    { id:3, number:1, target:0xFFD700, shape:'triangle',
                      pts:[{x:CX,y:175},{x:CX-30,y:235},{x:CX+30,y:235}], label:{x:CX,y:210} },
                    // middle tier
                    { id:4, number:2, target:0xFF8F00, shape:'rect', x:CX, y:385, w:115, h:38, label:{x:CX, y:385} },
                    // bottom tier
                    { id:5, number:2, target:0xFF8F00, shape:'rect', x:CX, y:420, w:145, h:28, label:{x:CX, y:420} },
                    // left column
                    { id:6, number:3, target:0xFFF8E1, shape:'rect', x:CX-82, y:430, w:24, h:90, label:{x:CX-82,y:445} },
                    // right column
                    { id:7, number:3, target:0xFFF8E1, shape:'rect', x:CX+82, y:430, w:24, h:90, label:{x:CX+82,y:445} },
                    // steps
                    { id:8, number:4, target:0xBDBDBD, shape:'rect', x:CX, y:490, w:180, h:28, label:{x:CX, y:490} },
                    // red accent band
                    { id:9, number:5, target:0xE53935, shape:'rect', x:CX, y:450, w:145, h:10, label:{x:CX, y:450} },
                ],
            },
            {
                name: '⛵ Longtailboot',
                palette: [
                    { color: 0xE53935, label: '1' },   // red hull
                    { color: 0x8D6E63, label: '2' },   // brown interior
                    { color: 0x1E88E5, label: '3' },   // blue canopy
                    { color: 0xB0BEC5, label: '4' },   // silver motor
                    { color: 0x00ACC1, label: '5' },   // teal water
                    { color: 0xFFD700, label: '6' },   // gold trim
                ],
                regions: [
                    // water
                    { id:1, number:5, target:0x00ACC1, shape:'rect',    x:CX, y:435, w:360, h:80,  label:{x:CX-120,y:445} },
                    // hull
                    { id:2, number:1, target:0xE53935, shape:'ellipse', x:CX, y:420, w:220, h:48,  label:{x:CX-60, y:420} },
                    // interior
                    { id:3, number:2, target:0x8D6E63, shape:'rect',    x:CX-30, y:400, w:140, h:28, label:{x:CX-30, y:400} },
                    // canopy/roof
                    { id:4, number:3, target:0x1E88E5, shape:'rect',    x:CX-30, y:372, w:130, h:24, label:{x:CX-30, y:372} },
                    // gold trim on canopy
                    { id:5, number:6, target:0xFFD700, shape:'rect',    x:CX-30, y:364, w:130, h:8,  label:{x:CX-30, y:364} },
                    // motor arm (vertical rect)
                    { id:6, number:4, target:0xB0BEC5, shape:'rect',    x:CX+100, y:378, w:10, h:55, label:{x:CX+105,y:390} },
                    // motor body
                    { id:7, number:4, target:0xB0BEC5, shape:'rect',    x:CX+100, y:430, w:28, h:18, label:{x:CX+100,y:433} },
                    // flag
                    { id:8, number:3, target:0x1E88E5, shape:'rect',    x:CX-30, y:348, w:28, h:18,  label:{x:CX-30, y:348} },
                ],
            },
            {
                name: '🌴 Palmboom',
                palette: [
                    { color: 0x6D4C41, label: '1' },   // brown trunk
                    { color: 0x2E7D32, label: '2' },   // dark green fronds
                    { color: 0x66BB6A, label: '3' },   // light green frond
                    { color: 0x4E342E, label: '4' },   // dark brown coconuts
                    { color: 0xFFF176, label: '5' },   // sandy ground
                    { color: 0x1565C0, label: '6' },   // sky blue
                ],
                regions: [
                    // sky
                    { id:1, number:6, target:0x1565C0, shape:'rect',     x:CX, y:290, w:360, h:330, label:{x:CX-130,y:200} },
                    // ground
                    { id:2, number:5, target:0xFFF176, shape:'rect',     x:CX, y:468, w:360, h:50,  label:{x:CX, y:473} },
                    // trunk
                    { id:3, number:1, target:0x6D4C41, shape:'rect',     x:CX+10, y:370, w:28, h:165, label:{x:CX+10,y:400} },
                    // left frond (triangle)
                    { id:4, number:2, target:0x2E7D32, shape:'triangle',
                      pts:[{x:CX+10,y:250},{x:CX-80,y:300},{x:CX-20,y:330}], label:{x:CX-40,y:295} },
                    // right frond
                    { id:5, number:2, target:0x2E7D32, shape:'triangle',
                      pts:[{x:CX+10,y:250},{x:CX+85,y:290},{x:CX+25,y:325}], label:{x:CX+50,y:295} },
                    // center frond
                    { id:6, number:3, target:0x66BB6A, shape:'triangle',
                      pts:[{x:CX+10,y:245},{x:CX-5,y:195},{x:CX+30,y:310}], label:{x:CX+12,y:270} },
                    // coconuts
                    { id:7, number:4, target:0x4E342E, shape:'circle',   x:CX+8,  y:272, r:14,       label:{x:CX+8, y:272} },
                    { id:8, number:4, target:0x4E342E, shape:'circle',   x:CX+22, y:280, r:12,       label:{x:CX+22,y:280} },
                ],
            },
        ];
    }

    // ── Draw illustration regions ─────────────────────────────────────────────

    _drawIllustration(ill) {
        var scene = this;

        // Drawing canvas background
        var canvasBg = this.add.graphics();
        canvasBg.fillStyle(0xF5F5DC, 1);  // parchment
        canvasBg.fillRoundedRect(16, 96, GAME_WIDTH - 32, 490, 12);

        // Create per-region graphics + zones
        ill.regions.forEach(function(reg) {
            // Clone region into scene state
            var r = {
                id:          reg.id,
                number:      reg.number,
                target:      reg.target,
                shape:       reg.shape,
                x:           reg.x,
                y:           reg.y,
                w:           reg.w || 0,
                h:           reg.h || 0,
                r:           reg.r || 0,
                pts:         reg.pts || null,
                angle:       reg.angle || 0,
                label:       reg.label,
                currentColor: null,
                checked:      false,   // was correct on last check?
                gfx:          scene.add.graphics(),
                outGfx:       scene.add.graphics(),
                numTxt:       null,
                zone:         null,
            };

            // Draw initial (empty = white fill)
            scene._drawRegion(r, 0xF5F5DC);

            // Outline on top
            scene._drawOutline(r, 0x333333, 2);

            // Number label
            r.numTxt = scene.add.text(reg.label.x, reg.label.y, reg.number.toString(), {
                fontFamily: 'Arial, sans-serif', fontSize: '14px', fontStyle: 'bold',
                color: '#333', stroke: '#fff', strokeThickness: 3,
            }).setOrigin(0.5).setDepth(10);

            // Hit zone — use bounding box for all shapes
            var zw, zh;
            if (reg.shape === 'circle')   { zw = (reg.r || 20) * 2 + 10; zh = zw; }
            else if (reg.shape === 'triangle') {
                var xs = reg.pts.map(function(p) { return p.x; });
                var ys = reg.pts.map(function(p) { return p.y; });
                var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
                var minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
                r.x = (minX + maxX) / 2; r.y = (minY + maxY) / 2;
                zw = maxX - minX; zh = maxY - minY;
            }
            else { zw = (reg.w || 40) + 10; zh = (reg.h || 40) + 10; }

            r.zone = scene.add.zone(reg.shape === 'triangle' ? r.x : reg.x,
                                    reg.shape === 'triangle' ? r.y : reg.y, zw, zh)
                         .setInteractive().setDepth(20);

            r.zone.on('pointerdown', function() { scene._tapRegion(r); });

            scene._regions.push(r);
        });
    }

    _drawRegion(r, color) {
        r.gfx.clear();
        r.gfx.fillStyle(color, 1);
        if (r.shape === 'rect') {
            r.gfx.fillRect(r.x - r.w / 2, r.y - r.h / 2, r.w, r.h);
        } else if (r.shape === 'circle') {
            r.gfx.fillCircle(r.x, r.y, r.r);
        } else if (r.shape === 'ellipse') {
            r.gfx.fillEllipse(r.x, r.y, r.w, r.h);
        } else if (r.shape === 'triangle' && r.pts) {
            r.gfx.fillTriangle(r.pts[0].x, r.pts[0].y, r.pts[1].x, r.pts[1].y, r.pts[2].x, r.pts[2].y);
        }
    }

    _drawOutline(r, color, thickness) {
        r.outGfx.clear();
        r.outGfx.lineStyle(thickness, color, 1);
        if (r.shape === 'rect') {
            r.outGfx.strokeRect(r.x - r.w / 2, r.y - r.h / 2, r.w, r.h);
        } else if (r.shape === 'circle') {
            r.outGfx.strokeCircle(r.x, r.y, r.r);
        } else if (r.shape === 'ellipse') {
            r.outGfx.strokeEllipse(r.x, r.y, r.w, r.h);
        } else if (r.shape === 'triangle' && r.pts) {
            r.outGfx.strokeTriangle(r.pts[0].x, r.pts[0].y, r.pts[1].x, r.pts[1].y, r.pts[2].x, r.pts[2].y);
        }
    }

    // ── Palette ───────────────────────────────────────────────────────────────

    _buildPalette(palette) {
        var scene   = this;
        var sw      = 46;                              // swatch size
        var gap     = 6;
        var n       = palette.length;
        var totalW  = n * sw + (n - 1) * gap;
        var startX  = (GAME_WIDTH - totalW) / 2 + sw / 2;
        var y       = 635;

        this._swatches = [];

        palette.forEach(function(p, i) {
            var x = startX + i * (sw + gap);

            // swatch background (dark ring)
            var ringGfx = scene.add.graphics();
            ringGfx.fillStyle(0x222222, 1);
            ringGfx.fillRoundedRect(x - sw / 2 - 2, y - sw / 2 - 2, sw + 4, sw + 4, 8);

            // swatch fill gfx (redrawn on select)
            var fillGfx = scene.add.graphics();
            fillGfx.fillStyle(p.color, 1);
            fillGfx.fillRoundedRect(x - sw / 2, y - sw / 2, sw, sw, 6);

            // swatch number
            var txt = scene.add.text(x, y, p.label, {
                fontFamily: 'Arial, sans-serif', fontSize: '16px', fontStyle: 'bold',
                color: '#fff', stroke: '#000', strokeThickness: 3,
            }).setOrigin(0.5).setDepth(15);

            // selection ring gfx (hidden by default)
            var selGfx = scene.add.graphics().setDepth(14);
            selGfx.setVisible(false);

            var swatch = { color: p.color, label: p.label, fillGfx: fillGfx, selGfx: selGfx, x: x, y: y, sw: sw, idx: i };

            var zone = scene.add.zone(x, y, sw + 4, sw + 4).setInteractive().setDepth(20);
            zone.on('pointerdown', function() { scene._selectSwatch(i); });

            scene._swatches.push(swatch);
        });
    }

    _selectSwatch(idx) {
        var sw = this._swatches[idx];
        if (!sw) return;

        // Hide all selection rings
        this._swatches.forEach(function(s) { s.selGfx.setVisible(false); });

        // Show ring on selected swatch
        sw.selGfx.clear();
        sw.selGfx.lineStyle(3, 0xFFD700, 1);
        sw.selGfx.strokeRoundedRect(sw.x - sw.sw / 2 - 4, sw.y - sw.sw / 2 - 4, sw.sw + 8, sw.sw + 8, 10);
        sw.selGfx.setVisible(true);

        this._selectedColor = sw.color;
        this._selectedIdx   = idx;
    }

    // ── Region tap ────────────────────────────────────────────────────────────

    _tapRegion(r) {
        if (this._selectedColor === null) {
            // Bounce hint — no color selected
            this.tweens.add({ targets: r.outGfx, alpha: 0.3, duration: 80, yoyo: true });
            return;
        }

        r.currentColor = this._selectedColor;
        this._drawRegion(r, r.currentColor);
        this._drawOutline(r, 0x333333, 2);

        // Keep number on top
        if (r.numTxt) r.numTxt.setDepth(10);

        // Check if all regions have a color → activate Controleer button
        var allFilled = this._regions.every(function(reg) { return reg.currentColor !== null; });
        if (allFilled && !this._checkActive) {
            this._activateCheckButton();
        }
    }

    // ── Check button ──────────────────────────────────────────────────────────

    _buildCheckButton() {
        var btn  = makeButton(this, GAME_WIDTH / 2, 718, 210, 48, 0x444444, 'Controleer ✓', 18);
        btn.bg.setAlpha(0.4);
        btn.text.setAlpha(0.4);

        var zone = this.add.zone(GAME_WIDTH / 2, 718, 210, 48).setInteractive().setDepth(20);
        var scene = this;
        zone.on('pointerdown', function() {
            if (!scene._checkActive) return;
            scene._checkAnswer();
        });
        this._checkBtn = { bg: btn.bg, text: btn.text, zone: zone };
    }

    _activateCheckButton() {
        this._checkActive = true;
        this._checkBtn.bg.setAlpha(1);
        this._checkBtn.text.setAlpha(1);
        // Recreate with active color
        this._checkBtn.bg.clear();
        this._checkBtn.bg.fillStyle(0x2E7D32, 1);
        this._checkBtn.bg.fillRoundedRect(GAME_WIDTH / 2 - 105, 694, 210, 48, 12);
    }

    _checkAnswer() {
        var scene   = this;
        var correct = 0;
        var total   = this._regions.length;

        this._regions.forEach(function(r) {
            var ok = r.currentColor === r.target;
            if (ok) correct++;
            // Visual feedback on outline
            scene._drawOutline(r, ok ? 0xFFD700 : 0xE53935, ok ? 3 : 2);
        });

        var perfect = (correct === total);
        if (perfect) this._perfects++;

        // Show result overlay
        var overlay = this.add.graphics().setDepth(30);
        overlay.fillStyle(0x000000, 0.65);
        overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        var msg = perfect
            ? '🌟 Perfect!\nAlle kleuren kloppen!'
            : correct + ' van ' + total + ' vlakken correct.\nProbeer de rest!';

        this.add.text(GAME_WIDTH / 2, 360, msg, {
            fontFamily: 'Georgia, serif', fontSize: '22px', color: '#FFD700',
            stroke: '#000', strokeThickness: 3, align: 'center',
            wordWrap: { width: 300 },
        }).setOrigin(0.5).setDepth(31);

        // If not perfect: show "Verder" to allow fixing
        if (!perfect) {
            var fixBtn = makeButton(scene, GAME_WIDTH / 2, 440, 200, 48, COLORS.orange, 'Verbeter ✏️', 17);
            fixBtn.bg.setDepth(31); fixBtn.text.setDepth(32);
            var fixZone = scene.add.zone(GAME_WIDTH / 2, 440, 200, 48).setInteractive().setDepth(33);
            fixZone.once('pointerdown', function() {
                overlay.destroy(); fixBtn.bg.destroy(); fixBtn.text.destroy(); fixZone.destroy();
                scene.children.list
                    .filter(function(c) { return c.depth >= 30; })
                    .forEach(function(c) { c.destroy(); });
                scene._checkActive = false;
                scene._buildCheckButton();
            });

            // Also show "Sla over" to advance anyway
            var skipBtn = makeButton(scene, GAME_WIDTH / 2, 500, 200, 48, 0x444444, 'Sla over ▶', 17);
            skipBtn.bg.setDepth(31); skipBtn.text.setDepth(32);
            var skipZone = scene.add.zone(GAME_WIDTH / 2, 500, 200, 48).setInteractive().setDepth(33);
            skipZone.once('pointerdown', function() { scene._nextRound(); });
        } else {
            // Perfect — auto advance after 1500ms
            this.time.delayedCall(1500, function() { scene._nextRound(); });
        }
    }

    _nextRound() {
        this._round++;
        if (this._round >= 5) {
            this._showEnd();
        } else {
            this._buildRound();
        }
    }

    // ── End screen ────────────────────────────────────────────────────────────

    _showEnd() {
        this.children.list.slice().forEach(function(c) { c.destroy(); });

        var bg = this.add.graphics();
        bg.fillStyle(0x0D0D1A, 1);
        bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        this.add.text(GAME_WIDTH / 2, 220, '🎨', { fontSize: '64px' }).setOrigin(0.5);
        this.add.text(GAME_WIDTH / 2, 300, 'Goed gedaan!', {
            fontFamily: 'Georgia, serif', fontSize: '28px', color: '#FFD700',
            stroke: '#000', strokeThickness: 3,
        }).setOrigin(0.5);

        var stars = this._perfects >= 5 ? 3 : this._perfects >= 3 ? 2 : this._perfects >= 1 ? 1 : 0;
        this.add.text(GAME_WIDTH / 2, 348, this._perfects + ' van 5 perfect gekleurd', {
            fontFamily: 'Arial, sans-serif', fontSize: '16px', color: 'rgba(255,255,255,0.7)',
        }).setOrigin(0.5);

        drawStars(this, GAME_WIDTH / 2, 400, 3, stars, 26);

        // Restart button
        var scene = this;
        var rBtn  = makeButton(this, GAME_WIDTH / 2, 490, 200, 50, COLORS.teal, 'Opnieuw 🔄', 18);
        var rZone = this.add.zone(GAME_WIDTH / 2, 490, 200, 50).setInteractive();
        rZone.on('pointerdown', function() { scene.scene.restart(); });

        // Back button
        var bBtn  = makeButton(this, GAME_WIDTH / 2, 560, 200, 50, 0x333333, '← Terug', 18);
        var bZone = this.add.zone(GAME_WIDTH / 2, 560, 200, 50).setInteractive();
        bZone.on('pointerdown', function() {
            if (window._onReturnToMap) window._onReturnToMap();
        });
    }
}

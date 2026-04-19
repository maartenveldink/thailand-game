// ── Web Audio API sound effects (no files needed) ──────────────────────────
var _audioCtx = null;

function _ctx() {
    if (!_audioCtx) {
        try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }
    return _audioCtx;
}

function _tone(freq, dur, type, vol) {
    try {
        var ctx  = _ctx(); if (!ctx) return;
        var osc  = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = type || 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol || 0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + dur);
    } catch (e) {}
}

var SFX = {
    tap:     function () { _tone(550, 0.07, 'sine', 0.18); },
    correct: function () { _tone(880, 0.18, 'sine', 0.28); },
    wrong:   function () { _tone(200, 0.35, 'square', 0.18); },
    match:   function () {
        _tone(660, 0.14, 'sine', 0.25);
        setTimeout(function () { _tone(880, 0.18, 'sine', 0.25); }, 140);
    },
    win: function () {
        var notes = [523, 659, 784, 1047];
        notes.forEach(function (f, i) {
            setTimeout(function () { _tone(f, 0.28, 'sine', 0.28); }, i * 110);
        });
    },
    stamp:   function () { _tone(440, 0.12, 'triangle', 0.3); },
    collect: function () { _tone(660, 0.08, 'sine', 0.22); },
    lose:    function () { _tone(180, 0.45, 'sawtooth', 0.18); },
    whoosh:  function () {
        try {
            var ctx = _ctx(); if (!ctx) return;
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.25);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
        } catch(e) {}
    }
};

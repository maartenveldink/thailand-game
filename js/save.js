var PLAYERS_KEY = 'thailand_players';
var ACTIVE_KEY  = 'thailand_active';
var SETTINGS_KEY = 'thailand_settings';

// ── Active player ──────────────────────────────────────────────────────────────

function getActivePlayer() {
    return localStorage.getItem(ACTIVE_KEY) || null;
}

function setActivePlayer(name) {
    localStorage.setItem(ACTIVE_KEY, name);
}

function getSaveKey() {
    var active = getActivePlayer();
    return active ? 'thailand_save_' + active : 'thailand_save';
}

// ── Player list ────────────────────────────────────────────────────────────────

function getPlayerList() {
    try { return JSON.parse(localStorage.getItem(PLAYERS_KEY)) || []; }
    catch (e) { return []; }
}

function addPlayer(name) {
    var list = getPlayerList();
    if (!list.includes(name)) {
        list.push(name);
        localStorage.setItem(PLAYERS_KEY, JSON.stringify(list));
    }
}

function removePlayer(name) {
    var list = getPlayerList().filter(function (n) { return n !== name; });
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(list));
    localStorage.removeItem('thailand_save_' + name);
    if (getActivePlayer() === name) {
        localStorage.removeItem(ACTIVE_KEY);
    }
}

// ── Per-player save ────────────────────────────────────────────────────────────

function _defaultSave(name) {
    return {
        version: 1,
        playerName: name || '',
        locations: LOCATIONS.map(function (loc) {
            return { id: loc.id, unlocked: loc.id === 'bangkok', completed: false, stars: 0 };
        }),
        totalStars: 0,
        lastPlayed: null
    };
}

function loadSave() {
    try {
        var raw = localStorage.getItem(getSaveKey());
        if (!raw) return _defaultSave(getActivePlayer());
        return JSON.parse(raw);
    } catch (e) {
        return _defaultSave(getActivePlayer());
    }
}

function writeSave(data) {
    data.lastPlayed = new Date().toISOString();
    localStorage.setItem(getSaveKey(), JSON.stringify(data));
}

function createPlayerSave(name) {
    setActivePlayer(name);
    addPlayer(name);
    var save = _defaultSave(name);
    writeSave(save);
    return save;
}

function completeLocation(locationIndex, stars) {
    var data = loadSave();
    data.locations[locationIndex].completed = true;
    data.locations[locationIndex].stars = Math.max(data.locations[locationIndex].stars, stars);
    if (locationIndex + 1 < data.locations.length) {
        data.locations[locationIndex + 1].unlocked = true;
    }
    data.totalStars = data.locations.reduce(function (sum, l) { return sum + l.stars; }, 0);
    writeSave(data);
    return data;
}

function resetSave() {
    var name = getActivePlayer();
    if (name) {
        writeSave(_defaultSave(name));
    } else {
        localStorage.removeItem('thailand_save');
    }
}

function getHighscore(locationId) {
    var data = loadSave();
    return (data.highscores && data.highscores[locationId]) || 0;
}

function setHighscore(locationId, score) {
    var data = loadSave();
    if (!data.highscores) data.highscores = {};
    if (score > (data.highscores[locationId] || 0)) {
        data.highscores[locationId] = score;
        writeSave(data);
    }
}

// ── Settings ───────────────────────────────────────────────────────────────────

function _settingsKey() {
    var active = getActivePlayer();
    return active ? SETTINGS_KEY + '_' + active : SETTINGS_KEY;
}

function loadSettings() {
    try { return JSON.parse(localStorage.getItem(_settingsKey())) || {}; }
    catch (e) { return {}; }
}

function writeSettings(s) {
    localStorage.setItem(_settingsKey(), JSON.stringify(s));
}

function resetGame(locationIndex) {
    var data = loadSave();
    var loc = data.locations[locationIndex];
    loc.completed = false;
    loc.stars = 0;
    data.totalStars = data.locations.reduce(function (sum, l) { return sum + (l.stars || 0); }, 0);
    writeSave(data);
}

// ── Window exports ─────────────────────────────────────────────────────────────

window.loadSave = loadSave;
window.writeSave = writeSave;
window.completeLocation = completeLocation;
window.resetSave = resetSave;
window.getPlayerList = getPlayerList;
window.addPlayer = addPlayer;
window.removePlayer = removePlayer;
window.getActivePlayer = getActivePlayer;
window.setActivePlayer = setActivePlayer;
window.createPlayerSave = createPlayerSave;
window.getSaveKey = getSaveKey;
window.loadSettings = loadSettings;
window.writeSettings = writeSettings;
window.resetGame = resetGame;

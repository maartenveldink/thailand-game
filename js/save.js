const SAVE_KEY = 'thailand_save';

function _defaultSave() {
    return {
        version: 1,
        players: { name1: '', name2: '' },
        locations: LOCATIONS.map(function (loc) {
            return { id: loc.id, unlocked: loc.id === 'bangkok', completed: false, stars: 0 };
        }),
        totalStars: 0,
        lastPlayed: null
    };
}

function loadSave() {
    try {
        var raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return _defaultSave();
        return JSON.parse(raw);
    } catch (e) {
        return _defaultSave();
    }
}

function writeSave(data) {
    data.lastPlayed = new Date().toISOString();
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function createNewSave(name1, name2) {
    var save = _defaultSave();
    save.players.name1 = name1;
    save.players.name2 = name2;
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
    localStorage.removeItem(SAVE_KEY);
}

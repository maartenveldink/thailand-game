// ── Game dimensions (portrait, iPhone 14 size) ─────────────────────────────
const GAME_WIDTH  = 390;
const GAME_HEIGHT = 844;

// ── Map drawing area inside the canvas ─────────────────────────────────────
const MAP_X = 55;   // left edge
const MAP_Y = 190;  // top edge
const MAP_W = 280;  // width
const MAP_H = 460;  // height

// ── Color palette ──────────────────────────────────────────────────────────
const COLORS = {
    gold:   0xE8A020,
    orange: 0xD84315,
    red:    0xB71C1C,
    teal:   0x00897B,
    jungle: 0x2E7D32,
    night:  0x0D1B4B,
    sand:   0xF5DEB3,
    water:  0x0288D1,
    bg:     0x1A0A00,
    white:  0xFFFFFF,
    dark:   0x111111,
    gray:   0x555555
};

// ── Thailand outline polygon ────────────────────────────────────────────────
// Normalized 0-1 within MAP_W × MAP_H; convert with MAP_X + x*MAP_W etc.
const THAILAND_POLY = [
    [0.30,0.00],[0.58,0.00],[0.70,0.03],[0.82,0.08],
    [0.90,0.18],[0.90,0.28],[0.86,0.34],[0.82,0.40],
    [0.72,0.44],[0.68,0.50],[0.65,0.56],[0.66,0.64],
    [0.65,0.72],[0.63,0.80],[0.60,0.88],[0.57,0.94],[0.53,0.99],
    [0.50,1.00],
    [0.47,0.99],[0.44,0.93],[0.42,0.83],[0.40,0.73],
    [0.38,0.63],[0.36,0.55],[0.34,0.47],[0.30,0.42],
    [0.22,0.36],[0.14,0.30],[0.10,0.22],[0.12,0.13],
    [0.18,0.06],[0.24,0.02],[0.30,0.00]
];

// ── Location definitions ────────────────────────────────────────────────────
// mapX/mapY: fractional position within the MAP drawing area (0-1)
const LOCATIONS = [
    {
        id:        'bangkok',
        name:      'Bangkok',
        nameTH:    'กรุงเทพฯ',
        mapX:      0.80, mapY: 0.36,
        color:     0xE8A020,
        stamp:     '🏛️',
        dateLabel: '26–29 april',
        scene:     'BangkokMapGame',
        storyTitle: 'Bangkok – De Stad der Engelen',
        storyText:  'Jullie zijn aangekomen in Bangkok, de hoofdstad van Thailand!\n\nDeze stad heeft meer dan 10 miljoen inwoners en is gevuld met gouden tempels, bruisende markten en kleurrijke tuk-tuks.\n\nVind alle 5 bijzondere plekken op de kaart van Bangkok!',
        winText:   'Sawadee ka! Jullie hebben Bangkok verkend!'
    },
    {
        id:        'kanchanaburi',
        name:      'Kanchanaburi',
        nameTH:    'กาญจนบุรี',
        mapX:      0.46, mapY: 0.43,
        color:     0x2E7D32,
        stamp:     '🌉',
        dateLabel: '29 apr – 1 mei',
        scene:     'KanchanaburiMemory',
        storyTitle: 'Kanchanaburi – De Rivier Kwai',
        storyText:  'Na Bangkok reizen jullie naar Kanchanaburi, diep in het oerwoud.\n\nHier stroomt de beroemde rivier Kwai. Jullie slapen op een vlotterij – een drijvend huisje op het water!\n\n\'s Nachts hoor je het oerwoud. Vind alle dierenparen!',
        winText:   'Alle dieren gevonden! De jungle van Kanchanaburi heeft geen geheimen meer.'
    },
    {
        id:        'nachttrein',
        name:      'Nachttrein',
        nameTH:    'รถไฟกลางคืน',
        mapX:      0.65, mapY: 0.50,
        color:     0x1A237E,
        stamp:     '🚂',
        dateLabel: '1–2 mei',
        scene:     'TrainReflexGame',
        storyTitle: 'De Nachttrein – Avontuur op de Rails',
        storyText:  'Vanavond stappen jullie in een echte slaaptrein! Om 19:50 uur vertrekt hij vanuit Bangkok.\n\nIn de trein hebben jullie een eigen couchette – een bedje in de trein!\n\nMaar eerst: zorg dat alle bagage meekomt. Haal jullie koffers van het perron!',
        winText:   'Vertrokken! De trein rijdt de nacht in. Welterusten!'
    },
    {
        id:        'khaosok',
        name:      'Khao Sok',
        nameTH:    'เขาสก',
        mapX:      0.50, mapY: 0.64,
        color:     0x388E3C,
        stamp:     '🌿',
        dateLabel: '2–3 mei',
        scene:     'KhaoSokPuzzle',
        storyTitle: 'Khao Sok – Het Oerwoud',
        storyText:  'Welkom in Khao Sok, een van de oudste regenwouden ter wereld – 160 miljoen jaar oud!\n\nHier leven gibbons, olifanten en de grootste bloem ter wereld: de Rafflesia.\n\nLaten we zien hoeveel jullie weten over dit bijzondere oerwoud!',
        winText:   'Jungle-experts! Khao Sok heeft geen geheimen meer voor jullie.'
    },
    {
        id:        'cheowlan',
        name:      'Cheow Lan Meer',
        nameTH:    'เชี่ยวหลาน',
        mapX:      0.50, mapY: 0.68,
        color:     0x0288D1,
        stamp:     '🛖',
        dateLabel: '3–4 mei',
        scene:     'LakeRaftGame',
        storyTitle: 'Cheow Lan Meer – Slapen op het Water',
        storyText:  'Jullie gaan vannacht op een vlot slapen, midden op een groot meer!\n\nHet water is zo spiegelglad dat je de sterren erin ziet weerspiegelen.\n\nMaar het vlot wiebelt soms… help jullie spullen veilig te houden!',
        winText:   'Alle spullen veilig! Wat een sprookjesachtige nacht op het meer.'
    },
    {
        id:        'samui',
        name:      'Koh Samui',
        nameTH:    'เกาะสมุย',
        mapX:      0.76, mapY: 0.70,
        color:     0x00897B,
        stamp:     '🏖️',
        dateLabel: '4–10 mei',
        scene:     'SamuiBeachGame',
        storyTitle: 'Koh Samui – Zes Dagen Strand!',
        storyText:  'Koh Samui is een eiland in de Golf van Thailand. Jullie mogen er zes hele dagen blijven!\n\nWit zand, turquoise water, palmbomen en tropische vissen. Het echte paradijs!\n\nKlaar voor drie strandavonturen?',
        winText:   'Strandkampioenen! Koh Samui was onvergetelijk.'
    },
    {
        id:        'terugbangkok',
        name:      'Terug in Bangkok',
        nameTH:    'กลับบ้าน',
        mapX:      0.80, mapY: 0.36,
        color:     0xB71C1C,
        stamp:     '✈️',
        dateLabel: '10–11 mei',
        scene:     'BangkokFinalGame',
        storyTitle: 'Terug in Bangkok – De Grote Quiz!',
        storyText:  'De vakantie zit er bijna op. Morgen vliegen jullie terug naar Nederland.\n\nWat een reis! Bangkok, Kanchanaburi, de nachttrein, Khao Sok, het meer, en zes prachtige dagen op Koh Samui.\n\nWeten jullie het nog allemaal? De grote Thailand-quiz begint nu!',
        winText:   '🎉 GEFELICITEERD! 🎉\n\nJullie hebben de hele Thailand-reis uitgespeeld!\n\nSawasdee ka – tot de volgende keer!'
    }
];

# Thailand Avontuur — Requirements

## Product
Offline-first PWA voor twee kinderen (ca. 10 jaar) die Thailand bezoeken van 26 april t/m 11 mei.
Geen internetverbinding vereist na eerste installatie.

## Technische basis
| Eis | Detail |
|-----|--------|
| Platform | PWA, installeerbaar op iOS/Android |
| Offline | Service Worker cachet alle assets |
| Game engine | Phaser 3.88.2 (gebundeld in `/lib/phaser.min.js`) |
| UI-shell | React 18 + Vite; inline styles |
| Opslag | `localStorage` — save per speler, gedeelde settings |
| Scherm | 390×844px ontwerp; schaalt via Phaser FIT |
| Taal | Nederlands UI, Thais schrift in woordenboek |

## Spelers
- Twee spelers, elk met eigen voortgangssave
- Spelernamen vrij in te voeren bij eerste opstart
- Wisselen via knop op de kaart
- Alle scores, sterren en bingo-voortgang zijn per speler opgeslagen

## Reisroute & locaties
| # | Locatie | Datum | Mini-game |
|---|---------|-------|-----------|
| 1 | Bangkok | 26–29 april | BangkokMapGame — vind 5 landmarks |
| 2 | Kanchanaburi | 29 apr–1 mei | KanchanaburiMemory — kaartengeheugen |
| 3 | Nachttrein | 1–2 mei | TrainReflexGame — vang bagage |
| 4 | Khao Sok | 2–3 mei | KhaoSokPuzzle — trivia |
| 5 | Cheow Lan Meer | 3–4 mei | LakeRaftGame — vlotbalans 60s |
| 6 | Koh Samui | 4–10 mei | SamuiBeachGame — 3 sub-spellen |
| 7 | Terug Bangkok | 10–11 mei | BangkokFinalGame — grote quiz |

Locaties worden op volgorde gespeeld; elke voltooide locatie ontgrendelt de volgende.

## Bonusspellen (altijd toegankelijk via "Alle Spellen")
| Spel | Beschrijving |
|------|-------------|
| Thailand Tetris | Klassieke Tetris met Thaise kleuren |
| Tempel Tocht | Tap-to-jump platformer, 5 tempelniveaus |
| Strand Pong | Pong met kokosnoot, strand-thema, 1 speler vs AI |
| Tempel Portaal | Math-portal runner; baas-gates elke 5 rondes |

Highscores per bonusspel opgeslagen in `save.highscores[key]`.

## Reistools (React-schermen, geen Phaser)

### Thailand Bingo
- 4×4 grid van te spotten items (tuk-tuk, olifant, pad thai, etc.)
- Winconditie: **4 op een rij** (horizontaal, verticaal of diagonaal)
- Thaise vlag getoond als `/img/flag.png` (niet als emoji)
- Twee tabs: **🎯 Bingo-kaart** (positioneel grid) en **👁️ Al gezien** (lineaire lijst + teller)
- Aanvinken in één tab reflecteert in de andere (gedeelde `checked`-array)
- "Nieuwe kaart" shufflet volgorde en reset aangevinkte vakjes; `wins` blijft bewaard
- `save.bingo = { checked[], order[], wins }` — wins telt **per speler**

### Baht Rekenmachine
- Offline EUR↔THB omzetter; twee richtingen (toggle)
- Wisselkoers (`bahtRate`) instelbaar via de Beheer-pagina; default 38.5
- Referentiekaartjes met prijzen (berekend met actuele koers)
- Koers opgeslagen in `settings.bahtRate`

### Thai Woordenboek
- ~30 woorden in 4 categorieën: Groeten, Eten, Cijfers, Dieren
- Elke kaart: Nederlands + fonetische uitspraak voor, Thai schrift achter
- Flip-animatie (CSS rotateY) bij aantikken
- Geen save; puur stateless

### Reisdagboek
- Per locatie een tekstveld (max 200 tekens)
- Automatisch opgeslagen bij verlaten veld (debounce 800ms)
- Opgeslagen in `save.diary = { [locationId]: string }`
- Preview van eerste 60 tekens zichtbaar op de locatiekaart

## Instellingen (toegankelijk voor spelers via ⚙️ op de kaart)
- Nachttrein — bagage tempo (Rustig / Normaal / Snel)
- Khao Sok — benodigde vragen (6 / 8 / 10 van 15)
- Bangkok quiz — max pogingen per woord (3 / 5)
- Cheow Lan — sterren nodig om te winnen (8 / 10 / 12)
- Kanchanaburi — aantal paren (4 / 6 / 8 / 10 / 12)
- Kanchanaburi — kaartjes per beurt (2 / 3 / 4)
- Koh Samui — min/max schelpen
- Tempel Tocht — spelsnelheid
- Strand Pong — basissnelheid + max snelheidsfactor
- Tempel Portaal — begin- en maximale snelheid

## Beheer (verborgen scherm, url `?beheer=true`)
- Locaties voltooien zonder spelen (voor testen / demo)
- Spelersoverzicht + verwijderen
- **Wisselkoers instellen** (`settings.bahtRate`) voor de Baht Rekenmachine

## Schilder-spel
- Los React-scherm (geen Phaser)
- Kleur foto's van Thailand in met touch/muis
- Upload eigen foto's mogelijk
- Offline werkend

## Niet in scope
- Multiplayer over netwerk
- Online highscores / live wisselkoers
- In-app aankopen

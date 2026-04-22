import { useState, useRef, useCallback } from 'react'

// ── Trivia data ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'flora-fauna',  label: 'Flora & Fauna',  emoji: '🌿' },
  { key: 'geschiedenis', label: 'Geschiedenis',   emoji: '🏛️' },
  { key: 'cultuur',      label: 'Cultuur',         emoji: '🎭' },
  { key: 'boeddhisme',   label: 'Boeddhisme',      emoji: '🙏' },
  { key: 'symbolen',     label: 'Symbolen',        emoji: '🐘' },
  { key: 'eten',         label: 'Eten & Drinken',  emoji: '🍜' },
  { key: 'geografie',    label: 'Geografie',       emoji: '🌍' },
  { key: 'koningshuis',  label: 'Koningshuis',     emoji: '👑' },
]

const TRIVIA = [
  // ── Flora & Fauna ────────────────────────────────────────────────────────────
  {
    id: 'ff1', cat: 'flora-fauna', emoji: '🐘',
    title: 'De Aziatische olifant',
    fact: 'De olifant is het nationale symbool van Thailand. Vroeger hielpen olifanten bij de bouw van tempels en in oorlogen.',
    detail: 'De Aziatische olifant is kleiner dan zijn Afrikaanse neef, maar nog steeds enorm: een volwassen mannetje kan 5.000 kilo wegen. In Thailand werden olifanten eeuwenlang als werkkrachten ingezet in de bosbouw. Tegenwoordig zijn er nog maar zo\'n 3.000–4.000 wilde olifanten in Thailand. Witte olifanten gelden als heilig en zijn het eigendom van de koning. In Khao Sok kun je olifanten soms in het wild zien bij waterpoelen.',
    search: 'Aziatische olifant Thailand',
  },
  {
    id: 'ff2', cat: 'flora-fauna', emoji: '🐅',
    title: 'De Indochinese tijger',
    fact: 'Thailand is een van de laatste toevluchtsoorden voor de wilde tijger in Zuidoost-Azië. Er leven er nog maar ongeveer 150–200 in het wild.',
    detail: 'De Indochinese tijger (Panthera tigris corbetti) is slanker dan de Bengaalse tijger. In Thailand leven ze voornamelijk in het Western Forest Complex, het grootste aaneengesloten bosgebied in Zuidoost-Azië. Tijgers zijn eenzame jagers en hebben een territorium van honderden vierkante kilometers nodig. Ze zijn heilig in de Thaise cultuur en symbool van kracht en moed. Stroperij en habitatverlies bedreigen hun voortbestaan.',
    search: 'Indochinese tijger Thailand wild',
  },
  {
    id: 'ff3', cat: 'flora-fauna', emoji: '🌺',
    title: 'De Ratchaphruek – nationale bloem',
    fact: 'De gele cassiabloem (Ratchaphruek) is de nationale bloem van Thailand. De gele kleur symboliseert het boeddhisme en de koningsfamilie.',
    detail: 'De Ratchaphruek (Cassia fistula) bloeit prachtig geel in maart en april. Thais noemen het ook wel de "Golden Shower Tree". De bloem verschijnt op bankbiljetten en officiële symbolen. In de volksmond geldt de boom als brenger van geluk en voorspoed. Naast de nationale bloem is de orchidee ook enorm populair in Thailand – het land is een van de grootste orchideeënexporteurs ter wereld.',
    search: 'Ratchaphruek nationale bloem Thailand',
  },
  {
    id: 'ff4', cat: 'flora-fauna', emoji: '🦜',
    title: 'De Neushoornvogel',
    fact: 'De neushoornvogel heeft een spectaculaire hoorn op zijn snavel en is heilig bij bergvolken in het noorden van Thailand.',
    detail: 'Thailand heeft vier soorten neushoornvogels, waarvan de Grote Neushoornvogel (Buceros bicornis) de meest indrukwekkende is. Ze leven in oude regenwouden zoals Khao Sok en kunnen 50 jaar oud worden. De hoorn op hun snavel heet een "casque" en is hol – het versterkt hun roep. In Khao Sok hoor je ze vaak voor je ze ziet: ze maken een enorm kabaal als ze door het bos vliegen.',
    search: 'Neushoornvogel Thailand Khao Sok',
  },
  {
    id: 'ff5', cat: 'flora-fauna', emoji: '🐍',
    title: 'De Koningscobra',
    fact: 'De koningscobra is de langste giftige slang ter wereld – hij kan 5,5 meter lang worden. In Thailand wordt hij gevreesd én vereerd.',
    detail: 'De koningscobra (Ophiophagus hannah) eet uitsluitend andere slangen. Hij is de enige slang die een nest bouwt voor zijn eieren. Zijn gif is zo krachtig dat het een olifant kan doden. In Thailand leven ook Siamese kobra\'s en pythons. Slangentempels zijn populaire bezienswaardigheid. In het wild zijn ze schuw en bijten ze alleen als ze zich bedreigd voelen. In Khao Sok leven pythons die soms kleine herten vangen.',
    search: 'Koningscobra Thailand',
  },
  {
    id: 'ff6', cat: 'flora-fauna', emoji: '🦧',
    title: 'De Withandgibbon',
    fact: 'De withandgibbon is de enige mensaap van Thailand. Ze zingen elke ochtend prachtige duetten – je hoort ze kilometers ver in het oerwoud.',
    detail: 'Gibbons zijn geen apen maar mensapen, nauw verwant aan mensen. De withandgibbon (Hylobates lar) leeft hoog in de boomtoppen van tropische regenwouden zoals Khao Sok. Een goedenmorgenduet tussen een mannetje en vrouwtje kan wel 15 minuten duren. Ze bewegen zich voort door te zwaaien aan takken (brachiation) en kunnen 55 km/u bereiken. Helaas worden ze vaak gevangen om als huisdier te verkopen – dat is illegaal maar komt nog steeds voor.',
    search: 'Withandgibbon Thailand Khao Sok',
  },
  {
    id: 'ff7', cat: 'flora-fauna', emoji: '🪷',
    title: 'De lotusbloem',
    fact: 'De lotus groeit uit modderig water maar bloeit smetteloos schoon. Daarom is het in Thailand een symbool van spirituele zuiverheid.',
    detail: 'De lotus (Nelumbo nucifera) speelt een enorme rol in de Thaise cultuur. Boeddhabeelden zitten altijd op een lotustroon. De bloem sluit \'s nachts en opent bij zonsopgang. Alle delen van de lotus zijn eetbaar: zaden, stengels en wortels worden gebruikt in de Thaise keuken. In tempels zie je altijd lotussen als offergave. De "lotus-effect" – waterdruppels rollen ervan af – inspireert moderne waterafstotende materialen.',
    search: 'Lotus bloem Thailand boeddhisme betekenis',
  },
  {
    id: 'ff8', cat: 'flora-fauna', emoji: '🦈',
    title: 'De walvishaai bij Koh Samui',
    fact: 'In de wateren rond Koh Samui en de Golf van Thailand zwemmen walvishaaien – de grootste vissen ter wereld. Ze zijn volstrekt ongevaarlijk voor mensen.',
    detail: 'De walvishaai (Rhincodon typus) kan 12 meter lang worden en 20 ton wegen – groter dan een schoolbus. Ondanks zijn enorme bek eet hij alleen plankton en kleine vissen. In Thailand zijn ze te zien rond de Sail Rock bij Koh Phangan en soms rond Koh Samui, vooral van april tot oktober. Snorkelen met een walvishaai geldt als een van de meest spectaculaire ervaringen in Thailand. Ze zijn beschermd maar door overbevissing en klimaatverandering staat hun populatie onder druk.',
    search: 'Walvishaai Koh Samui Thailand duiken',
  },

  // ── Geschiedenis ─────────────────────────────────────────────────────────────
  {
    id: 'gs1', cat: 'geschiedenis', emoji: '🏛️',
    title: 'Het Koninkrijk Ayutthaya',
    fact: 'Ayutthaya was van 1351 tot 1767 de hoofdstad van Thailand. Op zijn hoogtepunt was het een van de rijkste en grootste steden ter wereld.',
    detail: 'Het Koninkrijk Ayutthaya bestond meer dan 400 jaar en had 33 koningen. De stad lag op een eiland omgeven door drie rivieren – ideaal verdedigbaar. In de 17e eeuw woonden er meer dan een miljoen mensen, meer dan Londen en Parijs destijds. Handelaren uit Europa, China, Japan en India handelden er. In 1767 werd de stad volledig verwoest door het Birmese leger. De ruïnes zijn nu UNESCO Werelderfgoed. Je ziet er boeddhahoofden die verstrikt zijn geraakt in boomwortels.',
    search: 'Ayutthaya historische stad Thailand',
  },
  {
    id: 'gs2', cat: 'geschiedenis', emoji: '🗺️',
    title: 'Thailand nooit gekoloniseerd',
    fact: 'Thailand is het enige land in Zuidoost-Azië dat nooit gekoloniseerd is door een Europese macht. Slim diplomatiek spel hield de Thais vrij.',
    detail: 'Terwijl buurlanden als Burma (Brits), Vietnam, Cambodja en Laos (Frans) en Indonesië (Nederlands) gekoloniseerd werden, bleef Thailand zelfstandig. Koningen als Chulalongkorn (Rama V) moderniseerden het land en sloten slimme verdragen met Groot-Brittannië en Frankrijk. Ze stonden wel grondgebied af, maar behielden hun onafhankelijkheid. De naam "Thai" betekent zelf ook "vrij" in het Thais. Dit maakt de Thais bijzonder trots op hun geschiedenis.',
    search: 'Thailand nooit gekoloniseerd geschiedenis',
  },
  {
    id: 'gs3', cat: 'geschiedenis', emoji: '🌉',
    title: 'De Spoorweg over de Dood',
    fact: 'Tijdens de Tweede Wereldoorlog bouwden Japanse bezetters een spoorweg van Thailand naar Burma. Tienduizenden gevangenen stierven daarbij.',
    detail: 'De "Death Railway" werd gebouwd in 1942–1943 door zo\'n 180.000 Aziatische dwangarbeiders en 60.000 geallieerde krijgsgevangenen. Meer dan 100.000 mensen stierven door uitputting, ziekte en mishandeling. De 415 kilometer lange lijn liep van Bangkok naar Rangoon en moest Japanse troepen bevoorraden. De beroemde brug over de Kwai rivier bij Kanchanaburi is nog steeds intact. Een museum en begraafplaats herdenken de slachtoffers.',
    search: 'Death Railway Kanchanaburi Thailand WOII',
  },
  {
    id: 'gs4', cat: 'geschiedenis', emoji: '🏙️',
    title: 'De stichting van Bangkok',
    fact: 'Bangkok werd gesticht in 1782 door Koning Rama I. De volledige naam van de stad is de langste stadsnaam ter wereld: 169 letters.',
    detail: 'Na de verwoesting van Ayutthaya verplaatste Rama I de hoofdstad naar de oever van de Chao Phraya rivier. Bangkok heet in het Thais "Krung Thep Maha Nakhon" – wat "Stad der Engelen" betekent. De volledige ceremoniële naam heeft 169 letters. De stad groeide uit van een klein handelsdorp tot een metropool van meer dan 10 miljoen mensen. Het Grote Paleis dat Rama I bouwde staat er nog steeds en is een van de drukst bezochte bezienswaardigheden.',
    search: 'Bangkok stichting 1782 Rama I geschiedenis',
  },
  {
    id: 'gs5', cat: 'geschiedenis', emoji: '📜',
    title: 'Van Siam naar Thailand',
    fact: 'Tot 1939 heette Thailand officieel "Siam". De naamsverandering naar "Thailand" was een nationalistische politieke keuze.',
    detail: 'Premier Plaek Phibunsongkhram veranderde de naam in 1939 als onderdeel van een nationalistische beweging. "Thai" betekent "vrij" én verwijst naar de grootste bevolkingsgroep. Westerse landen kenden het land al eeuwen als Siam – van de naam van het toenmalige koningshuis. Je ziet Siam nog terug in namen als "Siam Center" in Bangkok en "Siamese kat". In 1945 werd de naam even teruggedraaid naar Siam, maar in 1949 definitief Thailand.',
    search: 'Siam Thailand naamsverandering 1939 geschiedenis',
  },
  {
    id: 'gs6', cat: 'geschiedenis', emoji: '⚔️',
    title: 'De olifantenoorlogen',
    fact: 'In de 16e en 17e eeuw werden oorlogen in Thailand uitgevochten op de rug van getrainde oorlogsolifanten. Koningen vochten soms in persoonlijk duel op olifant.',
    detail: 'Oorlogsolifanten waren de tanks van hun tijd: ze waren bepantserd met leer en metaal en droegen een "howdah" (een soort kastje) op hun rug vanwaar soldaten konden schieten. Een beroemde slag was die van 1593, waarbij de Thaise Kroonprins Naresuan de Birmese Kroonprins in een persoonlijk olifantenduel versloeg. Dit is nog steeds een geliefd verhaal in Thailand en er zijn er films over gemaakt. Het gebruik van oorlogsolifanten verdween pas in de 17e eeuw door de komst van vuurwapens.',
    search: 'Olifantenoorlog Thailand Naresuan',
  },

  // ── Cultuur ──────────────────────────────────────────────────────────────────
  {
    id: 'cu1', cat: 'cultuur', emoji: '🙏',
    title: 'De Wai – de Thaise begroeting',
    fact: 'Thais begroeten elkaar met de "Wai": handpalmen samen, licht buigen. Hoe lager je buigt, hoe meer respect je betuigt.',
    detail: 'De Wai is meer dan een groet – het is een teken van respect. Je begroet ouderen en monniken met een diepere buiging dan leeftijdsgenoten. Kinderen beginnen met de Wai, ouderen beantwoorden hem. Toeristen hoeven niet per se te wai-en, maar het wordt altijd gewaardeerd als je het probeert. Zeg erbij "Sawasdee kha" (vrouwen) of "Sawasdee khrap" (mannen). Wai nooit met iets in je handen.',
    search: 'Thaise Wai begroeting cultuur',
  },
  {
    id: 'cu2', cat: 'cultuur', emoji: '💦',
    title: 'Songkran – het waterfeest',
    fact: 'Songkran is het Thaise Nieuwjaar, gevierd in april. Het is het grootste watergevecht ter wereld – niemand blijft droog.',
    detail: 'Songkran (13–15 april) is oorspronkelijk een reinigingsritueel waarbij je ouderen met geparfumeerd water overgiet als teken van respect en zegening. Tegenwoordig zijn de straten veranderd in enorme watergevechten waarbij iedereen waterpistolen en emmers gebruikt. Het water symboliseert het afwassen van het oude jaar. Toeristen zijn zeer welkom om mee te doen – maar leg je telefoon goed weg! Bangkok en Chiang Mai hebben de grootste festiviteiten.',
    search: 'Songkran waterfeest Thailand april',
  },
  {
    id: 'cu3', cat: 'cultuur', emoji: '🏮',
    title: 'Loi Krathong – lantaarnsfeest',
    fact: 'Op volle maan in november laten Thais vlotjes drijven op het water en laten ze lichtende lantaarns op in de lucht. Een sprookjesachtig gezicht.',
    detail: 'Loi Krathong vindt plaats op de volle maan van de 12e maand van de Thaise maankalender (oktober of november). "Krathong" zijn kleine vlotjes van bananenbladeren, versierd met bloemen en kaarsen. Je legt er je wensen in en laat ze wegdrijven op het water – symbolisch laat je zo je zorgen los. In Chiang Mai is er ook het "Yi Peng" festival waarbij duizenden papieren lantaarns in de lucht worden gelaten. Een betoverend schouwspel.',
    search: 'Loi Krathong lantaarnsfeest Thailand',
  },
  {
    id: 'cu4', cat: 'cultuur', emoji: '🥊',
    title: 'Muay Thai – de kunst van de acht ledematen',
    fact: 'Muay Thai is de nationale sport van Thailand. Het gebruikt vuisten, ellebogen, knieën én voeten – acht punten van contact.',
    detail: 'Muay Thai is meer dan een sport – het is een kunst met eeuwenoude wortels. Vroeger was het een gevechtstechniek voor soldaten. Nu is het een nationale sport waarbij kinderen al op jonge leeftijd beginnen te trainen. Voor een wedstrijd voeren boksers de "Wai Kru Ram Muay" uit: een rituele dans om hun leraar te respecteren en zichzelf te beschermen. De muziek (Sarama) begeleidt de hele wedstrijd. In Thailand zijn er ontelbare Muay Thai-scholen die ook open zijn voor toeristen.',
    search: 'Muay Thai Thailand vechtsport',
  },
  {
    id: 'cu5', cat: 'cultuur', emoji: '👣',
    title: 'Hoofd en voeten',
    fact: 'In Thailand is het hoofd heilig en zijn de voeten onrein. Wijs nooit met je voet naar iemand of een boeddhabeeld – dat is heel beledigend.',
    detail: 'In het Thaise geloof zit de ziel in het hoofd. Raak nooit het hoofd van een Thaise persoon aan, ook niet van kinderen als liefkozend gebaar. Voeten zijn het laagste deel van het lichaam en gelden als onrein. Wijs nooit met je voet naar mensen, boeddhabeelden of heilige objecten. Steek je voeten niet omhoog op een stoel. Zit nooit met de voeten naar een boeddhabeeld. Trekken je schoenen uit voor een tempel of Thais huis is verplicht.',
    search: 'Thaise cultuur hoofd voeten etiquette',
  },
  {
    id: 'cu6', cat: 'cultuur', emoji: '🎭',
    title: 'Khon – het maskertheater',
    fact: 'Khon is het traditionele gemaskerde theaterspel van Thailand, gebaseerd op de Ramakien – de Thaise versie van het Indiase Ramayana-epos.',
    detail: 'Khon werd vroeger alleen opgevoerd voor het koningshuis. De uitvoerders dragen prachtige gouden kostuums en handgemaakte maskers. De verhalen gaan over de held Rama die zijn vrouw Sita redt van de demon Tosakan. Elk personage heeft zijn eigen kleur: groen voor koningen, rood voor demonen, goud voor goden. In 2018 erkende UNESCO Khon als immaterieel werelderfgoed. In Bangkok kun je voorstellingen bijwonen in het Nationaal Theater.',
    search: 'Khon maskertheater Thailand Ramakien',
  },
  {
    id: 'cu7', cat: 'cultuur', emoji: '🎨',
    title: 'Kleur van de dag',
    fact: 'In Thailand heeft elke dag van de week een eigen kleur. Thais dragen vaak de kleur van de dag. Op maandag is het geel – de kleur van de koning.',
    detail: 'De kleuren van de week zijn gebaseerd op hindoeïstische planeetgoden: Zondag=rood, Maandag=geel, Dinsdag=roze, Woensdag=groen, Donderdag=oranje, Vrijdag=lichtblauw, Zaterdag=paars. Na het overlijden van de geliefde Koning Bhumibol (op een maandag geboren) droeg heel Thailand maandenlang geel. De huidige koning is geboren op maandag – geel is dus dubbel relevant. Veel Thais raadplegen de kleurkalender voor geluk.',
    search: 'Thailand kleur van de dag week',
  },
  {
    id: 'cu8', cat: 'cultuur', emoji: '🛺',
    title: 'De Tuk-Tuk',
    fact: 'De tuk-tuk is het meest iconische voertuig van Bangkok. Hij dankt zijn naam aan het geluid van zijn tweetaktmotor.',
    detail: 'De tuk-tuk is een driewielig gemotoriseerde riksja die eind jaren \'50 werd geïntroduceerd als vervanging voor de fietsenriksha. "Tuk-tuk" is klanknabootsing van het motorgeluid. Ze zijn felgekleurd, snel en geweldig voor korte ritten door drukke stegen. Altijd van tevoren prijs afspreken! In Bangkok zijn ze duurder dan taxi\'s, maar de ervaring is het waard. In kleinere steden en op het platteland zijn ze nog steeds de meest gebruikte vorm van openbaar vervoer.',
    search: 'Tuk-tuk Thailand Bangkok rijden',
  },

  // ── Boeddhisme ───────────────────────────────────────────────────────────────
  {
    id: 'bo1', cat: 'boeddhisme', emoji: '🧘',
    title: 'Thailand – een boeddhistisch land',
    fact: 'Meer dan 95% van de Thaise bevolking is boeddhist. Er zijn ruim 40.000 tempels (Wats) in Thailand – meer dan benzinestations.',
    detail: 'Het Thaise boeddhisme behoort tot de Theravada-stroming, de oudste overgebleven boeddhistische school. Anders dan het Mahayana-boeddhisme (China, Japan) richt Theravada zich op de originele leerstellingen van de historische Boeddha Siddhartha Gautama. Elke Thaise man wordt geacht minstens één keer in zijn leven monnik te zijn geweest, al is het maar voor een paar weken. Dit geldt als een van de grootste geschenken aan zijn ouders.',
    search: 'Theravada boeddhisme Thailand',
  },
  {
    id: 'bo2', cat: 'boeddhisme', emoji: '🟠',
    title: 'Monniken en hun gewaden',
    fact: 'Thaise monniken dragen saffraangele gewaden en volgen 227 regels. Elke ochtend lopen ze blootsvoets door de straten om eten te verzamelen.',
    detail: 'De ochtendronde heet "Tak Bat" (almsbowl ronde). Mensen staan al voor zonsopgang klaar met gekookte rijst, fruit en andere etenswaren. Het is geen liefdadigheid: de gever verzamelt "merit" (verdienste voor een beter volgend leven), de monnik bidt voor de gever. Monniken mogen na 12 uur \'s middags niet meer eten. Ze mogen geen geld aanraken. Op Koh Samui zie je elke ochtend de kenmerkende oranje stoet door de straten.',
    search: 'Thaise monniken Tak Bat almsbowl',
  },
  {
    id: 'bo3', cat: 'boeddhisme', emoji: '💎',
    title: 'De Smaragdgroene Boeddha',
    fact: 'In Wat Phra Kaew in Bangkok staat de heiligste boeddha van Thailand. Hij is slechts 66 cm hoog – maar zijn betekenis is onmetelijk.',
    detail: 'De Phra Kaew Morakot ("smaragdgroene boeddha") is gemaakt van één stuk jadeit (geen smaragd). Hij is gekleed in drie gouden gewaden die de koning persoonlijk verwisselt bij elk seizoenswissel. Het beeld werd in 1434 ontdekt in Chiang Rai en reisde langs Laos en Chiang Mai voor het in 1784 naar Bangkok werd gebracht. Fotograferen van het beeld is verboden. De tempel grenst aan het Grote Paleis – je kunt ze samen bezoeken.',
    search: 'Smaragdgroene Boeddha Wat Phra Kaew Bangkok',
  },
  {
    id: 'bo4', cat: 'boeddhisme', emoji: '🛕',
    title: 'De Liggende Boeddha – Wat Pho',
    fact: 'In Wat Pho in Bangkok ligt een enorme gouden boeddha van 46 meter lang. Zijn voetzolen zijn bedekt met parelmoer en tonen 108 geluks-symbolen.',
    detail: 'Wat Pho is een van de oudste en grootste tempels in Bangkok. De liggende boeddha symboliseert de Boeddha op het moment van zijn overlijden (parinirvana – de bevrijding uit de kringloop van wedergeboorte). De 108 symbolen op de voetzolen vertegenwoordigen de 108 kenmerken van de ware Boeddha. Wat Pho staat ook bekend als de "School of Traditional Massage" – de Thaise massage is hier uitgevonden. Een massage in de tempel is dan ook een aanrader.',
    search: 'Liggende Boeddha Wat Pho Bangkok',
  },
  {
    id: 'bo5', cat: 'boeddhisme', emoji: '🪷',
    title: 'Offers en merit-making',
    fact: 'Thais brengen dagelijks offers in tempels: lotussen, wierook, goud blad. Ze kopen ook vrij gelaten schildpadden en vogels als karma-verdienste.',
    detail: 'Merit-making ("tham bun") is het dagelijks ritueel van goede daden doen om positief karma op te bouwen voor dit en het volgende leven. Bloemen, kaarsen en wierook zijn traditionele offers. Goudblad plakken op boeddhabeelden is een andere manier. "Bird merit-making" – vogels vrijlaten uit kooitjes – is populair, maar dierenwelzijnsorganisaties waarschuwen: de vogels worden vlak erna weer gevangen. Spirit Houses (San Phra Phum) voor de tempel bewaken het huis.',
    search: 'Merit making boeddhisme Thailand offers',
  },
  {
    id: 'bo6', cat: 'boeddhisme', emoji: '☸️',
    title: 'De vier edele waarheden',
    fact: 'De kern van het boeddhisme zijn de Vier Edele Waarheden van de Boeddha: lijden bestaat, lijden heeft een oorzaak, het kan worden gestopt, en er is een pad.',
    detail: 'De Boeddha Siddhartha Gautama werd geboren als prins in Nepal rond 563 v.Chr. Na jaren van luxe en ascese vond hij verlossing onder de Bodhiboom. Zijn eerste preek introduceerde de Vier Edele Waarheden en het Achtvoudige Pad. Het Wiel (Dharma Chakra ☸️) met acht spaken staat voor dit pad: juist begrip, juiste bedoeling, juist spreken, juist handelen, juist levensonderhoud, juiste inspanning, juiste oplettendheid, juiste concentratie.',
    search: 'Vier edele waarheden boeddhisme',
  },
  {
    id: 'bo7', cat: 'boeddhisme', emoji: '🔔',
    title: 'Tempelbellen en windklokken',
    fact: 'Bij elke Thaise tempel hangen honderden kleine bellen. Als de wind eraan rinkelt, gelooft men dat dit gebeden naar de hemel draagt.',
    detail: 'De bellen (Ranat) bij Thaise tempels hebben een dubbele functie: ze markeren de tijd en ze "spreken" tot de geesten en goden. Mensen hangen soms een extra bel op als dank voor een verhoord gebed. De punt van een Thaise tempeltoren heet de "Prang" – hij wijst naar de hemel als een verbinding tussen aarde en het goddelijke. Tempels zijn 24 uur open; \'s avonds is de sfeer bijzonder rustig en contemplatief.',
    search: 'Thaise tempel bellen betekenis',
  },

  // ── Symbolen ─────────────────────────────────────────────────────────────────
  {
    id: 'sy1', cat: 'symbolen', emoji: '🐘',
    title: 'De witte olifant – koninklijk symbool',
    fact: 'Een witte olifant vinden in het wild is het allerbeste voorteken in Thailand. Ze zijn automatisch eigendom van de koning en worden als heilig behandeld.',
    detail: 'Witte olifanten zijn niet echt wit, maar albino of bijna-albino met roze huid. Ze zijn historisch zo zeldzaam en kostbaar dat ze gebruikt werden als diplomatiek geschenk – zo kostbaar dat ze ook als straf werden gegeven. Een vijand die een witte olifant kreeg, kon het dier niet weigeren maar was ook verplicht het enorm kostbaar te verzorgen. Dit is de oorsprong van de uitdrukking "white elephant" voor een kostbaar maar nutteloos cadeau.',
    search: 'Witte olifant Thailand koninklijk symbool',
  },
  {
    id: 'sy2', cat: 'symbolen', emoji: '🦅',
    title: 'Garuda – het staatssymbool',
    fact: 'De Garuda is een mythische vogel-koning uit het hindoeïsme. Hij is het officiële staatssymbool van Thailand en staat op alle overheidsdocumenten.',
    detail: 'De Garuda (Phra Krut) heeft het lichaam van een mens en de vleugels, snavel en poten van een adelaar. In de hindoe- en boeddhistische mythologie is hij de rijdier van de god Vishnu. In Thailand symboliseert hij koninklijk gezag en goddelijke macht. Je ziet de Garuda op bankbiljetten, paspoorten, officiële gebouwen en als plaquette bij bedrijven die een koninklijke aanstelling hebben. Op Koh Samui zie je hem boven veel tempelpoorten.',
    search: 'Garuda Thailand staatssymbool',
  },
  {
    id: 'sy3', cat: 'symbolen', emoji: '🐉',
    title: 'De Naga – heilige rivierslang',
    fact: 'De Naga is een mythisch slangenwezen dat rivieren en water bewaakt. Bij elke Thaise tempeltrap zie je Naga\'s als decoratie – ze beschermen de ingang.',
    detail: 'Naga\'s zijn half mens, half cobra met een prachtig uitgewaaierde cobra-kap. Ze leven in rivieren, meren en de onderwereld en zijn meesters over het water. In de Thaise mythologie beschermde een Naga de mediterende Boeddha tijdens een storm door hem te overschaduwen met zijn cobra-kap. Op trapleuningen van Thaise tempels zijn Naga\'s het meest voorkomende decoratiemotief. Ze hebben altijd een oneven aantal koppen (1, 3, 5 of 7).',
    search: 'Naga Thailand tempel mythologie',
  },
  {
    id: 'sy4', cat: 'symbolen', emoji: '🪷',
    title: 'De lotus – zuiverheid uit modder',
    fact: 'De lotus groeit uit troebel, modderig water maar bloeit smetteloos schoon. Precies zo kan een mens opstijgen boven zijn omstandigheden.',
    detail: 'De lotusbloem heeft in Thailand minstens drie lagen van betekenis: boeddhistisch (zuiverheid, verlichting), hindoeïstisch (godin Lakshmi, welvaart) en gewoon praktisch (alles van de plant is eetbaar). Boeddha wordt altijd afgebeeld zittend op een lotustroon. De "Padmasana" yoga-houding is vernoemd naar de lotus. Er zijn drie kleuren: wit (zuiverheid), roze (de Boeddha zelf) en blauw (wijsheid). In tempelvijvers bloeien ze \'s ochtends vroeg het prachtigst.',
    search: 'Lotus symbool boeddhisme Thailand betekenis',
  },
  {
    id: 'sy5', cat: 'symbolen', emoji: '🦅',
    title: 'Kinnara – half mens, half vogel',
    fact: 'De Kinnara is een mythisch wezen met het hoofd en het bovenlichaam van een mens en de vleugels en het onderlichaam van een zwaan. Ze symboliseren liefde en muziek.',
    detail: 'Kinnara\'s (mannelijk: Kinnara, vrouwelijk: Kinnari) zijn hemelse musici en dansers in de boeddhistische en hindoeïstische mythologie. Ze wonen op de mythische berg Himavanta. Een beroemd Thais verhaal is "Manora" – een Kinnari die verliefd wordt op een prins. Je ziet ze als beelden bij de in- en uitgang van de grootste tempel in Bangkok: Wat Phra Kaew. Ze hebben een zeer elegante houding met gestrekte nek en gespreide vleugels.',
    search: 'Kinnara Kinnari Thailand mythologie',
  },
  {
    id: 'sy6', cat: 'symbolen', emoji: '🐯',
    title: 'De tijger als beschermer',
    fact: 'De tijger is in Thailand een symbool van kracht, moed en bescherming. Thaise soldaten tatoeeerden tijgers op hun huid voor bescherming in de strijd.',
    detail: 'Tijgertattoos (Sak Yant) zijn een oeroude Thaise tradtie. Monniken of "Ajarns" (geestelijke meesters) zetten heilige tattoos die bescherming, geluk en kracht bieden. De "Suea" (tijger) is een van de krachtigste motieven. Beroemde Sak Yant-plaatsen zijn Wat Bang Phra bij Bangkok. Angelina Jolie droeg een beroemde Sak Yant. In het boeddhisme temde de Boeddha wilde tijgers – symbool van het temmen van de wilde geest.',
    search: 'Tijger Sak Yant tattoo Thailand bescherming',
  },
  {
    id: 'sy7', cat: 'symbolen', emoji: '🇹🇭',
    title: 'De Thaise vlag – Trairong',
    fact: 'De Thaise vlag heeft vijf horizontale banden: rood-wit-blauw-wit-rood. Rood = natie, wit = religie, blauw = koningshuis.',
    detail: 'De huidige vlag werd in 1917 geïntroduceerd door Rama VI. Het blauw was toegevoegd om solidariteit met de geallieerden in de Eerste Wereldoorlog te tonen. "Trairong" betekent "drie kleuren". De vlag heeft altijd exact dezelfde verhoudingen: 2:1:3:1:2 van boven naar beneden. In Thailand moet de vlag dagelijks om 8:00 en 18:00 worden gehesen en gestreken – op openbare plekken stoppen mensen daarvoor even met wat ze doen.',
    search: 'Thaise vlag betekenis Trairong',
  },
  {
    id: 'sy8', cat: 'symbolen', emoji: '🏵️',
    title: 'Malai – bloemenkrans als geschenk',
    fact: 'De malai is een handgemaakte krans van jasmijn en goudsbloemen. Je geeft hem als geschenk, hangen ze in auto\'s of als offer in tempels.',
    detail: 'Malai\'s worden elke ochtend vers gevlochten op markten door vakkundige makers. Een malai vlecht je door bloemen aan elkaar te rijgen op een ketting. Ze worden gebruikt bij begroetingen van gasten, als dashboarddecoratie (voor bescherming), bij huwelijken, bij religieuze ceremonies en als offer. De geur van jasmijn is onlosmakelijk verbonden met Thailand. Op de markt van Bangkok zie je enorme aantallen malai\'s – een van de meest herkenbare beelden van het land.',
    search: 'Malai bloemenkrans Thailand jasmijn',
  },

  // ── Eten & Drinken ───────────────────────────────────────────────────────────
  {
    id: 'et1', cat: 'eten', emoji: '🍜',
    title: 'Pad Thai – het nationale gerecht',
    fact: 'Pad Thai is roergebakken rijstvermicelli met garnalen, tofu, taugé en pinda\'s. Het werd in de jaren \'40 gepromoot als nationaal gerecht om rijst te sparen.',
    detail: 'Pad Thai heeft een politieke oorsprong: na de Tweede Wereldoorlog promootte de overheid het gerecht om de rijstconsumptie te verminderen (rijstvermicelli gebruikt minder rijst). De smaak is een balans van zuur (tamarinde), zoet (palmsuiker), zout (vissaus) en umami (gedroogde garnalen). Je past het aan met vier smaakmakers die altijd op tafel staan: chilipeper, suiker, vissaus en gedroogde chili. Op straat kost het 40–70 baht, een fractie van restaurantprijzen.',
    search: 'Pad Thai recept geschiedenis Thailand',
  },
  {
    id: 'et2', cat: 'eten', emoji: '🍲',
    title: 'Tom Yum – de beroemde soep',
    fact: 'Tom Yum is de scherpzure soep van Thailand met lemongrass, kaffir limoenblad, galangal en garnalen. De geur herkent iedereen meteen.',
    detail: 'Tom Yum betekent letterlijk "gekookt mengen". Er zijn twee varianten: Tom Yum Goong (met garnalen, helder) en Tom Yum Nam Khon (met kokosmelk, romig). De soep bevat drie unieke Thaise ingrediënten die je nergens anders in combinatie ziet: galangal (een soort gember), lemongrass en kaffirlimoenblaadjes. Wetenschappers ontdekten dat de combinatie van galangal en lemongrass kankercellen 100 keer effectiever bestrijdt dan chemotherapie – het is echter geen medicijn.',
    search: 'Tom Yum soep Thailand recept',
  },
  {
    id: 'et3', cat: 'eten', emoji: '🥭',
    title: 'Mango Sticky Rice',
    fact: 'Kleverige rijst met verse mango en warme kokosmelk – het meest geliefde dessert van Thailand. Verkrijgbaar van april tot juni wanneer mango\'s rijp zijn.',
    detail: 'Khao Niaow Ma Muang wordt gemaakt van kleefrijst die gestoomd wordt en daarna gemengd met gezoete kokosmelk. Er gaat ook een beetje zout in de kokosmelk – het zoet-zout contrast maakt het verslavend lekker. De mango moet van het ras Nam Dok Mai zijn: zoet, vezelloos en goudgeel. Je eet het warm met een lepel en vingers. Op Koh Samui verkopen strandstalletjes het de hele dag. Prijs: 60–120 baht.',
    search: 'Mango sticky rice Thailand recept',
  },
  {
    id: 'et4', cat: 'eten', emoji: '🌶️',
    title: 'Straateten – de ziel van Thailand',
    fact: 'In Thailand eet je het lekkerste en goedkoopste eten op straat. Bangkok heeft meer straateters per vierkante kilometer dan welke stad ter wereld ook.',
    detail: 'Thaise straateten (Food Carts) zijn een UNESCO immaterieel erfgoed. Elke verkoper heeft vaak één specialiteit waar hij/zij zijn leven aan heeft gewijd. De hygiëne is beter dan je denkt: alles wordt verse bereid op hoog vuur. Populaire gerechten: Pad Kra Pao (basilicumstoofpot), Som Tam (papajasalade), Khao Man Gai (kip met rijst). Eet altijd waar veel Thais eten – dat is een teken van kwaliteit. Bangkok Chinatown (Yaowarat) is open tot in de vroege ochtend.',
    search: 'Thailand straateten Bangkok food carts',
  },
  {
    id: 'et5', cat: 'eten', emoji: '🥥',
    title: 'Kokosnoot – de boom des levens',
    fact: 'De kokosnoot heet in Thailand "de boom die duizend dingen geeft". De noot, het sap, de melk, de olie en het blad worden allemaal gebruikt.',
    detail: 'Kokosnoten zijn de basis van de Thaise keuken. Kokosmelk (uitgeperst vruchtvlees) maakt currysauzen romig. Kokoswater (het sap) is een perfecte elektrolieten-drank. Kokosolie wordt gebruikt voor wokken. Op Koh Samui staan kokospalmen overal – de palmbomen op het eiland produceren jaarlijks miljoenen noten. Opgeleide apen werden vroeger ingezet om kokosnoten te plukken (een traditionele praktijk die nu minder voorkomt). Jonge kokosnoten zijn lichtgroen, rijpe noten bruin.',
    search: 'Kokosnoot Thailand keuken gebruik',
  },
  {
    id: 'et6', cat: 'eten', emoji: '🍌',
    title: 'Durian – de koning der vruchten',
    fact: 'Durian ruikt zo sterk dat hij verboden is in hotels, metro\'s en vliegtuigen. Toch wordt hij "de koning der vruchten" genoemd – vanwege zijn ongeëvenaarde smaak.',
    detail: 'De geur van durian is onbeschrijfelijk: een combinatie van overrijp fruit, uien en vliegende vossen beschreef een onderzoeker het. De smaak is voor velen hemels: romig, zoet, met noten. Een rijpe durian weegt 1–3 kilo en kost 100–500 baht. De stekels kunnen gevaarlijk zijn bij vallen – sommige plantages vereisen een helm. Durian bevat meer calorieën dan enig ander fruit. Op Koh Samui vind je verse durian op elke markt van mei tot augustus.',
    search: 'Durian vrucht Thailand geur',
  },
  {
    id: 'et7', cat: 'eten', emoji: '🧋',
    title: 'Thai Iced Tea – cha yen',
    fact: 'Thai Iced Tea (Cha Yen) is sterke thee met gecondenseerde melk en veel ijs. De oranje kleur komt van speciale Thaise thee met vanille en kruiden.',
    detail: '"Cha Yen" ("koude thee") is de meest gedronken drank in Thailand na water. De speciale Thaise thee heeft extra ingrediënten: tamarindezaad, anijszaad, vanille en soms rode en gele kleurstof – dat geeft de kenmerkende felrode kleur. Gecondenseerde melk en evaporated milk worden eraan toegevoegd. Het is erg zoet en erg sterk – perfect als tegenwicht voor het pittige eten. Op straat kost een groot glas Cha Yen 20–40 baht.',
    search: 'Thai Iced Tea Cha Yen recept',
  },

  // ── Geografie ────────────────────────────────────────────────────────────────
  {
    id: 'ge1', cat: 'geografie', emoji: '🗺️',
    title: 'Thailand – het land van glimlachen',
    fact: 'Thailand is 513.000 km² groot – ruim 12 keer zo groot als Nederland. Het heeft meer dan 3.200 km kustlijn langs twee zeeën.',
    detail: 'Thailand grenst aan Myanmar (noordwest), Laos (noord en noordoost), Cambodja (oost) en Maleisië (zuiden). Het land heeft de vorm van de kop van een olifant met een lange slurf (de smalle zuidelijke landtong). De bevolking is 70 miljoen. In het noorden liggen bergen (tot 2.600m), in het midden de vruchtbare centrale vlakte, in het zuiden tropische eilanden. De twee kustlijnen grenzen aan de Golf van Thailand (oost) en de Andaman Zee (west).',
    search: 'Thailand geografie ligging kaart',
  },
  {
    id: 'ge2', cat: 'geografie', emoji: '🏝️',
    title: 'Koh Samui – het Kokosnooteiland',
    fact: 'Koh Samui is Thailand\'s op één na grootste eiland. Tot 1970 was het alleen bereikbaar per boot – nu komen er jaarlijks 2 miljoen toeristen.',
    detail: 'Koh Samui (Thais voor "Kokosnooteiland") ligt in de Golf van Thailand, 80 km voor de kust. Het eiland is 228 km² groot. De beroemdste stranden zijn Chaweng, Lamai en Maenam. In het midden liggen regenwoudbedekte bergen tot 600m hoog. Rond het eiland liggen kleinere eilanden zoals Koh Phangan (Full Moon Party) en de Angthong Marine National Park-archipel van 42 eilanden. De beste tijd is november tot mei; van oktober tot november kan er storm zijn.',
    search: 'Koh Samui Thailand eiland informatie',
  },
  {
    id: 'ge3', cat: 'geografie', emoji: '🌿',
    title: 'Khao Sok – oeroud regenwoud',
    fact: 'Khao Sok National Park is een van de oudste regenwouden ter wereld – ouder dan het Amazone-woud. Het is 160 miljoen jaar oud.',
    detail: 'Khao Sok ligt in de provincie Surat Thani. Het park omvat 739 km² aan tropisch regenwoud. Het oerwoud overleefde de laatste ijstijd en bevat plantensoorten die nergens anders op aarde voorkomen. Het meer Cheow Lan (Ratchaprapha Reservoir) werd aangelegd in 1982 en omvat 165 km². Rondom het meer steken kalksteenrotsen als tanden omhoog uit het water – een spectaculair ongezicht. Nachttochten in Khao Sok zijn bijzonder: je hoort gibbons, cicades en soms een neushoornvogel.',
    search: 'Khao Sok National Park Thailand oerwoud',
  },
  {
    id: 'ge4', cat: 'geografie', emoji: '🌊',
    title: 'De Andaman Zee',
    fact: 'De Andaman Zee (westkust) heeft het helderste water van Thailand. Bij Koh Lipe en de Similan-eilanden zie je 30 meter diep – ideaal voor snorkelen.',
    detail: 'De Andaman Zee maakt deel uit van de Indische Oceaan. Het water is er kalmer, de zichtbaarheid groter en de koraalriffen zijn beter bewaard dan aan de oostkust. De Similaneilanden staan in de top-10 van mooiste duikgebieden ter wereld. In 2004 werd de Andaman Zee getroffen door de verwoestende tsunami (Boxing Day Tsunami) waarbij 230.000 mensen omk kwamen in 14 landen. Thailand verloor 8.000 mensen. De kust is sindsdien volledig herbouwd.',
    search: 'Andaman Zee Thailand snorkelen duiken',
  },
  {
    id: 'ge5', cat: 'geografie', emoji: '🏙️',
    title: 'Bangkok – de zingende stad',
    fact: 'Bangkok is de hoofdstad én enige wereldstad van Thailand. Het ligt maar 1,5 meter boven zeeniveau en zakt elk jaar 2 cm door drinkwateronttrekking.',
    detail: 'Bangkok (Krung Thep) is met 10 miljoen inwoners de grootste stad van Zuidoost-Azië qua economische betekenis. De Chao Phraya rivier doorsnijdt de stad. Bangkok staat bekend om zijn verkeer: de beruchte files kunnen auto\'s uren lang vastzetten. Oplossing: de BTS Skytrain (metro boven de grond) en de MRT (ondergronds). De stad heeft de meest Michelin-ster restaurants per hoofd van de bevolking van alle Aziatische steden. Jaarlijks overstroomt een deel van de stad.',
    search: 'Bangkok Thailand hoofdstad informatie',
  },
  {
    id: 'ge6', cat: 'geografie', emoji: '⛰️',
    title: 'Doi Inthanon – het dak van Thailand',
    fact: 'De hoogste berg van Thailand is Doi Inthanon in het noorden: 2.565 meter hoog. Hier kun je vorst verwachten in de winter – ongewoon voor een tropisch land.',
    detail: 'Doi Inthanon is onderdeel van het Doi Inthanon Nationaal Park in de provincie Chiang Mai. De berg is vernoemd naar de laatste prins van Chiang Mai, wiens as op de top is begraven. In de buurt van de top liggen twee prachtige chedis (boeddhistische torens) gebouwd ter ere van het koningspaar. Het park herbergt meer dan 380 vogelsoorten. Het klimaat op de top is koel en mistig, omgeven door mosrijke wolkenbossen. In januari kan de temperatuur dalen tot 0°C.',
    search: 'Doi Inthanon Thailand hoogste berg',
  },

  // ── Koningshuis ──────────────────────────────────────────────────────────────
  {
    id: 'ko1', cat: 'koningshuis', emoji: '👑',
    title: 'Koning Vajiralongkorn – Rama X',
    fact: 'De huidige koning van Thailand is Vajiralongkorn (Rama X), geboren in 1952. Hij besteeg de troon in 2016 na het overlijden van zijn vader.',
    detail: 'Maha Vajiralongkorn is de tiende koning van de Chakri-dynastie. Hij studeerde militaire wetenschappen in Australië en het Verenigd Koninkrijk. Als kroonprins was hij al betrokken bij koninklijke en militaire taken. De Thaise constitutionele monarchie geeft de koning grote ceremoniële macht. Het koningshuis speelt een cruciale rol in de Thaise nationale identiteit en sociale samenhang. De officiële naam van de vorst telt meer dan 50 woorden.',
    search: 'Koning Vajiralongkorn Rama X Thailand',
  },
  {
    id: 'ko2', cat: 'koningshuis', emoji: '💛',
    title: 'De heilige status van de koning',
    fact: 'De Thaise koning wordt beschouwd als een half-goddelijk wezen – een incarnatie van Vishnu en de Boeddha. Kritiek op de koning is strafbaar.',
    detail: 'De Thaise grondwet bepaalt dat de koning "heilig en onaantastbaar" is. De lèse-majesté wet (artikel 112) maakt het beledigen van de koning, koningin, erfgenaam of regent strafbaar met 3 tot 15 jaar gevangenis. Thailand past deze wet streng toe. Afbeeldingen van de koninklijke familie zijn overal: in huizen, kantoren, winkels en op de weg. Thaise bankbiljetten tonen het portret van de regerende koning en mogen nooit worden verfrommeld of neergegooid.',
    search: 'Thaise monarch heilig lese majeste wet',
  },
  {
    id: 'ko3', cat: 'koningshuis', emoji: '👴',
    title: 'Koning Bhumibol – de geliefde vader',
    fact: 'Koning Bhumibol Adulyadej (Rama IX) regeerde 70 jaar – langer dan welke andere monarch in de Thaise geschiedenis. Hij stierf in 2016, diep betreden.',
    detail: 'Bhumibol (geboren 1927, gestorven 2016) was wereldwijd de langst regerende monarch. Hij was geliefd om zijn toewijding aan ontwikkelingsprojecten voor de armen, zijn muzikale talent (hij componeerde jazz en speelde saxofoon en gitaar) en zijn persoonlijke verbondenheid met het volk. Na zijn dood droeg Thailand een jaar lang rouw in het zwart. Zijn crematie in 2017 was het grootste evenement in de moderne Thaise geschiedenis. Zijn portret hangt in bijna elk Thais huis.',
    search: 'Bhumibol Rama IX Thailand koning leven',
  },
  {
    id: 'ko4', cat: 'koningshuis', emoji: '🏯',
    title: 'Het Grote Paleis van Bangkok',
    fact: 'Het Groot Paleis in Bangkok werd gebouwd in 1782 en is een complex van 218.000 m². Het is de meest bezochte bezienswaardigheid van Thailand.',
    detail: 'Het Groot Paleis (Grand Palace) was eeuwenlang de residentie van de Thaise koningen. Nu is het een ceremonieel centrum en museum. Het complex bevat Wat Phra Kaew (tempel van de Smaragdgroene Boeddha), de Chakri Maha Prasat Troonzaal, en tientallen andere gebouwen. De architectuur mengt Thaise, Khmer en Europese stijlen. Dresscode is verplicht: bedekte schouders en knieën. Kleding wordt verhuurd bij de ingang. Verwacht veel drukte – kom vroeg.',
    search: 'Groot Paleis Bangkok Thailand bezoeken',
  },
  {
    id: 'ko5', cat: 'koningshuis', emoji: '🔶',
    title: 'De Chakri-dynastie',
    fact: 'Het huidige koningshuis heet de Chakri-dynastie, gesticht in 1782 door Rama I. Het is een van de langstlevende monarchieën van Azië.',
    detail: 'De Chakri-dynastie werd gesticht door generaal Chakri die de troon besteeg als Rama I na de val van Ayutthaya. Elk lid van de Chakri-dynastie draagt de bijnaam "Rama" gevolgd door een nummer. De dynasty\'s naam komt van het symbool van Vishnu: het chakra (wiel) en de tri (drietand). Het huidige symbool van het koningshuis – de Garuda – vertegenwoordigt de goddelijke legitimiteit van de koning. De Chakri-dag op 6 april is een nationale feestdag.',
    search: 'Chakri dynastye Thailand koningshuis',
  },
]

// ── Component ──────────────────────────────────────────────────────────────────

export default function TriviaScreen({ onBack }) {
  const [activeCats, setActiveCats]   = useState(new Set()) // leeg = alles
  const [index, setIndex]             = useState(0)
  const [showDetail, setShowDetail]   = useState(false)
  const [fade, setFade]               = useState(true)

  const pointerStart = useRef(null)

  const filtered = activeCats.size === 0
    ? TRIVIA
    : TRIVIA.filter(t => activeCats.has(t.cat))

  const safeIndex = Math.min(index, filtered.length - 1)
  const item = filtered[safeIndex] ?? filtered[0]

  // ── Navigation ──────────────────────────────────────────────────────────────

  const go = useCallback((dir) => {
    if (showDetail) return
    setFade(false)
    setTimeout(() => {
      setIndex(i => {
        const next = i + dir
        if (next < 0) return filtered.length - 1
        if (next >= filtered.length) return 0
        return next
      })
      setFade(true)
    }, 180)
  }, [showDetail, filtered.length])

  const toggleCategory = (key) => {
    setActiveCats(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
    setIndex(0)
    setFade(true)
  }

  // ── Swipe handling ──────────────────────────────────────────────────────────

  const onPointerDown = (e) => {
    pointerStart.current = { x: e.clientX, y: e.clientY }
  }

  const onPointerUp = (e) => {
    if (!pointerStart.current) return
    const dx = e.clientX - pointerStart.current.x
    const dy = e.clientY - pointerStart.current.y
    pointerStart.current = null
    const absDx = Math.abs(dx), absDy = Math.abs(dy)
    if (absDx < 20 && absDy < 20) return // tap, geen swipe

    if (showDetail) {
      // In detail: swipe links → terug
      if (dx < -50 && absDx > absDy) setShowDetail(false)
    } else {
      if (absDy > absDx) {
        // Verticaal: boven = volgende, beneden = vorige
        if (dy < -50) go(1)
        else if (dy > 50) go(-1)
      } else {
        // Horizontaal: rechts = detail
        if (dx > 50) setShowDetail(true)
      }
    }
  }

  // ── Google search link ──────────────────────────────────────────────────────

  const googleUrl = item
    ? 'https://www.google.com/search?q=' + encodeURIComponent(item.search)
    : '#'

  // ── Styles ──────────────────────────────────────────────────────────────────

  const bg = 'linear-gradient(160deg,#1a1a2e 0%,#16213e 100%)'
  const s  = { fontFamily: 'sans-serif', color: '#fff' }

  if (!item) return (
    <div style={{ ...s, minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
      <div style={{ color: 'rgba(255,255,255,0.5)' }}>Geen trivia in deze categorie.</div>
      <button onClick={onBack} style={{ marginTop: 24, padding: '10px 24px', borderRadius: 10, border: 'none', background: '#E8A020', color: '#000', fontWeight: 700, cursor: 'pointer' }}>← Terug</button>
    </div>
  )

  return (
    <div style={{ ...s, height: '100vh', background: bg, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', marginRight: 12 }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 18, flex: 1 }}>📚 Thailand Trivia</span>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{safeIndex + 1} / {filtered.length}</span>
      </div>

      {/* ── Categorie-filter ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', overflowX: 'auto', gap: 6, padding: '10px 14px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => { setActiveCats(new Set()); setIndex(0) }}
          style={{
            whiteSpace: 'nowrap', padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: activeCats.size === 0 ? '#E8A020' : 'rgba(255,255,255,0.1)',
            color: activeCats.size === 0 ? '#000' : '#fff',
          }}
        >
          Alles
        </button>
        {CATEGORIES.map(c => {
          const active = activeCats.has(c.key)
          return (
            <button key={c.key} onClick={() => toggleCategory(c.key)} style={{
              whiteSpace: 'nowrap', padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              background: active ? '#E8A020' : 'rgba(255,255,255,0.1)',
              color: active ? '#000' : '#fff',
            }}>
              {c.emoji} {c.label}
            </button>
          )
        })}
      </div>

      {/* ── Trivia kaart ────────────────────────────────────────────────────── */}
      <div
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', touchAction: 'none', userSelect: 'none', cursor: 'grab', position: 'relative' }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '20px 24px', gap: 16,
          opacity: fade ? 1 : 0, transition: 'opacity 0.18s ease',
        }}>

          {/* Categorie badge */}
          <div style={{ fontSize: 12, color: '#E8A020', background: 'rgba(232,160,32,0.15)', border: '1px solid rgba(232,160,32,0.3)', borderRadius: 20, padding: '4px 14px' }}>
            {CATEGORIES.find(c => c.key === item.cat)?.emoji} {CATEGORIES.find(c => c.key === item.cat)?.label}
          </div>

          {/* Groot emoji */}
          <div style={{ fontSize: 96, lineHeight: 1, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>
            {item.emoji}
          </div>

          {/* Titel */}
          <div style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>
            {item.title}
          </div>

          {/* Feit */}
          <div style={{ fontSize: 15, lineHeight: 1.7, textAlign: 'center', color: 'rgba(255,255,255,0.85)', maxWidth: 360 }}>
            {item.fact}
          </div>
        </div>

        {/* Swipe-hints */}
        <div style={{ padding: '0 24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
            ↑ volgende<br />↓ vorige
          </div>
          <button
            onPointerDown={e => e.stopPropagation()}
            onPointerUp={e => e.stopPropagation()}
            onClick={() => setShowDetail(true)}
            style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: 'rgba(232,160,32,0.2)', color: '#E8A020', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Meer info →
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onPointerDown={e=>e.stopPropagation()} onPointerUp={e=>e.stopPropagation()} onClick={()=>go(-1)}
              style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 18, cursor: 'pointer' }}>↑</button>
            <button onPointerDown={e=>e.stopPropagation()} onPointerUp={e=>e.stopPropagation()} onClick={()=>go(1)}
              style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 18, cursor: 'pointer' }}>↓</button>
          </div>
        </div>
      </div>

      {/* ── Detail panel (slides in from right) ─────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(160deg,#0f0f23 0%,#1a1a3e 100%)',
        transform: showDetail ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column', zIndex: 10,
        touchAction: 'pan-y',
      }}>
        {/* Detail header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
          <button onClick={() => setShowDetail(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', marginRight: 12 }}>←</button>
          <span style={{ fontWeight: 700, fontSize: 16, flex: 1 }}>{item.title}</span>
        </div>

        {/* Detail inhoud */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 80, lineHeight: 1 }}>{item.emoji}</div>
          </div>

          <div style={{ background: 'rgba(232,160,32,0.1)', border: '1px solid rgba(232,160,32,0.25)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 13, color: '#E8A020', fontWeight: 700, marginBottom: 6 }}>
              {CATEGORIES.find(c => c.key === item.cat)?.emoji} {CATEGORIES.find(c => c.key === item.cat)?.label}
            </div>
            <div style={{ fontSize: 15, fontStyle: 'italic', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
              {item.fact}
            </div>
          </div>

          <div style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.85)' }}>
            {item.detail}
          </div>

          {/* Google zoeklink */}
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
              background: 'rgba(66,133,244,0.15)', border: '1px solid rgba(66,133,244,0.35)',
              borderRadius: 12, color: '#7BB3F8', textDecoration: 'none', fontWeight: 600, fontSize: 14,
            }}
          >
            <span style={{ fontSize: 24 }}>🔍</span>
            <div>
              <div>Zoek meer op Google</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>{item.search}</div>
            </div>
          </a>

          <div style={{ height: 8 }} />
        </div>
      </div>
    </div>
  )
}

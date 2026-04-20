// ── Bangkok Quiz Game ──────────────────────────────────────────────────────
var QUIZ_QUESTIONS = [
    { e:'🏙️', q:'Hoe heet de hoofdstad van Thailand?',
      a:['Bangkok','Phuket','Chiang Mai','Pattaya'], c:0 },
    { e:'🐘', q:'Welk dier is hét symbool van Thailand?',
      a:['Olifant','Tijger','Draak','Aap'], c:0 },
    { e:'👋', q:'Hoe zeg je "hallo" in het Thais?',
      a:['Sawasdee','Bonjour','Konnichiwa','Hola'], c:0 },
    { e:'🌊', q:'Hoe heet de grote rivier die door Bangkok stroomt?',
      a:['Chao Phraya','Mekong','Nijl','Yangtze'], c:0 },
    { e:'🛺', q:'Wat is een tuk-tuk?',
      a:['Een driewielige taxi','Een Thais gerecht','Een heilige tempel','Een muziekinstrument'], c:0 },
    { e:'🍜', q:'Hoe heet het beroemde Thaise noedelgerecht?',
      a:['Pad Thai','Sushi','Pizza','Paella'], c:0 },
    { e:'💰', q:'Hoe heet het geld in Thailand?',
      a:['Baht','Euro','Dollar','Yen'], c:0 },
    { e:'🙏', q:'Welke godsdienst heeft Thailand de meeste mensen?',
      a:['Boeddhisme','Islam','Christendom','Hindoeïsme'], c:0 },
    { e:'🌉', q:'Welke beroemde brug staat in Kanchanaburi?',
      a:['De Rivier Kwai brug','De Gouden Poort','De Erasmusbrug','Tower Bridge'], c:0 },
    { e:'🌿', q:'Hoe oud is het regenwoud van Khao Sok?',
      a:['160 miljoen jaar','1.000 jaar','10 miljoen jaar','5.000 jaar'], c:0 },
    { e:'🏖️', q:'Hoeveel dagen bleven jullie op Koh Samui?',
      a:['6 dagen','2 dagen','10 dagen','1 dag'], c:0 },
    { e:'⭐', q:'Wat zie je \'s nachts weerspiegeld in het Cheow Lan meer?',
      a:['De sterren','De zon','Vuurtorens','Haaien'], c:0 },
    { e:'🏯', q:'Hoe heet het paleis van de Thaise koning in Bangkok?',
      a:['Grand Palace','Buckingham Palace','Versailles','Kasteel de Haar'], c:0 },
    { e:'🐒', q:'Hoe heten de apen in het regenwoud van Khao Sok?',
      a:['Gibbons','Gorilla\'s','Chimpansees','Baboons'], c:0 },
    { e:'🌺', q:'Welke kleuren heeft de Thaise vlag?',
      a:['Rood, wit en blauw','Groen en geel','Zwart en goud','Paars en wit'], c:0 },
    { e:'🌴', q:'Welke boom groeit er veel op Thaise stranden?',
      a:['Palmboom','Eikenboom','Beukenboom','Dennenboom'], c:0 },
    { e:'🍌', q:'Welk tropisch fruit eet je het meest in Thailand?',
      a:['Mango','Appel','Peer','Aardbeien'], c:0 },
    { e:'🐟', q:'Wat zie je als je snorkelt bij Koh Samui?',
      a:['Kleurrijke tropische vissen','IJsberen','Walvissen','Pinguïns'], c:0 },
    { e:'🏝️', q:'Wat betekent "Koh" in het Thais?',
      a:['Eiland','Tempel','Berg','Rivier'], c:0 },
    { e:'🌍', q:'In welk werelddeel ligt Thailand?',
      a:['Azië','Afrika','Europa','Amerika'], c:0 },
    { e:'🥥', q:'Wat zit er in een verse kokosnoot?',
      a:['Zoet water','Koemelk','Limonade','Thee'], c:0 },
    { e:'🌸', q:'Welke bloem ruikt naar rottend vlees maar ziet er prachtig uit?',
      a:['Rafflesia','Zonnebloem','Roos','Tulp'], c:0 },
    { e:'🚂', q:'Hoe laat vertrok jullie nachttrein vanuit Bangkok?',
      a:['19:50 uur','08:00 uur','12:00 uur','23:00 uur'], c:0 },
    { e:'👨‍👩‍👧‍👦', q:'Hoeveel inwoners heeft Bangkok (ongeveer)?',
      a:['10 miljoen','1 miljoen','100 miljoen','100.000'], c:0 },
    { e:'🛕', q:'Hoe heet de tempel met de reusachtige liggende Boeddha?',
      a:['Wat Pho','Wat Arun','Wat Chalong','Gouden Pagode'], c:0 },
    { e:'✨', q:'Hoe noem je lichtgevende wezentjes in het donkere water?',
      a:['Bioluminescentie','Radioactiviteit','Zonneenergie','Neonlicht'], c:0 },
    { e:'🛶', q:'Hoe heet de traditionele smalle boot met een lange motor?',
      a:['Longtailboot','Gondel','Roeiboot','Catamaran'], c:0 },
    { e:'🍚', q:'Wat eet je bij bijna elk Thais gerecht?',
      a:['Rijst','Brood','Patat','Pasta'], c:0 },
    { e:'⛵', q:'Hoe heet de zee aan de oostkant van het Thaise schiereiland?',
      a:['Golf van Thailand','Stille Oceaan','Noordzee','Middellandse Zee'], c:0 },
    { e:'🗺️', q:'Welk land grenst NIET aan Thailand?',
      a:['Japan','Myanmar','Laos','Cambodja'], c:0 },
    { e:'🎒', q:'Wat is de grootste markt in Bangkok?',
      a:['Chatuchak (15.000 kraampjes!)','IKEA','Jumbo','Aldi'], c:0 },
    { e:'🏄', q:'Hoe noem je zwemmen met een masker en adembuisje?',
      a:['Snorkelen','Duiken','Surfen','Waterpolo'], c:0 },
    { e:'🐘', q:'Hoe oud kunnen olifanten maximaal worden?',
      a:['70 jaar','5 jaar','150 jaar','10 jaar'], c:0 },
    { e:'🌿', q:'Hoe heet het grote meer midden in Khao Sok?',
      a:['Cheow Lan meer','Samui meer','Kwai meer','Bangkok meer'], c:0 },
    { e:'🍽️', q:'Wat is "street food"?',
      a:['Eten kopen bij kraampjes op straat','Eten van de grond','Vliegtuigmaaltijd','Schoollunch'], c:0 },
    { e:'🏛️', q:'Hoe heet de bekende straat in Bangkok voor toeristen?',
      a:['Khao San Road','Damrak','Baker Street','Champs-Élysées'], c:0 },
    { e:'🌺', q:'Hoe zeg je "dank je wel" in het Thais?',
      a:['Khob khun','Merci','Gracias','Arigatou'], c:0 },
    { e:'😎', q:'Wat betekent "mai pen rai" in het Thais?',
      a:['Geen probleem!','Help!','Goedenacht!','Lekker!'], c:0 },
    { e:'🦜', q:'Hoe zijn veel tropische vogels in Thailand gekleed?',
      a:['Fel van kleur: rood, groen, blauw!','Zwart en wit','Grijs','Bruin'], c:0 },
    { e:'🏖️', q:'Welke kleur heeft het zand op de stranden van Koh Samui?',
      a:['Wit zand','Zwart zand','Rood zand','Paars zand'], c:0 },
    { e:'🐊', q:'Welk gevaarlijk reptiel leeft in Thaise rivieren?',
      a:['Krokodil','Kameleon','Hagedis','Schildpad'], c:0 },
    { e:'🌴', q:'Wat hangt er ook in het oerwoud, naast bomen?',
      a:['Lianen (slingerplanten)','Cactussen','Sneeuwvlokken','Lampen'], c:0 },
    { e:'🦋', q:'Hoeveel eilanden heeft Thailand (ongeveer)?',
      a:['Meer dan 1.400!','10','3','100.000'], c:0 },
    { e:'🛖', q:'Hoe noemde jullie het drijvende huisje op de rivier Kwai?',
      a:['Vlotterij','Boomhut','Tent','Iglo'], c:0 },
    { e:'🎭', q:'Hoe heet de traditionele Thaise dans met sierlijke handbewegingen?',
      a:['Khon','Ballet','Flamenco','Salsa'], c:0 },
    { e:'🌙', q:'Wat maakten jullie midden in de nacht op de trein?',
      a:['Slapend een reis naar het zuiden','Een kaartspel','Een wedstrijd','Een film'], c:0 },
    { e:'🦅', q:'Welke grote vogel soort is indrukwekkend in het Khao Sok oerwoud?',
      a:['Hoornvogel (grote oranje snavel!)','Pinguïn','Struisvogel','Flamingo'], c:0 },
    { e:'🌟', q:'Welke kleur heeft een gouden tempel in Thailand?',
      a:['Goud en rood','Blauw en wit','Groen en paars','Roze en geel'], c:0 },
    { e:'🏆', q:'Wat vonden jullie het allerleukst aan Thailand?',
      a:['Alles was geweldig!','Niets','Alleen het vliegtuig','Alleen het hotel'], c:0 },
    { e:'🗺️', q:'Hoe heet Bangkok in het officieel Thais (de langste stadsnaam ter wereld!)?',
      a:['Krung Thep Maha Nakhon','Bangkok City','Siam Town','Thai Capital'], c:0 },

    // ── 200 nieuwe vragen ────────────────────────────────────────────────────

    // Thaise geografie
    { e:'🏔️', q:'Hoe heet de hoogste berg van Thailand?',
      a:['Doi Inthanon','Doi Suthep','Khao Luang','Phu Kradung'], c:0 },
    { e:'🌊', q:'Welke zee ligt aan de westkant van Thailand (richting Myanmar)?',
      a:['Andamanezee','Golf van Thailand','Indische Oceaan','Stille Oceaan'], c:0 },
    { e:'🗺️', q:'Hoeveel provincies heeft Thailand?',
      a:['77','10','50','120'], c:0 },
    { e:'🌏', q:'Wat is de op één na grootste stad van Thailand?',
      a:['Chiang Mai','Phuket','Pattaya','Ayutthaya'], c:0 },
    { e:'🏞️', q:'In welke provincie ligt het nationale park Khao Sok?',
      a:['Surat Thani','Chiang Mai','Bangkok','Kanchanaburi'], c:0 },
    { e:'🌊', q:'Hoe heet de grote rivier die van noord naar bangkok stroomt?',
      a:['Chao Phraya','Mekong','Irrawaddy','Salween'], c:0 },
    { e:'🏝️', q:'Welke eilandengroep hoort bij het nationale park Ang Thong?',
      a:['42 eilanden in de Golf van Thailand','3 eilanden in de Andamanezee','10 eilanden bij Phuket','5 eilanden bij Pattaya'], c:0 },
    { e:'🗺️', q:'Welke grote rivier vormt de grens tussen Thailand en Laos?',
      a:['De Mekong','De Chao Phraya','De Irrawaddy','De Salween'], c:0 },
    { e:'🌏', q:'Hoe noem je het lange dunne stuk land van Thailand dat naar het zuiden uitsteekt?',
      a:['Het Thaise schiereiland','De Thaise arm','De Thaise staart','De Thaise vinger'], c:0 },
    { e:'🏔️', q:'In welk deel van Thailand liggen de meeste bergen?',
      a:['Het noorden','Het zuiden','Het oosten','Het midden'], c:0 },
    { e:'🗺️', q:'Welk land grenst aan de noordkant van Thailand?',
      a:['Myanmar en Laos','China','Vietnam','Cambodja'], c:0 },
    { e:'🌊', q:'Hoe heet het meer midden in Khao Sok dat gemaakt werd door een dam?',
      a:['Cheow Lan meer','Songkhla meer','Bueng Boraphet','Kwan Phayao'], c:0 },
    { e:'🏝️', q:'Koh Samui ligt in welke zee?',
      a:['Golf van Thailand','Andamanezee','Javazee','Arabische Zee'], c:0 },
    { e:'🗺️', q:'Hoe groot is Thailand vergeleken met Nederland?',
      a:['Ongeveer 14 keer zo groot','Even groot','2 keer zo groot','50 keer zo groot'], c:0 },
    { e:'🌏', q:'Wat was vroeger de naam van Thailand?',
      a:['Siam','Indochina','Birma','Malaya'], c:0 },

    // Thaise dieren
    { e:'🐘', q:'Hoeveel kilo kan een volwassen Aziatische olifant wegen?',
      a:['Wel 5.000 kilo!','100 kilo','500 kilo','50.000 kilo'], c:0 },
    { e:'🐯', q:'Welke grote kat leeft er in de jungles van Thailand?',
      a:['Tijger','Leeuw','Cheeta','Jaguar'], c:0 },
    { e:'🦎', q:'Hoe heet de grote hagedis die je in Bangkok en in parken ziet?',
      a:['Varaan','Kameleon','Gekko','Iguana'], c:0 },
    { e:'🐢', q:'Welke schildpad legt eieren op de Thaise stranden?',
      a:['Zeeschildpad','Landschildpad','Beekschildpad','Reuzen schildpad'], c:0 },
    { e:'🦜', q:'Hoe heet de grote toekanachtige vogel met een hoorn op zijn snavel?',
      a:['Hoornvogel','Toekan','Papegaai','Kaketoe'], c:0 },
    { e:'🐍', q:'Hoe heet de langste gifslang ter wereld die ook in Thailand leeft?',
      a:['Koningsco bra','Python','Anaconda','Ratelslang'], c:0 },
    { e:'🐒', q:'Welk klein nachtelijk aapje heeft enorm grote ogen?',
      a:['Langzame loris','Gibbon','Makaak','Orang-oetan'], c:0 },
    { e:'🐆', q:'Welke gevlekte kat leeft er in het oerwoud van Thailand?',
      a:['Luipaard','Tijger','Jachtluipaard','Ocelot'], c:0 },
    { e:'🦛', q:'Welk groot zoogdier lijkt op een klein nijlpaard maar leeft in het Thaise woud?',
      a:['Tapir','Neushoorn','Waterbuffel','Babirusa'], c:0 },
    { e:'🐘', q:'Hoeveel oren heeft een Aziatische olifant vergeleken met een Afrikaanse?',
      a:['Kleinere oren','Grotere oren','Dezelfde oren','Geen oren'], c:0 },
    { e:'🦟', q:'Welk klein insect kan in Thailand malaria overdragen?',
      a:['Mug','Vlieg','Bij','Kever'], c:0 },
    { e:'🐟', q:'Hoe heten de kleine vissen die graag dode huid van je voeten eten bij Thai massage?',
      a:['Doktersvissen','Piranha\'s','Goudvissen','Snoeken'], c:0 },
    { e:'🦋', q:'Waarom zijn gibbons goed in bewegen door de boom?',
      a:['Ze slingeren met hun lange armen','Ze vliegen','Ze zwemmen','Ze graven tunnels'], c:0 },
    { e:'🐊', q:'Hoe oud kan een krokodil worden?',
      a:['Wel 70 jaar','5 jaar','1 jaar','200 jaar'], c:0 },
    { e:'🦈', q:'Welke vriendelijke grote haai zwemt soms langs Thaise kust?',
      a:['Walvishaai','Witte haai','Tijgerhaai','Hamerkophaai'], c:0 },
    { e:'🐍', q:'Hoe beschermt de koningscobra zijn nest?',
      a:['Hij bijt indringers met giftige tanden','Hij schreeuwt heel hard','Hij versopt zich','Hij bouwt een muur'], c:0 },

    // Thai eten
    { e:'🍜', q:'Wat zijn de hoofdingrediënten van pad thai?',
      a:['Rijstnoedels, ei en pinda\'s','Spaghetti en kaas','Brood en boter','Rijst en appel'], c:0 },
    { e:'🍛', q:'Hoe heet de Thaise soep met citroengras en kokosmelk?',
      a:['Tom kha gai','Tom yum','Pad thai','Khao pad'], c:0 },
    { e:'🍹', q:'Wat is "Thai iced tea"?',
      a:['Sterke oranje thee met gecondenseerde melk en ijs','Gewone thee met suiker','Groene thee zonder melk','Vruchtenthee'], c:0 },
    { e:'🥭', q:'Hoe eet je mango sticky rice?',
      a:['Rijpe mango met kleverige rijst en kokossaus','Mango met brood','Mango in een soep','Gedroogde mango'], c:0 },
    { e:'🥜', q:'Wat is satay?',
      a:['Gegrild vlees op een stokje met pindausaus','Een Thaise soep','Gebakken rijst','Een dessert'], c:0 },
    { e:'🌶️', q:'Hoe heet de frisse salade van groene papaja?',
      a:['Som tam','Pad thai','Tom yum','Khao niao'], c:0 },
    { e:'🍦', q:'Wat is een populair Thais ijs op het strand?',
      a:['Kokosijs in een kokosschaal','Aardbeienijs','Chocoladeijs','Vanilleijs'], c:0 },
    { e:'🍈', q:'Hoe noem je het stekelige fruit dat vreselijk stinkt maar erg populair is in Thailand?',
      a:['Durian','Papaya','Mango','Rambutan'], c:0 },
    { e:'🌿', q:'Welk groen kruid ruikt lekker in Thaise soepen?',
      a:['Citroengras','Munt','Basilicum','Peterselie'], c:0 },
    { e:'🍜', q:'Hoe heet de pittige Thaise soep met garnalen en citroengras?',
      a:['Tom yum','Pad thai','Tom kha','Khao pad'], c:0 },
    { e:'🍛', q:'Welke kleur heeft groene curry?',
      a:['Groen, van groene pepers','Rood','Geel','Oranje'], c:0 },
    { e:'🥥', q:'Van welk fruit wordt kokosmelk gemaakt?',
      a:['Kokosnoot','Aardnoot','Walnoot','Hazelnoot'], c:0 },
    { e:'🍌', q:'Hoe eet je een banaan in Thailand die gekookt wordt verkocht?',
      a:['Gebakken banaan op een stokje','Rauw','In een soep','Gedroogd'], c:0 },
    { e:'🍚', q:'Hoe heet gebakken rijst met groenten en vlees in het Thais?',
      a:['Khao pad','Pad thai','Tom yum','Satay'], c:0 },
    { e:'🌶️', q:'Waarom is Thais eten vaak zo pittig?',
      a:['Door de verse chilipepers die ze gebruiken','Door veel zout','Door kokosmelk','Door citroensap'], c:0 },

    // Kanchanaburi
    { e:'🌉', q:'Waarom is de brug over de rivier de Kwai beroemd?',
      a:['Gebouwd door krijgsgevangenen in WOII','Langste brug ter wereld','Gemaakt van goud','Oudste brug van Azië'], c:0 },
    { e:'🚂', q:'Hoe heet de spoorlijn die langs de Kwai loopt?',
      a:['Death Railway (Dodenspoorlijn)','Orient Express','Bullet Train','Thai Railways'], c:0 },
    { e:'⚔️', q:'Tijdens welke oorlog werd de brug over de Kwai gebouwd?',
      a:['Tweede Wereldoorlog','Eerste Wereldoorlog','Vietnamoorlog','Koude Oorlog'], c:0 },
    { e:'🌿', q:'Wat is het Erawan nationaal park bij Kanchanaburi bekend om?',
      a:['Mooie smaragdgroene watervallen','Hoge bergen','Witte stranden','Vulkanen'], c:0 },
    { e:'🦁', q:'Hoe heette de tempel bij Kanchanaburi waar tijgers liepen?',
      a:['Tiger Temple (Tempel van de Tijger)','Gouden Tempel','Boeddha Tempel','Tijger Park'], c:0 },
    { e:'🛖', q:'Hoe sliepen jullie in Kanchanaburi op het water?',
      a:['In een vlotterhuis op de rivier Kwai','In een tent','In een hotel','Op een boot'], c:0 },
    { e:'🏛️', q:'Wat herdenkt het JEATH museum in Kanchanaburi?',
      a:['Krijgsgevangenen die de Death Railway bouwden','Thaise koningen','De Tweede Wereldoorlog in Europa','Beroemde ontdekkingsreizigers'], c:0 },
    { e:'🌊', q:'Welke rivier stroomt door Kanchanaburi?',
      a:['De Kwai','De Chao Phraya','De Mekong','De Ping'], c:0 },
    { e:'🌿', q:'Welk type bos groeit er langs de Kwai rivier?',
      a:['Tropisch regenwoud','Naaldbos','Berkenbos','Savanne'], c:0 },
    { e:'🚂', q:'Hoeveel arbeiders stierven er bij de bouw van de Death Railway?',
      a:['Meer dan 100.000','Tien','Honderd','Een miljoen'], c:0 },

    // Khao Sok
    { e:'🌿', q:'Wat maakt Khao Sok zo bijzonder vergeleken met de Amazone?',
      a:['Het is ouder: 160 miljoen jaar oud!','Het is groter','Het heeft meer water','Er leven meer dieren'], c:0 },
    { e:'🌸', q:'Hoe groot kan de rafflesia bloem worden?',
      a:['Wel 1 meter breed!','5 centimeter','10 centimeter','2 meter breed'], c:0 },
    { e:'🐒', q:'Hoe communiceren gibbons met andere gibbons ver weg?',
      a:['Ze roepen heel hard (hooting)','Ze sturen berichten','Ze gebruiken rook signalen','Ze tikken op bomen'], c:0 },
    { e:'🌿', q:'Wat is de rafflesia eigenlijk als je het bekijkt?',
      a:['Een parasiet op andere planten','Een boom','Een mos','Een paddenstoel'], c:0 },
    { e:'🦜', q:'Welke grote dier eet in Khao Sok aan de bomen?',
      a:['Olifanten die boomschors afschrapen','Gibbons die vissen eten','Tijgers die honing eten','Tapirs die vogels eten'], c:0 },
    { e:'🌙', q:'Wat maakte jullie nachtelijke boottocht op Cheow Lan speciaal?',
      a:['Het gloeiende plankton in het water','De haaien','De vuurvliegjes op het land','De vallende sterren'], c:0 },
    { e:'🏕️', q:'Hoe noemde men de huizen op het meer van Cheow Lan?',
      a:['Vlotterijen of raft houses','Boomhutten','Tenten','Palmboom huizen'], c:0 },
    { e:'🚣', q:'Welk avontuur deden jullie in een grot bij Cheow Lan?',
      a:['Kano\'en door een grot','Zwemmen met haaien','Klimmen','Duiken'], c:0 },
    { e:'🌿', q:'Hoe lang is Khao Sok nationaal park in Thailand al beschermd?',
      a:['Sinds 1980','Sinds 1900','Sinds 2000','Sinds 1950'], c:0 },
    { e:'🌿', q:'Welk groot zoogdier zie je soms aan het meer van Cheow Lan drinken?',
      a:['Olifanten','Tijgers','Gorilla\'s','Neushoorns'], c:0 },

    // Koh Samui
    { e:'🏖️', q:'Hoe heet het drukste strand op Koh Samui?',
      a:['Chaweng Beach','Lamai Beach','Mae Nam Beach','Bophut Beach'], c:0 },
    { e:'🌴', q:'Waarvoor staat Koh Samui vroeger het meest bekend?',
      a:['Kokosnoot export','Toerisme','Visvangst','Rijstteelt'], c:0 },
    { e:'🎉', q:'Hoe heet het beroemde feest elke maand op het strand bij volle maan?',
      a:['Full Moon Party','Songkran','Loy Krathong','New Year Party'], c:0 },
    { e:'🏝️', q:'Welk nationaal park met 42 eilandjes ligt vlak bij Koh Samui?',
      a:['Ang Thong Nationaal Park','Khao Sok','Erawan','Doi Inthanon'], c:0 },
    { e:'🐠', q:'Welke zeedieren kun je zien bij het snorkelen rond Koh Samui?',
      a:['Kleurrijke vissen, koraal en zeeschildpadden','IJsberen en walrussen','Pinguïns','Haaien en krokodillen'], c:0 },
    { e:'🥥', q:'Welk dier helpt soms bij het plukken van kokosnoten op Samui?',
      a:['Getrainde makaak aap','Olifant','Papegaai','Reuzenschildpad'], c:0 },
    { e:'🌅', q:'Aan welke zee ligt Koh Samui?',
      a:['Golf van Thailand','Andamanezee','Rode Zee','Zwarte Zee'], c:0 },
    { e:'🚤', q:'Hoe kom je van de Thaise kust naar Koh Samui?',
      a:['Per veerboot of vliegtuig','Per trein','Te voet','Per tuk-tuk'], c:0 },
    { e:'🌺', q:'Welke grote Boeddha zit er op een heuvel op Koh Samui?',
      a:['De Big Buddha (Phra Yai)','De Liggende Boeddha','De Gouden Boeddha','De Jade Boeddha'], c:0 },
    { e:'🌊', q:'Wat zijn de mooie blauwe meren midden in Ang Thong park?',
      a:['Kratermeren omringd door kalkstenen kliffen','Kunstmatige vijvers','Lagunes bij het strand','Overstromingsvlaktes'], c:0 },

    // Bangkok bezienswaardigheden
    { e:'🏯', q:'Hoeveel hectare beslaat het Grand Palace complex in Bangkok?',
      a:['Meer dan 21 hectare','1 hectare','100 hectare','500 hectare'], c:0 },
    { e:'🛕', q:'Hoe heet de tempel van de Dageraad in Bangkok?',
      a:['Wat Arun','Wat Pho','Wat Phra Kaew','Wat Saket'], c:0 },
    { e:'🧘', q:'Hoe lang is de liggende Boeddha in Wat Pho?',
      a:['46 meter lang','5 meter lang','100 meter lang','10 meter lang'], c:0 },
    { e:'🛕', q:'Van welk materiaal zijn de spiegeltjes gemaakt die Wat Arun versieren?',
      a:['Chinese porseleinen scherven','Goud','Glas','Edelstenen'], c:0 },
    { e:'🚤', q:'Hoe ga je van tempel naar tempel langs de Chao Phraya in Bangkok?',
      a:['Met een waterbus of longtailboot','Per tuk-tuk','Per fiets','Te voet op drijvende steigers'], c:0 },
    { e:'🛒', q:'Hoe groot is de Chatuchak markt in Bangkok?',
      a:['15.000 kraampjes op 35 hectare!','100 kraampjes','500 kraampjes','5.000 kraampjes'], c:0 },
    { e:'🌊', q:'Hoe heet de drijvende markt vlak bij Bangkok?',
      a:['Damnoen Saduak','Chatuchak','Khao San','Chinatown'], c:0 },
    { e:'🏛️', q:'Welke beroemde smaragden Boeddha staat in het Grand Palace?',
      a:['De Smaragden Boeddha (Phra Kaew)','De Gouden Boeddha','De Zilveren Boeddha','De Jade Boeddha'], c:0 },
    { e:'🌃', q:'Hoe heet de hoge uitkijktoren in Bangkok?',
      a:['Baiyoke Tower','Grand Tower','Bangkok Sky','Chao Phraya Tower'], c:0 },
    { e:'🐘', q:'Wat is het "olifanten museum" in Bangkok eigenlijk?',
      a:['De MUSEA laten zien hoe olifanten vroeger werden ingezet','Een dierentuin','Een circus','Een speeltuin'], c:0 },

    // Thaise taal
    { e:'🔢', q:'Hoe zeg je "één" in het Thais?',
      a:['Neung','Song','Sam','Si'], c:0 },
    { e:'🔢', q:'Hoe zeg je "twee" in het Thais?',
      a:['Song','Neung','Sam','Ha'], c:0 },
    { e:'🔢', q:'Hoe zeg je "drie" in het Thais?',
      a:['Sam','Si','Ha','Neung'], c:0 },
    { e:'🔢', q:'Hoe zeg je "vier" in het Thais?',
      a:['Si','Sam','Ha','Song'], c:0 },
    { e:'🔢', q:'Hoe zeg je "vijf" in het Thais?',
      a:['Ha','Si','Sam','Song'], c:0 },
    { e:'😴', q:'Hoe zeg je "goedenacht" in het Thais?',
      a:['Ratri sawat','Sawasdee','Khob khun','Mai pen rai'], c:0 },
    { e:'🍽️', q:'Hoe zeg je "heerlijk/lekker" in het Thais?',
      a:['Aroy','Sawasdee','Khob khun','Mai pen rai'], c:0 },
    { e:'💰', q:'Hoe zeg je "hoeveel kost dat?" in het Thais?',
      a:['Tao rai?','Sawasdee?','Khob khun?','Aroy?'], c:0 },
    { e:'🤔', q:'Wat betekent "farang" in het Thais?',
      a:['Buitenlander (vriendelijk woord)','Vreemdeling','Toerist','Hollander'], c:0 },
    { e:'🐘', q:'Hoe zeg je "olifant" in het Thais?',
      a:['Chang','Pak','Nok','Pla'], c:0 },
    { e:'🐟', q:'Hoe zeg je "vis" in het Thais?',
      a:['Pla','Chang','Nok','Pak'], c:0 },
    { e:'🐦', q:'Hoe zeg je "vogel" in het Thais?',
      a:['Nok','Pla','Chang','Moo'], c:0 },
    { e:'🐷', q:'Hoe zeg je "varken" in het Thais?',
      a:['Moo','Nok','Pla','Chang'], c:0 },
    { e:'🙏', q:'Wat betekent de "wai" groet in Thailand?',
      a:['Respect betuigen door je handen samen te vouwen','Hallo zeggen met je hand','Dag zeggen met een kus','Bedanken met een buiging'], c:0 },
    { e:'😂', q:'Waarom schrijven Thais soms "555" als ze lachen online?',
      a:['Omdat "5" in het Thais "ha" klinkt en 555 = hahaha!','Omdat 5 hun geluksgetal is','Het is een geheime code','Omdat 555 "veel plezier" betekent'], c:0 },

    // Thaise cultuur
    { e:'💦', q:'Hoe heet het Thaise nieuwjaarsfestival waarbij iedereen water gooit?',
      a:['Songkran','Loy Krathong','Thetsakan','Phi Ta Khon'], c:0 },
    { e:'🏮', q:'Hoe heet het festival waarbij Thais lichtjes op water laten drijven?',
      a:['Loy Krathong','Songkran','Diwali','Lantern Festival'], c:0 },
    { e:'🛕', q:'Hoe heet een klein tempeltje dat Thais in hun tuin zetten voor de geesten?',
      a:['Geestenhuis (spirit house)','Bloementempel','Miniatuurpagode','Boeddhakastje'], c:0 },
    { e:'🧡', q:'Welke kleur draagt de Thaise koning?',
      a:['Geel','Blauw','Rood','Groen'], c:0 },
    { e:'👑', q:'Hoe heet de huidige Thaise koning?',
      a:['Vajiralongkorn (Rama X)','Bhumibol (Rama IX)','Chulalongkorn','Mongkut'], c:0 },
    { e:'🙏', q:'Hoe moet je omgaan met de voeten in Thailand?',
      a:['Nooit met je voeten naar een Boeddha of persoon wijzen','Je voeten altijd wassen voor je een tempel ingaat','Schoenen aandoen in tempels','Blootsvoets op straat lopen'], c:0 },
    { e:'🎭', q:'Hoe heten de kleurrijke maskers die gedragen worden bij Thais theater?',
      a:['Khon maskers','Wai maskers','Muay maskers','Thai maskers'], c:0 },
    { e:'🌺', q:'Welke bloem zie je overal in Thailand als sieraad en offer?',
      a:['Jasmijn en lotus','Tulp en roos','Zonnebloem en madeliefje','Orchidee en anjer'], c:0 },
    { e:'🎵', q:'Hoe noem je de traditionele Thaise muziek met houten percussie?',
      a:['Piphat muziek','Gamelan','Samba','Flamenco'], c:0 },
    { e:'🛕', q:'Hoeveel boeddhistische tempels zijn er (ongeveer) in Thailand?',
      a:['Meer dan 40.000','Honderd','Duizend','Tienduizend'], c:0 },
    { e:'🧘', q:'Wat dragen boeddhistische monniken in Thailand?',
      a:['Oranje gewaden','Witte gewaden','Blauwe gewaden','Zwarte gewaden'], c:0 },
    { e:'🌅', q:'Wanneer vieren Thais Songkran (Thais Nieuwjaar)?',
      a:['In april','In januari','In december','In juni'], c:0 },
    { e:'🎋', q:'Wat leggen Thais in een krathong (voor Loy Krathong)?',
      a:['Bloemen, kaarsen en wierook','Voedsel en fruit','Geld en cadeaus','Foto\'s en brieven'], c:0 },

    // Thaise geschiedenis
    { e:'👑', q:'In welk jaar veranderde Siam van naam in Thailand?',
      a:['1939','1900','1850','1975'], c:0 },
    { e:'🏛️', q:'Hoe heet de oude koninklijke hoofdstad vóór Bangkok?',
      a:['Ayutthaya','Chiang Mai','Sukhothai','Lopburi'], c:0 },
    { e:'⚔️', q:'Thailand is bijzonder omdat het als enige land in Zuidoost-Azië nooit...?',
      a:['Gekoloniseerd is door Europeanen','Oorlog heeft gehad','Een koning heeft gehad','Eilanden heeft'], c:0 },
    { e:'🏯', q:'Wanneer werd het Grand Palace in Bangkok gebouwd?',
      a:['In 1782','In 1900','In 1500','In 1200'], c:0 },
    { e:'👑', q:'Hoe lang was Bhumibol Adulyadej (Rama IX) koning van Thailand?',
      a:['70 jaar (1946-2016)','10 jaar','25 jaar','50 jaar'], c:0 },
    { e:'🏛️', q:'Hoe oud is de stad Ayutthaya (de oude hoofdstad)?',
      a:['Meer dan 600 jaar','100 jaar','1.000 jaar','2.000 jaar'], c:0 },
    { e:'🌉', q:'In welk jaar werd de brug over de Kwai gebouwd door krijgsgevangenen?',
      a:['1943','1945','1939','1950'], c:0 },
    { e:'🏯', q:'Wat betekent de naam "Thailand"?',
      a:['Land van de Vrijen','Land van de Olifanten','Land van de Gouden Tempels','Land van de Glimlachen'], c:0 },
    { e:'👑', q:'Hoe heet de eerste koning van de moderne Thaise staat (Chakri-dynastie)?',
      a:['Rama I','Rama IX','Bhumibol','Taksin'], c:0 },

    // Natuur feiten
    { e:'🌿', q:'Hoe noem je een bos dat het hele jaar door groen blijft?',
      a:['Regenwoud (tropisch)','Naaldbos','Loofbos','Savannebos'], c:0 },
    { e:'✨', q:'Welk klein levend organisme zorgt voor het gloeiende licht in het meer?',
      a:['Bioluminescente plankton (fytoplankton)','Elektrische alen','Vuurvliegjes','Radioactieve vissen'], c:0 },
    { e:'🌊', q:'Wat zijn koraalriffen eigenlijk?',
      a:['Kleine dieren (poliepen) die samen een rif bouwen','Stenen op de zeebodem','Zeeplanten','Zandbanken'], c:0 },
    { e:'🌿', q:'Hoe heet het bos dat bij eb en vloed onder water staat?',
      a:['Mangrovebos','Regenwoud','Naaldbos','Bamboebos'], c:0 },
    { e:'☔', q:'Hoe heet het seizoen in Thailand met heel veel regen?',
      a:['Moesson','Winter','Zomer','Droog seizoen'], c:0 },
    { e:'🌺', q:'Waarom stinkt de rafflesia zo vreselijk?',
      a:['Om insecten aan te lokken voor bestuiving','Om vijanden weg te jagen','Om water vast te houden','Om zaden te verspreiden'], c:0 },
    { e:'🌊', q:'Waaruit bestaat een koraalrif eigenlijk?',
      a:['Kalkskeletten van miljoenen kleine dieren','Rotsen met algen','Zand en schelpen','Zee-gras'], c:0 },
    { e:'🌙', q:'Wat is plankton in het water?',
      a:['Microscopisch kleine levende wezentjes','Kleine vissen','Zeeplanten','Koralen'], c:0 },
    { e:'🌳', q:'Waarom zijn regenwouden zo belangrijk voor de aarde?',
      a:['Ze maken zuurstof en houden de lucht schoon','Ze leveren hout','Ze zijn mooi','Ze beschermen mensen'], c:0 },
    { e:'🐠', q:'Waarom zijn koraalriffen kleurrijk?',
      a:['Algen geven het koraal kleur','Vissen schilderen ze in','Het zonlicht reflecteert zo','Het zijn gekleurde stenen'], c:0 },

    // Leuke weetjes voor kinderen
    { e:'🏖️', q:'Hoe heet het langste strand van Thailand?',
      a:['Hat Yao (op Koh Phangan)','Chaweng (Koh Samui)','Patong (Phuket)','Kata (Phuket)'], c:0 },
    { e:'🥊', q:'Hoe heet de traditionele Thaise vechtkunst?',
      a:['Muay Thai','Kung Fu','Karate','Judo'], c:0 },
    { e:'💆', q:'Hoe heet de traditionele Thaise massage?',
      a:['Nuad Boran (Thai massage)','Shiatsu','Ayurveda','Reflexologie'], c:0 },
    { e:'🐘', q:'Hoeveel liters water drinkt een olifant per dag?',
      a:['Wel 200 liter!','10 liter','50 liter','500 liter'], c:0 },
    { e:'🌊', q:'Wat is het gevaarlijkste op het strand: meduses of schipbreuk?',
      a:['Kwallen (meduses) kunnen pijnlijk steken','Schipbreuk','Krokodillen','Piranha\'s'], c:0 },
    { e:'🛺', q:'Hoeveel wielen heeft een tuk-tuk?',
      a:['3 wielen','2 wielen','4 wielen','6 wielen'], c:0 },
    { e:'🏯', q:'Hoeveel tempels zijn er alleen al in Bangkok?',
      a:['Meer dan 400','10','50','1.000'], c:0 },
    { e:'🐘', q:'Wat is een olifantenopvang (sanctuary)?',
      a:['Een veilige plek waar olifanten verzorgd worden zonder te werken','Een dierentuin','Een circus','Een boerderij'], c:0 },
    { e:'🌺', q:'Hoe heet de nationale bloem van Thailand?',
      a:['De orchidee (Ratchaphruek)','De roos','De tulp','De lotus'], c:0 },
    { e:'🎪', q:'Wat is de popularste sport om naar te kijken in Thailand?',
      a:['Muay Thai (Thais boksen)','Voetbal','Zwemmen','Tennis'], c:0 },
    { e:'🍜', q:'Hoe lang is Thailand al bekend om zijn streetfood cultuur?',
      a:['Honderden jaren','10 jaar','50 jaar','20 jaar'], c:0 },
    { e:'🌴', q:'Wat is de nationale boom van Thailand?',
      a:['De Cassia fistula (Ratchaphruek gouden boom)','De palmboom','De mangoboom','De bamboeboom'], c:0 },

    // Vergelijkingen en cijfers
    { e:'👥', q:'Hoeveel mensen wonen er in heel Thailand?',
      a:['Meer dan 70 miljoen','1 miljoen','10 miljoen','500 miljoen'], c:0 },
    { e:'🌏', q:'Hoe groot is Thailand in vierkante kilometers?',
      a:['513.000 km²','41.000 km² (dat is Nederland)','1 miljoen km²','100.000 km²'], c:0 },
    { e:'✈️', q:'Hoeveel uur vliegen is het van Nederland naar Thailand?',
      a:['Ongeveer 11 uur','2 uur','5 uur','20 uur'], c:0 },
    { e:'🌡️', q:'Hoe warm is het gemiddeld in Bangkok?',
      a:['Zo\'n 30-35 graden het hele jaar!','5-10 graden','15-20 graden','40-50 graden'], c:0 },
    { e:'🏙️', q:'Hoe veel tempel heeft Bangkok per inwoner (grappige vergelijking)?',
      a:['1 tempel per 25.000 inwoners','1 tempel voor heel Bangkok','1 tempel per 100 inwoners','Geen tempels'], c:0 },
    { e:'🌴', q:'Hoeveel kokosnoten produceert Thailand per jaar (ongeveer)?',
      a:['Miljarden kokosnoten','Duizend kokosnoten','Een miljoen kokosnoten','Honderd kokosnoten'], c:0 },
    { e:'🐘', q:'Hoeveel wilde olifanten leven er nog in Thailand?',
      a:['Zo\'n 3.000 tot 4.000','100','100.000','50'], c:0 },
    { e:'🗺️', q:'Welke Thaise stad groeit het snelst?',
      a:['Bangkok','Chiang Mai','Phuket','Pattaya'], c:0 },
    { e:'🛕', q:'Hoeveel goud is er gebruikt voor Thaise tempels (grappige schatting)?',
      a:['Tonnen en tonnen goud!','Een paar gram','Een kilo','Een gram'], c:0 },

    // Vervoer
    { e:'🚁', q:'Hoe heet het hogesnelheidstreinnetwerk in Bangkok?',
      a:['BTS Skytrain','TGV','Bullet Train','Metro Express'], c:0 },
    { e:'🚤', q:'Wat is een "water taxi" in Bangkok?',
      a:['Een boot die mensen langs de kanalen vervoert','Een drijvende auto','Een taxi die over water rijdt','Een vliegend vaartuig'], c:0 },
    { e:'🛺', q:'Hoe oud is de tuk-tuk als vervoermiddel in Thailand (ongeveer)?',
      a:['Zo\'n 60-70 jaar','5 jaar','200 jaar','1.000 jaar'], c:0 },
    { e:'🚲', q:'Hoe heet de fietsrickshaw in Thailand?',
      a:['Samlor','Tuk-tuk','Songthaew','Rot daeng'], c:0 },
    { e:'🚌', q:'Wat is een "songthaew" in Thailand?',
      a:['Een pick-uptruck als bus gebruikt','Een lange taxi','Een klein vliegtuig','Een waterwagen'], c:0 },
    { e:'🚂', q:'Hoe lang duurt de nachttreinreis van Bangkok naar het zuiden?',
      a:['Zo\'n 10-12 uur','1 uur','5 uur','24 uur'], c:0 },
    { e:'🛶', q:'Waarom zijn longtailboten zo snel?',
      a:['Ze hebben een krachtige automotor aan een lange stang','Ze zijn heel licht','Ze hebben een zeil','Ze worden aangedreven door roeiriemen'], c:0 },
    { e:'🚤', q:'Hoe heet het kanaal (klong) waar waterbussen doorheen varen in Bangkok?',
      a:['Khlong Saen Saep','Chao Phraya Canal','Bangkok River','Kwai Canal'], c:0 },
    { e:'✈️', q:'Hoe heet de grootste luchthaven van Bangkok?',
      a:['Suvarnabhumi Airport','Don Mueang Airport','Bangkok Airport','Thai Airways Hub'], c:0 },
    { e:'🛺', q:'Hoe onderhandel je over de prijs van een tuk-tuk?',
      a:['Je vraagt van tevoren de prijs en marchandeert','Je betaalt wat de taxameter aangeeft','Je betaalt nooit','Je vraagt een reisagent'], c:0 },

    // Gemengde extra vragen
    { e:'🌺', q:'Hoe heet de lila/blauwe bloem die op Thaise markten te koop is?',
      a:['Orchidee','Jasmijn','Lotus','Hibiscus'], c:0 },
    { e:'🧲', q:'Wat trekt toeristen naar Koh Samui behalve het strand?',
      a:['Tempels, oerwoud en watervallen','Skigebieden','Gletsjers','Woestijn'], c:0 },
    { e:'🌊', q:'Hoe heet het fenomeen waarbij de zee \'s nachts oplicht?',
      a:['Bioluminescentie','Fosforescering','Radioactiviteit','Elektriciteit'], c:0 },
    { e:'🐠', q:'Hoeveel soorten vissen leven er in de Golf van Thailand?',
      a:['Meer dan 400 soorten','10 soorten','50 soorten','1.000 soorten'], c:0 },
    { e:'🏔️', q:'Op welke hoogte ligt de top van Doi Inthanon (de hoogste berg van Thailand)?',
      a:['2.565 meter','500 meter','5.000 meter','1.000 meter'], c:0 },
    { e:'🌿', q:'Hoe heet de plant die je kunt eten en ook dienst doet als een soort fles?',
      a:['Bamboe','Cactus','Rafflesia','Palmblad'], c:0 },
    { e:'🍜', q:'Welk kruid geeft Tom Yum soep zijn zure smaak?',
      a:['Citroengras en kaffirlimoen','Rijst azijn','Citroen','Appelsap'], c:0 },
    { e:'🎆', q:'Hoe noem je het vuurwerk dat bij Songkran wordt afgestoken?',
      a:['Voetzoeker (bangers en kleine vuurpijlen)','Confetti','Waterballonnen','Lichtkogels'], c:0 },
    { e:'🌿', q:'Waarom zetten Thais eten voor hun geestenhuis?',
      a:['Als offer voor de beschermende geesten','Omdat het te veel is','Als versiering','Voor de katten'], c:0 },
    { e:'🦟', q:'Hoe bescherm je jezelf tegen muggen in Thailand?',
      a:['Muggenwerende spray (DEET) en lange kleding','Heel hard rennen','In het water blijven','Niets eten'], c:0 },
    { e:'🌊', q:'Wat maakt de Andamanezee anders dan de Golf van Thailand?',
      a:['De golven zijn groter en het water is helderder','Het is warmer','Er zijn geen vissen','Het is zoet water'], c:0 },
    { e:'🐒', q:'Waarom zijn gibbons bedreigd?',
      a:['Door ontbossing en het verlies van hun leefgebied','Ze eten te weinig','Ze zijn ziek','Ze zijn bang voor mensen'], c:0 },
    { e:'🛕', q:'Wat moet je doen voor je een Thaise tempel ingaat?',
      a:['Schoenen uitdoen en bedekte schouders','Zingen','Een munt gooien','Bidden op je knieën'], c:0 },
    { e:'🌴', q:'Hoeveel soorten palm groeien er in Thailand?',
      a:['Meer dan 50 soorten','3 soorten','1 soort','200 soorten'], c:0 },
    { e:'🎯', q:'Waar staat de afkorting "BTS" voor in Bangkok?',
      a:['Bangkok Mass Transit System (skytrain)','Bangkok Tourist Service','Big Thai Supermarket','Bus Traffic System'], c:0 },
    { e:'🌺', q:'Welke bloem is heilig in het boeddhisme en groeit in het water?',
      a:['Lotus','Orchidee','Jasmijn','Hibiscus'], c:0 },
    { e:'🐘', q:'Hoe helpen olifanten vroeger bij bosbouw in Thailand?',
      a:['Ze sjouwden zware boomstammen','Ze plantten bomen','Ze bewaakten het bos','Ze vochten bosbranden'], c:0 },
    { e:'🌿', q:'Hoe groot worden de bladeren van sommige planten in het Khao Sok regenwoud?',
      a:['Zo groot als een tafel!','Zo groot als je hand','Zo groot als een cent','Zo groot als je hoofd'], c:0 },
    { e:'🚤', q:'Waarom worden longtailboten zo genoemd?',
      a:['Door de lange staaf (stang) van de motor die in het water steekt','Ze lijken op een vis','Ze zijn erg lang','Ze zijn snel als een dier'], c:0 },
    { e:'🎆', q:'Hoe vieren Thais Loy Krathong feest?',
      a:['Ze laten lichtjes op het water drijven en wensen iets','Ze gooien water naar iedereen','Ze eten een groot diner','Ze dansen op straat'], c:0 },
    { e:'🌊', q:'Wat kun je doen tijdens cave kayaking in Khao Sok?',
      a:['Met een kano door grotten paddelen in het donker','Op zee surfen','Door een waterval duiken','Een expeditie op het land'], c:0 },
    { e:'🏖️', q:'Welke kleur heeft het water rond de eilanden bij Ang Thong?',
      a:['Turquoise en smaragdgroen','Grijs','Zwart','Rood'], c:0 },
    { e:'🐍', q:'Hoe lang kan een koningscobra worden?',
      a:['Wel 5 meter!','50 centimeter','1 meter','10 meter'], c:0 },
    { e:'🛕', q:'Wat betekent het woord "Wat" in het Thais?',
      a:['Tempel','Huis','Berg','Rivier'], c:0 },
    { e:'🌿', q:'Hoeveel bamboe soorten groeien er in Thailand?',
      a:['Meer dan 60 soorten','3 soorten','1 soort','500 soorten'], c:0 },
    { e:'🐘', q:'Hoe communiceren olifanten met andere olifanten ver weg?',
      a:['Via lage trillingen (infrageluid) die mensen niet horen','Via signaalvuren','Via kreten','Via geursporen alleen'], c:0 },
    { e:'🌴', q:'Wat maakt de Chao Phraya rivier zo belangrijk voor Bangkok?',
      a:['Vervoer, water en visserij al eeuwenlang','Het is de mooiste rivier','Er wonen dinosauriërs in','Het is de langste rivier'], c:0 },
    { e:'🎭', q:'Welk Thais schimmenspel is ingeschreven bij UNESCO?',
      a:['Nang Yai (groot schaduwspel)','Khon','Likay','Manohra'], c:0 },
    { e:'🌺', q:'Hoeveel bezoekers trekt Thailand per jaar (voor corona)?',
      a:['Meer dan 39 miljoen toeristen!','1 miljoen','100 miljoen','500.000'], c:0 },
    { e:'🦅', q:'Hoe groot is de spanwijdte van een hoornvogel?',
      a:['Wel 150 centimeter!','30 centimeter','10 centimeter','50 centimeter'], c:0 },
    { e:'🌿', q:'Hoe oud is het oudste boeddhistische klooster in Thailand?',
      a:['Meer dan 700 jaar','100 jaar','1.000 jaar','50 jaar'], c:0 },
    { e:'🥥', q:'Hoeveel kokosnoten plukt een getrainde aap per dag?',
      a:['Tot 1.000 kokosnoten!','10 kokosnoten','100 kokosnoten','5 kokosnoten'], c:0 },
    { e:'🌊', q:'Wat is een atol?',
      a:['Een ringvormig koraaleiland rond een lagune','Een onderzeese berg','Een zandbank','Een mangrovebos'], c:0 },
    { e:'🐒', q:'Hoe ver kunnen gibbons slingeren in één zwaai?',
      a:['Wel 3 meter per zwaai!','10 centimeter','1 kilometer','50 centimeter'], c:0 },
    { e:'🌡️', q:'Wanneer is het het koelst in Thailand (minder heet)?',
      a:['November tot februari','Juni en juli','Oktober','April en mei'], c:0 },
    { e:'🏖️', q:'Hoe lang is het strand van Chaweng Beach op Koh Samui?',
      a:['Ongeveer 7 kilometer','100 meter','1 kilometer','50 kilometer'], c:0 },
    { e:'🐟', q:'Waarom zijn tropische vissen zo kleurrijk?',
      a:['Om soortgenoten te herkennen en om te verstoppen tussen koralen','Om mensen te waarschuwen','Ze zijn gevaarlijk','Ze zijn giftiger'], c:0 },
    { e:'🌿', q:'Wat eten gibbons het liefst?',
      a:['Rijpe vruchten en fig','Vlees en vissen','Bladeren en gras','Insecten en noten'], c:0 },
    { e:'🛕', q:'Welke kleur heeft de tempel Wat Arun in het zonlicht?',
      a:['Hij schittert wit en goud door de porseleinen scherven','Hij is helemaal rood','Hij is geel','Hij is zwart'], c:0 },
    { e:'🍜', q:'Wat is de beste manier om Thais eten te proeven?',
      a:['Op de markt en bij streetfood kraampjes!','In dure restaurants','Zelf koken','In het vliegtuig'], c:0 },
    { e:'🌺', q:'Hoe heet de rode bloem die je als slinger om je nek krijgt op Thaise luchthavens?',
      a:['Jasmijn of marigold (goudsbloem) slinger','Rozenkrans','Orchidee ketting','Palmboom blad'], c:0 },
    { e:'🌊', q:'Hoe diep is de Golf van Thailand op het diepste punt?',
      a:['Ongeveer 80 meter (vrij ondiep voor een zee)','5.000 meter','100 meter','1.000 meter'], c:0 },
    { e:'🐘', q:'Wat is het verschil tussen een Aziatische en een Afrikaanse olifant?',
      a:['Aziatische olifanten zijn kleiner en hebben kleinere oren','Ze zijn hetzelfde','Aziatische olifanten zijn groter','Aziatische olifanten hebben geen slurf'], c:0 },
    { e:'🎒', q:'Hoeveel nachten duurde jullie Thailand trip in totaal?',
      a:['Zo\'n 15 nachten (april-mei 2025)','5 nachten','30 nachten','3 nachten'], c:0 },
    { e:'🏝️', q:'Hoe heet de eilandengroep in de Andamanezee vlak bij Krabi?',
      a:['Phi Phi eilanden','Koh Samui eilanden','Similan eilanden','Ko Chang eilanden'], c:0 },
    { e:'🌿', q:'Welk tropisch woud heeft meer biodiversiteit dan de Amazone in bepaalde gebieden?',
      a:['Het Maleisische-Thaise regenwoud','Het Afrikaanse regenwoud','Het Australische oerwoud','Het Europese woud'], c:0 },
    { e:'🦁', q:'Hoeveel wilde tijgers leven er nog in Thailand?',
      a:['Zo\'n 150-200 wilde tijgers','10.000','50','Geen meer'], c:0 },
    { e:'🛺', q:'Hoe maak je een tuk-tuk rit zo veilig mogelijk?',
      a:['Prijs afspreken, helm op en riem om!','Heel snel rijden','Ogen dicht houden','S nachts rijden'], c:0 },
    { e:'🏯', q:'Welke kleur heeft het dak van het Grand Palace in Bangkok?',
      a:['Goud en groen (vergulde dakpannen)','Rood en blauw','Wit en zwart','Oranje en paars'], c:0 },
    { e:'🌊', q:'Hoe heet de sport waarbij je op een plank op de golven rijdt?',
      a:['Surfen','Snorkelen','Duiken','Waterpolo'], c:0 },
    { e:'🐘', q:'Hoe noem je een jonge olifant?',
      a:['Een kalf','Een veulen','Een welp','Een kuiken'], c:0 },
    { e:'🍚', q:'Hoe heet het heerlijke kleefrijst dessert dat je in bananenblad gestoomd koopt?',
      a:['Khao tom mat','Mango sticky rice','Pad thai zoet','Khao niao dam'], c:0 },
    { e:'🌺', q:'Wat is de betekenis van de witte olifant in Thailand?',
      a:['Geluk en koninklijke macht','Gevaar','Oorlog','Landbouw'], c:0 },
    { e:'🎭', q:'Hoe heet de Thaise vechtkunst waarbij je ook je ellebogen en knieën gebruikt?',
      a:['Muay Thai','Sumo','Judo','Taekwondo'], c:0 },
    { e:'🌿', q:'Waarom mogen toeristen de rafflesia niet aanraken?',
      a:['Ze is erg kwetsbaar en zeldzaam','Ze is giftig','Ze bijt','Ze is elektrisch'], c:0 },
    { e:'🚂', q:'Welke kleur heeft de Thaise nachttrein slaapwagon?',
      a:['Blauw en wit','Rood en geel','Groen en goud','Oranje en zwart'], c:0 },
    { e:'🌊', q:'Hoe heet het koraal dat eruitziet als een hersenenwrinkels?',
      a:['Hersenkoraal','Tafelkoraal','Staafkoraal','Waaiervormig koraal'], c:0 },
    { e:'🐒', q:'Hoeveel gibbonsoorten leven er in Thailand?',
      a:['Minstens 3 soorten','1 soort','10 soorten','Geen'], c:0 },
    { e:'🌴', q:'Waarvoor gebruiken Thais palmbladeren traditioneel?',
      a:['Voor daken, manden en verpakkingen','Alleen als decoratie','Als eten','Als brandstof'], c:0 },
    { e:'🏰', q:'Wat is de betekenis van het Thaise symbool "Garuda"?',
      a:['Een mythische adelaar, symbool van de Thaise staat','Een draak','Een slang','Een vis'], c:0 },
    { e:'🌙', q:'Hoe laat gaat de zon onder in Thailand (het hele jaar bijna gelijk)?',
      a:['Rond 18:00-19:00 uur','Om middernacht','Om 21:00 uur','Om 16:00 uur'], c:0 },
    { e:'🐟', q:'Hoe heet de grote vangst die Thaise vissers \'s nachts met lampen lokken?',
      a:['Inktvis (squid fishing met lampen)','Haaien','Walvissen','Zalm'], c:0 },
    { e:'🌺', q:'Waarom hangt er een bloemslinger bij een geestenhuis?',
      a:['Als welkom geschenk voor de geesten','Als decoratie voor toeristen','Om muggen weg te jagen','Om mooi te ruiken'], c:0 },
    { e:'🏊', q:'Wat moet je NIET doen bij het snorkelen om koraal te beschermen?',
      a:['Op het koraal staan of het aanraken','Langzaam zwemmen','Masker dragen','Flipper dragen'], c:0 },
    { e:'🌿', q:'Hoe noem je het deel van het regenwoud vlak boven de grond?',
      a:['Bosbodem of undergrowth','Het bladerdek','De boomtoppen','De kruin'], c:0 },
    { e:'🐦', q:'Wat eet een hoornvogel het liefst?',
      a:['Vruchten en vijgen uit de tropen','Vis','Vlees','Insecten alleen'], c:0 },
    { e:'🏙️', q:'Hoe noem je de wijk in Bangkok vol Chinese winkels en tempels?',
      a:['Chinatown (Yaowarat)','Bangrak','Silom','Sukhumvit'], c:0 },
    { e:'🌊', q:'Wat zijn zeegrassen en waarom zijn ze belangrijk?',
      a:['Planten op de zeebodem, voedsel voor zeeschildpadden','Gevaarlijke algen','Vissenkooi','Koraalsoort'], c:0 },
    { e:'🌴', q:'Wat is het verschil tussen een palmboom en een kokospalm?',
      a:['Een kokospalm is een type palmboom dat kokosnoten geeft','Ze zijn precies hetzelfde','Palmbomen zijn kleiner','Kokospalmen groeien in het water'], c:0 },
    { e:'🎉', q:'Wanneer vieren Thais hun nationale dag?',
      a:['5 december (verjaardag van Koning Bhumibol)','1 januari','14 juli','25 december'], c:0 },
    { e:'🦜', q:'Hoeveel vogelsoorten leven er in Thailand?',
      a:['Meer dan 1.000 soorten!','50 soorten','100 soorten','5.000 soorten'], c:0 },
    { e:'🌿', q:'Hoe lang duurt het moesson seizoen in Thailand?',
      a:['Zo\'n 5 maanden (mei tot oktober)','1 maand','Het hele jaar','2 weken'], c:0 },
    { e:'🐘', q:'Hoe helpt een olifant zich afkoelen op een warme dag?',
      a:['Door water en modder op zichzelf te gooien','Door in de schaduw te slapen','Door te zwemmen','Door in een grot te zitten'], c:0 },
    { e:'🌊', q:'Hoe heet de onderwaterrotsformatie die rifvissen als schuilplaats gebruiken?',
      a:['Koraalrif','Zandbank','Modderbodem','Rotskust'], c:0 },
    { e:'🛕', q:'Hoe noem je de puntige toren bovenop een Thaise tempel?',
      a:['Prang of chedi (stoepa)','Minaret','Koepel','Belfort'], c:0 },
    { e:'🌺', q:'Welk kleur heeft de lotus bloem die je bij Thaise tempels ziet?',
      a:['Roze en wit','Geel en groen','Blauw en paars','Rood en oranje'], c:0 },
    { e:'🏄', q:'Waarom is de westkust van Thailand (Andamanezee) populair bij duikers?',
      a:['Heel helder water en prachtige koraalriffen','Warm water','Veel haaien','Grote golven'], c:0 },
    { e:'🌴', q:'Hoe lang duurt het voor een kokospalm vrucht draagt?',
      a:['5 tot 6 jaar','1 jaar','1 maand','20 jaar'], c:0 },
    { e:'🍜', q:'Wat maakt Tom Yum soep zo lekker?',
      a:['De combinatie van zuur, pittig, zout en umami!','Veel suiker','Zachte smaak','Vettigheid'], c:0 },
    { e:'🚤', q:'Waarom is de Chao Phraya rivier zo druk in Bangkok?',
      a:['Het is een belangrijke verkeersader en handelsroute','Het is een recreatieplas','Er wonen krokodillen in','Het is de breedste rivier'], c:0 },
    { e:'🏔️', q:'Welk diersoort leeft op de hoogste bergtoppen van Thailand?',
      a:['Gaoeral (een soort wilde geit)','Olifanten','Gibbons','Tijgers'], c:0 },
    { e:'🐚', q:'Wat zijn mangroven?',
      a:['Bomen die in zout water aan de kust groeien','Een soort koraal','Zeegrasvelden','Drijvende eilanden'], c:0 },
    { e:'🎯', q:'Hoe heet de Thaise sport waarbij je met je benen een rotan bal overkopt slaat?',
      a:['Sepak takraw','Muay thai','Chinlon','Kabbadi'], c:0 },
    { e:'🌿', q:'Waarom heeft Thailand drie seizoenen in plaats van vier?',
      a:['Warm seizoen, regenseizoen en koel seizoen (geen winter)','Ze hebben gewoon vier','Ze hebben er maar twee','Seizoenen bestaan niet in Thailand'], c:0 },
    { e:'🦎', q:'Hoe groot kan een varaan (monitor lizard) worden in Thailand?',
      a:['Tot 2 meter lang!','20 centimeter','50 centimeter','5 meter'], c:0 },
    { e:'🐢', q:'Hoe navigeren zeeschildpadden terug naar het strand waar ze geboren zijn?',
      a:['Ze gebruiken het magnetisch veld van de aarde','Ze volgen de sterren','Ze ruiken de zee','Ze volgen andere schildpadden'], c:0 },
    { e:'🌊', q:'Hoe heten de grote golven die kunnen ontstaan na een aardbeving in zee?',
      a:['Tsunami','Tyfoon','Moesson','Springvloed'], c:0 },
    { e:'🏙️', q:'Hoe oud is de stad Bangkok als hoofdstad van Thailand?',
      a:['Meer dan 240 jaar (gesticht 1782)','100 jaar','500 jaar','1.000 jaar'], c:0 },
];

class BangkokMapGame extends Phaser.Scene {
    constructor() { super({ key: 'BangkokMapGame' }); }

    init(data) {
        this.locationIndex = data.locationIndex;
        this.name1 = data.name1;
        this.name2 = data.name2;
    }

    create() {
        var scene = this;

        this._correct  = 0;
        this._needed   = 5;
        this._answering = false;
        this._pool = Phaser.Utils.Array.Shuffle(QUIZ_QUESTIONS.slice());

        // ── Background ──────────────────────────────────────────────────────
        var bg = this.add.graphics();
        bg.fillGradientStyle(0x0D004D, 0x0D004D, 0x003366, 0x003366, 1);
        bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Decorative gold stars scattered
        var deco = this.add.graphics();
        for (var i = 0; i < 30; i++) {
            var sx = Phaser.Math.Between(0, GAME_WIDTH);
            var sy = Phaser.Math.Between(110, GAME_HEIGHT - 60);
            deco.fillStyle(0xE8A020, 0.15 + Math.random() * 0.1);
            deco.fillCircle(sx, sy, 2);
        }

        // Temple silhouettes
        this.add.text(8,  GAME_HEIGHT - 95, '🛕', { fontSize: '60px', alpha: 0.25 }).setAlpha(0.25);
        this.add.text(GAME_WIDTH - 72, GAME_HEIGHT - 95, '🛕', { fontSize: '60px' }).setAlpha(0.25);

        // ── Header ──────────────────────────────────────────────────────────
        this.add.rectangle(0, 0, GAME_WIDTH, 86, 0x000000, 0.65).setOrigin(0);
        this.add.text(GAME_WIDTH / 2, 36, '🗺️ Bangkok Quiz', {
            fontFamily: 'Georgia, serif', fontSize: '22px',
            color: '#E8A020', stroke: '#000', strokeThickness: 2,
        }).setOrigin(0.5);
        this.add.text(GAME_WIDTH / 2, 68, 'Krijg 5 vragen goed om verder te reizen!', {
            fontFamily: 'Arial', fontSize: '13px', color: '#aaaaaa',
        }).setOrigin(0.5);

        // ── Progress stars ───────────────────────────────────────────────────
        this._starGfx = this.add.graphics();
        this._drawStars();

        // ── Question container ───────────────────────────────────────────────
        this._qContainer = this.add.container(0, 0);

        // ── Feedback flash ───────────────────────────────────────────────────
        this._flash = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
            .setOrigin(0).setDepth(50).setVisible(false);

        // ── Back button ─────────────────────────────────────────────────────
        backArrow(this, function () {
            if (window._onReturnToMap) { window._onReturnToMap(); }
            else { scene.scene.start('MapScene', { saveData: loadSave() }); }
        });

        this._showQuestion();
    }

    _drawStars() {
        var gfx = this._starGfx;
        gfx.clear();
        var cx = GAME_WIDTH / 2;
        var y  = 90;
        var gap = 38;
        var total = this._needed;
        var startX = cx - ((total - 1) * gap) / 2;
        for (var i = 0; i < total; i++) {
            var x = startX + i * gap;
            if (i < this._correct) {
                gfx.fillStyle(0xFFD700, 1);
                gfx.lineStyle(2, 0xFFA000, 1);
            } else {
                gfx.fillStyle(0x333355, 1);
                gfx.lineStyle(1, 0x555577, 1);
            }
            // Draw 5-point star
            var r = 13, ri = 5.5;
            var pts = [];
            for (var p = 0; p < 10; p++) {
                var angle = Math.PI / 2 + (p * Math.PI) / 5;
                var radius = (p % 2 === 0) ? r : ri;
                pts.push({ x: x + radius * Math.cos(angle), y: y - radius * Math.sin(angle) });
            }
            gfx.fillPoints(pts, true);
            gfx.strokePoints(pts, true);
        }
    }

    _showQuestion() {
        var scene = this;
        this._answering = false;
        this._qContainer.removeAll(true);

        if (this._pool.length === 0) {
            // Refill pool if somehow exhausted (shouldn't happen for 50 Qs)
            this._pool = Phaser.Utils.Array.Shuffle(QUIZ_QUESTIONS.slice());
        }

        var q = this._pool.shift();

        // ── Question card ────────────────────────────────────────────────
        var cardY = 115, cardH = 185;
        var cardBg = scene.add.graphics();
        cardBg.fillStyle(0x0D1B4B, 0.97);
        cardBg.fillRoundedRect(14, cardY, GAME_WIDTH - 28, cardH, 18);
        cardBg.lineStyle(2, 0x0288D1, 1);
        cardBg.strokeRoundedRect(14, cardY, GAME_WIDTH - 28, cardH, 18);

        var emoji = scene.add.text(GAME_WIDTH / 2, cardY + 38, q.e, {
            fontSize: '40px',
        }).setOrigin(0.5);

        var qText = scene.add.text(GAME_WIDTH / 2, cardY + 130, q.q, {
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: GAME_WIDTH - 55 },
            stroke: '#000', strokeThickness: 2,
        }).setOrigin(0.5);

        // Vertically center question text in card
        var textH = qText.height;
        qText.setY(cardY + cardH - textH / 2 - 24);

        this._qContainer.add([cardBg, emoji, qText]);

        // ── Shuffle answers, track correct ───────────────────────────────
        var shuffled = q.a.slice();
        var correctText = shuffled[q.c];
        Phaser.Utils.Array.Shuffle(shuffled);
        var correctIdx = shuffled.indexOf(correctText);

        // ── Answer buttons ───────────────────────────────────────────────
        var btnY0 = 325, btnH2 = 100, btnGap = 10;
        scene._allBtnBgs = [];   // { bg, by, h, isCor }

        shuffled.forEach(function (answer, i) {
            var by      = btnY0 + i * (btnH2 + btnGap);
            var isCor   = (i === correctIdx);

            var bg2 = scene.add.graphics();
            bg2.fillStyle(0x01579B, 1);
            bg2.fillRoundedRect(14, by, GAME_WIDTH - 28, btnH2, 16);
            bg2.lineStyle(2, 0x29B6F6, 0.5);
            bg2.strokeRoundedRect(14, by, GAME_WIDTH - 28, btnH2, 16);

            scene._allBtnBgs.push({ bg: bg2, by: by, h: btnH2, isCor: isCor });

            var txt = scene.add.text(GAME_WIDTH / 2, by + btnH2 / 2, answer, {
                fontFamily: 'Arial, sans-serif',
                fontSize: '17px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: GAME_WIDTH - 65 },
            }).setOrigin(0.5);

            var zone = scene.add.zone(GAME_WIDTH / 2, by + btnH2 / 2, GAME_WIDTH - 28, btnH2)
                .setInteractive();
            zone.on('pointerdown', function () {
                if (scene._answering) return;
                scene._answering = true;
                scene._onAnswer(isCor, bg2, by, btnH2);
            });

            scene._qContainer.add([bg2, txt, zone]);
        });

        // Slide in from right
        this._qContainer.setX(GAME_WIDTH);
        this.tweens.add({ targets: this._qContainer, x: 0, duration: 220, ease: 'Cubic.easeOut' });
    }

    _onAnswer(isCorrect, btnBg, by, h) {
        var scene = this;

        // Colour feedback on the tapped button
        btnBg.clear();
        btnBg.fillStyle(isCorrect ? 0x1B5E20 : 0x7B1010, 1);
        btnBg.fillRoundedRect(14, by, GAME_WIDTH - 28, h, 16);
        btnBg.lineStyle(3, isCorrect ? 0x69F0AE : 0xFF5252, 1);
        btnBg.strokeRoundedRect(14, by, GAME_WIDTH - 28, h, 16);

        // Screen flash
        this._flash.setVisible(true).setFillStyle(isCorrect ? 0x00FF00 : 0xFF0000, 0.12);
        this.tweens.add({ targets: this._flash, alpha: 0, duration: 400, onComplete: function () {
            scene._flash.setVisible(false).setAlpha(1);
        }});

        if (isCorrect) {
            SFX.correct();
            this._correct++;
            this._drawStars();

            // Animate the newly filled star
            this.tweens.add({ targets: this._starGfx, scaleX: 1.2, scaleY: 1.2, duration: 120, yoyo: true });

            if (this._correct >= this._needed) {
                this.time.delayedCall(800, function () { scene._doWin(); });
                return;
            }
        } else {
            SFX.wrong();
            // Pulse the correct button green so the player sees the right answer
            var corrBtn = null;
            for (var ci = 0; ci < scene._allBtnBgs.length; ci++) {
                if (scene._allBtnBgs[ci].isCor) { corrBtn = scene._allBtnBgs[ci]; break; }
            }
            if (corrBtn) {
                corrBtn.bg.clear();
                corrBtn.bg.fillStyle(0x00C853, 1);
                corrBtn.bg.fillRoundedRect(14, corrBtn.by, GAME_WIDTH - 28, corrBtn.h, 16);
                corrBtn.bg.lineStyle(3, 0xB9F6CA, 1);
                corrBtn.bg.strokeRoundedRect(14, corrBtn.by, GAME_WIDTH - 28, corrBtn.h, 16);
                scene.tweens.add({ targets: corrBtn.bg, alpha: 0.35, duration: 160, yoyo: true, repeat: 2, ease: 'Sine.easeInOut' });
            }
        }

        this.time.delayedCall(950, function () {
            scene._showQuestion();
        });
    }

    _doWin() {
        SFX.win();
        // Stars: fewer questions needed = more stars
        var asked = QUIZ_QUESTIONS.length - this._pool.length;
        var stars = asked <= 6 ? 3 : asked <= 10 ? 2 : 1;
        completeLocation(this.locationIndex, stars);
        this.scene.start('WinScene', {
            locationIndex: this.locationIndex, stars: stars,
            name1: this.name1, name2: this.name2,
        });
    }
}

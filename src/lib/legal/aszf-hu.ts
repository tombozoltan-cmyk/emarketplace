import type { LegalDocumentContent } from "./types";

/**
 * ÁSZF 3.0 – hatályos 2026. január 1-től.
 * A szöveg az E-Marketplace_ASZF_2026.pdf tartalmával egyezik; a PDF a
 * `public/legal/aszf-v3.0-2026-01-01.pdf` címen töltődik le.
 */
export const aszfHu: LegalDocumentContent = {
  language: "hu",
  title: "Általános Szerződési Feltételek",
  subtitle: "székhelyszolgáltatás és kézbesítési megbízotti szolgáltatás tárgyában",
  lead:
    "Szolgáltató: E-Marketplace Szolgáltató Korlátolt Felelősségű Társaság. Jelen ÁSZF a székhelyszolgáltatás, a kézbesítési megbízotti szolgáltatás, valamint az ezekhez kapcsolódó irodahasználati és postakezelési szolgáltatások igénybevételének általános feltételeit tartalmazza.",
  sections: [
    {
      id: "bevezeto",
      number: "1.",
      title: "Bevezető rendelkezések",
      blocks: [
        {
          kind: "p",
          text:
            "1.1. Jelen Általános Szerződési Feltételek (a továbbiakban: ÁSZF) a Megbízott által nyújtott székhelyszolgáltatás, kézbesítési megbízotti szolgáltatás, valamint az ezekhez kapcsolódó irodahasználati és postakezelési szolgáltatások igénybevételének általános feltételeit tartalmazzák.",
        },
        { kind: "p", text: "1.2. A Megbízott adatai:" },
        {
          kind: "table",
          head: ["Adat", "Érték"],
          rows: [
            ["Név", "E-Marketplace Szolgáltató Korlátolt Felelősségű Társaság"],
            ["Székhely", "1064 Budapest, Izabella utca 68/B."],
            ["Cégjegyzékszám", "01-09-296567"],
            ["Adószám", "25924916-2-42"],
            ["Képviselő", "Kádár Zoltán ügyvezető (önálló képviselet)"],
            ["E-mail", "[emarketplacekft@gmail.com](mailto:emarketplacekft@gmail.com)"],
            ["Telefon", "[06 50 104 61 16](tel:+36501046116)"],
            ["Honlap", "[https://e-marketplace.hu](https://e-marketplace.hu)"],
          ],
        },
        {
          kind: "p",
          text:
            "1.3. A Megbízott székhelyszolgáltatási tevékenysége a székhelyszolgáltatásról szóló 7/2017. (VI. 1.) IM rendelet (a továbbiakban: Rendelet) hatálya alá tartozik. A Megbízott a pénzmosás és a terrorizmus finanszírozása megelőzéséről és megakadályozásáról szóló 2017. évi LIII. törvény (a továbbiakban: Pmt.) 1. § (1) bekezdése alapján szolgáltatónak minősül, és e törvény szerinti kötelezettségek terhelik.",
        },
      ],
    },
    {
      id: "ertelmezo",
      number: "2.",
      title: "Értelmező rendelkezések",
      blocks: [
        {
          kind: "p",
          text:
            "2.1. **Szerződés:** a Felek között létrejött egyedi megbízási szerződés, amelynek elválaszthatatlan részét képezi jelen ÁSZF és annak mellékletei.",
        },
        { kind: "p", text: "2.2. **Megbízott:** az 1.2. pontban megjelölt társaság és annak jogutódai." },
        {
          kind: "p",
          text:
            "2.3. **Megbízó:** az a jogi személy, egyéb szervezet, egyéni vállalkozó vagy természetes személy, aki a Megbízott szolgáltatását szerződő félként igénybe veszi.",
        },
        { kind: "p", text: "2.4. **Felek:** a Megbízott és a Megbízó együttesen." },
        {
          kind: "p",
          text:
            "2.5. **Ingatlan:** az 1064 Budapest, Izabella utca 68/B. szám alatti ingatlan, amely a Megbízott jogszerű használatában áll, és amelyet a Megbízott a Megbízó székhelyeként, illetve telephelyeként, fióktelepeként biztosít.",
        },
        {
          kind: "p",
          text:
            "2.6. **Székhelyszolgáltatás:** a Rendelet szerinti szolgáltatás, amelynek keretében a Megbízott az Ingatlant a Megbízó székhelyeként biztosítja, és ellátja a Rendeletben, a Szerződésben és jelen ÁSZF-ben meghatározott feladatokat.",
        },
        {
          kind: "p",
          text:
            "2.7. **Kézbesítési megbízotti szolgáltatás:** a cégnyilvánosságról, a bírósági cégeljárásról és a végelszámolásról szóló 2006. évi V. törvény (a továbbiakban: Ctv.) szerinti kézbesítési megbízotti feladatok ellátása a Megbízó cégjegyzékbe bejegyzett külföldi tagja, vezető tisztségviselője vagy más, a cégjegyzékbe bejegyzett külföldi személye részére.",
        },
        {
          kind: "p",
          text:
            "2.8. **Hivatalos küldemény:** a Megbízó cégnevére érkező, hatóságtól, bíróságtól, pénzintézettől, közműszolgáltatótól vagy más szervezettől, illetve személytől származó levél vagy irat.",
        },
        { kind: "p", text: "2.9. **Ptk.:** a Polgári Törvénykönyvről szóló 2013. évi V. törvény." },
        { kind: "p", text: "2.10. **Art.:** az adózás rendjéről szóló 2017. évi CL. törvény." },
        { kind: "p", text: "2.11. **Díjtáblázat:** jelen ÁSZF 1. számú melléklete." },
        {
          kind: "p",
          text:
            "2.12. **Munkanap:** a magyarországi munkarend szerinti munkanap. A szombat, a vasárnap, a munkaszüneti és ünnepnapok, valamint a jogszabály által pihenőnappá nyilvánított napok nem minősülnek munkanapnak, és a jelen ÁSZF-ben meghatározott határidőkbe nem számítanak bele. A munkanapon 16:00 óra után átvett küldemény a következő munkanapon átvettnek minősül.",
        },
      ],
    },
    {
      id: "hatalya",
      number: "3.",
      title: "Az ÁSZF hatálya, a Szerződés létrejötte",
      blocks: [
        {
          kind: "p",
          text:
            "3.1. A Szerződés a Felek írásbeli megállapodásával jön létre. A Rendelet 1. § (1) bekezdése alapján a székhelyszolgáltatásra írásba foglalt megbízási szerződést kell kötni; szóban, illetve ráutaló magatartással a Szerződés nem jön létre.",
        },
        {
          kind: "p",
          text:
            "3.2. A Megbízott a mindenkor hatályos ÁSZF-et a honlapján közzéteszi, és azt a Szerződés megkötését megelőzően a Megbízó rendelkezésére bocsátja. A Megbízó a Szerződés aláírásával elismeri, hogy az ÁSZF tartalmát a szerződéskötést megelőzően megismerte, az abban foglaltakat megértette és magára nézve kötelezőnek elfogadta.",
        },
        {
          kind: "note",
          text:
            "3.3. **Kiemelt tájékoztatás a szokatlan kikötésekről (Ptk. 6:78. § (2)–(3) bekezdés).** A Megbízott kifejezetten és külön is felhívja a Megbízó figyelmét az alábbi kikötésekre, amelyek a Megbízó számára a szokásos szerződési gyakorlattól eltérő rendelkezéseket tartalmaznak. E kikötések csak akkor válnak a Szerződés részévé, ha azokat a Megbízó kifejezetten elfogadja:",
        },
        {
          kind: "lettered",
          items: [
            "a díj éves, előre történő megfizetése és a megfizetett díj vissza nem téríthetősége (7.2., 7.6. pont);",
            "a Szerződés automatikus megújulása és a következő évre vonatkozó automatikus kiszámlázás (12.2. pont);",
            "a rendes felmondás jogának a szerződéskötéstől számított egy éven belüli kizárása (12.4. pont);",
            "a díj évenkénti, inflációhoz kötött kiigazítása (7.7. pont);",
            "az ÁSZF egyoldalú módosításának joga (8. pont);",
            "a Megbízott kártérítési felelősségének korlátozása (10. pont);",
            "a kötbér kikötése arra az esetre, ha a Megbízó a Szerződés megszűnését követően a székhelyét nem helyezi át (12.9. pont);",
            "az elektronikus úton megtett nyilatkozatok kézbesítési vélelme (14.3. pont);",
            "az azonnali hatályú felmondás 12.7. pont szerinti esetei.",
          ],
        },
        {
          kind: "p",
          text:
            "A Megbízó e kikötések kifejezett elfogadását a Szerződésben erre rendelt helyen tett külön aláírásával (vagy a Szerződés aláírásával, ha az a jelen pontra kifejezetten visszautal) ismeri el.",
        },
        {
          kind: "p",
          text:
            "3.4. A Szerződésre és jelen ÁSZF-re a magyar jog az irányadó. A Szerződésből, illetve jelen ÁSZF-ből eredő jogvitákra a magyar bíróságok joghatósága kizárólagos; a Felek a jogvita eldöntésére a hatáskörrel és illetékességgel rendelkező magyar bíróság eljárását kötik ki.",
        },
        {
          kind: "p",
          text:
            "3.5. A Felek közötti jogviszonyban a Megbízó saját általános szerződési feltételei, beszerzési vagy egyéb általános feltételei nem alkalmazhatók, kivéve, ha azokat a Megbízott írásban, kifejezetten elfogadta.",
        },
      ],
    },
    {
      id: "szekhelyszolgaltatas",
      number: "4.",
      title: "A székhelyszolgáltatás tartalma",
      blocks: [
        {
          kind: "p",
          text:
            "4.1. A Megbízott az Ingatlant a Szerződés hatálya alatt a Megbízó székhelyeként biztosítja, és hozzájárul ahhoz, hogy a Megbízó az Ingatlant székhelyként a cégbíróságnál, az állami adó- és vámhatóságnál, valamint minden egyéb hatóságnál bejelentse és feltüntesse. A Megbízott erről a Szerződés megkötésével egyidejűleg külön okiratba foglalt, a cégeljárásban felhasználható székhelyhasználati hozzájáruló nyilatkozatot ad ki.",
        },
        {
          kind: "p",
          text:
            "4.2. A Megbízott az Ingatlanon a Megbízó cégtáblájának a közterületről jól látható helyen történő elhelyezéséről a Rendelet 2. § (2) bekezdése szerint gondoskodik.",
        },
        {
          kind: "p",
          text:
            "4.3. A Megbízott ügyfélfogadási ideje: munkanapokon 10:00–16:00 óra között. Az iratok személyes átvételére és az irodahasználatra előre egyeztetett időpontban van lehetőség.",
        },
        {
          kind: "p",
          text:
            "4.4. **Postakezelés.** A Megbízott gondoskodik a Megbízó cégnevére, az Ingatlan címére érkező postai küldemények átvételéről, és az átvételről a Rendelet 3. §-ában írt határidőben, az átvételt követő 1 (egy) munkanapon belül elektronikus úton értesíti a Megbízót a Szerződésben megadott e-mail címen.",
        },
        {
          kind: "p",
          text: "4.5. A Megbízott kizárólag a Megbízó cégnevére érkező küldemények átvételére jogosult. Nem veszi át:",
        },
        {
          kind: "lettered",
          items: [
            "a kizárólag természetes személy címzett nevére szóló küldeményt;",
            "az árucsomagot, kereskedelmi célú küldeményt, utánvételes és nem díjmentes küldeményt, kivéve, ha annak teljes költségét a Megbízó előre megfizette;",
            "a külön tárolást, hűtést, vagy engedélyt igénylő, illetve veszélyes küldeményt.",
          ],
        },
        {
          kind: "p",
          text:
            "4.6. A Megbízó a Szerződés megkötésével egyidejűleg, külön okiratban postai meghatalmazást ad a Megbízottnak és a Megbízott nevében eljáró személyeknek a küldemények átvételére, felnyitására és tartalmuk megismerésére. A postai meghatalmazás átadása a Szerződés hatálybalépésének feltétele. A Megbízott és a Megbízott nevében eljáró személyek a küldemények tartalmát, az abban foglalt levéltitkot és üzleti titkot a 11. pont szerint kötelesek megőrizni.",
        },
        {
          kind: "p",
          text:
            "4.7. A Megbízott a hivatalos küldeményeket a postai meghatalmazás alapján felnyitja, PDF formátumban beszkenneli, és a szkennelt iratot az átvételt követő 1–2 (egy–kettő) munkanapon belül megküldi a Megbízó által megadott e-mail címre. Terjedelmi okból a Megbízott egy iraton belül legfeljebb 20 oldal szkennelésére köteles; a 20 oldalt meghaladó iratok esetén a Megbízott erről a tényről a Megbízót értesíti, a további oldalak szkennelését pedig a Díjtáblázat szerinti külön díj ellenében vállalja.",
        },
        {
          kind: "p",
          text:
            "4.8. A Megbízott a küldemények beérkezéséről – annak tényéről, a feladó és a küldemény megjelöléséről – akkor is értesíti a Megbízót az átvételt követő 1 (egy) munkanapon belül, ha a szkennelésre a 4.5., a 4.7. vagy a 7.5. pont alapján nem kerül sor.",
        },
        {
          kind: "p",
          text:
            "4.9. **A küldemények nyilvántartása és az elektronikus kézbesítés rendszere.** A Megbízott a beérkező küldeményeket saját zárt ügyviteli rendszerében (app.smartszekhely.hu) érkezteti és tartja nyilván; a nyilvántartás tartalmazza a küldemény azonosítóját, a feladót, az átvétel napját, a szkennelés és a továbbítás időpontját. A szkennelt iratok elektronikus megküldése a Brevo levelezőrendszerén keresztül történik, amely a kiküldés, a kézbesítés és – ahol ez technikailag elérhető – a megnyitás tényét és időpontját naplózza.",
        },
        {
          kind: "p",
          text:
            "4.9.1. A Felek rögzítik, hogy a Megbízott rendszerében és a Brevo rendszerében keletkezett napló (log) a küldemény feldolgozásának és elektronikus megküldésének igazolására szolgál. A Megbízó kérésére, illetve jogvita esetén a Megbízott a napló adatait kivonat formájában rendelkezésre bocsátja. A Felek a naplóadatokat a teljesítés igazolására alkalmas bizonyítéknak tekintik; ezzel ellentétes bizonyításnak helye van.",
        },
        {
          kind: "p",
          text:
            "4.9.2. A Megbízó tudomásul veszi, hogy a kézbesítés az általa megadott e-mail címre történő kiküldéssel teljesül. A Megbízó felel azért, hogy a megadott e-mail cím működőképes legyen, és hogy a Megbízott küldeményei ne kerüljenek a levélszemét mappába vagy ne kerüljenek elutasításra; a Megbízó köteles a Megbízott küldő címét engedélyezni (whitelist).",
        },
        {
          kind: "p",
          text:
            "4.10. **Iratkezelés, iratjegyzék.** A Megbízott a Megbízó iratait és ingóságait a többi megbízója, valamint saját iratai és ingóságai körében elkülönítve kezeli, és azokról a Rendelet 2. § (3)–(4) bekezdésének megfelelően tételes, naprakész iratjegyzéket és ingóságjegyzéket vezet.",
        },
        {
          kind: "p",
          text:
            "4.11. A Megbízó köteles a Szerződésben megjelölni azon iratait, amelyeket az Ingatlanban őriz, illetve ott tart rendelkezésre. A Rendelet 2. § (1) bekezdése alapján a székhelyen rendelkezésre kell tartani legalább a Megbízó cégiratait, hatósági engedélyeit, az adóhatósági adatbejelentési kötelezettségekkel összefüggő iratait, valamint a számviteli törvény szerinti beszámolóját.",
        },
        {
          kind: "p",
          text:
            "4.12. A Megbízott a székhelyen tartott hatósági ellenőrzés során a jogszabályban előírtak szerint együttműködik, az eljárást nem akadályozza, és az ellenőrzésről, valamint az ellenőrzés során részére átadott iratokról a Megbízót haladéktalanul értesíti. A hatósági kényszerintézkedés kizárólag a Megbízó irataira és ingóságaira terjedhet ki.",
        },
        {
          kind: "p",
          text:
            "4.13. A Megbízott a küldeményeket a Megbízó részére történő, dokumentált átadásáig, legkésőbb azonban a Szerződés megszűnését követő 30 (harminc) napig őrzi. A Megbízott nem köteles a küldemények postai továbbküldésére; továbbküldést a Megbízó írásbeli kérésére, a postai költség és a Díjtáblázat szerinti kezelési díj előzetes megfizetése esetén teljesít.",
        },
        {
          kind: "p",
          text:
            "4.14. A Rendelet 3. §-ára tekintettel a Megbízott nem vehet igénybe és a Megbízó sem kérhet olyan postai szolgáltatást (így különösen átirányítást), amely azt eredményezi, hogy a Megbízó küldeményét a székhelytől eltérő címen veszik át.",
        },
        {
          kind: "p",
          text:
            "4.15. **A szolgáltatás tartalmán kívül eső feladatok.** A Megbízott szolgáltatása nem foglalja magában a könyvelést, a bérszámfejtést, az adóbevallás elkészítését, a jogi képviseletet, a jogi vagy adótanácsadást, a cégeljárásban való képviseletet, a Megbízó határidőinek figyelemmel kísérését, továbbá a küldemények tartalmának értelmezését vagy a Megbízó erre vonatkozó tájékoztatását. A Megbízott a küldemények tartalmát nem vizsgálja és nem értékeli.",
        },
      ],
    },
    {
      id: "kezbesitesi-megbizott",
      number: "5.",
      title: "Kézbesítési megbízotti szolgáltatás",
      blocks: [
        {
          kind: "p",
          text:
            "5.1. A Megbízott a Szerződésben kifejezetten rögzített esetben, külön díj ellenében ellátja a kézbesítési megbízotti feladatokat a Megbízó cégjegyzékbe bejegyzett külföldi személye (tagja, vezető tisztségviselője) részére. A kézbesítési megbízotti jogviszony a megbízásról és annak elfogadásáról szóló okirat aláírásával jön létre, és a cégjegyzékbe való bejegyzéssel válik a cégnyilvántartásban közhitelesen nyilvántartottá.",
        },
        {
          kind: "p",
          text:
            "5.2. A Megbízott kézbesítési megbízottként átveszi a külföldi személynek a cég működésével összefüggésben küldött hivatalos iratokat, az átvételt nyilvántartásában dokumentálja (érkeztetés), és az iratot a 4.7. pont szerinti módon és határidőben továbbítja.",
        },
        {
          kind: "p",
          text:
            "5.3. A Megbízott kijelenti, hogy kézbesítési megbízotti tisztségének vállalása nem esik jogszabály tiltó vagy korlátozó rendelkezése alá, és hogy nem tagja, vezető tisztségviselője, felügyelőbizottsági tagja a Megbízó cégnek.",
        },
        {
          kind: "p",
          text:
            "5.4. A Megbízó, illetve a külföldi személy tudomásul veszi, hogy a kézbesítési megbízott részére joghatályosan kézbesített iratok tekintetében a kézbesítés jogkövetkezményei a jogszabályok szerint beállnak, függetlenül attól, hogy a külföldi személy az iratot a megbízottjától mikor vette át vagy ismerte meg.",
        },
        {
          kind: "p",
          text:
            "5.5. A kézbesítési megbízotti jogviszony megszűnése esetén a Megbízott a Ctv. szerinti eljárási rendet követi: a megbízás megszűnéséről (lemondásáról) a külföldi személyt írásban tájékoztatja, és őt egyidejűleg felhívja új kézbesítési megbízott kijelölésére. A Megbízó, illetve a külföldi személy tudomásul veszi, hogy ha a felhívást követő 60 (hatvan) napon belül nem jelöl ki új kézbesítési megbízottat és azt a cégbírósághoz nem jelenti be, a Megbízott a cégbíróságnál törvényességi felügyeleti eljárást kezdeményezhet, amelynek jogkövetkezményei (pénzbírság, felügyelőbiztos kirendelése, az ismeretlen székhelyű cég megszüntetésére irányuló eljárás) a Megbízót, illetve vezető tisztségviselőjét terhelik.",
        },
        {
          kind: "p",
          text:
            "5.6. A Megbízott a kézbesítési megbízotti feladatokat a lemondás hatályosulásáig, illetve a jogszabályban meghatározott időpontig ellátja, ezt követően a részére érkező iratokat átvenni nem jogosult.",
        },
      ],
    },
    {
      id: "irodahasznalat",
      number: "6.",
      title: "Irodahasználat, tárgyalóhasználat",
      blocks: [
        {
          kind: "p",
          text:
            "6.1. A Megbízó a Szerződésben rögzített csomag szerint jogosult az Eco-office közösségi iroda használatára. Az irodahasználat nem jelenti az Ingatlan kizárólagos birtoklását, és nem keletkeztet bérleti jogviszonyt.",
        },
        {
          kind: "p",
          text:
            "6.2. A tárgyalóhasználat előzetes foglalás alapján, a Megbízott mindenkori díjszabása szerint vehető igénybe. A Megbízó az irodát és a tárgyalót rendeltetésének megfelelően, a házirend szerint használja, és az általa okozott kárért a Ptk. szabályai szerint felel.",
        },
      ],
    },
    {
      id: "dijak",
      number: "7.",
      title: "Díjak, fizetési feltételek",
      blocks: [
        {
          kind: "p",
          text:
            "7.1. A Megbízott szolgáltatásainak díját a Díjtáblázat tartalmazza. A díjak nettó összegek, amelyekre a mindenkori általános forgalmi adó rakódik.",
        },
        {
          kind: "p",
          text:
            "7.2. A Megbízó a díjat **12 (tizenkét) havi időszakra, előre, egy összegben** fizeti meg. A Megbízott a díjról szóló számlát a szolgáltatási időszak kezdetét megelőzően állítja ki, és azt elektronikus úton megküldi a Megbízó részére. A szolgáltatás nyújtásának, illetve a székhelyhasználati hozzájáruló nyilatkozat kiadásának feltétele a díj teljes összegének jóváírása a Megbízott bankszámláján.",
        },
        {
          kind: "p",
          text:
            "7.3. A fizetés teljesítésének napja az az időpont, amikor a díj a Megbízott bankszámláján jóváírásra kerül. Az átutalás költségeit az átutalást indító fél viseli.",
        },
        {
          kind: "p",
          text:
            "7.4. Fizetési késedelem esetén a Megbízott a Ptk. 6:155. § szerinti késedelmi kamatra, valamint a behajtási költségátalányról szóló 2016. évi IX. törvény szerinti 40 EUR összegű behajtási költségátalányra jogosult, továbbá követelheti a követelés behajtásával összefüggésben felmerült, igazolt költségeit.",
        },
        {
          kind: "p",
          text:
            "7.5. Ha a Megbízónak 30 (harminc) napot meghaladó díjhátraléka van, a Megbízott jogosult a küldemények szkennelését és továbbítását a hátralék megfizetéséig felfüggeszteni. A Megbízott ebben az esetben is értesíti a Megbízót a küldemény beérkezéséről a 4.8. pont szerint, és a küldeményt megőrzi.",
        },
        {
          kind: "p",
          text:
            "7.6. A már megfizetett díj a Szerződés időtartamának lejárta előtti megszűnése esetén – ideértve a Megbízó általi felmondást, a Megbízó szerződésszegése miatti azonnali hatályú felmondást, valamint azt az esetet, ha a Megbízó a székhelyét a szolgáltatási időszak lejárta előtt áthelyezi – **nem téríthető vissza**, és a Megbízott azt a szolgáltatás rendelkezésre állásának ellenértékeként megtartja. A Megbízó e kikötést a 3.3. pont szerinti kifejezett elfogadással ismeri el.",
        },
        {
          kind: "p",
          text:
            "7.7. **Díjkiigazítás.** A Megbízott a díjat évente egy alkalommal, a Központi Statisztikai Hivatal által a megelőző naptári évre közzétett fogyasztói árindex (infláció) mértékével megegyezően, automatikusan kiigazítja. A kiigazított díj a közzétételt követő naptári hónap első napjától alkalmazandó, és a következő, előre kiszámlázott időszakra érvényesül; a Megbízott a kiigazításról a számla kiállításával egyidejűleg, írásban tájékoztatja a Megbízót. A kiigazítás mértéke a fogyasztói árindex mértékét nem haladhatja meg. Ha a Megbízott a közzétételt követő 90 (kilencven) napon belül nem gyakorolja a kiigazítás jogát, az adott évre vonatkozóan arról lemond.",
        },
        {
          kind: "p",
          text:
            "7.8. A Megbízó tudomásul veszi, hogy a Megbízott a Díjtáblázatban meghatározott külön díjakra is jogosult, így különösen a csomagtárolás, a levéltárolás, a 20 oldalt meghaladó szkennelés, a postai továbbküldés kezelése, az iratok soron kívüli kiadása, a hatósági ellenőrzésben való közreműködés és a szerződésmódosítással összefüggő adminisztráció esetén.",
        },
      ],
    },
    {
      id: "aszf-modositas",
      number: "8.",
      title: "Az ÁSZF egyoldalú módosítása",
      blocks: [
        {
          kind: "p",
          text:
            "8.1. A Megbízott jogosult jelen ÁSZF-et egyoldalúan módosítani, kizárólag az alábbi okok valamelyikének fennállása esetén:",
        },
        {
          kind: "lettered",
          items: [
            "a szolgáltatásra vonatkozó jogszabály, hatósági előírás vagy bírósági, hatósági döntés megváltozása;",
            "a szolgáltatás nyújtásához igénybe vett harmadik személy (postai szolgáltató, informatikai szolgáltató, az Ingatlan tulajdonosa) szerződési feltételeinek vagy díjainak megváltozása;",
            "a szolgáltatás tartalmának bővítése, új szolgáltatási elem bevezetése;",
            "a Megbízott működésében, szervezetében, adataiban bekövetkezett változás;",
            "nyilvánvaló szövegezési hiba vagy ellentmondás javítása, amely a Megbízó jogait és kötelezettségeit érdemben nem érinti.",
          ],
        },
        {
          kind: "p",
          text:
            "8.2. A Megbízott a módosítást – megjelölve az érintett pontokat, a módosítás okát és hatálybalépésének napját – a hatálybalépést megelőzően legalább 30 (harminc) nappal elektronikus úton megküldi a Megbízónak, és a honlapján közzéteszi.",
        },
        {
          kind: "p",
          text:
            "8.3. Ha a Megbízó a módosítást nem fogadja el, a módosítás közlésétől számított 30 (harminc) napon belül jogosult a Szerződést a módosítás hatálybalépésének napjára, írásban felmondani; e felmondási jog gyakorlását a 12.4. pont szerinti felmondási tilalom nem zárja ki. Ebben az esetben a Megbízott a már megfizetett díjnak a fel nem használt időszakra arányosan eső részét a Megbízó részére visszafizeti.",
        },
        {
          kind: "p",
          text:
            "8.4. Ha a Megbízó a 8.3. pont szerinti határidőn belül nem mond fel, a módosítás a hatálybalépés napjával a Szerződés részévé válik. A 7.7. pont szerinti automatikus díjkiigazítás nem minősül egyoldalú szerződésmódosításnak.",
        },
        { kind: "p", text: "8.5. A Megbízó egyoldalú szerződésmódosításra nem jogosult." },
      ],
    },
    {
      id: "atvilagitas",
      number: "9.",
      title: "Ügyfél-átvilágítás, pénzmosás megelőzése",
      blocks: [
        {
          kind: "p",
          text:
            "9.1. A Megbízott a Pmt. alapján köteles a Megbízót, annak képviselőjét, a nevében eljáró személyt, valamint tényleges tulajdonosát azonosítani és átvilágítani. A Megbízó köteles a Megbízott által kért okiratokat és nyilatkozatokat – így különösen a személyazonosító okmányok másolatát, a tényleges tulajdonosi nyilatkozatot és a kiemelt közszereplői (PEP) nyilatkozatot – hiánytalanul rendelkezésre bocsátani.",
        },
        {
          kind: "p",
          text:
            "9.2. A Szerződés megkötésének, illetve hatálybalépésének feltétele az ügyfél-átvilágítás sikeres elvégzése. Ha a Megbízó az átvilágításhoz nem járul hozzá, az adatszolgáltatást megtagadja, vagy az átvilágítás eredménye alapján a jogszabályi feltételek nem állnak fenn, a Megbízott a Pmt. alapján köteles az üzleti kapcsolat létesítését, illetve a megbízás teljesítését megtagadni, vagy a fennálló üzleti kapcsolatot megszüntetni. Az ebből eredő következményekért a Megbízott felelősséget nem vállal, és a díj a 7.6. pont szerint nem téríthető vissza.",
        },
        {
          kind: "p",
          text:
            "9.3. A Megbízó köteles az átvilágítás során közölt adatokban bekövetkezett változást annak bekövetkezésétől számított 5 (öt) munkanapon belül a Megbízottnak bejelenteni.",
        },
        {
          kind: "p",
          text:
            "9.4. A Megbízó tudomásul veszi, hogy a Megbízottat jogszabályon alapuló bejelentési kötelezettség terheli a pénzügyi információs egységként működő hatóság felé, továbbá hogy a Megbízott a bejelentés megtételéről, annak tartalmáról és a hatóság megkereséséről – a Pmt. rendelkezései szerint – a Megbízót nem tájékoztathatja. E kötelezettség teljesítése nem minősül a Megbízott szerződésszegésének vagy titoktartási kötelezettsége megsértésének.",
        },
      ],
    },
    {
      id: "felelosseg",
      number: "10.",
      title: "Felelősség",
      blocks: [
        {
          kind: "p",
          text:
            "10.1. A Megbízott a szolgáltatást a Ptk. 6:272. §-a szerinti megbízási jogviszony keretében, a tőle elvárható gondossággal (gondossági kötelem) teljesíti. A Megbízott a szolgáltatás eredményéért, illetve a Megbízó üzleti céljainak eléréséért nem felel.",
        },
        { kind: "p", text: "10.2. A Megbízott nem felel:" },
        {
          kind: "lettered",
          items: [
            "a postai vagy más szolgáltató hibájából, illetve a küldemény késedelmes, hibás vagy elmaradt kézbesítéséből eredő kárért;",
            "a Megbízó által megadott hibás, hiányos vagy elavult adatokból, különösen érvénytelen e-mail címből, elérhetetlenségből eredő kárért;",
            "a Megbízó jogszabályi kötelezettségei (adóbejelentés, beszámoló, határidők) elmaradásáért vagy késedelmes teljesítéséért;",
            "a küldemény tartalmából eredő következményekért, ideértve a határidők elmulasztását és a jogorvoslati jogok elvesztését;",
            "elektronikus hírközlési, informatikai vagy e-mail szolgáltatási hibából, kiszolgáló-kimaradásból eredő kárért;",
            "a 13. pont szerinti vis maior eseményből eredő kárért.",
          ],
        },
        {
          kind: "p",
          text:
            "10.3. A Megbízott kártérítési felelősségének felső határa – a szándékosan okozott, továbbá az emberi életet, testi épséget vagy egészséget megsértő szerződésszegéssel okozott kár esetét kivéve (Ptk. 6:152. §) – a Megbízó által a kárt kiváltó szerződésszegést megelőző 12 (tizenkét) hónapban a Megbízottnak megfizetett nettó díj összege. A Megbízott nem felel a Megbízó elmaradt vagyoni előnyéért, üzleti veszteségéért, jóhírnevének sérelméből eredő kárért és egyéb közvetett kárért.",
        },
        {
          kind: "p",
          text:
            "10.4. A 10.2.–10.3. pont nem zárja ki és nem korlátozza a Megbízott Rendelet 2. §-ából fakadó, jogszabályban előírt kötelezettségeit; e kötelezettségek alóli mentesítésre vonatkozó kikötés érvénytelen.",
        },
        {
          kind: "p",
          text:
            "10.5. A Megbízó köteles a Megbízottat mentesíteni minden olyan igény, bírság, költség és kár alól, amely abból ered, hogy a Megbízó az Ingatlant a jogszabályoktól eltérően használta, az adatszolgáltatási, bejelentési vagy iratátadási kötelezettségét megszegte, vagy a Megbízottnak valótlan adatot szolgáltatott.",
        },
      ],
    },
    {
      id: "titoktartas",
      number: "11.",
      title: "Titoktartás, levéltitok",
      blocks: [
        {
          kind: "p",
          text:
            "11.1. A Felek a Szerződés teljesítése során tudomásukra jutott minden nem nyilvános adatot, tényt és információt üzleti titokként kötelesek kezelni. A titoktartási kötelezettség időbeli korlátozás nélkül, a Szerződés megszűnése után is fennáll.",
        },
        {
          kind: "p",
          text:
            "11.2. A Megbízott és a Megbízott nevében eljáró személyek a küldemények felnyitása során tudomásukra jutott tartalmat, levéltitkot és magántitkot megőrzik, azt harmadik személy számára nem teszik megismerhetővé, kivéve, ha erre jogszabály kötelezi őket, vagy ha ahhoz a Megbízó írásban hozzájárult.",
        },
        {
          kind: "p",
          text:
            "11.3. Nem minősül a titoktartási kötelezettség megsértésének a jogszabályon alapuló adatszolgáltatás, így különösen a hatósági megkeresés teljesítése, a Pmt. szerinti bejelentés, valamint az az eset, amikor a Megbízott a titkot a Megbízóval szemben fennálló lejárt követelésének érvényesítéséhez szükséges mértékben használja fel.",
        },
        {
          kind: "p",
          text:
            "11.4. A Megbízott a titoktartási kötelezettség betartását a munkavállalói, alvállalkozói és közreműködői részéről is biztosítja.",
        },
      ],
    },
    {
      id: "megszunes",
      number: "12.",
      title: "A Szerződés időtartama, megszűnése",
      blocks: [
        {
          kind: "p",
          text:
            "12.1. A Szerződés – a Rendelet 1. § (3) bekezdésére tekintettel – határozatlan időre jön létre. Határozott időre szóló szerződés kizárólag akkor kötött, ha a cég létesítésére is határozott időre került sor.",
        },
        {
          kind: "p",
          text:
            "12.2. A szolgáltatás elszámolási időszaka 12 (tizenkét) hónap, amely a szolgáltatás kezdő napjától számítódik, és – felmondás hiányában – további 12 (tizenkét) hónappal automatikusan megújul. A Megbízott a megújuló időszak díját a 7.2. pont szerint előre számlázza.",
        },
        {
          kind: "p",
          text:
            "12.3. A Felek a Szerződést közös megegyezéssel, írásban bármikor megszüntethetik; ebben az esetben a megszűnés napját közösen határozzák meg.",
        },
        {
          kind: "p",
          text:
            "12.4. **Rendes felmondás.** A Szerződést bármely Fél 30 (harminc) napos felmondási idővel, írásban felmondhatja. A Rendelet 1. § (3) bekezdése alapján a rendes felmondás jogát a Felek **a szerződéskötést követő egy éven belül nem gyakorolhatják.** A 8.3. pont szerinti felmondási jogot e tilalom nem érinti.",
        },
        {
          kind: "p",
          text:
            "12.5. A Megbízó tudomásul veszi, hogy a rendes felmondás a 7.6. pont alkalmazását nem érinti: a felmondás a már megfizetett díj visszafizetésére nem ad alapot.",
        },
        {
          kind: "p",
          text:
            "12.6. **Azonnali hatályú felmondás.** Súlyos szerződésszegés esetén a sérelmet szenvedett Fél a Szerződést póthatáridő tűzése nélkül, írásban, azonnali hatállyal felmondhatja. A felmondásban a szerződésszegés tényét és annak alapjául szolgáló körülményeket meg kell jelölni.",
        },
        { kind: "p", text: "12.7. A Felek súlyos szerződésszegésnek tekintik különösen, ha" },
        {
          kind: "lettered",
          items: [
            "a Megbízó az esedékes díjat – írásbeli fizetési felszólítás ellenére – az esedékességtől számított 30 (harminc) napon túl sem fizeti meg;",
            "a Megbízó az ügyfél-átvilágításhoz szükséges adatokat, okiratokat vagy nyilatkozatokat nem bocsátja rendelkezésre, vagy valótlan adatot szolgáltat;",
            "a Megbízó a Rendelet szerinti iratátadási, illetve a Szerződés szerinti adatszolgáltatási és iratőrzési kötelezettségét megszegi;",
            "a Megbízó az Ingatlant a Szerződésben foglaltaktól eltérő célra használja, ott a Megbízott hozzájárulása nélkül tevékenységet végez, vagy az Ingatlan címét a Szerződés tárgyán kívüli célra (így különösen kereskedelmi csomagok átvételére) használja;",
            "a Megbízó a megadott elérhetőségeken – a Megbízott előzetes értesítése nélkül – 30 (harminc) napot meghaladóan elérhetetlenné válik, vagy a részére küldött elektronikus levél visszaérkezik;",
            "a Megbízó a küldeményeiért egy naptári negyedéven keresztül nem jelentkezik, és azokat felszólítás ellenére sem veszi át;",
            "bármely Fél ellen felszámolási, kényszertörlési eljárás indul, vagy jogerősen elrendelik a törlését;",
            "bármely Fél a titoktartási kötelezettségét megszegi;",
            "a Megbízott tudomására jut olyan körülmény, amely alapján a Pmt. szerinti kötelezettségei teljesítése a jogviszony fenntartása mellett nem biztosítható.",
          ],
        },
        {
          kind: "p",
          text:
            "12.8. **A megszűnés jogkövetkezményei.** A Szerződés megszűnésének napján a Megbízó köteles a Megbízott által őrzött iratait és ingóságait – személyesen vagy meghatalmazottja útján – a Megbízott székhelyén, a Rendelet szerinti jegyzék alapján, átvételi elismervény ellenében átvenni. Ha a Megbízó az átvételt elmulasztja, a Megbízott az iratokat a Megbízó költségére és veszélyére postai úton megküldheti, illetve azokat a 4.13. pont szerinti 30 napos határidő elteltéig megőrzi.",
        },
        {
          kind: "p",
          text:
            "12.9. A Megbízó tudomásul veszi, hogy a Szerződés megszűnése esetén köteles haladéktalanul gondoskodni új székhely bejelentéséről és a változásbejegyzési kérelem cégbírósághoz történő benyújtásáról, valamint az Art. szerinti adatbejelentés megtételéről. Ha a Megbízó a Szerződés megszűnésétől számított 15 (tizenöt) munkanapon belül nem igazolja hitelt érdemlően a változásbejegyzési kérelem benyújtását, a Megbízott a Díjtáblázat szerinti kötbérre jogosult, a kötelezettség teljesítéséig, legfeljebb azonban 12 (tizenkét) hónap időtartamra.",
        },
        {
          kind: "p",
          text:
            "12.10. A Megbízó tudomásul veszi, hogy a Szerződés megszűnése esetén a Megbízott jogosult – és a jogszabályi kötelezettségei teljesítéséhez szükséges mértékben köteles – a Szerződés megszűnésének tényéről és időpontjáról az állami adó- és vámhatóságot és a cégbíróságot értesíteni, valamint a Ctv. 74. §-a alapján, jogi érdekének valószínűsítése mellett, a cégbíróságnál törvényességi felügyeleti eljárást kezdeményezni. Az eljárás jogkövetkezményei – ideértve a pénzbírságot, a felügyelőbiztos kirendelését és a cég megszűntnek nyilvánítását – a Megbízót, illetve vezető tisztségviselőjét terhelik.",
        },
        {
          kind: "p",
          text:
            "12.11. A Szerződés megszüntetésével összefüggő jognyilatkozatokat a Felek egymásnak postai úton, tértivevényes levélben is megküldik. A Megbízott e küldeményeket a Megbízó cégjegyzék szerinti székhelyére, illetve vezető tisztségviselőjének cégjegyzék szerinti lakóhelyére küldi. A küldemény a feladástól számított **5. (ötödik) munkanapon kézbesítettnek minősül** akkor is, ha a címzett azt nem vette át, vagy az részére nem volt kézbesíthető.",
        },
      ],
    },
    {
      id: "vis-maior",
      number: "13.",
      title: "Vis maior",
      blocks: [
        {
          kind: "p",
          text:
            "13.1. Nem minősül szerződésszegésnek, ha a Fél kötelezettségének teljesítését olyan, ellenőrzési körén kívül eső esemény késlelteti vagy akadályozza, amelyet nem láthatott előre és nem háríthatott el (vis maior), így különösen háború, terrorcselekmény, zavargás, sztrájk, embargó, járvány, hatósági intézkedés, természeti katasztrófa, tűz, árvíz, áramkimaradás, az elektronikus hírközlési vagy postai szolgáltatás tartós kiesése.",
        },
        {
          kind: "p",
          text:
            "13.2. Az érintett Fél a vis maior eseményről a másik Felet haladéktalanul értesíti, és a teljesítés érdekében a tőle elvárható intézkedéseket megteszi. Ha a vis maior állapot 60 (hatvan) napot meghaladóan fennáll, bármely Fél jogosult a Szerződést írásban, azonnali hatállyal felmondani.",
        },
      ],
    },
    {
      id: "kapcsolattartas",
      number: "14.",
      title: "Kapcsolattartás, értesítések",
      blocks: [
        {
          kind: "p",
          text:
            "14.1. A Felek közötti kapcsolattartás – a 12.11. pontban foglalt kivétellel – elektronikus úton, a Szerződésben megadott e-mail címeken történik. A Megbízó köteles biztosítani, hogy a megadott e-mail cím elektronikus levelek fogadására alkalmas legyen.",
        },
        {
          kind: "p",
          text:
            "14.2. A Megbízó jogosult kapcsolattartó személyeket megnevezni. Utasítás adására kizárólag a Megbízó cégjegyzékbe bejegyzett képviselője, illetve az általa írásban erre felhatalmazott kapcsolattartó jogosult. A Megbízott a kapcsolattartó nyilatkozatát a Megbízó nyilatkozatának tekinti, amíg a felhatalmazás visszavonását a Megbízó írásban be nem jelenti. A kapcsolattartókra a Megbízott a Pmt. szerinti azonosítási kötelezettségeket is teljesíti.",
        },
        {
          kind: "p",
          text:
            "14.3. Az e-mail útján megküldött értesítés **az elküldés napján kézbesítettnek minősül**, függetlenül attól, hogy a címzett azt mikor nyitotta meg. A kiküldés tényét és időpontját a 4.9. pont szerinti rendszerek naplója igazolja. Az elektronikus úton megküldött számla, értesítés és nyilatkozat a papíralapú irattal egyenértékű.",
        },
        {
          kind: "p",
          text:
            "14.4. A Megbízó köteles a Szerződésben megadott adataiban (különösen cégadat, képviselő, e-mail cím, levelezési cím) bekövetkezett változást haladéktalanul, de legkésőbb 5 (öt) munkanapon belül, igazolható módon bejelenteni. A bejelentés elmaradásából eredő következményeket a Megbízó viseli.",
        },
        {
          kind: "p",
          text:
            "14.5. A Megbízó gazdasági társaság azon tagja, aki nem kapcsolattartó és meghatalmazással nem rendelkezik, a Megbízott előtt a társaság ügyeiben nem járhat el; részére a Megbízott tájékoztatást, iratbetekintést kizárólag a vezető tisztségviselő írásbeli meghatalmazása alapján adhat. Ugyanez irányadó minden további harmadik személyre, a törvényes jogkörében eljáró hatósági személy kivételével.",
        },
      ],
    },
    {
      id: "adatkezeles",
      number: "15.",
      title: "Adatkezelés",
      blocks: [
        {
          kind: "p",
          text:
            "15.1. A Megbízott a személyes adatokat az Európai Parlament és a Tanács (EU) 2016/679 rendelete (GDPR) és az információs önrendelkezési jogról és az információszabadságról szóló 2011. évi CXII. törvény rendelkezései szerint kezeli. Az adatkezelés részleteit – a célokat, jogalapokat, megőrzési időket és az érintettek jogait – a Megbízott [Adatkezelési tájékoztatója](/adatvedelem) tartalmazza, amely a Megbízott honlapján elérhető, és amelyet a Megbízott a szerződéskötést megelőzően a Megbízó rendelkezésére bocsát.",
        },
        {
          kind: "p",
          text:
            "15.2. A Felek rögzítik, hogy a Megbízó részére érkező küldemények harmadik személyek személyes adatait is tartalmazhatják. E személyes adatok tekintetében az adatkezelő a Megbízó, a Megbízott pedig a GDPR 28. cikke szerinti adatfeldolgozóként jár el a küldemények átvétele, felnyitása, szkennelése, továbbítása és őrzése körében. A Felek – a Megbízó kérésére, illetve szükség esetén – külön adatfeldolgozói megállapodást kötnek. A Megbízó felel azért, hogy az érintetteket az adatkezelésről tájékoztassa.",
        },
        {
          kind: "p",
          text:
            "15.3. A Megbízó képviselője és kapcsolattartója az adatkezelésről szóló tájékoztatást a Szerződés aláírásával megismeri; a szerződéses és jogszabályi kötelezettségen alapuló adatkezelés nem hozzájáruláson alapul, ezért annak visszavonásával nem szüntethető meg.",
        },
      ],
    },
    {
      id: "egyeb",
      number: "16.",
      title: "Egyéb rendelkezések",
      blocks: [
        {
          kind: "p",
          text:
            "16.1. A Megbízó a Szerződésből eredő jogait és kötelezettségeit a Megbízott előzetes írásbeli hozzájárulása nélkül harmadik személyre nem ruházhatja át, és azokat nem engedményezheti.",
        },
        {
          kind: "p",
          text:
            "16.2. A Megbízott jogosult a szolgáltatás teljesítéséhez közreműködőt igénybe venni; a közreműködő magatartásáért a Megbízott a Ptk. szabályai szerint felel.",
        },
        {
          kind: "p",
          text:
            "16.3. Ha a Szerződés vagy jelen ÁSZF bármely rendelkezése érvénytelennek vagy végrehajthatatlannak minősül, az a többi rendelkezés érvényességét nem érinti. A Felek az érvénytelen rendelkezést olyan érvényes rendelkezéssel helyettesítik, amely a felek szerződéses céljához a lehető legközelebb áll.",
        },
        {
          kind: "p",
          text:
            "16.4. Ha a Szerződésben vagy jelen ÁSZF-ben meghatározott határidő utolsó napja nem munkanap, a határidő a következő munkanapon jár le.",
        },
        {
          kind: "p",
          text: "16.5. A Megbízott bármely jogának nem gyakorlása vagy késedelmes gyakorlása nem jelent jogfeladást.",
        },
        {
          kind: "p",
          text:
            "16.6. A Felek közötti kapcsolattartás nyelve a magyar. Ha a Szerződés, jelen ÁSZF vagy bármely értesítés magyar és idegen nyelven is elkészül, a két változat közötti bármely eltérés esetén a magyar nyelvű változat az irányadó.",
        },
        {
          kind: "p",
          text:
            "16.7. A Megbízó kijelenti, hogy a Szerződésben és az átvilágítás során megadott adatai a valóságnak megfelelnek, és azokat okirattal igazolta; továbbá hogy a megbízás gondossági kötelem jellegéről, az ügyfél-átvilágítás céljáról és módjáról, a teljesítés megtagadásának és a jogszabályi bejelentésnek az eseteiről részletes tájékoztatást kapott.",
        },
        {
          kind: "p",
          text:
            "16.8. Jelen ÁSZF 2026. január 1. napján lép hatályba, és a hatálybalépését követően megkötött szerződésekre, valamint – a 8. pont szerinti eljárás lefolytatása után – a már fennálló szerződésekre is alkalmazandó. A korábbi, 2018. január 10. napján hatályba lépett ÁSZF (1.0 verzió) a hatálybalépéssel egyidejűleg hatályát veszti.",
        },
      ],
    },
    {
      id: "melleklet-1",
      number: "1. sz. melléklet –",
      title: "Díjtáblázat",
      blocks: [
        {
          kind: "p",
          text:
            "Hatályos: 2026. január 1-től. A díjak nettó összegek, az általános forgalmi adót nem tartalmazzák.",
        },
        { kind: "h3", text: "Székhelyszolgáltatás" },
        {
          kind: "table",
          head: ["Csomag", "Díj", "Tartalom"],
          rows: [
            [
              "Székhely – magyar lakcímmel rendelkező ügyfél",
              "8 000 Ft + áfa / hó",
              "székhelycím, cégtábla, postakezelés, szkennelés és e-mailes továbbítás, iratőrzés",
            ],
            [
              "Székhely – külföldi ügyfél",
              "10 000 Ft + áfa / hó",
              "a fenti tartalom, angol nyelvű szerződéssel és dokumentációval",
            ],
            [
              "Székhely + irodahasználat",
              "18 000 Ft + áfa / hó",
              "székhelyszolgáltatás + havi 4 alkalom irodahasználat az Eco-office közösségi irodában, kedvezményes tárgyalóbérlés",
            ],
          ],
        },
        { kind: "h3", text: "Kézbesítési megbízotti szolgáltatás" },
        {
          kind: "table",
          head: ["Szolgáltatás", "Díj"],
          rows: [["Kézbesítési megbízott (cégenként)", "5 000 Ft + áfa / hó"]],
        },
        { kind: "h3", text: "Külön díjak" },
        {
          kind: "table",
          head: ["Tétel", "Díj"],
          rows: [
            ["Csomagtárolás a beérkezéstől számított 10. munkanapot követően", "500 Ft + áfa / nap / csomag"],
            ["Levéltárolás a 4.13. pont szerinti határidőn túl", "1 000 Ft + áfa / hó"],
            ["Szkennelés 20 oldal felett", "50 Ft + áfa / oldal"],
            ["Postai továbbküldés kezelési díja", "2 000 Ft + áfa / küldemény + a postai költség"],
            ["Iratok soron kívüli kiadása, iratmásolat", "5 000 Ft + áfa / alkalom"],
            ["Közreműködés hatósági ellenőrzésben (az első megkezdett óra után)", "10 000 Ft + áfa / óra"],
            ["Szerződésmódosítás, új hozzájáruló nyilatkozat kiadása", "5 000 Ft + áfa / alkalom"],
            ["Kötbér a 12.9. pont szerinti esetben", "10 000 Ft + áfa / hó"],
          ],
        },
        {
          kind: "p",
          text:
            "**Fizetési feltétel:** 12 havi díj előre, egy összegben. A díj a 7.6. pont szerint nem téríthető vissza.",
        },
      ],
    },
    {
      id: "melleklet-2",
      number: "2. sz. melléklet –",
      title: "Postai meghatalmazás (minta)",
      blocks: [
        {
          kind: "p",
          text:
            "A Megbízó a Szerződés megkötésével egyidejűleg a Magyar Posta Zrt. mindenkori általános szerződési feltételeinek megfelelő tartalommal és formában postai meghatalmazást ad a Megbízott, valamint a Megbízott nevében eljáró, általa megjelölt személyek részére a Megbízó cégnevére érkező postai küldemények átvételére. A meghatalmazás kiterjed a küldemények felnyitására és tartalmuk megismerésére.",
        },
      ],
    },
    {
      id: "melleklet-3",
      number: "3. sz. melléklet –",
      title: "Irat- és ingóságjegyzék (minta)",
      blocks: [
        {
          kind: "table",
          head: ["Sorszám", "Irat / ingóság megnevezése", "Átadás napja", "Átadó", "Átvevő aláírása"],
          rows: [
            ["", "", "", "", ""],
            ["", "", "", "", ""],
            ["", "", "", "", ""],
          ],
        },
      ],
    },
  ],
  closing: ["Budapest, 2026. január 1.", "E-Marketplace Szolgáltató Kft."],
};

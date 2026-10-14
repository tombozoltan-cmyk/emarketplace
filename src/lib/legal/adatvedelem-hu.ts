import type { LegalDocumentContent } from "./types";

/**
 * Adatkezelési tájékoztató 2.0 – hatályos 2026. január 1-től.
 * A szöveg a `public/legal/adatkezelesi-tajekoztato-v2.0-2026-01-01.pdf`
 * tartalmával egyezik.
 */
export const adatvedelemHu: LegalDocumentContent = {
  language: "hu",
  title: "Adatkezelési tájékoztató",
  subtitle: "székhelyszolgáltatás, kézbesítési megbízotti szolgáltatás és irodahasználat igénybevételéhez",
  lead:
    "Adatkezelő: E-Marketplace Szolgáltató Kft. Jelen tájékoztató az Európai Parlament és a Tanács (EU) 2016/679 rendelete (GDPR) 13. és 14. cikke szerinti tájékoztatás. Alkalmazandó továbbá az információs önrendelkezési jogról és az információszabadságról szóló 2011. évi CXII. törvény (Info tv.).",
  sections: [
    {
      id: "adatkezelo",
      number: "1.",
      title: "Az adatkezelő adatai",
      blocks: [
        {
          kind: "table",
          head: ["Adat", "Érték"],
          rows: [
            ["Név", "E-Marketplace Szolgáltató Korlátolt Felelősségű Társaság"],
            ["Székhely", "1064 Budapest, Izabella utca 68/B."],
            ["Cégjegyzékszám", "01-09-296567"],
            ["Adószám", "25924916-2-42"],
            ["Képviselő", "Kádár Zoltán ügyvezető"],
            ["E-mail", "[emarketplacekft@gmail.com](mailto:emarketplacekft@gmail.com)"],
            ["Telefon", "[06 50 104 61 16](tel:+36501046116)"],
            ["Honlap", "[https://e-marketplace.hu](https://e-marketplace.hu)"],
          ],
        },
        {
          kind: "p",
          text:
            "**Adatvédelmi tisztviselő:** az Adatkezelő a GDPR 37. cikke alapján adatvédelmi tisztviselő kijelölésére nem kötelezett, ezért nem jelölt ki adatvédelmi tisztviselőt. Adatvédelmi kérdésekben a fenti e-mail címen lehet az Adatkezelőhöz fordulni.",
        },
      ],
    },
    {
      id: "erintettek",
      number: "2.",
      title: "Kikre terjed ki a tájékoztató (érintettek)",
      blocks: [
        {
          kind: "ul",
          items: [
            "az Adatkezelő ügyfelének (megbízójának) vezető tisztségviselői, tagjai, tényleges tulajdonosai, képviselői és kapcsolattartói;",
            "a kézbesítési megbízotti szolgáltatással érintett külföldi személyek;",
            "az ajánlatot kérő, kapcsolatfelvételt kezdeményező személyek;",
            "az iratokat átvevő, meghatalmazott személyek;",
            "az irodát, tárgyalót használó személyek;",
            "az Adatkezelő által átvett küldeményekben szereplő harmadik személyek (lásd a 6. pontot).",
          ],
        },
      ],
    },
    {
      id: "celok",
      number: "3.",
      title: "Az adatkezelés céljai, jogalapjai, megőrzési ideje",
      blocks: [
        {
          kind: "p",
          text:
            "A GDPR 13. cikk (1) bekezdés c) pontjának megfelelően az Adatkezelő minden célhoz külön-külön megjelöli a jogalapot.",
        },

        { kind: "h3", text: "3.1. Ajánlatadás, kapcsolatfelvétel" },
        {
          kind: "ul",
          items: [
            "**Kezelt adatok:** név, cégnév, e-mail cím, telefonszám, a megkeresés tartalma.",
            "**Cél:** a megkeresés megválaszolása, ajánlat adása.",
            "**Jogalap:** GDPR 6. cikk (1) bekezdés b) pont – szerződés megkötését megelőző lépések az érintett kérésére; ha a megkeresést a leendő ügyfél képviselője teszi, a jogalap a GDPR 6. cikk (1) bekezdés f) pontja szerinti jogos érdek (az ajánlatkérés teljesítése).",
            "**Megőrzés:** az ajánlat érvényességének lejártát követő 1 (egy) év; szerződéskötés esetén a 3.2. pont szerint.",
          ],
        },

        {
          kind: "h3",
          text: "3.2. A szerződés megkötése és teljesítése (székhely, kézbesítési megbízott, irodahasználat)",
        },
        {
          kind: "ul",
          items: [
            "**Kezelt adatok:** a megbízó cégadatai; a képviselő neve, tisztsége, személyazonosító adatai, aláírása; a kapcsolattartó neve, e-mail címe, telefonszáma; a küldeményekre vonatkozó értesítési adatok; a kézbesítési megbízotti szolgáltatás esetén a külföldi személy neve, születési helye és ideje, anyja neve, lakcíme, azonosító okmányának száma, adóazonosító jele.",
            "**Cél:** a szerződés megkötése és teljesítése, a székhelyhasználati hozzájáruló nyilatkozat kiadása, a küldemények átvétele, érkeztetése, szkennelése és továbbítása, az iratőrzés és iratjegyzék vezetése, a kézbesítési megbízotti feladatok ellátása, kapcsolattartás.",
            "**Jogalap:** GDPR 6. cikk (1) bekezdés b) pont (a szerződés teljesítése); a képviselők és kapcsolattartók adatai esetében GDPR 6. cikk (1) bekezdés f) pont (az Adatkezelő jogos érdeke a szerződés teljesíthetőségéhez és a kapcsolattartáshoz). A jogszabályban előírt kötelezettségek – a székhelyszolgáltatásról szóló 7/2017. (VI. 1.) IM rendelet 2. § és 3. § szerinti iratkezelés, iratjegyzék és értesítés – körében a jogalap a GDPR 6. cikk (1) bekezdés c) pontja.",
            "**Megőrzés:** a szerződés megszűnésétől számított 5 (öt) év (a Ptk. szerinti általános elévülési idő), a számviteli bizonylatok esetén a 3.4. pont szerinti idő, az átvilágítási iratok esetén a 3.3. pont szerinti idő. A szkennelt küldemények és az érkeztető nyilvántartás megőrzési ideje a szerződés megszűnésétől számított 5 (öt) év, az eredeti küldeményeket az Adatkezelő a szerződés megszűnését követő 30 (harminc) napig őrzi, majd azokat átadja vagy – ha az átvétel elmarad – megsemmisíti.",
          ],
        },

        { kind: "h3", text: "3.3. Ügyfél-átvilágítás, pénzmosás megelőzése" },
        {
          kind: "ul",
          items: [
            "**Kezelt adatok:** a Pmt. által előírt adatok: természetes személy neve, születési neve, állampolgársága, születési helye és ideje, anyja neve, lakcíme, azonosító okmányának típusa és száma, az okmány másolata; tényleges tulajdonosi nyilatkozat adatai; kiemelt közszereplői (PEP) nyilatkozat; a pénzeszközök forrására vonatkozó adatok, ha azok bekérése szükséges.",
            "**Cél:** a pénzmosás és a terrorizmus finanszírozása megelőzéséről és megakadályozásáról szóló 2017. évi LIII. törvény (Pmt.) szerinti ügyfél-átvilágítás, az üzleti kapcsolat folyamatos figyelemmel kísérése, bejelentési kötelezettség teljesítése, belső nyilvántartás vezetése.",
            "**Jogalap:** GDPR 6. cikk (1) bekezdés c) pont – az Adatkezelőre vonatkozó jogi kötelezettség teljesítése. Az Adatkezelő a Pmt. 1. § (1) bekezdése alapján székhelyszolgáltatóként szolgáltatónak minősül.",
            "**Megőrzés:** az üzleti kapcsolat megszűnésétől számított 8 (nyolc) év; hatóság megkeresése esetén a Pmt. szerint ennél hosszabb, legfeljebb 10 (tíz) év.",
            "**Megjegyzés:** ezen adatok megadása jogszabályon alapuló kötelezettség. Ha az érintett az adatokat nem adja meg, az Adatkezelő a Pmt. alapján köteles az üzleti kapcsolat létesítését vagy a megbízás teljesítését megtagadni, illetve a fennálló üzleti kapcsolatot megszüntetni.",
          ],
        },

        { kind: "h3", text: "3.4. Számlázás, számviteli bizonylatok megőrzése" },
        {
          kind: "ul",
          items: [
            "**Kezelt adatok:** a számlázási név, cím, adószám, a számla adatai, a teljesítés és a fizetés adatai.",
            "**Cél:** jogszabályi számlázási és bizonylat-megőrzési kötelezettség teljesítése.",
            "**Jogalap:** GDPR 6. cikk (1) bekezdés c) pont – az általános forgalmi adóról szóló 2007. évi CXXVII. törvény és a számvitelről szóló 2000. évi C. törvény szerinti kötelezettség.",
            "**Megőrzés:** a számviteli törvény szerint a bizonylat keletkezésétől számított 8 (nyolc) év.",
          ],
        },

        { kind: "h3", text: "3.5. Jogi igények érvényesítése, követeléskezelés" },
        {
          kind: "ul",
          items: [
            "**Kezelt adatok:** a szerződés és teljesítés adatai, a fizetési előzmények, a levelezés, a fizetési felszólítások.",
            "**Cél:** az Adatkezelő lejárt követelésének érvényesítése, jogi igények előadása és védelme, panaszok kezelése, visszaélések megelőzése.",
            "**Jogalap:** GDPR 6. cikk (1) bekezdés f) pont – az Adatkezelő jogos érdeke a követelései érvényesítéséhez és jogai védelméhez. Az érdekmérlegelési teszt az Adatkezelőnél megtekinthető.",
            "**Megőrzés:** az igény elévüléséig, folyamatban lévő eljárás esetén az eljárás jogerős befejezését követő 1 (egy) évig.",
          ],
        },

        { kind: "h3", text: "3.6. Hatósági megkeresések teljesítése" },
        {
          kind: "ul",
          items: [
            "**Jogalap:** GDPR 6. cikk (1) bekezdés c) pont – jogi kötelezettség (bíróság, ügyészség, nyomozó hatóság, adóhatóság, cégbíróság, végrehajtó megkeresése).",
            "**Megőrzés:** a megkeresés teljesítésétől számított 5 (öt) év.",
          ],
        },

        { kind: "h3", text: "3.7. Honlap üzemeltetése, naplózás, cookie-k" },
        {
          kind: "ul",
          items: [
            "**Kezelt adatok:** IP-cím, a kérés időpontja, a megtekintett oldal, böngésző- és eszközadatok; űrlapkitöltés esetén a 3.1. pont szerinti adatok.",
            "**Cél:** a honlap működtetése, biztonság, a visszaélések megelőzése, statisztika.",
            "**Jogalap:** a működéshez szükséges adatkezelés és a biztonsági naplózás esetén GDPR 6. cikk (1) bekezdés f) pont (jogos érdek); a nem feltétlenül szükséges (statisztikai, marketing) cookie-k esetén GDPR 6. cikk (1) bekezdés a) pont – az érintett hozzájárulása, amelyet a cookie-kezelő felületen bármikor visszavonhat.",
            "**Megőrzés:** a naplóállományok esetén legfeljebb 12 (tizenkét) hónap, a cookie-k esetén a cookie-tájékoztatóban megadott idő.",
          ],
        },

        { kind: "h3", text: "3.8. Hírlevél, üzletszerzési célú megkeresés (ha van)" },
        {
          kind: "ul",
          items: [
            "**Jogalap:** GDPR 6. cikk (1) bekezdés a) pont – hozzájárulás, összhangban a gazdasági reklámtevékenységről szóló 2008. évi XLVIII. törvény 6. §-ával. A hozzájárulás bármikor, díjmentesen visszavonható; a visszavonás nem érinti a visszavonásig végzett adatkezelés jogszerűségét.",
            "**Megőrzés:** a hozzájárulás visszavonásáig.",
          ],
        },

        { kind: "h3", text: "3.9. Irodahasználat, belépés az ingatlanba" },
        {
          kind: "ul",
          items: [
            "**Kezelt adatok:** a belépő neve, a belépés időpontja, az általa használt helyiség.",
            "**Cél:** az ingatlan és az ott őrzött iratok biztonsága, a használat nyomon követése.",
            "**Jogalap:** GDPR 6. cikk (1) bekezdés f) pont – jogos érdek (vagyonvédelem, az iratok biztonsága).",
            "**Megőrzés:** a rögzítéstől számított 6 (hat) hónap.",
          ],
        },

        { kind: "h3", text: "3.10. Kamerás megfigyelés" },
        {
          kind: "ul",
          items: [
            "**Kezelt adatok:** a megfigyelt területre belépő személyek képmása és a belépés időpontja.",
            "**Megfigyelt területek:** az ingatlan közösen használt területei (bejárat, folyosó) és az iratok tárolására szolgáló helyiség (irattároló).",
            "**Cél:** az ingatlan, a berendezés és különösen a megbízók itt őrzött iratainak védelme, a jogosulatlan hozzáférés megelőzése és felderítése.",
            "**Jogalap:** GDPR 6. cikk (1) bekezdés f) pont – az Adatkezelő és a megbízói jogos érdeke (vagyonvédelem, iratbiztonság). Az érdekmérlegelési teszt az Adatkezelőnél megtekinthető.",
            "**Megőrzés:** a felvétel rögzítésétől számított 7 (hét) nap, ezt követően a felvétel automatikusan törlődik. Ha a felvétel jogsértés vagy biztonsági esemény bizonyítására szolgál, az Adatkezelő a felvételt az ügy lezárásáig, illetve a hatósági vagy bírósági eljárás jogerős befejezéséig megőrzi.",
            "**Hozzáférés:** a felvételekhez kizárólag az ügyvezető és az általa írásban felhatalmazott, titoktartásra kötelezett munkatárs fér hozzá. A felvételekről másolat csak hatósági megkeresésre, illetve az érintett kérelmére, az ő képmását tartalmazó részről adható ki.",
            "**Tájékoztatás a helyszínen:** a megfigyelt területek bejáratánál jól látható figyelemfelhívó jelzés és rövid tájékoztató tábla található.",
            "**Az érintett jogai:** az érintett kérheti a róla készült felvételhez való hozzáférést, annak zárolását a megőrzési időn belül, és tiltakozhat a megfigyelés ellen a 9. pont szerint.",
          ],
        },
      ],
    },
    {
      id: "kotelezo-jelleg",
      number: "4.",
      title: "A személyes adatok szolgáltatásának kötelező jellege",
      blocks: [
        {
          kind: "p",
          text:
            "A 3.2. pont szerinti adatok megadása a szerződés megkötésének előfeltétele; a 3.3. és 3.4. pont szerinti adatok megadása jogszabályon alapuló kötelezettség. Ezen adatok hiányában az Adatkezelő a szerződést nem köti meg, illetve azt nem teljesíti. A 3.7. és 3.8. pont szerinti, hozzájáruláson alapuló adatkezelés önkéntes; annak megtagadása a szolgáltatás igénybevételét nem érinti.",
        },
      ],
    },
    {
      id: "leveltitok",
      number: "5.",
      title: "Küldemények átvétele, felnyitása és szkennelése – levéltitok",
      blocks: [
        {
          kind: "p",
          text:
            "5.1. Az Adatkezelő a megbízó cégnevére érkező postai küldeményeket a megbízó által adott postai meghatalmazás alapján, a megbízó meghatalmazottjaként veszi át. A 7/2017. (VI. 1.) IM rendelet 3. §-a alapján az Adatkezelő gondoskodik a küldemények székhelyen történő átvételéről, és az átvételről egy munkanapon belül értesíti a céget.",
        },
        {
          kind: "p",
          text:
            "5.2. A zárt küldemény felnyitására, tartalmának megismerésére és szkennelésére az Adatkezelő kizárólag a megbízó **kifejezett, írásbeli felhatalmazása** alapján jogosult, a szerződés teljesítése (szkennelés, továbbítás, érkeztetés, iratőrzés) céljából. E felhatalmazás hiányában az Adatkezelő a küldeményt nem nyitja fel, hanem annak beérkezéséről értesít.",
        },
        {
          kind: "p",
          text:
            "5.3. Az Adatkezelő és a nevében eljáró személyek a küldemény tartalmát, az abban foglalt levéltitkot, magántitkot és üzleti titkot megőrzik; a megőrzési kötelezettség időbeli korlátozás nélkül, a jogviszony megszűnése után is fennáll. Munkavállalói és közreműködői írásbeli titoktartási nyilatkozatot tesznek.",
        },
        {
          kind: "p",
          text:
            "5.4. A szkennelt állományokat az Adatkezelő jelszóval védett, kétfaktoros hitelesítéssel ellátott üzleti fiókban és saját zárt ügyviteli rendszerében (app.smartszekhely.hu) tárolja; azokhoz kizárólag a szolgáltatás teljesítésében részt vevő, titoktartásra kötelezett munkatársak férhetnek hozzá.",
        },
        {
          kind: "p",
          text:
            "5.5. A küldemények érkeztetése és nyilvántartása az app.smartszekhely.hu rendszerben, az iratok elektronikus megküldése a Brevo levelezőrendszeren keresztül történik. E rendszerek naplózzák a küldemény átvételének, feldolgozásának, kiküldésének és kézbesítésének időpontját; a naplóadatok célja a teljesítés igazolása és az esetleges jogvita esetén a bizonyítás. A naplóadatok kezelésének jogalapja a GDPR 6. cikk (1) bekezdés b) pontja (a szerződés teljesítése) és f) pontja (az Adatkezelő jogos érdeke a teljesítés igazolásához). A naplóadatok megőrzési ideje a szerződés megszűnésétől számított 5 (öt) év.",
        },
      ],
    },
    {
      id: "harmadik-szemelyek",
      number: "6.",
      title: "Harmadik személyek adatai a küldeményekben – adatfeldolgozói szerep",
      blocks: [
        {
          kind: "p",
          text:
            "A megbízó részére érkező küldemények harmadik személyek (a megbízó ügyfelei, munkavállalói, partnerei) személyes adatait is tartalmazhatják. Ezen adatok tekintetében az adatkezelő a megbízó, az Adatkezelő pedig – a küldemények átvétele, felnyitása, szkennelése, továbbítása és őrzése körében – a **GDPR 28. cikke szerinti adatfeldolgozó**. Az Adatkezelő ezen adatokat kizárólag a megbízó utasítása szerint, a szerződés teljesítése céljából kezeli, további célra nem használja fel, és azokat a megbízó rendelkezése szerint adja ki vagy törli. Az érintettek tájékoztatása a megbízó mint adatkezelő kötelezettsége. A felek erre vonatkozóan – szükség esetén – külön adatfeldolgozói megállapodást kötnek.",
        },
      ],
    },
    {
      id: "adatfeldolgozok",
      number: "7.",
      title: "Adatfeldolgozók és adattovábbítás",
      blocks: [
        {
          kind: "p",
          text:
            "Az Adatkezelő az alábbi adatfeldolgozókat veszi igénybe. Az adatfeldolgozók az adatokat kizárólag az Adatkezelő utasítása szerint kezelik.",
        },
        {
          kind: "table",
          head: ["Adatfeldolgozó", "Tevékenység", "Kezelt adatok köre"],
          rows: [
            [
              "Google Cloud EMEA Limited, Velasco, Clanwilliam Place, Dublin 2, Írország",
              "a honlap és az app.smartszekhely.hu rendszer tárhelye, szerverszolgáltatás",
              "honlapon megadott adatok, a rendszerben kezelt adatok, szkennelt küldemények, naplóadatok",
            ],
            [
              "Google Ireland Limited (Google Workspace), Gordon House, Barrow Street, Dublin 4, Írország",
              "e-mail szolgáltatás és dokumentumtárolás",
              "levelezés, szkennelt küldemények",
            ],
            ["KBOSS.hu Kft. (Számlázz.hu számlázó rendszer)", "számlázás", "számlázási és számlaadatok"],
            [
              "Brandstädter Ügyvédi Iroda, 1149 Budapest, Nagy Lajos király útja 158. II/4.",
              "jogi képviselet, követelésérvényesítés, szerződéses ügyek",
              "a jogi ügyhöz szükséges szerződéses és kapcsolattartási adatok",
            ],
            [
              "Brevo (Sendinblue SAS, Franciaország)",
              "elektronikus levélküldés, kézbesítési naplózás",
              "név, e-mail cím, a kiküldés, kézbesítés és megnyitás naplóadatai",
            ],
          ],
        },
        {
          kind: "p",
          text:
            "Az app.smartszekhely.hu ügyviteli rendszert az Adatkezelő saját maga fejleszti és üzemelteti, így az abban kezelt adatok tekintetében nem vesz igénybe külső üzemeltetőt; a rendszer a Google Cloud szerverein fut, amely e körben adatfeldolgozóként jár el.",
        },
        {
          kind: "p",
          text:
            "**Önálló adatkezelőként** férhetnek hozzá az adatokhoz a jogszabály alapján eljáró szervek: a cégbíróság, az állami adó- és vámhatóság (ideértve a pénzügyi információs egységként működő hatóságot), bíróság, ügyészség, nyomozó hatóság, végrehajtó, valamint a postai szolgáltató a küldemények kézbesítése körében.",
        },
        {
          kind: "p",
          text:
            "Az Adatkezelő a megbízó kifejezett kérése vagy utasítása esetén az adatokat továbbítja a megbízó által megjelölt partnernek (például a cégeljárást intéző ügyvédnek vagy könyvelőnek).",
        },
        {
          kind: "p",
          text:
            "**Harmadik országba történő adattovábbítás:** a Google Workspace és a Google Cloud igénybevétele esetén az adatok továbbítása az Amerikai Egyesült Államokba is megtörténhet. Ez a továbbítás a GDPR 45. cikke szerinti megfelelőségi határozat (EU–USA adatvédelmi keret), illetve a GDPR 46. cikke szerinti általános szerződési feltételek alapján történik. A megfelelőségi döntés és a garanciák aktuális állapotáról az Adatkezelő a fenti e-mail címen ad felvilágosítást.",
        },
      ],
    },
    {
      id: "adatbiztonsag",
      number: "8.",
      title: "Adatbiztonsági intézkedések",
      blocks: [
        {
          kind: "p",
          text:
            "Az Adatkezelő a GDPR 32. cikke szerint az adatok biztonsága érdekében az alábbi intézkedéseket alkalmazza:",
        },
        {
          kind: "ul",
          items: [
            "a papíralapú iratok zárt, illetéktelenek számára nem hozzáférhető helyiségben, megbízónként elkülönítve tárolva;",
            "az elektronikus adatok jelszóval védett, kétfaktoros hitelesítéssel (2FA) ellátott fiókokban, titkosított kapcsolaton (HTTPS) keresztül elérhetők;",
            "a hozzáférés a feladat ellátásához szükséges munkatársakra korlátozva (szükséges ismeret elve), rendszeres jogosultság-felülvizsgálattal;",
            "rendszeres mentés, vírusvédelem, naplózás;",
            "a munkavállalók és közreműködők írásbeli titoktartási nyilatkozata és adatvédelmi oktatása;",
            "adatvédelmi incidens esetén az Adatkezelő az incidenst nyilvántartásba veszi, azt 72 órán belül bejelenti a Nemzeti Adatvédelmi és Információszabadság Hatóságnak, és – ha az incidens az érintettek jogaira nézve magas kockázattal jár – az érintetteket tájékoztatja (GDPR 33–34. cikk).",
          ],
        },
      ],
    },
    {
      id: "jogok",
      number: "9.",
      title: "Az érintett jogai",
      blocks: [
        { kind: "p", text: "Az érintett a GDPR alapján az alábbi jogokkal élhet:" },
        {
          kind: "ul",
          items: [
            "**hozzáférés (15. cikk):** tájékoztatás arról, hogy az Adatkezelő kezel-e róla személyes adatot, és annak másolata;",
            "**helyesbítés (16. cikk):** a pontatlan adat kijavítása, a hiányos adat kiegészítése;",
            "**törlés (17. cikk):** az adat törlése, ha annak kezelésére már nincs szükség vagy az jogellenes; a törlés nem kérhető, amíg az adat kezelését jogszabály (így a Pmt. vagy a számviteli törvény) írja elő;",
            "**az adatkezelés korlátozása (18. cikk);**",
            "**adathordozhatóság (20. cikk):** a hozzájáruláson vagy szerződésen alapuló, automatizáltan kezelt adatok géppel olvasható formátumban való megkapása, továbbítása;",
            "**tiltakozás (21. cikk):** a jogos érdeken alapuló adatkezelés ellen;",
            "**hozzájárulás visszavonása (7. cikk (3)):** a hozzájáruláson alapuló adatkezelés esetén bármikor, díjmentesen.",
          ],
        },
        {
          kind: "p",
          text:
            "Az Adatkezelő a kérelmet a beérkezésétől számított 1 (egy) hónapon belül teljesíti; a határidő a GDPR 12. cikk (3) bekezdése szerint indokolt esetben két hónappal meghosszabbítható, amiről az Adatkezelő az érintettet tájékoztatja. A kérelmet a fenti e-mail címen vagy postai úton, az Adatkezelő székhelyére küldve lehet előadni. Az Adatkezelő a kérelmezőt szükség esetén azonosítja.",
        },
        {
          kind: "p",
          text:
            "**Automatizált döntéshozatal, profilalkotás:** az Adatkezelő automatizált döntéshozatalt és profilalkotást nem végez.",
        },
      ],
    },
    {
      id: "jogorvoslat",
      number: "10.",
      title: "Jogorvoslat",
      blocks: [
        {
          kind: "p",
          text:
            "**Panasz a Hatóságnál:** Nemzeti Adatvédelmi és Információszabadság Hatóság (NAIH), 1055 Budapest, Falk Miksa utca 9–11. | Postacím: 1363 Budapest, Pf. 9. | Telefon: [+36 (1) 391-1400](tel:+3613911400) | E-mail: [ugyfelszolgalat@naih.hu](mailto:ugyfelszolgalat@naih.hu) | Honlap: [https://naih.hu](https://naih.hu)",
        },
        {
          kind: "p",
          text:
            "**Bírósági jogorvoslat:** az érintett a lakóhelye vagy tartózkodási helye szerint illetékes törvényszékhez fordulhat. A per – az érintett választása szerint – az Adatkezelő székhelye szerinti törvényszék előtt is megindítható.",
        },
        {
          kind: "p",
          text:
            "Az érintett a jogorvoslat igénybevétele előtt az Adatkezelőhöz is fordulhat; az Adatkezelő a panaszt kivizsgálja, és annak eredményéről az érintettet tájékoztatja.",
        },
      ],
    },
    {
      id: "modositas",
      number: "11.",
      title: "A tájékoztató módosítása",
      blocks: [
        {
          kind: "p",
          text:
            "Az Adatkezelő a jelen tájékoztatót jogosult egyoldalúan módosítani, ha az adatkezelés körülményei, a jogszabályi környezet vagy a szolgáltatás tartalma megváltozik. A módosított tájékoztatót az Adatkezelő a honlapján közzéteszi, és a módosításról a fennálló szerződéses ügyfeleit elektronikus úton tájékoztatja.",
        },
        {
          kind: "p",
          text: "Jelen tájékoztató 2026. január 1. napján lép hatályba, és a korábbi adatkezelési tájékoztató helyébe lép.",
        },
      ],
    },
  ],
  closing: ["Budapest, 2026. január 1.", "E-Marketplace Szolgáltató Kft."],
};

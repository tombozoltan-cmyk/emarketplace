import type { Metadata } from "next";
import Link from "next/link";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Adatkezelési tájékoztató | E-Marketplace Kft.",
  description:
    "GDPR kompatibilis adatkezelési tájékoztató az E-Marketplace Kft. székhelyszolgáltatási, irodabérleti és kapcsolattartási folyamataihoz.",
  alternates: {
    canonical: "https://e-marketplace.hu/adatvedelem",
    languages: {
      hu: "https://e-marketplace.hu/adatvedelem",
    },
  },
};

export default function AdatvedelemPage() {
  return (
    <main className="flex min-h-screen w-full flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Header />

      <section className="w-full border-b border-[color:var(--border)] bg-[color:var(--muted)]/60 pt-24 pb-10 md:pt-32 md:pb-16">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Adatkezelési tájékoztató
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-[color:var(--muted-foreground)] md:text-base">
              Jelen tájékoztató célja, hogy átláthatóan és érthetően bemutassa, hogyan kezeljük az Ön
              személyes adatait az E-Marketplace Kft. székhelyszolgáltatási, irodabérleti és kapcsolattartási
              folyamatai során.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 text-xs text-[color:var(--muted-foreground)] md:text-sm">
            <p>
              Utolsó frissítés: <span className="font-medium text-[color:var(--foreground)]">2025. január 1.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Tartalom */}
      <section className="py-10 md:py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)] lg:gap-12 lg:px-8">
          {/* Fő tartalom */}
          <article className="space-y-10 text-sm leading-relaxed md:text-base">
            {/* 1. Adatkezelő adatai */}
            <section id="adatkezelo" className="scroll-mt-28">
              <h2 className="mb-3 text-xl font-bold md:text-2xl">1. Adatkezelő adatai</h2>
              <div className="space-y-1 text-[color:var(--muted-foreground)]">
                <p>
                  <span className="font-semibold text-[color:var(--foreground)]">Adatkezelő neve:</span> E-Marketplace
                  Korlátolt Felelősségű Társaság
                </p>
                <p>
                  <span className="font-semibold text-[color:var(--foreground)]">Székhelye:</span> 1064 Budapest, Izabella
                  utca 68/B.
                </p>
                <p>
                  <span className="font-semibold text-[color:var(--foreground)]">Cégjegyzékszám:</span> 01-09-999999
                </p>
                <p>
                  <span className="font-semibold text-[color:var(--foreground)]">Adószám:</span> 12345678-2-42
                </p>
                <p>
                  <span className="font-semibold text-[color:var(--foreground)]">E-mail:</span>{" "}
                  <a
                    href="mailto:info@e-marketplace.hu"
                    className="font-medium text-[color:var(--primary)] hover:underline"
                  >
                    info@e-marketplace.hu
                  </a>
                </p>
                <p>
                  <span className="font-semibold text-[color:var(--foreground)]">Telefon:</span> +36 (1) 234 5678
                </p>
              </div>
            </section>

            {/* 2. Az adatkezelés alapelvei */}
            <section id="alapelvek" className="scroll-mt-28">
              <h2 className="mb-3 text-xl font-bold md:text-2xl">2. Az adatkezelés alapelvei</h2>
              <p className="mb-3 text-[color:var(--muted-foreground)]">
                Az adatkezelő az Európai Parlament és a Tanács (EU) 2016/679 rendelete (GDPR), valamint a vonatkozó
                magyar jogszabályok (különösen az Infotv.) előírásai szerint jár el. Az adatkezelés során az alábbi
                alapelveket követjük:
              </p>
              <ul className="ml-5 list-disc space-y-1 text-[color:var(--muted-foreground)]">
                <li>
                  <span className="font-semibold text-[color:var(--foreground)]">Jogszerűség, tisztességesség,
                  átláthatóság:</span> az adatkezelést jogalapon, az érintett számára érthető módon végezzük.
                </li>
                <li>
                  <span className="font-semibold text-[color:var(--foreground)]">Célhoz kötöttség:</span> az adatokat
                  meghatározott, egyértelmű és jogszerű célból gyűjtjük.
                </li>
                <li>
                  <span className="font-semibold text-[color:var(--foreground)]">Adattakarékosság:</span> csak a
                  szükséges és releváns adatokat kezeljük.
                </li>
                <li>
                  <span className="font-semibold text-[color:var(--foreground)]">Pontosság:</span> törekszünk arra,
                  hogy az adatok pontosak és naprakészek legyenek.
                </li>
                <li>
                  <span className="font-semibold text-[color:var(--foreground)]">Korlátozott tárolhatóság:</span> az
                  adatokat csak a szükséges ideig őrizzük meg.
                </li>
                <li>
                  <span className="font-semibold text-[color:var(--foreground)]">Integritás és bizalmas jelleg:</span>
                  megfelelő technikai és szervezési intézkedésekkel védjük az adatokat.
                </li>
              </ul>
            </section>

            {/* 3. Kezelt adatkategóriák és célok */}
            <section id="celok" className="scroll-mt-28">
              <h2 className="mb-3 text-xl font-bold md:text-2xl">3. Kezelt adatkategóriák és adatkezelési célok</h2>

              <div className="space-y-6 text-[color:var(--muted-foreground)]">
                <div>
                  <h3 className="mb-1 text-base font-semibold text-[color:var(--foreground)]">
                    3.1. Ajánlatkérés, kapcsolatfelvétel
                  </h3>
                  <p className="mb-1">Kezelt adatok:</p>
                  <ul className="ml-5 list-disc space-y-1">
                    <li>Név</li>
                    <li>E-mail cím</li>
                    <li>Telefonszám</li>
                    <li>Cég neve, adószám (működő cég esetén)</li>
                    <li>Székhelyszolgáltatás / csomag típusa</li>
                    <li>Üzenet tartalma, egyedi kérések</li>
                  </ul>
                  <p className="mt-2">
                    Cél: ajánlat készítése, kapcsolatfelvétel, egyeztetés, szerződés előkészítése.
                  </p>
                  <p>
                    Jogalap: GDPR 6. cikk (1) bekezdés b) pont – szerződés megkötését megelőző lépések
                    kezdeményezése az érintett kérésére.
                  </p>
                  <p>Megőrzési idő: az ajánlatkérést követő legfeljebb 2 év.</p>
                </div>

                <div>
                  <h3 className="mb-1 text-base font-semibold text-[color:var(--foreground)]">
                    3.2. Székhelyszolgáltatás és irodabérleti szerződések teljesítése
                  </h3>
                  <p className="mb-1">Kezelt adatok:</p>
                  <ul className="ml-5 list-disc space-y-1">
                    <li>Szerződő fél és kapcsolattartó azonosító adatai</li>
                    <li>Cégadatok (cégnév, székhely, adószám, cégjegyzékszám)</li>
                    <li>Számlázási adatok</li>
                    <li>Szerződés adatai (időtartam, szolgáltatás típusa, fizetési feltételek)</li>
                  </ul>
                  <p className="mt-2">
                    Cél: szerződés teljesítése, számlázás, jogszabályi kötelezettségek teljesítése.
                  </p>
                  <p>
                    Jogalap: GDPR 6. cikk (1) b) pont – szerződés teljesítése, valamint 6. cikk (1) c) pont – jogi
                    kötelezettség teljesítése.
                  </p>
                  <p>Megőrzési idő: számviteli bizonylatok esetén 8 év, szerződések esetén az általános elévülési idő.</p>
                </div>

                <div>
                  <h3 className="mb-1 text-base font-semibold text-[color:var(--foreground)]">
                    3.3. Hírlevél és marketing kommunikáció (ha Ön ehhez hozzájárul)
                  </h3>
                  <p className="mb-1">Kezelt adatok:</p>
                  <ul className="ml-5 list-disc space-y-1">
                    <li>Név</li>
                    <li>E-mail cím</li>
                  </ul>
                  <p className="mt-2">
                    Cél: szakmai tartalmak, ajánlatok, hírek küldése a székhelyszolgáltatás és kapcsolódó
                    szolgáltatások területén.
                  </p>
                  <p>
                    Jogalap: GDPR 6. cikk (1) a) pont – az Ön hozzájárulása. A hozzájárulás bármikor visszavonható.
                  </p>
                  <p>Megőrzési idő: a hozzájárulás visszavonásáig.</p>
                </div>

                <div>
                  <h3 className="mb-1 text-base font-semibold text-[color:var(--foreground)]">
                    3.4. Weboldal működtetése, naplófájlok, biztonság
                  </h3>
                  <p className="mb-1">Kezelt adatok:</p>
                  <ul className="ml-5 list-disc space-y-1">
                    <li>IP-cím, böngésző típusa, operációs rendszer</li>
                    <li>Látogatás időpontja, megtekintett oldalak</li>
                    <li>Űrlaphasználat alapvető metaadatai (pl. küldés időpontja)</li>
                  </ul>
                  <p className="mt-2">
                    Cél: a weboldal biztonságos üzemeltetése, hibakeresés, informatikai védelem.
                  </p>
                  <p>
                    Jogalap: GDPR 6. cikk (1) f) pont – az adatkezelő jogos érdeke a weboldal biztonságos működtetése.
                  </p>
                  <p>Megőrzési idő: legfeljebb 1 év.</p>
                </div>
              </div>
            </section>

            {/* 4. Cookie-k és hasonló technológiák */}
            <section id="cookiek" className="scroll-mt-28">
              <h2 className="mb-3 text-xl font-bold md:text-2xl">4. Cookie-k és hasonló technológiák</h2>
              <p className="mb-3 text-[color:var(--muted-foreground)]">
                Weboldalunk cookie-kat (sütiket) használ a felhasználói élmény javítása, statisztika készítése és a
                weboldal biztonságának növelése érdekében. A cookie-k kezeléséről részletes tájékoztatót a külön
                <Link
                  href="/cookie-szabalyzat"
                  className="font-semibold text-[color:var(--primary)] hover:underline"
                >
                  {" "}
                  Cookie Szabályzat
                </Link>
                {" "}
                tartalmaz.
              </p>
              <p className="text-[color:var(--muted-foreground)]">
                A cookie-beállításokat a weboldal láblécében található „Cookie beállítások” linken keresztül bármikor
                módosíthatja.
              </p>
            </section>

            {/* 5. Adatfeldolgozók és adattovábbítás */}
            <section id="adatfeldolgozok" className="scroll-mt-28">
              <h2 className="mb-3 text-xl font-bold md:text-2xl">5. Adatfeldolgozók és adattovábbítás</h2>
              <p className="mb-3 text-[color:var(--muted-foreground)]">
                Az adatkezelő az adatkezelési tevékenység egyes részeinek ellátásához adatfeldolgozókat vehet igénybe.
                Az adatfeldolgozók az adatokat önálló döntési jogkör nélkül, kizárólag az adatkezelő utasításai szerint
                kezelik.
              </p>
              <div className="space-y-2 text-[color:var(--muted-foreground)]">
                <p>A főbb adatfeldolgozók köre különösen az alábbi területekre terjed ki:</p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>tárhelyszolgáltató, rendszergazda, IT üzemeltető,</li>
                  <li>könyvelő, adótanácsadó,</li>
                  <li>jogi képviselő, ügyvéd,</li>
                  <li>banki szolgáltatók, pénzforgalmi szolgáltatók.</li>
                </ul>
                <p>
                  Az adatkezelő az Európai Unión kívüli országba csak akkor továbbít adatokat, ha az adatátvitel
                  megfelel a GDPR előírásainak (pl. megfelelő szintű adatvédelmi garanciák).
                </p>
              </div>
            </section>

            {/* 6. Adatbiztonság */}
            <section id="adatbiztonsag" className="scroll-mt-28">
              <h2 className="mb-3 text-xl font-bold md:text-2xl">6. Adatbiztonság</h2>
              <p className="mb-3 text-[color:var(--muted-foreground)]">
                Az adatkezelő a személyes adatok biztonságát megfelelő technikai és szervezési intézkedésekkel védi,
                különösen az alábbi módokon:
              </p>
              <ul className="ml-5 list-disc space-y-1 text-[color:var(--muted-foreground)]">
                <li>az adatokhoz való hozzáférés jogosultság-kezelése és naplózása,</li>
                <li>rendszeres biztonsági mentések készítése,</li>
                <li>titkosított kommunikáció (HTTPS) használata,</li>
                <li>vírusvédelem és tűzfal alkalmazása,</li>
                <li>fizikai védelem az irodai és szerver infrastruktúrára vonatkozóan.</li>
              </ul>
            </section>

            {/* 7. Az érintettek jogai */}
            <section id="jogok" className="scroll-mt-28">
              <h2 className="mb-3 text-xl font-bold md:text-2xl">7. Az érintettek jogai</h2>
              <p className="mb-3 text-[color:var(--muted-foreground)]">
                Ön a személyes adatai kezelésével kapcsolatban az alábbi jogokat gyakorolhatja az adatkezelővel szemben:
              </p>
              <div className="space-y-3 text-[color:var(--muted-foreground)]">
                <div>
                  <p className="font-semibold text-[color:var(--foreground)]">Hozzáféréshez való jog</p>
                  <p>
                    Tájékoztatást kérhet arról, hogy kezeljük-e személyes adatait, és ha igen, milyen adatokat, milyen
                    célból, milyen jogalapon és mennyi ideig.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-[color:var(--foreground)]">Helyesbítés joga</p>
                  <p>Kérheti a pontatlan vagy hiányos adatok helyesbítését vagy kiegészítését.</p>
                </div>
                <div>
                  <p className="font-semibold text-[color:var(--foreground)]">Törléshez való jog ("elfeledtetés joga")</p>
                  <p>
                    Bizonyos esetekben kérheti személyes adatai törlését, például ha az adatkezelés jogalapja a
                    hozzájárulás, amelyet visszavon, vagy ha az adatokra már nincs szükség.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-[color:var(--foreground)]">Adatkezelés korlátozásának joga</p>
                  <p>
                    Kérheti az adatkezelés korlátozását például, ha vitatja az adatok pontosságát, vagy tiltakozott az
                    adatkezelés ellen.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-[color:var(--foreground)]">Adathordozhatóság joga</p>
                  <p>
                    Kérheti, hogy az Önre vonatkozó, Ön által rendelkezésünkre bocsátott adatokat tagolt, széles körben
                    használt, géppel olvasható formátumban megkapja, illetve továbbítsuk azokat egy másik adatkezelőnek,
                    ha az technikailag megvalósítható.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-[color:var(--foreground)]">Tiltakozáshoz való jog</p>
                  <p>
                    Jogos érdeken alapuló adatkezelés esetén tiltakozhat személyes adatai kezelése ellen. Ilyen esetben
                    az adatkezelést megszüntetjük, kivéve, ha bizonyítjuk, hogy az adatkezelést olyan kényszerítő erejű
                    jogos okok indokolják, amelyek elsőbbséget élveznek az Ön jogaival szemben.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-[color:var(--foreground)]">Hozzájárulás visszavonásának joga</p>
                  <p>
                    Ha az adatkezelés jogalapja az Ön hozzájárulása, azt bármikor, indokolás nélkül visszavonhatja. A
                    visszavonás nem érinti a visszavonás előtti adatkezelés jogszerűségét.
                  </p>
                </div>
              </div>
            </section>

            {/* 8. Jogorvoslati lehetőségek */}
            <section id="jogorvoslat" className="scroll-mt-28">
              <h2 className="mb-3 text-xl font-bold md:text-2xl">8. Jogorvoslati lehetőségek</h2>
              <p className="mb-3 text-[color:var(--muted-foreground)]">
                Amennyiben úgy véli, hogy személyes adatai kezelése sérti a GDPR rendelkezéseit, illetve a vonatkozó
                magyar jogszabályokat, az alábbi jogorvoslati lehetőségekkel élhet:
              </p>
              <div className="space-y-3 text-[color:var(--muted-foreground)]">
                <div>
                  <p className="font-semibold text-[color:var(--foreground)]">Panasz benyújtása a felügyeleti hatósághoz</p>
                  <p>
                    Nemzeti Adatvédelmi és Információszabadság Hatóság (NAIH)
                    <br />
                    Cím: 1055 Budapest, Falk Miksa utca 9-11.
                    <br />
                    Postacím: 1363 Budapest, Pf. 9.
                    <br />
                    Web:{" "}
                    <a
                      href="https://www.naih.hu"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[color:var(--primary)] hover:underline"
                    >
                      www.naih.hu
                    </a>
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-[color:var(--foreground)]">Bírósághoz fordulás joga</p>
                  <p>
                    Ön jogosult bírósághoz fordulni, ha megítélése szerint személyes adatai kezelése sérti a GDPR
                    rendelkezéseit. A pert – választása szerint – az adatkezelő székhelye szerinti törvényszék, vagy az
                    Ön lakóhelye / tartózkodási helye szerinti törvényszék előtt indíthatja meg.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-[color:var(--foreground)]">Panasz közvetlen benyújtása az adatkezelőhöz</p>
                  <p>
                    Kérdéseivel, észrevételeivel vagy panaszaival közvetlenül is fordulhat hozzánk az alábbi elérhetőségek
                    egyikén:
                  </p>
                  <p className="mt-1">
                    E-mail:{" "}
                    <a
                      href="mailto:info@e-marketplace.hu"
                      className="font-medium text-[color:var(--primary)] hover:underline"
                    >
                      info@e-marketplace.hu
                    </a>
                    {" | "}
                    Telefon: +36 (1) 234 5678
                  </p>
                </div>
              </div>
            </section>

            {/* 9. A tájékoztató módosítása */}
            <section id="modositas" className="scroll-mt-28">
              <h2 className="mb-3 text-xl font-bold md:text-2xl">9. A tájékoztató módosítása</h2>
              <p className="text-[color:var(--muted-foreground)]">
                Az adatkezelő fenntartja a jogot, hogy jelen adatkezelési tájékoztatót a jövőben módosítsa. A módosítás
                nem eredményezheti az érintettek jogainak csorbulását. A mindenkor hatályos verzió a
                <span className="font-medium text-[color:var(--foreground)]">
                  https://e-marketplace.hu/adatvedelem
                </span>
                {" "}
                weboldalon érhető el.
              </p>
            </section>
          </article>

          {/* OLDALSÁV – TARTALOMJEGYZÉK */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 text-sm">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                Tartalomjegyzék
              </h3>
              <nav className="space-y-1 text-xs text-[color:var(--muted-foreground)]">
                <a
                  href="#adatkezelo"
                  className="block rounded-md px-2 py-1 hover:bg-[color:var(--muted)]/60 hover:text-[color:var(--foreground)]"
                >
                  1. Adatkezelő adatai
                </a>
                <a
                  href="#alapelvek"
                  className="block rounded-md px-2 py-1 hover:bg-[color:var(--muted)]/60 hover:text-[color:var(--foreground)]"
                >
                  2. Az adatkezelés alapelvei
                </a>
                <a
                  href="#celok"
                  className="block rounded-md px-2 py-1 hover:bg-[color:var(--muted)]/60 hover:text-[color:var(--foreground)]"
                >
                  3. Adatkategóriák és célok
                </a>
                <a
                  href="#cookiek"
                  className="block rounded-md px-2 py-1 hover:bg-[color:var(--muted)]/60 hover:text-[color:var(--foreground)]"
                >
                  4. Cookie-k
                </a>
                <a
                  href="#adatfeldolgozok"
                  className="block rounded-md px-2 py-1 hover:bg-[color:var(--muted)]/60 hover:text-[color:var(--foreground)]"
                >
                  5. Adatfeldolgozók
                </a>
                <a
                  href="#adatbiztonsag"
                  className="block rounded-md px-2 py-1 hover:bg-[color:var(--muted)]/60 hover:text-[color:var(--foreground)]"
                >
                  6. Adatbiztonság
                </a>
                <a
                  href="#jogok"
                  className="block rounded-md px-2 py-1 hover:bg-[color:var(--muted)]/60 hover:text-[color:var(--foreground)]"
                >
                  7. Érintetti jogok
                </a>
                <a
                  href="#jogorvoslat"
                  className="block rounded-md px-2 py-1 hover:bg-[color:var(--muted)]/60 hover:text-[color:var(--foreground)]"
                >
                  8. Jogorvoslat
                </a>
                <a
                  href="#modositas"
                  className="block rounded-md px-2 py-1 hover:bg-[color:var(--muted)]/60 hover:text-[color:var(--foreground)]"
                >
                  9. A tájékoztató módosítása
                </a>
              </nav>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export type LegalLanguage = "hu" | "en";

/**
 * A jogi dokumentumok tartalma adatként él, nem JSX-ként: így a magyar és az
 * angol változat szerkezete garantáltan azonos, és egy új verzió feltöltése
 * nem jár az oldal újraírásával.
 *
 * A szövegekben támogatott inline jelölés (lásd `renderInline`):
 *   **félkövér**            → <strong>
 *   [szöveg](https://...)   → link (mailto: és tel: is)
 */
export type LegalBlock =
  | { kind: "p"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "ul"; items: string[] }
  /** a) b) c) … jelöléssel számozott felsorolás, ahogy a dokumentumban szerepel. */
  | { kind: "lettered"; items: string[] }
  | { kind: "table"; head: string[]; rows: string[][] }
  /** Kiemelt figyelemfelhívó blokk (pl. a szokatlan kikötésekről szóló tájékoztatás). */
  | { kind: "note"; text: string };

export type LegalSection = {
  /** Horgony azonosító, a tartalomjegyzék erre hivatkozik. */
  id: string;
  /** A dokumentumban nyomtatott sorszám, pl. "3." vagy "1. sz. melléklet". */
  number: string;
  title: string;
  blocks: LegalBlock[];
};

export type LegalDocumentContent = {
  language: LegalLanguage;
  title: string;
  subtitle: string;
  /** Rövid bevezető a címlap alatt. */
  lead: string;
  /** Az angol változatokon: eltérés esetén a magyar szöveg az irányadó. */
  translationNotice?: string;
  sections: LegalSection[];
  /** Záró sorok (keltezés, aláíró). */
  closing: string[];
};

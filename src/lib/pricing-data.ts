export type PricingLanguage = "hu" | "en";

export type PricingGroup =
  | "basic"
  | "bundles"
  | "officeBundles"
  | "fullEntrepreneur";

export type PricingCardStyle =
  | "primary"
  | "border"
  | "primarySoft"
  | "premium"
  | "primaryShadow";

export type PricingCardText = {
  hu: string;
  en: string;
};

export type PricingCardDoc = {
  id: string;
  group: PricingGroup;
  order: number;
  style: PricingCardStyle;
  title: PricingCardText;
  subtitle?: PricingCardText;
  cornerBadge?: PricingCardText;
  originalPrice?: PricingCardText;
  price: PricingCardText;
  priceNote: PricingCardText;
  annualNote: PricingCardText;
  features: {
    hu: string[];
    en: string[];
  };
  packageId?: string;
};

export const defaultPricingCards: PricingCardDoc[] = [
  {
    id: "basic-hu",
    group: "basic",
    order: 10,
    style: "primary",
    title: { hu: "Magyar vállalkozóknak", en: "For Hungarian companies" },
    subtitle: { hu: "Hazai Kft-k és Bt-k számára", en: "Local businesses (Kft., Bt.)" },
    price: { hu: "8 000 Ft", en: "8 000 HUF" },
    priceNote: { hu: "+ ÁFA / hó", en: "+ VAT / month" },
    annualNote: { hu: "1 évre előre: 96.000 Ft + ÁFA", en: "Pay annually: 96,000 HUF + VAT" },
    features: {
      hu: ["Hivatalos székhely cím", "Postakezelés & szkennelés", "Email értesítés 0-24"],
      en: [
        "Official registered office address",
        "Mail handling & scanning",
        "Email notifications 24/7",
      ],
    },
    packageId: "szekhely-hu",
  },
  {
    id: "basic-foreign",
    group: "basic",
    order: 20,
    style: "primary",
    title: { hu: "Külföldi vállalkozóknak", en: "For foreign clients" },
    subtitle: { hu: "Nemzetközi ügyfeleknek", en: "International founders" },
    price: { hu: "10 000 Ft", en: "10 000 HUF" },
    priceNote: { hu: "+ ÁFA / hó", en: "+ VAT / month" },
    annualNote: { hu: "1 évre előre: 120.000 Ft + ÁFA", en: "Pay annually: 120,000 HUF + VAT" },
    features: {
      hu: ["Hivatalos székhely cím", "Postakezelés & szkennelés", "Angol nyelvű szerződés"],
      en: ["Official registered office address", "Mail handling & scanning", "Contract in English"],
    },
    packageId: "szekhely-kulfoldi",
  },
  {
    id: "basic-delivery-agent",
    group: "basic",
    order: 30,
    style: "border",
    title: { hu: "Kézbesítési megbízott", en: "Service address / delivery agent" },
    subtitle: { hu: "Minden cégnek kötelező", en: "Required in many cases" },
    price: { hu: "5 000 Ft", en: "5 000 HUF" },
    priceNote: { hu: "+ ÁFA / hó", en: "+ VAT / month" },
    annualNote: { hu: "1 évre előre: 60.000 Ft + ÁFA", en: "Pay annually: 60,000 HUF + VAT" },
    features: {
      hu: ["Átveszi a hatósági iratokat", "Hivatalos képviselet", "Törvényi megfelelés"],
      en: ["Receives authority documents", "Official representation", "Legal compliance"],
    },
    packageId: "kezbesitesi",
  },
  {
    id: "basic-virtual-office",
    group: "basic",
    order: 40,
    style: "premium",
    cornerBadge: { hu: "PRÉMIUM", en: "PREMIUM" },
    title: { hu: "Virtuális iroda", en: "Virtual office" },
    subtitle: { hu: "12 hónapos szerződés", en: "12‑month contract" },
    price: { hu: "30 000 Ft", en: "30 000 HUF" },
    priceNote: { hu: "+ ÁFA / hó", en: "+ VAT / month" },
    annualNote: { hu: "1 évre előre: 360.000 Ft + ÁFA", en: "Pay annually: 360,000 HUF + VAT" },
    features: {
      hu: [
        "Banki ügyintézéshez alkalmas",
        "Hosszú távú szerződés",
        "Havi 4 alkalom irodahasználat",
        "Külföldi vállalkozóknak is ideális",
      ],
      en: [
        "Suitable for banking procedures",
        "Long‑term contract",
        "Up to 4 office uses per month",
        "Ideal for foreign founders",
      ],
    },
    packageId: "szerzodeses-irodaberles",
  },
  {
    id: "bundle-hu",
    group: "bundles",
    order: 10,
    style: "primarySoft",
    cornerBadge: { hu: "-15%", en: "-15%" },
    title: { hu: "Teljes csomag magyar vállalkozóknak", en: "Bundle for Hungarian companies" },
    subtitle: { hu: "Székhely + Kézbesítési megbízott", en: "Registered office + delivery agent" },
    originalPrice: { hu: "13 000 Ft", en: "13 000 HUF" },
    price: { hu: "11 000 Ft", en: "11 000 HUF" },
    priceNote: { hu: "+ ÁFA / hó", en: "+ VAT / month" },
    annualNote: { hu: "1 évre előre: 132.000 Ft + ÁFA", en: "Pay annually: 132,000 HUF + VAT" },
    features: {
      hu: [
        "Székhely (8 000 Ft)",
        "Kézbesítési megbízott (5 000 Ft)",
        "Minden szolgáltatás egyben, egyszerűsített adminisztrációval",
      ],
      en: [
        "Registered office (8,000 HUF)",
        "Delivery agent (5,000 HUF)",
        "All services in one — simplified administration",
      ],
    },
    packageId: "szekhely-kezbesitesi-hu",
  },
  {
    id: "bundle-foreign",
    group: "bundles",
    order: 20,
    style: "primary",
    cornerBadge: { hu: "-13%", en: "-13%" },
    title: { hu: "Teljes csomag külföldi vállalkozóknak", en: "Bundle for foreign clients" },
    subtitle: { hu: "Székhely + Kézbesítési megbízott", en: "Registered office + delivery agent" },
    originalPrice: { hu: "15 000 Ft", en: "15 000 HUF" },
    price: { hu: "13 000 Ft", en: "13 000 HUF" },
    priceNote: { hu: "+ ÁFA / hó", en: "+ VAT / month" },
    annualNote: { hu: "1 évre előre: 156.000 Ft + ÁFA", en: "Pay annually: 156,000 HUF + VAT" },
    features: {
      hu: [
        "Székhely (10 000 Ft)",
        "Kézbesítési megbízott (5 000 Ft)",
        "Angol nyelvű szerződés és dokumentáció",
      ],
      en: [
        "Registered office (10,000 HUF)",
        "Delivery agent (5,000 HUF)",
        "Contract and documentation in English",
      ],
    },
    packageId: "szekhely-kezbesitesi-kulfoldi",
  },
  {
    id: "office-hu",
    group: "officeBundles",
    order: 10,
    style: "border",
    title: { hu: "Teljeskörű megoldás magyar vállalkozóknak", en: "Full solution for Hungarian companies" },
    subtitle: { hu: "Székhely + Irodahasználat", en: "Registered office + office use" },
    price: { hu: "18 000 Ft", en: "18 000 HUF" },
    priceNote: { hu: "+ ÁFA / hó", en: "+ VAT / month" },
    annualNote: { hu: "Fél vagy 1 évre előre fizetendő.", en: "Pay in advance for 6 or 12 months." },
    features: {
      hu: [
        "Székhelyszolgáltatás (8 000 Ft/hó).",
        "Havi 4 alkalmas irodahasználat.",
        "Kedvezményes iroda díj: 10 000 Ft/hó.",
        "Postakezelés és továbbítás.",
        "Email értesítés a beérkező postáról.",
        "Tárgyaló bérlési lehetőség kedvezményes áron.",
      ],
      en: [
        "Registered office service (8,000 HUF/month).",
        "Up to 4 office uses per month.",
        "Discounted office fee: 10,000 HUF/month.",
        "Mail handling and forwarding.",
        "Email notifications for incoming mail.",
        "Meeting room rental available at a discounted rate.",
      ],
    },
    packageId: "iroda-hu",
  },
  {
    id: "office-foreign",
    group: "officeBundles",
    order: 20,
    style: "border",
    title: { hu: "Komplex csomag külföldi vállalkozóknak", en: "Comprehensive package for foreign clients" },
    subtitle: { hu: "Székhely + Iroda hosszú távra", en: "Registered office + office long‑term" },
    price: { hu: "20 000 Ft", en: "20 000 HUF" },
    priceNote: { hu: "+ ÁFA / hó", en: "+ VAT / month" },
    annualNote: { hu: "1 évre előre fizetendő.", en: "Pay annually in advance." },
    features: {
      hu: [
        "Havi 4 alkalommal irodahasználat.",
        "Angol vagy magyar nyelvű szerződés.",
        "Eco-Office coworking használata.",
        "Cégbejegyzéshez szükséges dokumentumok kiállítása.",
        "Dedikált ügyintéző a külföldi ügyfeleknek.",
      ],
      en: [
        "Up to 4 office uses per month.",
        "Contract in English or Hungarian.",
        "Eco-Office coworking access.",
        "Documents issued for company registration.",
        "Dedicated support for foreign clients.",
      ],
    },
    packageId: "iroda-kulfoldi",
  },
  {
    id: "full-hu",
    group: "fullEntrepreneur",
    order: 10,
    style: "primaryShadow",
    cornerBadge: { hu: "-8%", en: "-8%" },
    title: { hu: "Teljes csomag magyar vállalkozóknak", en: "Full package for Hungarian companies" },
    subtitle: { hu: "Székhely + Iroda + Kézbesítési megbízott", en: "Registered office + office + delivery agent" },
    originalPrice: { hu: "26 000 Ft", en: "26 000 HUF" },
    price: { hu: "24 000 Ft", en: "24 000 HUF" },
    priceNote: { hu: "+ ÁFA / hó", en: "+ VAT / month" },
    annualNote: { hu: "1 évre előre: 288.000 Ft + ÁFA", en: "Pay annually: 288,000 HUF + VAT" },
    features: {
      hu: [
        "Székhelyszolgáltatás (8 000 Ft).",
        "Irodahasználat (10 000 Ft).",
        "Kézbesítési megbízott (5 000 Ft).",
        "Teljes körű adminisztráció és postakezelés.",
      ],
      en: [
        "Registered office service (8,000 HUF).",
        "Office use (10,000 HUF).",
        "Delivery agent (5,000 HUF).",
        "End‑to‑end administration and mail handling.",
      ],
    },
    packageId: "iroda-kezbesitesi-hu",
  },
  {
    id: "full-foreign",
    group: "fullEntrepreneur",
    order: 20,
    style: "primaryShadow",
    cornerBadge: { hu: "-10%", en: "-10%" },
    title: { hu: "Teljes csomag külföldi vállalkozóknak", en: "Full package for foreign clients" },
    subtitle: { hu: "Székhely + Iroda + Kézbesítési megbízott", en: "Registered office + office + delivery agent" },
    originalPrice: { hu: "30 000 Ft", en: "30 000 HUF" },
    price: { hu: "27 000 Ft", en: "27 000 HUF" },
    priceNote: { hu: "+ ÁFA / hó", en: "+ VAT / month" },
    annualNote: { hu: "1 évre előre: 324.000 Ft + ÁFA", en: "Pay annually: 324,000 HUF + VAT" },
    features: {
      hu: [
        "Székhelyszolgáltatás (10 000 Ft).",
        "Irodahasználat (10 000 Ft).",
        "Kézbesítési megbízott (5 000 Ft).",
        "Angol nyelvű szerződés és dokumentáció.",
      ],
      en: [
        "Registered office service (10,000 HUF).",
        "Office use (10,000 HUF).",
        "Delivery agent (5,000 HUF).",
        "Contract and documentation in English.",
      ],
    },
    packageId: "iroda-kezbesitesi-kulfoldi",
  },
];

export const pricingGroupLabel: Record<PricingGroup, PricingCardText> = {
  basic: { hu: "Alap csomagok", en: "Basic packages" },
  bundles: { hu: "Kombinált csomagok", en: "Bundles" },
  officeBundles: { hu: "Iroda csomagok", en: "Office bundles" },
  fullEntrepreneur: { hu: "Teljes körű csomagok", en: "Full entrepreneur packages" },
};

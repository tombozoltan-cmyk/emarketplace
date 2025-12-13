import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";
import { MarketingScripts } from "@/components/MarketingScripts";
import { ModalProvider } from "@/components/ModalContext";
import { OrderModal } from "@/components/OrderModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prémium székhelyszolgáltatás Budapest belvárosában | Székhelyszolgáltatás+",
  description:
    "Prémium székhelyszolgáltatás Budapest belváros szívében, VI. kerületi címmel, kézbesítési megbízottal és virtuális irodával, átlátható árakkal.",
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
};

function ThemeInitScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&d)){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`,
      }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <head>
        <ThemeInitScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground transition-colors duration-300`}
      >
        <MarketingScripts />
        <ModalProvider>
          <OrderModal />
          <div className="flex min-h-screen w-full flex-col items-center">
            {children}
          </div>
          <CookieBanner />
        </ModalProvider>
      </body>
    </html>
  );
}

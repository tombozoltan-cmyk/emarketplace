import type { Metadata } from "next";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";
import { BackToTopButton } from "@/components/BackToTopButton";
import { MarketingScripts } from "@/components/MarketingScripts";
import { ModalProvider } from "@/components/ModalContext";
import { OrderModal } from "@/components/OrderModal";

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
      suppressHydrationWarning
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
    <html lang="hu" suppressHydrationWarning>
      <head>
        <ThemeInitScript />
      </head>
      <body
        className="antialiased bg-background text-foreground transition-colors duration-300"
      >
        <MarketingScripts />
        <ModalProvider>
          <OrderModal />
          <div className="flex min-h-screen w-full flex-col items-center">
            {children}
          </div>
          <BackToTopButton />
          <CookieBanner />
        </ModalProvider>
      </body>
    </html>
  );
}

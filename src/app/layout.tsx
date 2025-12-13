import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-900 text-slate-50`}
      >
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

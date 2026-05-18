"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { useAdminAuth } from "./AdminAuthProvider";
import { ThemeToggle } from "../ThemeToggle";
import { Loader2, ShieldCheck, Sparkles, Menu, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import type { User } from "firebase/auth";

const COMPANY_LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/emarketplace-8aab1.firebasestorage.app/o/image%2FPlexi-tabla-86x53-E-marketplace_logo-2.png?alt=media";

const SPARKLE_POSITIONS = [
  { left: 10, top: 15, delay: 0, duration: 4, size: 12 },
  { left: 25, top: 8, delay: 1.2, duration: 5, size: 16 },
  { left: 45, top: 22, delay: 0.5, duration: 3.5, size: 14 },
  { left: 70, top: 12, delay: 2, duration: 4.5, size: 18 },
  { left: 85, top: 25, delay: 0.8, duration: 5.5, size: 11 },
  { left: 15, top: 40, delay: 1.5, duration: 4, size: 15 },
  { left: 35, top: 55, delay: 0.3, duration: 6, size: 13 },
  { left: 55, top: 45, delay: 2.5, duration: 3.8, size: 17 },
  { left: 75, top: 60, delay: 1, duration: 4.2, size: 12 },
  { left: 90, top: 50, delay: 0.7, duration: 5, size: 14 },
  { left: 5, top: 70, delay: 2.2, duration: 4.8, size: 16 },
  { left: 30, top: 80, delay: 0.9, duration: 3.5, size: 11 },
  { left: 50, top: 75, delay: 1.8, duration: 5.2, size: 15 },
  { left: 65, top: 85, delay: 0.4, duration: 4.5, size: 18 },
  { left: 80, top: 78, delay: 2.8, duration: 6, size: 13 },
];

function LoginScreen({ user, signIn }: { user: User | null; signIn: () => Promise<void> }) {
  const [mounted, setMounted] = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t1 = setTimeout(() => setLogoVisible(true), 100);
    const t2 = setTimeout(() => setTextVisible(true), 600);
    const t3 = setTimeout(() => setCardVisible(true), 1100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden relative">
      {/* Animated background - full screen */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-primary/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col items-center justify-center p-12 relative">
        {/* Floating sparkles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {SPARKLE_POSITIONS.map((pos, i) => (
            <Sparkles
              key={i}
              className="absolute text-primary/20 animate-float"
              style={{
                left: `${pos.left}%`,
                top: `${pos.top}%`,
                animationDelay: `${pos.delay}s`,
                animationDuration: `${pos.duration}s`,
                width: `${pos.size}px`,
                height: `${pos.size}px`,
              }}
            />
          ))}
        </div>

        {/* Company Logo */}
        <div
          className={`relative mb-10 transition-all duration-1000 ease-out ${
            logoVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-75 -translate-y-10"
          }`}
        >
          <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/10">
            <img
              src={COMPANY_LOGO_URL}
              alt="E-Marketplace"
              className="w-64 h-auto max-h-32 object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Welcome text */}
        <div
          className={`text-center max-w-xl transition-all duration-1000 ease-out ${
            textVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h1 className="text-5xl xl:text-6xl font-bold text-white mb-4 tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
              Admin Vezérlőpult
            </span>
          </h1>
          <p className="text-xl text-slate-300 font-light mb-6">
            Üdvözöljük az E-Marketplace admin felületén
          </p>
          <div className="flex items-center justify-center gap-4 text-slate-400 text-sm">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-slate-500 to-transparent" />
            <ShieldCheck className="w-5 h-5 text-green-400" />
            <span>Biztonságos belépés</span>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-slate-500 to-transparent" />
          </div>

          {/* Feature badges */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {['Érdeklődések', 'Szerződések', 'Blog kezelés', 'Email sablonok'].map((feature) => (
              <span
                key={feature}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm backdrop-blur-sm"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-12">
        <div
          className={`w-full max-w-md transition-all duration-1000 ease-out ${
            cardVisible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-10 scale-95"
          }`}
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex flex-col items-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/10">
              <img
                src={COMPANY_LOGO_URL}
                alt="E-Marketplace"
                className="w-40 h-auto object-contain"
              />
            </div>
            <h2 className="text-2xl font-bold text-white">Admin Vezérlőpult</h2>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-blue-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
            <div className="relative rounded-2xl border border-white/10 bg-slate-800/90 backdrop-blur-xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {user ? "Hozzáférés megtagadva" : "Bejelentkezés"}
                </h2>
                <p className="text-slate-400">
                  {user
                    ? "A fiókod nem rendelkezik admin jogosultsággal."
                    : "Jelentkezz be Google fiókkal a folytatáshoz"}
                </p>
              </div>

              <Button
                onClick={signIn}
                className="w-full h-14 text-base font-semibold bg-white hover:bg-slate-100 text-slate-900 border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] rounded-xl"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Belépés Google fiókkal
              </Button>

              {user?.email && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
                        {(user.displayName || user.email)[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-red-400 mb-0.5">Nincs jogosultság:</p>
                      <p className="text-sm text-slate-300 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              <p className="mt-6 text-center text-xs text-slate-500">
                Csak engedélyezett admin fiókok léphetnek be
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-slate-600 text-xs">
        <p>© {new Date().getFullYear()} E-Marketplace Kft. • Minden jog fenntartva</p>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.2; }
          50% { transform: translateY(-20px) rotate(10deg); opacity: 0.5; }
        }
        .animate-float { animation: float 5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

type AdminLayoutProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
};

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const { isAuthenticated, isLoading, user, signIn, signOut } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileClose = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--background)]">
        <Loader2 className="w-8 h-8 animate-spin text-[color:var(--primary)]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen user={user} signIn={signIn} />;
  }

  return (
    <div className="min-h-screen w-full bg-[color:var(--background)] overflow-hidden">
      <AdminSidebar mobileOpen={mobileMenuOpen} onMobileClose={handleMobileClose} />
      
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-[color:var(--card)] border-b border-[color:var(--border)] flex items-center justify-between px-4">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -ml-2 rounded-lg hover:bg-[color:var(--muted)] text-[color:var(--foreground)]"
          aria-label="Menü"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <span className="font-semibold text-[color:var(--foreground)] text-sm truncate mx-2">
          {title || "Admin"}
        </span>
        
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="w-7 h-7 rounded-full"
            />
          ) : user ? (
            <div className="w-7 h-7 rounded-full bg-[color:var(--primary)] flex items-center justify-center text-white text-xs font-medium">
              {(user.displayName || user.email || 'U')[0].toUpperCase()}
            </div>
          ) : null}
          <button
            onClick={() => signOut()}
            className="p-2 -mr-2 rounded-lg hover:bg-[color:var(--muted)] text-[color:var(--muted-foreground)]"
            aria-label="Kijelentkezés"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="lg:ml-56 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 w-full overflow-x-auto">
          {(title || description) && (
            <div className="mb-4 sm:mb-6">
              {title && (
                <h1 className="text-xl sm:text-2xl font-bold text-[color:var(--foreground)]">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-1 text-xs sm:text-sm text-[color:var(--muted-foreground)]">
                  {description}
                </p>
              )}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;

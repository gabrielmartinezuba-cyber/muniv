"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { X, User as UserIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import LogoutButton from "@/components/auth/LogoutButton";

interface NavbarProps {
  initialUser: User | null;
}

export default function Navbar({ initialUser }: NavbarProps) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(initialUser);

  // Sync with initialUser if it changes (server-side update)
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    const supabase = createClient();
    
    // Listen for auth changes to update UI immediately on client-side actions
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  });

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-500 flex items-center justify-between px-6 md:px-12",
          scrolled
            ? "bg-slate-950/50 backdrop-blur-md border-b border-white/5 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
            : "bg-transparent py-6"
        )}
      >
        <Link 
          href="/" 
          className="flex items-center group relative z-10"
          onClick={() => setIsMenuOpen(false)}
        >
          <Image
            src="/logo.png"
            alt="MUNIV Logo"
            width={400}
            height={133}
            className="w-auto h-16 md:h-20 group-hover:scale-105 transition-transform duration-500 object-contain"
            priority
          />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm tracking-widest uppercase font-medium z-10">
          <Link href="/" className="text-slate-300 hover:text-gold-500 transition-colors">Club</Link>
          <Link href="/gifting" className="text-slate-300 hover:text-gold-500 transition-colors">B2B Gifting</Link>
          {user ? (
            <>
              <Link href="/club" className="text-gold-500 hover:text-white transition-colors">Mi Club</Link>
              <Link href="/club/perfil" className="text-slate-300 hover:text-gold-500 transition-colors" aria-label="Mi Perfil">
                <UserIcon size={18} />
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-300 hover:text-gold-500 transition-colors">Login</Link>
              <Link href="/registro" className="px-5 py-2 glass-panel-glow bg-gold-500/10 border border-gold-500/50 text-gold-200 rounded-full hover:bg-gold-500 hover:text-slate-900 transition-all font-semibold">Registro</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden flex flex-col gap-1.5 p-2 z-10 min-h-[44px] min-w-[44px] justify-center items-end" 
          aria-label="Menú"
          onClick={() => setIsMenuOpen(true)}
        >
          <span className="w-6 h-[2px] bg-gold-500 rounded-full" />
          <span className="w-4 h-[2px] bg-gold-500 rounded-full" />
        </button>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-xl flex flex-col pt-6 px-6"
          >
            <div className="flex justify-between items-center w-full">
              <Link href="/" onClick={() => setIsMenuOpen(false)}>
                <Image
                  src="/logo.png"
                  alt="MUNIV Logo"
                  width={400}
                  height={133}
                  className="w-auto h-16 object-contain"
                  priority
                />
              </Link>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="text-gold-500 min-h-[44px] min-w-[44px] flex items-center justify-end"
                aria-label="Cerrar Menú"
              >
                <X size={32} />
              </button>
            </div>
            
            <div className="flex flex-col items-center justify-center flex-grow gap-12 pb-20">
              <Link href="/" onClick={() => setIsMenuOpen(false)} className="font-display text-4xl text-white hover:text-gold-500 transition-colors tracking-wide">CLUB</Link>
              <Link href="/gifting" onClick={() => setIsMenuOpen(false)} className="font-display text-4xl text-white hover:text-gold-500 transition-colors tracking-wide">B2B GIFTING</Link>
              <div className="flex flex-col items-center gap-6 mt-4 w-full px-6 text-center">
                {user ? (
                  <>
                    <Link href="/club" onClick={() => setIsMenuOpen(false)} className="font-display text-3xl text-gold-500 hover:text-white transition-colors tracking-wide">MI CLUB</Link>
                    <Link href="/club/perfil" onClick={() => setIsMenuOpen(false)} className="font-display text-2xl text-slate-300 hover:text-white transition-colors tracking-wide">MI PERFIL</Link>
                    <div onClick={() => setIsMenuOpen(false)}>
                      <LogoutButton />
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)} className="font-display text-3xl text-slate-300 hover:text-white transition-colors tracking-wide">LOGIN</Link>
                    <Link href="/registro" onClick={() => setIsMenuOpen(false)} className="w-full text-center font-display text-2xl text-gold-200 hover:text-slate-900 hover:bg-gold-500 transition-all tracking-widest uppercase glass-panel-glow border border-gold-500/50 bg-gold-500/10 py-5 rounded-full">Crear Cuenta</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

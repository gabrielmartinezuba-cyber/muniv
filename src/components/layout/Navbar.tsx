"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { X, ShoppingCart } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import LogoutButton from "@/components/auth/LogoutButton";
import { useCartStore } from "@/store/useCartStore";

interface NavbarProps {
  initialUser: User | null;
}

export default function Navbar({ initialUser }: NavbarProps) {
  const { scrollY } = useScroll();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(initialUser);
  const { items, openCart } = useCartStore();
  const cartItemCount = items.length;

  // Sync with initialUser if it changes (server-side update)
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    const supabase = createClient();

    // Listen for auth changes to update UI immediately on client-side actions
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 40) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  });

  // Prevent double navbar/logo on comunidad dashboard or admin
  if (pathname.startsWith("/comunidad") || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-500 flex items-center justify-between px-6 md:px-12",
          scrolled
            ? "glass-heavy border-b border-white/5 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
            : "bg-transparent py-5"
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
            className="w-auto h-14 md:h-16 group-hover:scale-105 transition-transform duration-500 object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-xs tracking-[0.2em] uppercase font-medium z-10">
          <Link
            href="/#experiencias"
            className="text-slate-300 hover:text-gold-400 transition-colors relative py-1 group"
          >
            <span>Experiencias</span>
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gold-400 group-hover:w-full transition-all duration-300" />
          </Link>

          <Link
            href="/#beneficios"
            className="text-slate-300 hover:text-gold-400 transition-colors relative py-1 group"
          >
            <span>Beneficios</span>
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gold-400 group-hover:w-full transition-all duration-300" />
          </Link>

          {user ? (
            <>
              <Link
                href="/comunidad"
                className="text-gold-400 hover:text-white transition-colors font-semibold"
              >
                Mi Perfil
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-slate-300 hover:text-gold-400 transition-colors"
              >
                Ingresar
              </Link>
              <Link
                href="/registro"
                className="px-5 py-2 glass-subtle border border-gold-500/40 text-gold-200 rounded-full hover:bg-gold-500 hover:text-stone-950 transition-all font-semibold shadow-[0_0_20px_rgba(182,154,104,0.15)]"
              >
                Crear Cuenta
              </Link>
            </>
          )}

          {/* Cart Icon Button with Badge */}
          <button
            onClick={openCart}
            className="relative p-2 ml-2 text-slate-300 hover:text-gold-400 transition-colors cursor-pointer"
            aria-label="Abrir carrito"
          >
            <ShoppingCart size={21} />
            <AnimatePresence>
              {cartItemCount > 0 && (
                <motion.span
                  key={cartItemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="absolute -top-1 -right-1 bg-burgundy-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-stone-900 shadow-[0_0_10px_rgba(124,32,32,0.8)]"
                >
                  {cartItemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile Navbar Controls */}
        <div className="md:hidden flex items-center gap-3 z-10">
          <button
            onClick={openCart}
            className="relative p-2 text-gold-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Abrir carrito"
          >
            <ShoppingCart size={22} />
            <AnimatePresence>
              {cartItemCount > 0 && (
                <motion.span
                  key={cartItemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="absolute -top-1 -right-1 bg-burgundy-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-stone-900 shadow-[0_0_10px_rgba(124,32,32,0.8)]"
                >
                  {cartItemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Hamburger Menu Trigger */}
          <button
            className="flex flex-col gap-1.5 p-2 min-h-[44px] min-w-[44px] justify-center items-end cursor-pointer"
            aria-label="Abrir menú de navegación"
            onClick={() => setIsMenuOpen(true)}
          >
            <span className="w-6 h-[2px] bg-gold-400 rounded-full" />
            <span className="w-4 h-[2px] bg-gold-400 rounded-full" />
          </button>
        </div>
      </motion.nav>

      {/* Fullscreen Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-2xl flex flex-col pt-6 px-6"
          >
            <div className="flex justify-between items-center w-full">
              <Link href="/" onClick={() => setIsMenuOpen(false)}>
                <Image
                  src="/logo.png"
                  alt="MUNIV Logo"
                  width={400}
                  height={133}
                  className="w-auto h-14 object-contain"
                  priority
                />
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-gold-400 p-2 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Cerrar menú"
              >
                <X size={28} />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center flex-grow gap-10 pb-20">
              <Link
                href="/#experiencias"
                onClick={() => setIsMenuOpen(false)}
                className="font-display text-3xl text-white hover:text-gold-400 transition-colors uppercase tracking-wider"
              >
                Experiencias
              </Link>
              <Link
                href="/#beneficios"
                onClick={() => setIsMenuOpen(false)}
                className="font-display text-3xl text-white hover:text-gold-400 transition-colors uppercase tracking-wider"
              >
                Beneficios
              </Link>

              <div className="flex flex-col items-center gap-5 mt-4 w-full max-w-xs text-center">
                {user ? (
                  <>
                    <Link
                      href="/comunidad"
                      onClick={() => setIsMenuOpen(false)}
                      className="font-display text-2xl text-gold-400 hover:text-white transition-colors"
                    >
                      Mi Perfil
                    </Link>
                    <div onClick={() => setIsMenuOpen(false)}>
                      <LogoutButton />
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="font-display text-2xl text-slate-300 hover:text-white transition-colors"
                    >
                      Ingresar
                    </Link>
                    <Link
                      href="/registro"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full text-center font-display text-xl text-gold-200 hover:bg-gold-500 hover:text-stone-950 transition-all tracking-widest uppercase glass-subtle border border-gold-500/50 py-4 rounded-full"
                    >
                      Crear Cuenta
                    </Link>
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

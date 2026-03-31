"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Ticket, Gift, Settings, Menu, X, ClipboardList, Package, ExternalLink, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MobileNav({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Unified links for all users (3 items)
  const mainLinks = [
    {
      href: "/comunidad",
      label: "Experiencias",
      icon: Ticket,
      active: pathname === "/comunidad",
    },
    {
      href: "/comunidad/beneficios",
      label: "Beneficios",
      icon: Gift,
      active: pathname === "/comunidad/beneficios",
    },
    {
      href: "/comunidad/perfil",
      label: "Mi Perfil",
      icon: Settings,
      active: pathname === "/comunidad/perfil",
    },
  ];

  // Admin specific modules for the drawer
  const adminModules = [
    { href: "/admin/ordenes", label: "Órdenes", icon: ClipboardList },
    { href: "/admin", label: "Reportes", icon: History },
    { href: "/admin/experiencias", label: "Experiencias", icon: Package },
    { href: "/admin/beneficios", label: "Beneficios", icon: Gift },
    { href: "/admin/editar-web", label: "Editar Web", icon: ExternalLink },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-50 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] px-4 py-3 flex items-center justify-around shadow-[0_20px_40px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom duration-500">
        {mainLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                link.active ? "text-gold-500 scale-105" : "text-slate-400 opacity-60"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all",
                link.active ? "bg-gold-500/10" : "bg-transparent"
              )}>
                <Icon size={20} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-center px-1">
                {link.label}
              </span>
            </Link>
          );
        })}

        {isAdmin && (
          <button
            onClick={() => setIsMenuOpen(true)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              isMenuOpen ? "text-gold-500 scale-105" : "text-slate-400 opacity-60"
            )}
          >
            <div className={cn(
               "p-2 rounded-xl transition-all",
               isMenuOpen ? "bg-gold-500/10 font-bold" : "bg-transparent"
             )}>
              <Menu size={20} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-center">
              Más
            </span>
          </button>
        )}
      </nav>

      {/* Admin Drawer (Sheet Replacement) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] md:hidden"
            />
            
            {/* Drawer Container */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 w-full bg-black border-t border-white/10 rounded-t-[3rem] z-[70] md:hidden p-8 pb-16 shadow-[0_-20px_60px_rgba(0,0,0,0.8)]"
            >
              {/* Handle */}
              <div className="w-16 h-1.5 bg-white/10 rounded-full mx-auto mb-10" />
              
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-display text-3xl text-white">Administración</h3>
                  <p className="text-xs text-slate-400 font-light mt-1">Configuración y gestión avanzada</p>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white border border-white/5 active:scale-90 transition-transform"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modules Grid */}
              <div className="grid grid-cols-2 xs:grid-cols-3 gap-3 md:grid-cols-2">
                {adminModules.map((mod) => {
                  const Icon = mod.icon;
                  const isActive = pathname === mod.href;
                  return (
                    <Link
                      key={mod.href}
                      href={mod.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "flex flex-col gap-3 p-4 rounded-[2rem] transition-all group active:scale-95 border",
                        isActive 
                          ? "bg-gold-500/10 border-gold-500/30" 
                          : "bg-white/5 border-white/5 hover:border-white/10"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                        isActive ? "bg-gold-500 text-slate-950" : "bg-black text-gold-500 border border-gold-500/10"
                      )}>
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        isActive ? "text-gold-500" : "text-slate-300"
                      )}>
                        {mod.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

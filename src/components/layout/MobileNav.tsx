"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { User, Settings, ClipboardList, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileNav({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  const links = [
    {
      href: "/club",
      label: "Mi Perfil",
      icon: User,
      active: pathname === "/club",
    },
    ...(isAdmin ? [
      {
        href: "/admin",
        label: "Reportes",
        icon: ClipboardList,
        active: pathname === "/admin",
      },
      {
        href: "/admin/experiencias",
        label: "Experiencias",
        icon: Package,
        active: pathname === "/admin/experiencias",
      }
    ] : []),
    {
      href: "/club/perfil",
      label: "Configuración",
      icon: Settings,
      active: pathname === "/club/perfil",
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 px-6 pb-6 pt-3 flex items-center justify-around shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              link.active ? "text-gold-500 scale-110" : "text-slate-400 opacity-70"
            )}
          >
            <div className={cn(
              "p-2 rounded-xl transition-all",
              link.active ? "bg-gold-500/10" : "bg-transparent"
            )}>
              <Icon size={20} strokeWidth={link.active ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}



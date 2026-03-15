"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { User, Settings } from "lucide-react";

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 hidden md:flex flex-col gap-2">
      <Link 
        href="/club" 
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
          pathname === '/club' 
            ? 'bg-gold-500/10 border border-gold-500 text-gold-500 font-medium' 
            : 'hover:bg-white/5 text-slate-300'
        }`}
      >
        <User size={18} /> Mi Perfil
      </Link>
      <div className="mt-8 border-t border-white/5 pt-8">
        <Link 
          href="/club/perfil" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
            pathname === '/club/perfil' 
              ? 'bg-gold-500/10 border border-gold-500 text-gold-500 font-medium' 
              : 'hover:bg-white/5 text-slate-300'
          }`}
        >
          <Settings size={18} /> Configuración
        </Link>
      </div>
    </nav>
  );
}

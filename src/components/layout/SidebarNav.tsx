"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { User, Settings, ClipboardList, Package, Ticket, Gift } from "lucide-react";

export default function SidebarNav({ isAdmin }: { isAdmin?: boolean }) {
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
        <Ticket size={18} /> Mis reservas
      </Link>
      <Link 
        href="/club/beneficios" 
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
          pathname === '/club/beneficios' 
            ? 'bg-gold-500/10 border border-gold-500 text-gold-500 font-medium' 
            : 'hover:bg-white/5 text-slate-300'
        }`}
      >
        <Gift size={18} /> Mis Beneficios
      </Link>

      {isAdmin && (
        <>
          <Link 
            href="/admin" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              pathname === '/admin' 
                ? 'bg-gold-500/10 border border-gold-500 text-gold-500 font-medium' 
                : 'hover:bg-gold-500/10 text-gold-400 border border-gold-500/20'
            }`}
          >
            <ClipboardList size={18} /> Reportes
          </Link>
          <Link 
            href="/admin/experiencias" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              pathname === '/admin/experiencias' 
                ? 'bg-gold-500/10 border border-gold-500 text-gold-500 font-medium' 
                : 'hover:bg-gold-500/10 text-gold-400 border border-gold-500/20'
            }`}
          >
            <Package size={18} /> Experiencias
          </Link>
          <Link 
            href="/admin/beneficios" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              pathname === '/admin/beneficios' 
                ? 'bg-gold-500/10 border border-gold-500 text-gold-500 font-medium' 
                : 'hover:bg-gold-500/10 text-gold-400 border border-gold-500/20'
            }`}
          >
            <Gift size={18} /> Beneficios
          </Link>
          <Link 
            href="/admin/editar-web" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              pathname === '/admin/editar-web' 
                ? 'bg-gold-500/10 border border-gold-500 text-gold-500 font-medium' 
                : 'hover:bg-gold-500/10 text-gold-400 border border-gold-500/20'
            }`}
          >
            <Settings size={18} /> Editar Web
          </Link>
        </>
      )}

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



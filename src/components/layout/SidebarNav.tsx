"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { User, Settings, ClipboardList, Package, Ticket, Gift } from "lucide-react";

export default function SidebarNav({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 hidden md:flex flex-col gap-2">
      <Link 
        href="/comunidad" 
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
          pathname === '/comunidad' 
            ? 'bg-gold-500/10 border border-gold-500 text-gold-500 font-medium' 
            : 'hover:bg-white/5 text-slate-300'
        }`}
      >
        <Ticket size={18} /> Mis Experiencias
      </Link>
      <Link 
        href="/comunidad/beneficios" 
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
          pathname === '/comunidad/beneficios' 
            ? 'bg-gold-500/10 border border-gold-500 text-gold-500 font-medium' 
            : 'hover:bg-white/5 text-slate-300'
        }`}
      >
        <Gift size={18} /> Mis Beneficios
      </Link>

      {isAdmin && (
        <div className="mt-8 pt-8 border-t border-white/5 space-y-2">
           <div className="flex items-center gap-2 mb-2 px-4">
              <div className="w-1.5 h-1.5 bg-gold-500 rounded-full" />
              <h4 className="text-[9px] uppercase tracking-[0.3em] text-slate-500 font-black">ADMINISTRACIÓN</h4>
           </div>

           <Link 
            href="/admin/ordenes" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              pathname === '/admin/ordenes' 
                ? 'bg-gold-500/10 border border-gold-500 text-gold-500 font-medium font-bold' 
                : 'hover:bg-gold-500/10 text-gold-400 border border-gold-500/20'
            }`}
          >
            <ClipboardList size={18} /> Órdenes Activas
          </Link>

          <Link 
            href="/admin" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              pathname === '/admin' 
                ? 'bg-gold-500/10 border border-gold-500 text-gold-500 font-medium font-bold' 
                : 'hover:bg-gold-500/10 text-gold-400 border border-gold-500/20'
            }`}
          >
            <Package size={18} /> Reportes
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
        </div>
      )}

      <div className="mt-8 border-t border-white/5 pt-8">
        <Link 
          href="/comunidad/perfil" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
            pathname === '/comunidad/perfil' 
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



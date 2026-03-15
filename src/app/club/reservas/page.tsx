import { motion } from "framer-motion";
import { CalendarX } from "lucide-react";

export default function ReservasPage() {
  return (
    <div className="flex flex-col h-full">
      <h1 className="font-display text-4xl text-white mb-8">Mis Reservas</h1>
      
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <div className="glass-panel p-12 rounded-3xl flex flex-col items-center text-center max-w-md border border-white/5 shadow-2xl relative overflow-hidden group">
          {/* Decorative background for empty state */}
          <div className="absolute inset-0 bg-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mb-6 border border-white/10 text-slate-500 group-hover:text-gold-500 group-hover:border-gold-500/30 transition-all duration-500 shadow-inner">
            <CalendarX size={40} strokeWidth={1.5} />
          </div>
          
          <h2 className="text-2xl font-display text-white mb-3">Sin Experiencias</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Aún no tienes experiencias programadas. Explora nuestro catálogo y reserva tu próximo momento inolvidable.
          </p>
          
          <a 
            href="/"
            className="px-8 py-3 bg-gold-500 text-slate-950 rounded-full font-bold text-sm hover:bg-gold-400 transition-all active:scale-95 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
          >
            Explorar Club
          </a>
        </div>
      </div>
    </div>
  );
}

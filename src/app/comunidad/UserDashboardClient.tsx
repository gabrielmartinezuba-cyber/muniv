"use client";

import { useState } from "react";
import { PlusCircle, Compass, History, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { BookingCard } from "./BookingCard";

export default function UserDashboardClient({ bookings }: { bookings: any[] }) {
  const [showFinalizadas, setShowFinalizadas] = useState(false);

  // Lógica de visibilidad inteligente
  const activeBookings = bookings.filter((b: any) => {
    const isEntregado = b.status === "ENTREGADO";
    const isCancelado = b.status === "CANCELADO";
    const isEvento = b.experiences?.type?.trim().toLowerCase() === "evento";
    
    // Un evento se considera "Pasado" si su fecha es menor o igual a hoy
    const isPastEvent = isEvento && b.experiences?.event_date && new Date(b.experiences.event_date) <= new Date();

    if (showFinalizadas) {
      // En Finalizadas mostramos las entregadas Y los eventos pasados.
      return isEntregado || isPastEvent;
    } else {
      // En Activas ocultamos las entregadas, canceladas y los eventos que ya pasaron
      return !isEntregado && !isCancelado && !isPastEvent;
    }
  });

  const hasBookings = activeBookings.length > 0;

  return (
    <div className="min-h-screen bg-[#0c0a09] pt-32 pb-20 px-6 md:px-12 lg:px-20">
      {/* Contenido Principal */}
      <main className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="font-display text-4xl text-white tracking-tight">
              Mis Experiencias
            </h1>
            <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-black flex items-center gap-2">
              <History size={14} className="text-gold-500/50" /> Historial de Actividad
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/50 p-1.5 rounded-full border border-white/5">
             <button
                onClick={() => setShowFinalizadas(false)}
                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${!showFinalizadas ? 'bg-gold-500 text-slate-950 shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
             >
                Activas
             </button>
             <button
                onClick={() => setShowFinalizadas(true)}
                className={`px-5 py-2 flex items-center gap-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${showFinalizadas ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300'}`}
             >
                <CheckCircle2 size={14} /> Experiencias Finalizadas
             </button>
          </div>
        </div>

        <div className="space-y-12">
          {hasBookings ? (
            <div className="space-y-12">
              {/* Eventos */}
              {activeBookings.some((b: any) => b.experiences?.type?.trim().toLowerCase() === 'evento') && (
                <section>
                  <h3 className="text-gold-500 text-[10px] font-black tracking-[0.3em] uppercase mb-6 flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-gold-500/30" /> Eventos {showFinalizadas ? 'Asistidos' : 'Próximos'} <span className="w-full h-[1px] bg-gold-500/30" />
                  </h3>
                  <div className="space-y-4">
                    {activeBookings.filter((b: any) => b.experiences?.type?.trim().toLowerCase() === 'evento').map((booking: any) => (
                      <BookingCard key={booking.id} booking={booking} />
                    ))}
                  </div>
                </section>
              )}

              {/* Cajas */}
              {activeBookings.some((b: any) => b.experiences?.type?.trim().toLowerCase() === 'caja') && (
                <section>
                  <h3 className="text-gold-500 text-[10px] font-black tracking-[0.3em] uppercase mb-6 flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-gold-500/30" /> Cajas <span className="w-full h-[1px] bg-gold-500/30" />
                  </h3>
                  <div className="space-y-4">
                    {activeBookings.filter((b: any) => b.experiences?.type?.trim().toLowerCase() === 'caja').map((booking: any) => (
                      <BookingCard key={booking.id} booking={booking} />
                    ))}
                  </div>
                </section>
              )}

              {/* Sorteos */}
              {activeBookings.some((b: any) => b.experiences?.type?.trim().toLowerCase() === 'sorteo') && (
                <section>
                  <h3 className="text-gold-500 text-[10px] font-black tracking-[0.3em] uppercase mb-6 flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-gold-500/30" /> Sorteos <span className="w-full h-[1px] bg-gold-500/30" />
                  </h3>
                  <div className="space-y-4">
                    {activeBookings.filter((b: any) => b.experiences?.type?.trim().toLowerCase() === 'sorteo').map((booking: any) => (
                      <BookingCard key={booking.id} booking={booking} />
                    ))}
                  </div>
                </section>
              )}

              <div className="pt-4 mt-2 border-t border-white/5">
                <Link
                  href="/"
                  className="w-full justify-center px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-300 hover:bg-gold-500 hover:text-slate-900 transition-all flex items-center gap-2"
                >
                  <PlusCircle size={14} /> Explorar Catálogo
                </Link>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-black/20 flex-1">
              <Compass size={40} className="text-slate-600 mb-4" />
              <h3 className="text-lg text-white font-medium mb-2">
                {showFinalizadas ? 'No tenés experiencias finalizadas' : 'Aún no tenés experiencias activas'}
              </h3>
              <p className="text-slate-400 text-sm mb-6 max-w-xs">
                {showFinalizadas
                   ? 'Cuando disfrutes de alguna de nuestras experiencias y recibas tu pedido, aparecerá aquí.' 
                   : 'Tu agenda activa está vacía. Empezá a diseñar momentos únicos explorando nuestro catálogo.'}
              </p>
              <Link
                href="/"
                className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm font-medium hover:bg-gold-500 hover:text-slate-900 hover:border-gold-500 transition-all flex items-center gap-2"
              >
                <PlusCircle size={14} /> Ver Catálogo
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

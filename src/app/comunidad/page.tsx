import { PlusCircle, Compass, History } from "lucide-react";
import Link from "next/link";
import { getUserBookings } from "@/actions/booking";
import { BookingCard } from "./BookingCard";

export default async function ClubDashboard() {
  const bookings = await getUserBookings();

  // Lógica de visibilidad inteligente (Auto-Limpieza)
  const activeBookings = bookings.filter((b: any) => {
    const type = b.experiences?.type?.trim().toLowerCase();
    const now = new Date();

    if (type === 'caja') {
      // Para Cajas: Solo se ocultan entregados o cancelados
      return b.status !== 'ENTREGADO' && b.status !== 'CANCELADO';
    } else {
      // Para Eventos/Sorteos: Se ocultan si están cancelados O si la fecha ya pasó
      // Se ajusta la comparación reseteando las horas para que no se oculte prematuramente el mismo día
      let isPast = false;
      if (b.experiences?.event_date) {
        const eventDate = new Date(b.experiences.event_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        eventDate.setHours(0, 0, 0, 0);
        isPast = today > eventDate;
      }
      return b.status !== 'CANCELADO' && !isPast;
    }
  });

  const hasBookings = activeBookings.length > 0;

  return (
    <div className="min-h-screen bg-[#0c0a09] pt-32 pb-20 px-6 md:px-12 lg:px-20">
      {/* Contenido Principal */}
      <main className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display text-4xl text-white tracking-tight">Mis Experiencias</h1>
            <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-black flex items-center gap-2">
              <History size={14} className="text-gold-500/50" /> Historial de Actividad
            </p>
          </div>
        </div>

        <div className="space-y-12">
          {hasBookings ? (
            <div className="space-y-12">
              {/* Eventos */}
              {activeBookings.some((b: any) => b.experiences?.type?.trim().toLowerCase() === 'evento') && (
                <section>
                  <h3 className="text-gold-500 text-[10px] font-black tracking-[0.3em] uppercase mb-6 flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-gold-500/30" /> Próximos Eventos <span className="w-full h-[1px] bg-gold-500/30" />
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
              <h3 className="text-lg text-white font-medium mb-2">Aún no tenés experiencias</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-xs">
                Tu agenda está vacía. Empezá a diseñar momentos únicos explorando nuestro catálogo.
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

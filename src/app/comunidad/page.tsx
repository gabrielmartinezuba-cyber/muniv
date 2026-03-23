import { createClient } from "@/utils/supabase/server";
import { PlusCircle, Compass, History, Calendar, Users, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getUserBookings } from "@/actions/booking";
import Image from "next/image";

export default async function ClubDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const bookings = await getUserBookings();

  // Extraemos nombre del metadata si está disponible
  const firstName = user?.user_metadata?.first_name || "Miembro";

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700">
      
      <header className="mb-10">
        <h1 className="text-3xl font-serif text-gold-500 tracking-wide uppercase italic">
          Mis <span className="text-white">reservas</span>
        </h1>
      </header>

      <div className="max-w-4xl">
        
        {/* Widget: Mis Reservas */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-slate-900/40 relative overflow-hidden group hover:border-white/10 transition-colors flex flex-col">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-700/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-8">
             <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/30">
               <History size={20} />
             </div>
             <h2 className="font-display text-2xl text-white">Próximas Reservas</h2>
          </div>

          {bookings && bookings.length > 0 ? (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {bookings.map((booking: any) => (
                <div key={booking.id} className="relative group/card overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50 p-4 transition-all hover:bg-slate-900/80">
                  {/* Background Experience Image dimmed */}
                  <div className="absolute inset-0 opacity-10 group-hover/card:opacity-20 transition-opacity">
                    <Image 
                      src={booking.experiences?.image_url || '/placeholder.jpg'} 
                      alt="" 
                      fill 
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <h4 className="text-white font-display text-lg mb-1 tracking-wide">
                        {booking.experiences?.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-xs">
                        <span className="flex items-center gap-1.5">
                          <Users size={14} className="text-gold-500" /> {booking.guests_count} personas
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-gold-500" /> 
                          {new Date(booking.created_at).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="flex items-center gap-1.5 pl-3 pr-4 py-1.5 bg-gold-500/10 border border-gold-500/30 text-gold-500 rounded-full text-[10px] font-bold tracking-widest uppercase">
                        <CheckCircle2 size={12} /> {booking.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 mt-2 border-t border-white/5">
                <Link 
                  href="/"
                  className="w-full justify-center px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-300 hover:bg-gold-500 hover:text-slate-900 transition-all flex items-center gap-2"
                >
                  <PlusCircle size={14} /> Reservar Nueva Experiencia
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
                <PlusCircle size={16} /> Ver Catálogo
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}



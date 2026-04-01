"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getActiveExperiences, type Experience } from "@/actions/experiences";
import { useCartStore } from "@/store/useCartStore";
import { Loader2, Plus, Calendar, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function ExperienceList() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, openCart } = useCartStore();
  const router = useRouter();

  const handleBookingClick = async (exp: Experience) => {
    // SECURITY: Raffle Gatekeeping
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (exp.type?.toLowerCase() === 'sorteo' && !session) {
      toast.error("¡Evento exclusivo!", {
        description: "Para participar de los sorteos tenés que ser miembro. ¡Registrate ahora!",
        icon: <ShieldCheck className="text-gold-500" size={20} />,
      });
      return;
    }

    addItem({
      experienceId: exp.id,
      type: exp.type, // Pass type
      title: exp.title,
      price: exp.price,
      status: exp.status,
      eventDate: exp.event_date,
      guests: 1,
      upSells: [],
      wine_quantity: (exp as any).wine_quantity,
      wine_options: (exp as any).wine_options,
    });
    openCart();
  };

  useEffect(() => {
    getActiveExperiences().then((data: Experience[]) => {
      setExperiences(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-6 md:px-12 py-12">
      {experiences.map((exp, index) => (
        <motion.div
          key={exp.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="group relative glass-panel rounded-3xl overflow-hidden border hover:border-gold-500/20 transition-all duration-500"
        >
          {/* Image Container */}
          <div className="relative h-64 w-full overflow-hidden">
            <Image
              src={exp.image_url}
              alt={exp.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

            {/* Type Badge */}
            <span className="absolute top-4 left-4 px-3 py-1 bg-stone-950/85 backdrop-blur-md border border-gold-500/25 text-gold-500 text-[10px] uppercase tracking-widest font-bold rounded-full">
              {exp.type}
            </span>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="font-display text-2xl text-white mb-2 group-hover:text-gold-400 transition-colors">
              {exp.title}
            </h3>
            <p className="text-slate-400 text-sm mb-4 font-light">
              {exp.description}
            </p>

            {exp.event_date && (
              <div className="flex items-center gap-2 text-gold-500 text-[11px] tracking-wider uppercase font-bold mb-2">
                <Calendar size={14} />
                <span>
                  {new Date(exp.event_date).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', '')} - {new Date(exp.event_date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}hs
                </span>
              </div>
            )}

            {(exp as any).location_name && (
               <div className="flex items-center gap-2 text-slate-500 text-[10px] tracking-widest uppercase font-black mb-6">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gold-500/70"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                 <span className="truncate">{(exp as any).location_name} • {(exp as any).location_address}</span>
               </div>
            )}

            <div className="flex items-center justify-between mt-auto">
              <div className="flex flex-col">
                {exp.price > 0 && (
                  <span className="text-xs text-slate-500 uppercase tracking-tighter">Precio</span>
                )}
                <span className="text-xl text-white font-medium">
                  {exp.price === 0 ? 'Gratis' : `$${exp.price.toLocaleString('es-AR')}`}
                </span>
              </div>

              {exp.status === 'COMING_SOON' ? (
                <button
                  disabled
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-slate-500 rounded-full font-bold text-sm cursor-not-allowed border border-white/5"
                >
                  PRÓXIMAMENTE
                </button>
              ) : (
                <button
                  onClick={() => handleBookingClick(exp)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-burgundy-600 text-white rounded-full font-bold text-sm hover:bg-burgundy-500 transition-all active:scale-95 shadow-[0_0_20px_rgba(108,26,26,0.4)]"
                >
                  {exp.type?.toLowerCase() === 'caja' ? 'COMPRAR' : (exp.price === 0 ? 'Participar' : 'Reservar')} <Plus size={16} />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}



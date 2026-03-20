"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getActiveExperiences, type Experience } from "@/actions/experiences";
import { useBookingStore } from "@/store/useBookingStore";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ExperienceList() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const { openBooking } = useBookingStore();
  const router = useRouter();
  const supabase = createClient();

  const handleBookingClick = async (exp: Experience) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // No session, redirect to login
      router.push("/login");
      return;
    }

    openBooking(exp.id, exp.title, exp.price, exp.status);
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
            <p className="text-slate-400 text-sm mb-6 font-light">
              {exp.description}
            </p>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 uppercase tracking-tighter">Inversión</span>
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
                  {exp.price === 0 ? 'Participar' : 'Reservar'} <Plus size={16} />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}



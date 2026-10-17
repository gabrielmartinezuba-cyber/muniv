"use client";

import { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  getActiveExperiences,
  getExperienceAvailability,
  type Experience,
} from "@/actions/experiences";
import { useCartStore } from "@/store/useCartStore";
import {
  Loader2,
  Plus,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Sparkles,
  Flame,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { submitBooking } from "@/actions/booking";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export default function ExperienceList() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [availability, setAvailability] = useState<
    Record<string, { remaining: number }>
  >({});
  const { addItem, openCart } = useCartStore();
  const router = useRouter();

  const handleBookingClick = async (exp: Experience) => {
    // SECURITY: Raffle Gatekeeping
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (exp.type?.toLowerCase() === "sorteo") {
      if (!session) {
        toast.error("¡Evento exclusivo!", {
          description:
            "Para participar de los sorteos tenés que ser miembro. ¡Registrate ahora!",
          icon: <ShieldCheck className="text-gold-500" size={20} />,
        });
        return;
      }

      // SORTEO: Bypasses cart entirely and submits participation directly
      setProcessingId(exp.id);
      startTransition(async () => {
        const res = await submitBooking({
          experienceId: exp.id,
          experienceTitle: exp.title,
          date: exp.event_date
            ? exp.event_date.split("T")[0]
            : new Date().toISOString().split("T")[0],
          time: exp.event_date
            ? new Date(exp.event_date).toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : "00:00",
          guests: 1,
          upSells: [],
          final_price: 0,
        });

        if (res.success) {
          toast.success("¡Participación Confirmada!", {
            description: `Ya estás participando en el sorteo de ${exp.title}. ¡Mucha suerte!`,
            icon: <CheckCircle2 className="text-emerald-500" size={20} />,
          });
        } else {
          toast.error("Atención", {
            description: res.message || "Error al participar del sorteo.",
          });
        }
        setProcessingId(null);
      });

      return;
    }

    // Normal Cart Flow for Cajas and Eventos
    if (!session && exp.type?.toLowerCase() !== "sorteo") {
      toast("¡Te estás perdiendo de un descuento!", {
        description:
          "Como miembro de Muniv adquirís precios especiales y múltiples beneficios.",
        action: { label: "Crear cuenta", onClick: () => router.push("/login") },
        icon: <ShieldCheck className="text-gold-500" size={20} />,
      });
    }

    addItem({
      experienceId: exp.id,
      type: exp.type,
      title: exp.title,
      price: exp.price,
      status: exp.status,
      eventDate: exp.event_date,
      guests: 1,
      upSells: [],
      temp_discount: exp.temp_discount || (exp as any).temporal_discount || 0,
      wine_quantity: (exp as any).wine_quantity,
      wine_options: (exp as any).wine_options,
      addon_picada_price: exp.addon_picada_price || 0,
      addon_copas_price: exp.addon_copas_price || 0,
    });
    openCart();
  };

  useEffect(() => {
    getActiveExperiences().then(async (data: Experience[]) => {
      setExperiences(data);

      // Fetch availability for each
      const availMap: Record<string, { remaining: number }> = {};
      for (const exp of data) {
        if (exp.max_capacity && exp.max_capacity > 0) {
          const res = await getExperienceAvailability(exp.id);
          availMap[exp.id] = { remaining: res.remaining };
        } else {
          availMap[exp.id] = { remaining: 999 };
        }
      }
      setAvailability(availMap);
      setLoading(false);
    });
  }, []);

  // Premium Shimmer Loading State
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-8">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="rounded-3xl glass-panel p-5 border border-white/5 space-y-4"
          >
            <Skeleton variant="card" className="w-full h-56 rounded-2xl" />
            <div className="space-y-2 pt-2">
              <Skeleton variant="text" lines={2} />
              <div className="flex justify-between items-center pt-4">
                <Skeleton variant="button" className="w-24 h-6" />
                <Skeleton variant="button" className="w-28 h-10 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-8">
      {experiences.map((exp, index) => {
        const isSoldOut = availability[exp.id]?.remaining <= 0;
        const isComingSoon = exp.status === "COMING_SOON";
        const tempDiscount =
          exp.temp_discount || (exp as any).temporal_discount || 0;

        return (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: index * 0.08 }}
            whileHover={!isSoldOut ? { y: -6 } : undefined}
            className={cn(
              "group relative rounded-3xl overflow-hidden flex flex-col justify-between",
              "glass-panel border border-white/5 hover:border-gold-500/30",
              "transition-all duration-500 ease-out shadow-[0_10px_30px_rgba(0,0,0,0.5)]",
              isSoldOut && "opacity-75 grayscale-[0.35]"
            )}
          >
            {/* Top Image Container */}
            <div className="relative h-64 w-full overflow-hidden bg-iron-950">
              <Image
                src={exp.image_url}
                alt={exp.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={cn(
                  "object-cover transition-transform duration-700 ease-out",
                  !isSoldOut && "group-hover:scale-105"
                )}
              />

              {/* Cinematic Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-transparent to-black/30 pointer-events-none" />

              {/* Badges Container */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
                {/* Type Badge */}
                <span className="px-3.5 py-1 bg-black/60 backdrop-blur-md border border-gold-500/25 text-gold-400 text-[11px] uppercase tracking-[0.18em] font-bold rounded-full shadow-lg">
                  {exp.type}
                </span>

                {/* Promotional Discount Badge */}
                {tempDiscount > 0 && !isSoldOut && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-burgundy-700/90 backdrop-blur-md border border-ember-500/40 text-amber-200 text-xs font-bold rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                    <Flame size={12} className="text-amber-400 animate-pulse" />
                    <span>-{tempDiscount}% OFF</span>
                  </span>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 md:p-7 flex flex-col flex-1 justify-between">
              <div>
                <h3 className="font-display text-2xl text-white mb-2.5 group-hover:text-gold-300 transition-colors leading-tight">
                  {exp.title}
                </h3>
                <p className="text-slate-300/80 text-sm mb-5 font-light line-clamp-3 leading-relaxed">
                  {exp.description}
                </p>

                {/* Metadata Details: Date & Location */}
                <div className="space-y-2 mb-6">
                  {exp.event_date && (
                    <div className="flex items-center gap-2 text-gold-400/90 text-xs tracking-wider uppercase font-medium">
                      <Calendar size={14} className="text-gold-400 shrink-0" />
                      <span>
                        {new Date(exp.event_date)
                          .toLocaleDateString("es-AR", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })
                          .replace(".", "")}{" "}
                        •{" "}
                        {new Date(exp.event_date).toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        hs
                      </span>
                    </div>
                  )}

                  {(exp as any).location_name && (
                    <div className="flex items-center gap-2 text-slate-400 text-xs tracking-wider font-light">
                      <MapPin size={14} className="text-gold-400/70 shrink-0" />
                      <span className="truncate">
                        {(exp as any).location_name}
                        {(exp as any).location_address
                          ? ` • ${(exp as any).location_address}`
                          : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price & Action Footer */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4 mt-auto">
                <div className="flex flex-col">
                  {exp.price > 0 && (
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                      Inversión
                    </span>
                  )}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl text-white font-medium tracking-tight">
                      {exp.price === 0
                        ? "Gratis"
                        : `$${exp.price.toLocaleString("es-AR")}`}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                {isComingSoon ? (
                  <button
                    disabled
                    className="px-5 py-2.5 rounded-full font-bold text-xs cursor-not-allowed bg-stone-900/80 border border-white/10 text-slate-500 uppercase tracking-widest"
                  >
                    Próximamente
                  </button>
                ) : isSoldOut ? (
                  <button
                    disabled
                    className="px-5 py-2.5 rounded-full font-bold text-xs cursor-not-allowed bg-stone-950/80 border border-white/10 text-slate-500 uppercase tracking-widest"
                  >
                    Agotado
                  </button>
                ) : (
                  <button
                    onClick={() => handleBookingClick(exp)}
                    disabled={processingId === exp.id}
                    className={cn(
                      "relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm",
                      "bg-burgundy-600 hover:bg-burgundy-500 text-white",
                      "transition-all duration-300 ease-out shadow-[0_0_20px_rgba(124,32,32,0.4)]",
                      "active:scale-95 cursor-pointer disabled:opacity-50"
                    )}
                  >
                    {processingId === exp.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <span>
                          {exp.type?.toLowerCase() === "caja"
                            ? "Comprar"
                            : exp.type?.toLowerCase() === "sorteo"
                            ? "Participar"
                            : "Reservar"}
                        </span>
                        <Plus size={15} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

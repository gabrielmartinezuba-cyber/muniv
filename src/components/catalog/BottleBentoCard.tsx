"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Calendar, MapPin, Flame, Plus, Eye, Loader2 } from "lucide-react";
import { type Experience } from "@/actions/experiences";
import { cn } from "@/lib/utils";

interface BottleBentoCardProps {
  exp: Experience;
  index: number;
  isSoldOut: boolean;
  isComingSoon: boolean;
  tempDiscount: number;
  bottleAsset: string;
  onSelect: (exp: Experience) => void;
  onQuickBuy: (exp: Experience, e: React.MouseEvent) => void;
  isProcessing: boolean;
}

export function BottleBentoCard({
  exp,
  index,
  isSoldOut,
  isComingSoon,
  tempDiscount,
  bottleAsset,
  onSelect,
  onQuickBuy,
  isProcessing,
}: BottleBentoCardProps) {
  // Bento grid spans
  let bentoSpan = "col-span-1 row-span-1 min-h-[380px]";
  const isHeroBento = index === 0;

  if (isHeroBento) {
    bentoSpan = "md:col-span-2 md:row-span-2 min-h-[480px] md:min-h-[580px]";
  } else if (index === 3) {
    bentoSpan = "md:col-span-2 row-span-1 min-h-[380px]";
  } else if (index % 5 === 0) {
    bentoSpan = "lg:col-span-2 row-span-1 min-h-[380px]";
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.07 }}
      whileHover={!isSoldOut ? { y: -6 } : undefined}
      onClick={() => onSelect(exp)}
      className={cn(
        "group relative rounded-3xl overflow-hidden flex flex-col justify-between cursor-pointer",
        "bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-xl",
        "border border-white/10 hover:border-gold-400/40",
        "transition-all duration-500 ease-out shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
        bentoSpan,
        isSoldOut && "opacity-70 grayscale-[0.4]"
      )}
    >
      {/* Visual Container with Floating Bottle Animation (layoutId for FLIP transition) */}
      <div
        className={cn(
          "relative w-full overflow-hidden flex items-center justify-center bg-gradient-to-b from-white/[0.02] to-transparent",
          isHeroBento ? "h-72 sm:h-80 md:h-[360px]" : "h-56 md:h-64"
        )}
      >
        {/* Ambient Glow behind the bottle */}
        <div className="absolute w-40 h-40 bg-gold-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-gold-500/20 transition-all duration-700" />

        {/* Floating Bottle Asset with Framer Motion layoutId */}
        <motion.div
          layoutId={`bottle-visual-${exp.id}`}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 26,
            mass: 0.8,
          }}
          className="relative z-10 w-full h-full p-6 flex items-center justify-center"
        >
          {/* Continuous Kinetic Levitation in Idle state */}
          <motion.div
            animate={
              !isSoldOut
                ? {
                    y: [0, -8, 0],
                    rotateZ: [0, 1, 0, -1, 0],
                  }
                : undefined
            }
            transition={{
              repeat: Infinity,
              duration: 4.5,
              ease: "easeInOut",
              delay: index * 0.3,
            }}
            className="relative w-full h-full flex items-center justify-center filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.7)]"
          >
            <Image
              src={bottleAsset}
              alt={exp.title}
              fill
              sizes={
                isHeroBento
                  ? "(max-width: 768px) 100vw, 66vw"
                  : "(max-width: 768px) 100vw, 33vw"
              }
              className="object-contain transition-transform duration-500 group-hover:scale-105"
              priority={index < 2}
            />
          </motion.div>
        </motion.div>

        {/* Badges Container */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none z-20">
          <span className="px-3.5 py-1 bg-black/45 backdrop-blur-md border border-white/15 text-gold-300 text-[11px] uppercase tracking-[0.2em] font-bold rounded-full shadow-lg">
            {exp.type}
          </span>

          {tempDiscount > 0 && !isSoldOut && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-burgundy-700/80 backdrop-blur-md border border-ember-400/40 text-amber-200 text-xs font-bold rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)]">
              <Flame size={12} className="text-amber-400 animate-pulse" />
              <span>-{tempDiscount}% OFF</span>
            </span>
          )}
        </div>

        {/* Hover Hint Overlay: "Ver Detalle" */}
        <div className="absolute bottom-3 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5 text-xs text-gold-300 font-medium tracking-wider uppercase pointer-events-none">
          <Eye size={13} />
          <span>Ver Detalle</span>
        </div>
      </div>

      {/* Bento Card Content */}
      <div className="p-6 md:p-7 flex flex-col flex-1 justify-between bg-black/20">
        <div>
          <h3
            className={cn(
              "font-display text-white mb-2.5 group-hover:text-gold-300 transition-colors leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]",
              isHeroBento ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
            )}
          >
            {exp.title}
          </h3>
          <p
            className={cn(
              "text-[#e8e0d5]/80 font-light mb-5 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]",
              isHeroBento ? "text-base md:text-lg line-clamp-3" : "text-sm line-clamp-2"
            )}
          >
            {exp.description}
          </p>

          {/* Date & Location Details */}
          <div className="space-y-2 mb-4">
            {exp.event_date && (
              <div className="flex items-center gap-2 text-gold-300/90 text-xs tracking-wider uppercase font-medium drop-shadow">
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
              <div className="flex items-center gap-2 text-slate-300/80 text-xs tracking-wider font-light drop-shadow">
                <MapPin size={14} className="text-gold-400/80 shrink-0" />
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
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4 mt-auto">
          <div className="flex flex-col">
            {exp.price > 0 && (
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                Inversión
              </span>
            )}
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl md:text-3xl text-white font-display font-medium tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {exp.price === 0
                  ? "Gratis"
                  : `$${exp.price.toLocaleString("es-AR")}`}
              </span>
            </div>
          </div>

          {/* Action Button */}
          {isComingSoon ? (
            <button
              disabled
              className="px-5 py-2.5 rounded-full font-bold text-xs cursor-not-allowed bg-white/5 border border-white/10 text-slate-400 uppercase tracking-widest"
            >
              Próximamente
            </button>
          ) : isSoldOut ? (
            <button
              disabled
              className="px-5 py-2.5 rounded-full font-bold text-xs cursor-not-allowed bg-black/40 border border-white/10 text-slate-400 uppercase tracking-widest"
            >
              Agotado
            </button>
          ) : (
            <button
              onClick={(e) => onQuickBuy(exp, e)}
              disabled={isProcessing}
              className={cn(
                "relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm",
                "bg-burgundy-600/90 hover:bg-burgundy-500 text-white backdrop-blur-md",
                "border border-burgundy-400/30",
                "transition-all duration-300 ease-out shadow-[0_0_25px_rgba(124,32,32,0.4)] hover:shadow-[0_0_35px_rgba(124,32,32,0.6)]",
                "active:scale-95 cursor-pointer disabled:opacity-50"
              )}
            >
              {isProcessing ? (
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
}

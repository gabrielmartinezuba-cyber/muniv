"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  X,
  Calendar,
  MapPin,
  Flame,
  Plus,
  Minus,
  UtensilsCrossed,
  GlassWater,
  Wine,
  Sparkles,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { type Experience } from "@/actions/experiences";
import { cn } from "@/lib/utils";

interface ExperienceDetailModalProps {
  exp: Experience | null;
  bottleAsset: string;
  onClose: () => void;
  onConfirm: (
    exp: Experience,
    options: {
      picadaQty: number;
      copasQty: number;
      selectedWines: string[];
    }
  ) => void;
  isProcessing: boolean;
  remainingCapacity: number;
}

export function ExperienceDetailModal({
  exp,
  bottleAsset,
  onClose,
  onConfirm,
  isProcessing,
  remainingCapacity,
}: ExperienceDetailModalProps) {
  const [picadaQty, setPicadaQty] = useState(0);
  const [copasQty, setCopasQty] = useState(0);
  const [selectedWines, setSelectedWines] = useState<string[]>([]);

  // Reset local state when experience changes
  useEffect(() => {
    if (exp) {
      setPicadaQty(0);
      setCopasQty(0);
      setSelectedWines([]);
    }
  }, [exp]);

  // Accessibility: Escape key listener and body scroll locking
  useEffect(() => {
    if (!exp) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow || "unset";
    };
  }, [exp, onClose]);

  if (!exp) return null;

  const isSoldOut = remainingCapacity <= 0;
  const isCaja = exp.type?.toLowerCase() === "caja";
  const isSorteo = exp.type?.toLowerCase() === "sorteo";
  const tempDiscount =
    exp.temp_discount || (exp as any).temporal_discount || 0;

  const basePrice = Number(exp.price || 0);
  const discountAmount = basePrice * (Number(tempDiscount) / 100);
  const discountedBase = basePrice - discountAmount;

  const picadaPrice = Number(exp.addon_picada_price || 0);
  const copasPrice = Number(exp.addon_copas_price || 0);

  const totalCalculated =
    discountedBase + picadaQty * picadaPrice + copasQty * copasPrice;

  const totalBottles = (exp as any).wine_quantity || 1;
  const wineOptions: string[] = (exp as any).wine_options || [];

  const handleAction = () => {
    onConfirm(exp, {
      picadaQty,
      copasQty,
      selectedWines,
    });
  };

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-experience-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto"
      >
        {/* Backdrop: deep blur darkening the cave / video */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-40"
        />

        {/* Modal Container */}
        <div className="relative z-50 w-full max-w-5xl my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pointer-events-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 md:top-2 md:right-2 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center backdrop-blur-xl border border-white/15 transition-all shadow-xl cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>

          {/* LEFT: 2.5D Floating Bottle Showcase (FLIP Animated via layoutId) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative perspective-[1200px]">
            {/* Ambient Radial Spotlight */}
            <div className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-gold-500/15 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
              layoutId={`bottle-visual-${exp.id}`}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 26,
                mass: 0.8,
              }}
              style={{
                transformStyle: "preserve-3d",
              }}
              className="relative w-64 h-80 sm:w-80 sm:h-[460px] md:w-96 md:h-[520px] flex items-center justify-center"
            >
              {/* 2.5D Tilt and Levitation */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotateY: [-10, -6, -10],
                  rotateX: [6, 4, 6],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  ease: "easeInOut",
                }}
                className="relative w-full h-full flex items-center justify-center filter drop-shadow-[0_30px_60px_rgba(0,0,0,0.95)]"
              >
                <Image
                  src={bottleAsset}
                  alt={exp.title}
                  fill
                  sizes="(max-width: 1024px) 80vw, 40vw"
                  className="object-contain"
                  priority
                />
              </motion.div>
            </motion.div>

            {/* Reflection / Grounding Glow */}
            <div className="w-48 h-6 bg-gold-400/20 blur-xl rounded-full -mt-4 opacity-70" />
          </div>

          {/* RIGHT: High-End Glassmorphic Detail Panel (Fade-in Up) */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className={cn(
              "lg:col-span-7 flex flex-col justify-between",
              "bg-white/[0.05] backdrop-blur-2xl rounded-[2.5rem]",
              "border border-white/10 p-6 sm:p-8 md:p-10",
              "shadow-[0_20px_80px_rgba(0,0,0,0.85)] max-h-[85vh] overflow-y-auto custom-scrollbar"
            )}
          >
            <div>
              {/* Badge & Category */}
              <div className="flex items-center gap-3 mb-4">
                <span className="px-4 py-1.5 bg-black/50 backdrop-blur-md border border-white/15 text-gold-300 text-xs uppercase tracking-[0.2em] font-bold rounded-full">
                  {exp.type}
                </span>

                {tempDiscount > 0 && !isSoldOut && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-burgundy-700/80 backdrop-blur-md border border-ember-400/40 text-amber-200 text-xs font-bold rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                    <Flame size={13} className="text-amber-400 animate-pulse" />
                    <span>-{tempDiscount}% OFF</span>
                  </span>
                )}
              </div>

              {/* Title */}
              <h2
                id="modal-experience-title"
                className="font-display text-3xl sm:text-4xl md:text-5xl text-white mb-4 leading-[1.08] drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
              >
                {exp.title}
              </h2>

              {/* Description */}
              <p className="text-[#e8e0d5]/85 text-base sm:text-lg font-light leading-relaxed mb-6">
                {exp.description}
              </p>

              {/* Date & Location */}
              <div className="space-y-2.5 mb-6 pb-6 border-b border-white/10">
                {exp.event_date && (
                  <div className="flex items-center gap-2.5 text-gold-300 text-xs sm:text-sm tracking-wider uppercase font-medium">
                    <Calendar size={16} className="text-gold-400 shrink-0" />
                    <span>
                      {new Date(exp.event_date).toLocaleDateString("es-AR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}{" "}
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
                  <div className="flex items-center gap-2.5 text-slate-300 text-xs sm:text-sm tracking-wider font-light">
                    <MapPin size={16} className="text-gold-400/80 shrink-0" />
                    <span>
                      {(exp as any).location_name}
                      {(exp as any).location_address
                        ? ` • ${(exp as any).location_address}`
                        : ""}
                    </span>
                  </div>
                )}
              </div>

              {/* Wine Selector for Cajas */}
              {isCaja && wineOptions.length > 0 && (
                <div className="mb-6 space-y-3">
                  <label className="text-xs text-gold-300 uppercase font-bold tracking-widest flex items-center gap-2">
                    <Wine size={14} className="text-gold-400" />
                    <span>
                      Elegí tus botellas ({selectedWines.filter(Boolean).length}/
                      {totalBottles}):
                    </span>
                  </label>

                  <div className="grid grid-cols-1 gap-2.5">
                    {Array.from({ length: totalBottles }).map((_, idx) => (
                      <select
                        key={idx}
                        value={selectedWines[idx] || ""}
                        onChange={(e) => {
                          const updated = [...selectedWines];
                          updated[idx] = e.target.value;
                          setSelectedWines(updated);
                        }}
                        className="w-full bg-black/45 backdrop-blur-md border border-white/15 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-gold-400/50 transition-all cursor-pointer"
                      >
                        <option value="" disabled>
                          Seleccionar etiqueta {idx + 1}...
                        </option>
                        {wineOptions.map((opt, oIdx) => (
                          <option key={oIdx} value={opt} className="bg-stone-900 text-white">
                            {opt}
                          </option>
                        ))}
                      </select>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons for Cajas (Picada & Copas) */}
              {isCaja && (picadaPrice > 0 || copasPrice > 0) && (
                <div className="mb-6 space-y-3 pt-2">
                  <label className="text-xs text-burgundy-300 uppercase font-bold tracking-widest flex items-center gap-1.5">
                    <Sparkles size={14} className="text-burgundy-400" />
                    <span>Extras para tu experiencia:</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {picadaPrice > 0 && (
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                        <div className="flex items-center gap-2.5">
                          <UtensilsCrossed size={16} className="text-gold-400/80" />
                          <div>
                            <span className="text-xs text-white block">Picada Artesanal</span>
                            <span className="text-[11px] text-gold-400 font-medium">
                              +${picadaPrice.toLocaleString("es-AR")}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-black/40 rounded-full border border-white/10 p-1">
                          <button
                            onClick={() => setPicadaQty((q) => Math.max(0, q - 1))}
                            className="w-6 h-6 rounded-full text-slate-300 hover:text-white flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
                            aria-label="Restar picada"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-xs font-bold text-white min-w-[1ch] text-center">
                            {picadaQty}
                          </span>
                          <button
                            onClick={() => setPicadaQty((q) => q + 1)}
                            className="w-6 h-6 rounded-full text-slate-300 hover:text-white flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
                            aria-label="Sumar picada"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                    )}

                    {copasPrice > 0 && (
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                        <div className="flex items-center gap-2.5">
                          <GlassWater size={16} className="text-gold-400/80" />
                          <div>
                            <span className="text-xs text-white block">Copas de Cristal</span>
                            <span className="text-[11px] text-gold-400 font-medium">
                              +${copasPrice.toLocaleString("es-AR")} c/u
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-black/40 rounded-full border border-white/10 p-1">
                          <button
                            onClick={() => setCopasQty((q) => Math.max(0, q - 1))}
                            className="w-6 h-6 rounded-full text-slate-300 hover:text-white flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
                            aria-label="Restar copas"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-xs font-bold text-white min-w-[1ch] text-center">
                            {copasQty}
                          </span>
                          <button
                            onClick={() => setCopasQty((q) => q + 1)}
                            className="w-6 h-6 rounded-full text-slate-300 hover:text-white flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
                            aria-label="Sumar copas"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Dynamic Live Price & CTA */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 mt-6">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                  Total Estimado
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl text-gold-400 font-display italic font-semibold drop-shadow">
                    {basePrice === 0
                      ? "Gratis"
                      : `$${totalCalculated.toLocaleString("es-AR")}`}
                  </span>
                  {tempDiscount > 0 && (
                    <span className="text-sm line-through text-slate-500">
                      ${basePrice.toLocaleString("es-AR")}
                    </span>
                  )}
                </div>
              </div>

              {/* CTA Action */}
              {isSoldOut ? (
                <button
                  disabled
                  className="px-8 py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs bg-black/40 border border-white/10 text-slate-400 cursor-not-allowed"
                >
                  Cupo Agotado
                </button>
              ) : (
                <button
                  onClick={handleAction}
                  disabled={isProcessing}
                  className={cn(
                    "px-8 py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs",
                    "bg-burgundy-600 hover:bg-burgundy-500 text-white backdrop-blur-md",
                    "border border-burgundy-400/40",
                    "shadow-[0_0_35px_rgba(124,32,32,0.5)] hover:shadow-[0_0_50px_rgba(124,32,32,0.7)]",
                    "transition-all duration-300 active:scale-[0.98] cursor-pointer disabled:opacity-50",
                    "flex items-center gap-2.5"
                  )}
                >
                  {isProcessing ? (
                    <>
                      <span>Procesando</span>
                      <Loader2 size={16} className="animate-spin" />
                    </>
                  ) : (
                    <>
                      <span>
                        {isCaja
                          ? "Comprar Ahora"
                          : isSorteo
                          ? "Participar en Sorteo"
                          : "Reservar Lugar"}
                      </span>
                      <Plus size={16} />
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

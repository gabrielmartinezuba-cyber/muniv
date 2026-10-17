"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getBenefits, type Benefit } from "@/actions/benefits";
import { Skeleton } from "@/components/ui/Skeleton";
import { Sparkles, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BenefitList({
  filterType = "all",
}: {
  filterType?: "all" | "physical";
}) {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const allBenefits = await getBenefits();
      const activeBenefits = allBenefits.filter((b) => b.status === "ACTIVE");

      if (filterType === "physical") {
        setBenefits(
          activeBenefits.filter(
            (b) => !b.discount_percentage || b.discount_percentage === 0
          )
        );
      } else {
        setBenefits(activeBenefits);
      }

      setLoading(false);
    };

    init();
  }, [filterType]);

  // Premium Shimmer Loading State in Bento shapes
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
        <div className="md:col-span-2 h-[340px] rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 flex flex-col justify-between">
          <Skeleton variant="card" className="w-full h-44 rounded-2xl" />
          <Skeleton variant="text" lines={2} />
        </div>
        <div className="md:col-span-1 h-[340px] rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 flex flex-col justify-between">
          <Skeleton variant="card" className="w-full h-44 rounded-2xl" />
          <Skeleton variant="text" lines={2} />
        </div>
      </div>
    );
  }

  if (benefits.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
      {benefits.map((b, index) => {
        const hasDiscount = b.discount_percentage && b.discount_percentage > 0;
        const isFeatured = index === 0;

        return (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: index * 0.08 }}
            whileHover={{ y: -6 }}
            className={cn(
              "group relative rounded-3xl overflow-hidden border border-white/10",
              "bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-xl",
              "hover:border-gold-400/40 transition-all duration-500 ease-out",
              "flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
              isFeatured ? "md:col-span-2 min-h-[380px]" : "col-span-1 min-h-[360px]"
            )}
          >
            {/* Image Container with Organic Wax Seal */}
            <div
              className={cn(
                "relative w-full overflow-hidden",
                isFeatured ? "h-64 sm:h-72" : "h-52"
              )}
            >
              <Image
                src={b.image_url}
                alt={b.title}
                fill
                sizes={
                  isFeatured
                    ? "(max-width: 768px) 100vw, 66vw"
                    : "(max-width: 768px) 100vw, 33vw"
                }
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

              {/* Artisan Wax Seal or Exclusive Badge */}
              {hasDiscount ? (
                <div className="absolute top-4 left-4 z-20 transition-transform duration-500 group-hover:scale-110 pointer-events-none">
                  <div className="relative w-24 h-24 flex items-center justify-center filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)]">
                    {/* Organic Wax Base */}
                    <div
                      className={cn(
                        "absolute inset-0 rounded-[47%_53%_44%_56%/53%_47%_56%_44%]",
                        "bg-gradient-to-br from-[#7a1e23] via-[#541417] to-[#360b0d]",
                        "border-2 border-[#a33535]/50",
                        "shadow-[inset_-3px_-3px_8px_rgba(0,0,0,0.9),inset_3px_3px_8px_rgba(255,255,255,0.2)]"
                      )}
                    />

                    {/* Concentric Embossed Rings */}
                    <div className="absolute inset-2 border border-black/50 rounded-full" />
                    <div className="absolute inset-2.5 border border-amber-200/25 rounded-full" />

                    {/* Seal Gold Foil Content */}
                    <div className="relative z-10 flex flex-col items-center justify-center text-amber-200">
                      <Sparkles size={11} className="text-amber-300 opacity-80 mb-0.5" />
                      <span className="text-2xl font-display font-bold leading-none tracking-tight drop-shadow-[1px_2px_3px_rgba(0,0,0,0.9)]">
                        {b.discount_percentage}%
                      </span>
                      <span className="text-[9px] font-black tracking-[0.25em] mt-0.5 opacity-90 drop-shadow-[1px_1px_2px_rgba(0,0,0,0.8)]">
                        OFF
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute top-4 left-4 z-20">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-black/50 backdrop-blur-md border border-gold-400/30 text-gold-300 text-[10px] uppercase tracking-[0.2em] font-bold rounded-full shadow-lg">
                    <Award size={12} className="text-gold-300" />
                    <span>Beneficio Exclusivo</span>
                  </span>
                </div>
              )}
            </div>

            {/* Content Details */}
            <div className="p-6 md:p-7 flex flex-col flex-1 bg-black/20 justify-between">
              <div>
                <h3
                  className={cn(
                    "font-display text-white mb-2 group-hover:text-gold-300 transition-colors leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]",
                    isFeatured ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
                  )}
                >
                  {b.title}
                </h3>
                <p className="text-[#e8e0d5]/80 text-sm md:text-base font-light leading-relaxed line-clamp-3 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                  {b.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gold-400/90 font-medium tracking-wider uppercase mt-4">
                <span>Comunidad MUNIV</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300 text-gold-300">
                  Acceder →
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

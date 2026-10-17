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

  // Premium Shimmer Loading State
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-8">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="rounded-3xl glass-panel p-5 border border-white/5 space-y-4"
          >
            <Skeleton variant="card" className="w-full h-52 rounded-2xl" />
            <div className="space-y-2 pt-2">
              <Skeleton variant="text" lines={2} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (benefits.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-8">
      {benefits.map((b, index) => {
        const hasDiscount = b.discount_percentage && b.discount_percentage > 0;

        return (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: index * 0.08 }}
            whileHover={{ y: -6 }}
            className={cn(
              "group relative rounded-3xl overflow-hidden border border-white/5",
              "glass-panel hover:border-gold-500/30 transition-all duration-500 ease-out",
              "h-full flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            )}
          >
            {/* Image Container with Organic Wax Seal */}
            <div className="relative h-56 w-full overflow-hidden bg-iron-950">
              <Image
                src={b.image_url}
                alt={b.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-transparent to-black/20 pointer-events-none" />

              {/* Artisan Wax Seal or Exclusive Badge */}
              {hasDiscount ? (
                <div className="absolute top-4 left-4 z-20 transition-transform duration-500 group-hover:scale-110 pointer-events-none">
                  <div className="relative w-24 h-24 flex items-center justify-center filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]">
                    {/* Organic Wax Base with realistic texture and bevel */}
                    <div
                      className={cn(
                        "absolute inset-0 rounded-[47%_53%_44%_56%/53%_47%_56%_44%]",
                        "bg-gradient-to-br from-[#721c21] via-[#521316] to-[#360b0d]",
                        "border-2 border-[#8f2828]/40",
                        "shadow-[inset_-3px_-3px_8px_rgba(0,0,0,0.8),inset_3px_3px_8px_rgba(255,255,255,0.15)]"
                      )}
                    />

                    {/* Concentric Embossed Rings */}
                    <div className="absolute inset-2 border border-black/40 rounded-full" />
                    <div className="absolute inset-2.5 border border-amber-200/20 rounded-full" />

                    {/* Seal Gold Foil Content */}
                    <div className="relative z-10 flex flex-col items-center justify-center text-amber-200">
                      <Sparkles size={11} className="text-amber-300 opacity-70 mb-0.5" />
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
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-black/60 backdrop-blur-md border border-gold-500/30 text-gold-400 text-[10px] uppercase tracking-[0.18em] font-bold rounded-full shadow-lg">
                    <Award size={12} className="text-gold-400" />
                    <span>Beneficio Exclusivo</span>
                  </span>
                </div>
              )}
            </div>

            {/* Content Details */}
            <div className="p-6 md:p-7 flex flex-col flex-1 bg-gradient-to-b from-transparent to-[#141210]/60">
              <h3 className="font-display text-2xl text-white mb-2.5 group-hover:text-gold-300 transition-colors leading-tight">
                {b.title}
              </h3>
              <p className="text-slate-300/80 text-sm font-light leading-relaxed line-clamp-3">
                {b.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

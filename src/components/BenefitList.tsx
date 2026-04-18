"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getBenefits, type Benefit } from "@/actions/benefits";
import { Loader2 } from "lucide-react";

export default function BenefitList({ filterType = "all" }: { filterType?: "all" | "physical" }) {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const allBenefits = await getBenefits();
      const activeBenefits = allBenefits.filter(b => b.status === 'ACTIVE');
      
      if (filterType === "physical") {
        setBenefits(activeBenefits.filter(b => !b.discount_percentage || b.discount_percentage === 0));
      } else {
        setBenefits(activeBenefits);
      }
      
      setLoading(false);
    };

    init();
  }, [filterType]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
      </div>
    );
  }

  if (benefits.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {benefits.map((b, index) => {
        const hasDiscount = b.discount_percentage && b.discount_percentage > 0;

        return (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative glass-panel rounded-3xl overflow-hidden border hover:border-gold-500/20 transition-all duration-500 h-full flex flex-col"
          >
            {/* Image Container */}
            <div className="relative h-52 w-full overflow-hidden">
              <Image
                src={b.image_url}
                alt={b.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              
              {hasDiscount ? (
                <div className="absolute top-4 left-4 z-20 transition-transform group-hover:scale-110 duration-500 pointer-events-none">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    {/* Wax Seal Base (Organic shape) */}
                    <div className="absolute inset-0 bg-[#54161a] rounded-[48%_52%_45%_55%/52%_48%_55%_45%] shadow-[inset_-4px_-4px_10px_rgba(0,0,0,0.6),inset_4px_4px_10px_rgba(255,255,255,0.05),6px_10px_20px_rgba(0,0,0,0.7)] border-2 border-[#421014]" />
                    
                    {/* Inner Decorative Rings */}
                    <div className="absolute inset-2 border border-black/30 rounded-full" />
                    <div className="absolute inset-2.5 border border-white/5 rounded-full" />

                    {/* Seal Content */}
                    <div className="relative z-10 flex flex-col items-center justify-center text-[#c29d5b]">
                      {/* Top Ornament */}
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 opacity-40 mb-1">
                        <path d="M12 2c0 0-2 4-6 4-2 0-4 2-4 4 0 3 3 5 5 5 0 0 0 2 1 4 1 2 4 3 4 3s3-1 4-3c1-2 1-4 1-4 2 0 5-2 5-5 0-2-2-4-4-4-4 0-6-4-6-4z" />
                      </svg>
                      
                      <span className="text-2xl font-display font-bold leading-none drop-shadow-[1px_2px_2px_rgba(0,0,0,0.8)]">
                        {b.discount_percentage}%
                      </span>
                      <span className="text-[9px] font-black tracking-[0.2em] mt-0.5 drop-shadow-[1px_1px_1px_rgba(0,0,0,0.5)] opacity-80">
                        OFF
                      </span>

                      {/* Bottom Ornament */}
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 opacity-40 mt-1 rotate-180">
                        <path d="M12 2c0 0-2 4-6 4-2 0-4 2-4 4 0 3 3 5 5 5 0 0 0 2 1 4 1 2 4 3 4 3s3-1 4-3c1-2 1-4 1-4 2 0 5-2 5-5 0-2-2-4-4-4-4 0-6-4-6-4z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <span className="absolute top-4 left-4 px-3 py-1 bg-slate-950/80 backdrop-blur-md border border-white/10 text-white text-[10px] uppercase tracking-widest font-bold rounded-full">
                  Beneficio Exclusivo
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1 bg-slate-900/40">
              <h3 className="font-display text-2xl text-white mb-2 group-hover:text-gold-400 transition-colors">
                {b.title}
              </h3>
              <p className="text-slate-400 text-sm font-light leading-relaxed">
                {b.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

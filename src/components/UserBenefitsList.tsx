"use client";

import { useEffect, useState } from "react";
import { getUserBenefits, type Benefit } from "@/actions/benefits";
import { Loader2, Gift, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function UserBenefitsList({ 
  email, 
  initialBenefits = [] 
}: { 
  email?: string; 
  initialBenefits?: Benefit[] 
}) {
  const [benefits, setBenefits] = useState<Benefit[]>(initialBenefits);
  const [loading, setLoading] = useState(initialBenefits.length === 0 && !!email);

  useEffect(() => {
    if (initialBenefits.length > 0) return;
    if (!email) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getUserBenefits(email).then(data => {
      setBenefits(data);
      setLoading(false);
    });
  }, [email, initialBenefits]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-6 h-6 text-gold-500 animate-spin" />
      </div>
    );
  }

  if (benefits.length === 0) {
    return (
      <div className="border border-dashed border-white/10 rounded-2xl p-8 text-center bg-black/10">
        <Gift size={32} className="text-slate-700 mb-3 mx-auto" />
        <p className="text-slate-500 text-sm italic">Aún no has canjeado ningún beneficio.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {benefits.map((b) => (
        <div key={b.id} className="relative group overflow-hidden rounded-2xl border border-white/5 bg-slate-950/40 p-3 transition-all hover:bg-slate-900/60 flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden shadow-lg border border-white/5">
            <Image 
              src={b.image_url} 
              alt={b.title} 
              fill 
              className="object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-medium text-sm truncate pr-4">
              {b.title}
            </h4>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter mt-1">
              CANJEADO
            </p>
          </div>
          
          <ChevronRight size={16} className="text-slate-700 group-hover:text-gold-500 group-hover:translate-x-1 transition-all" />
        </div>
      ))}
    </div>
  );
}

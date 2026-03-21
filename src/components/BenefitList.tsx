"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getBenefits, redeemBenefit, getUserBenefits, type Benefit } from "@/actions/benefits";
import { Loader2, Gift, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function BenefitList({ initialRedeemedIds = [] }: { initialRedeemedIds?: string[] }) {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [userBenefits, setUserBenefits] = useState<string[]>(initialRedeemedIds);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      const allBenefits = await getBenefits();
      setBenefits(allBenefits);

      // If we didn't get props, fetch them here (fallback)
      if (currentUser?.email && initialRedeemedIds.length === 0) {
        const redeemed = await getUserBenefits(currentUser.email);
        setUserBenefits(redeemed.map(b => b.id));
      }
      
      setLoading(false);
    };

    init();
  }, [initialRedeemedIds]);

  const handleRedeem = async (benefit: Benefit) => {
    if (!user) {
      router.push("/login");
      return;
    }

    setRedeemingId(benefit.id);
    const res = await redeemBenefit(benefit.id);
    setRedeemingId(null);

    if (res.success) {
      toast.success("¡Beneficio canjeado con éxito! Revisá tu correo para las instrucciones.");
      setUserBenefits(prev => [...prev, benefit.id]);
    } else {
      toast.error(res.error || "Error al canjear");
    }
  };

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
        const isRedeemed = userBenefits.includes(b.id);
        
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
              
              <span className="absolute top-4 left-4 px-3 py-1 bg-burgundy-900 border border-burgundy-500/30 text-white text-[10px] uppercase tracking-widest font-bold rounded-full">
                Exclusivo Miembros
              </span>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
              <h3 className="font-display text-2xl text-white mb-2 group-hover:text-gold-400 transition-colors">
                {b.title}
              </h3>
              <p className="text-slate-400 text-sm mb-6 font-light line-clamp-3">
                {b.description}
              </p>

              <div className="mt-auto">
                {!user ? (
                   <button
                    onClick={() => router.push("/login")}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-slate-800 text-gold-500 rounded-xl font-bold text-sm hover:bg-slate-700 transition-all border border-white/5"
                  >
                    Registrarse para canjear
                  </button>
                ) : isRedeemed ? (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gold-500/10 text-gold-500/50 rounded-xl font-bold text-sm border border-gold-500/20 cursor-default"
                  >
                    CANJEADO <Check size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleRedeem(b)}
                    disabled={redeemingId === b.id}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-burgundy-600 text-white rounded-xl font-bold text-sm hover:bg-burgundy-500 transition-all active:scale-95 shadow-[0_0_20px_rgba(108,26,26,0.3)] disabled:opacity-50"
                  >
                    {redeemingId === b.id ? <Loader2 size={16} className="animate-spin" /> : <><Gift size={16} /> Canjear</>}
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

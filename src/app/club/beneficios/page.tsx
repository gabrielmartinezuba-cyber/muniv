import { createClient } from "@/utils/supabase/server";
import { Gift } from "lucide-react";
import UserBenefitsList from "@/components/UserBenefitsList";
import { redirect } from "next/navigation";
import { getUserBenefits } from "@/actions/benefits";

export default async function ClubBenefitsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Task 3: Obtené el usuario actual -> Consultá la tabla user_benefits filtrando por su email. 
  // Extraé los IDs y hacé una segunda consulta a benefits usando .in('id', arrayDeIds).
  // (All this logic is now encapsulated in getUserBenefits following the requested two-step process)
  const benefits = await getUserBenefits(user.email!);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700">
      <header className="mb-12">
        <h1 className="font-display text-4xl md:text-5xl text-white tracking-wide">
          Mis <span className="italic text-gold-500">Beneficios</span>
        </h1>
        <p className="text-slate-400 mt-4 text-lg max-w-xl font-light">
          Aquí encontrarás todos los beneficios y recompensas que has canjeado en MUNIV.
        </p>
      </header>

      <div className="max-w-4xl">
        <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-slate-900/40 relative overflow-hidden group hover:border-white/10 transition-colors flex flex-col shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-8">
             <div className="w-10 h-10 rounded-full bg-gold-500/10 text-gold-500 flex items-center justify-center border border-gold-500/30">
               <Gift size={20} />
             </div>
             <h2 className="font-display text-2xl text-white tracking-tight">Recompensas Canjeadas</h2>
          </div>

          <UserBenefitsList initialBenefits={benefits} />
        </div>
      </div>
    </div>
  );
}

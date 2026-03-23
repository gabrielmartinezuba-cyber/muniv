import { createClient } from "@/utils/supabase/server";
import { Gift } from "lucide-react";
import BenefitList from "@/components/BenefitList";
import { redirect } from "next/navigation";

export default async function ClubBenefitsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700">
      <header className="mb-12 border-b border-white/5 pb-8">
        <h1 className="font-display text-4xl md:text-5xl text-white tracking-wide">
          Mis <span className="italic text-gold-500">Beneficios Físicos</span>
        </h1>
        <p className="text-slate-400 mt-4 text-base max-w-xl font-light">
          <strong className="text-white">Mostrá esta pantalla en el local adherido para usar tu beneficio.</strong> Los descuentos de Tienda se aplican automáticamente en tu Carrito de Compras.
        </p>
      </header>

      <div className="w-full">
        <div className="relative">
          <div className="flex items-center gap-3 mb-8">
             <div className="w-10 h-10 rounded-full bg-gold-500/10 text-gold-500 flex items-center justify-center border border-gold-500/30">
               <Gift size={20} />
             </div>
             <h2 className="font-display text-2xl text-white tracking-tight">Tus Beneficios Presentables</h2>
          </div>

          <BenefitList filterType="physical" />
        </div>
      </div>
    </div>
  );
}

import BenefitManager from "@/app/admin/BenefitManager";
import { Gift } from "lucide-react";

export default function AdminBenefitsPage() {
  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-gold-500/10 border border-gold-500/30 rounded-2xl flex items-center justify-center text-gold-500">
           <Gift size={24} />
        </div>
        <div>
          <h1 className="font-display text-4xl text-white">Beneficios</h1>
          <p className="text-slate-400">Gestioná los beneficios exclusivos para miembros del club.</p>
        </div>
      </div>

      <BenefitManager />
    </div>
  );
}

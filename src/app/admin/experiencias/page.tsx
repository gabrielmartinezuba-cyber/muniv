import ExperienceManager from "../ExperienceManager";
import { Package } from "lucide-react";

export default function AdminExperiencesPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl text-white font-medium flex items-center gap-3">
            <Package size={24} className="text-gold-500" /> Gestión de Catálogo
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Crear, modificar y gestionar las experiencias ofrecidas por MUNIV.
          </p>
        </div>
      </div>

      <ExperienceManager />
    </div>
  );
}


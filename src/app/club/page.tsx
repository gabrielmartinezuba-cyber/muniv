import { createClient } from "@/utils/supabase/server";
import { PlusCircle, Compass, History } from "lucide-react";
import Link from "next/link";

export default async function ClubDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Extraemos nombre del metadata si está disponible
  const firstName = user?.user_metadata?.first_name || "Miembro";

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700">
      
      <header className="mb-12">
        <h1 className="font-display text-4xl md:text-5xl text-white tracking-wide">
          Bienvenido al <span className="italic text-gold-500">Club,</span><br className="hidden md:block"/> {firstName}.
        </h1>
        <p className="text-slate-400 mt-4 text-lg max-w-xl font-light">
          Desde tu panel podés gestionar tus experiencias adquiridas y acceder a nuestro catálogo privado.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Widget: Mis Reservas (Empty State) */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-slate-900/40 relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-700/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-8">
             <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/30">
               <History size={20} />
             </div>
             <h2 className="font-display text-2xl text-white">Próximas Reservas</h2>
          </div>

          <div className="border border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-black/20">
            <Compass size={40} className="text-slate-600 mb-4" />
            <h3 className="text-lg text-white font-medium mb-2">Aún no tenés experiencias</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">
              Tu agenda está vacía. Empezá a diseñar momentos únicos explorando nuestro catálogo.
            </p>
            <Link 
              href="/"
              className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm font-medium hover:bg-gold-500 hover:text-slate-900 hover:border-gold-500 transition-all flex items-center gap-2"
            >
              <PlusCircle size={16} /> Ver Catálogo
            </Link>
          </div>
        </div>

        {/* Widget: Beneficios (Empty State) */}
        <div className="glass-panel p-8 rounded-3xl border border-gold-500/20 bg-slate-900/40 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
             <h2 className="font-display text-2xl text-gold-500 flex items-center gap-3">
               Beneficios Exclusivos <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest bg-gold-500 text-slate-900 rounded-sm">V.I.P</span>
             </h2>
          </div>
          
          <p className="text-slate-400 text-md mb-8 relative z-10 border-b border-white/5 pb-8">
            Como miembro de nuestra comunidad, tenés acceso prioritario a ventas anticipadas y asesoría directa de nuestro Sommelier Jefe.
          </p>

          <div className="mt-auto relative z-10 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="text-white font-medium text-sm">Consultoría One-to-One</span>
              <span className="text-gold-500 text-sm font-semibold">Desbloqueado</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 opacity-50">
              <span className="text-slate-300 font-medium text-sm">Suscripción de Cajas Mensuales</span>
              <span className="text-slate-500 text-sm font-semibold">Próximamente</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

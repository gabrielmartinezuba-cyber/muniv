"use client";

import { motion } from "framer-motion";
import { Building2, Package, CircleDollarSign, Send, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useState, useTransition } from "react";
import Link from "next/link";
import { submitGifting } from "@/actions/booking";

export default function CorporateGifting() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    volume: "10-50",
    budget: "500k-1M",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    startTransition(async () => {
      const res = await submitGifting(formData);
      if (res.success) {
        setSubmitted(true);
      } else {
        setGlobalError(res.message);
      }
    });
  };

  return (
    <main className="min-h-screen bg-[#0c0a09] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Background for B2B */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 -left-1/4 w-[80wv] h-[80wv] bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-[80wv] h-[80wv] bg-rose-700/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 z-10 relative">
        {/* Left Col: Info */}
        <div className="flex flex-col justify-center">
          <Link href="/" className="text-gold-500 hover:text-white flex items-center gap-2 mb-8 transition-colors text-sm tracking-widest uppercase font-semibold">
             &larr; Volver al Club
          </Link>
          <span className="text-rose-500 font-semibold tracking-[0.2em] uppercase text-sm mb-4 block">
            Muniv B2B
          </span>
          <h1 className="font-display text-5xl md:text-6xl text-white mb-6 leading-tight">
            Corporate <span className="italic text-gold-500">Gifting</span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-lg">
            Elevamos tus regalos corporativos. Curamos estuches de altísima gama y diseñamos catas privadas para directorios, fidelización de clientes C-Level o eventos de fin de año.
          </p>

          <div className="space-y-6">
            {[
              "Personalización con la identidad de tu empresa.",
              "Envíos blindados a todo el país.",
              "Sommelier asignado para asesoramiento corporativo."
            ].map((text, i) => (
              <div key={i} className="flex flex-row items-center gap-4">
                <div className="w-8 h-8 rounded-full border border-gold-500/30 flex items-center justify-center text-gold-500 bg-gold-500/10">
                  <CheckIcon />
                </div>
                <p className="text-white text-sm md:text-base">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Form */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 md:p-10 rounded-3xl"
        >
          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-center py-10">
              <div className="w-20 h-20 bg-gold-500/20 text-gold-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                 <Send size={32} />
              </div>
              <h3 className="font-display text-3xl text-white mb-4">Propuesta Solicitada</h3>
              <p className="text-slate-300">
                Nuestro equipo B2B está analizando tu caso. Nos contactaremos con {formData.contactName || "vos"} en menos de 24hs con un presupuesto a medida.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-white text-sm font-medium mb-2 flex items-center gap-2">
                    <Building2 size={16} className="text-gold-500" /> Empresa
                  </label>
                  <input required placeholder="Ej. Globant" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all font-sans" />
                </div>
                <div>
                  <label className="text-white text-sm font-medium mb-2 flex items-center gap-2">Nombre y Apellido</label>
                  <input required placeholder="Tu nombre" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all font-sans" />
                </div>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 flex items-center gap-2">Email Corporativo</label>
                <input required type="email" placeholder="nombre@empresa.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all font-sans" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-white text-sm font-medium mb-2 flex items-center gap-2">
                    <Package size={16} className="text-gold-500" /> Volumen (Cajas)
                  </label>
                  <select value={formData.volume} onChange={e => setFormData({...formData, volume: e.target.value})} className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all font-sans appearance-none">
                    <option value="10-50">10 a 50 Cajas</option>
                    <option value="50-100">50 a 100 Cajas</option>
                    <option value="100+">Más de 100 Cajas</option>
                  </select>
                </div>
                <div>
                  <label className="text-white text-sm font-medium mb-2 flex items-center gap-2">
                    <CircleDollarSign size={16} className="text-gold-500" /> Presupuesto Est.
                  </label>
                  <select value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all font-sans appearance-none">
                    <option value="<500k">Menos de $500.000 ARS</option>
                    <option value="500k-1M">$500k - $1M ARS</option>
                    <option value=">1M">Más de $1M ARS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 flex items-center gap-2">Mensaje Adicional</label>
                <textarea rows={3} placeholder="Detalles de la ocasión o requerimientos específicos..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all font-sans resize-none" />
              </div>

              {globalError && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 border border-rose-700/50 bg-rose-950/50 rounded-xl flex items-center gap-3 text-rose-300 text-sm">
                   <AlertCircle size={16} className="text-rose-500 shrink-0" />
                   <p>{globalError}</p>
                </motion.div>
              )}

              <button disabled={isPending} type="submit" className="glass-panel-glow bg-gold-500 text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gold-400 transition-all group mt-2 disabled:opacity-70 disabled:cursor-not-allowed">
                {isPending ? (
                  <>Procesando Solicitud <Loader2 size={18} className="animate-spin" /></>
                ) : (
                  <>Solicitar Cotización <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </main>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
  );
}


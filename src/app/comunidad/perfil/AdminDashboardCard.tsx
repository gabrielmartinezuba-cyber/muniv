"use client";

import { useState, useEffect } from "react";
import { checkIsAdmin, addAdmin } from "@/actions/admin";
import { ShieldAlert, UserPlus, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AdminDashboardCard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      const status = await checkIsAdmin();
      setIsAdmin(status);
      setIsChecking(false);
    };
    verifyAdmin();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("email", email);

    const { success, error } = await addAdmin(formData);
    setIsSubmitting(false);

    if (success) {
      toast.success(`Rol de administrador otorgado a ${email}`);
      setEmail("");
    } else {
      toast.error(error || "Error al asignar administrador");
    }
  };

  if (isChecking || !isAdmin) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-panel p-8 rounded-3xl border border-gold-500/20 bg-slate-900/40 relative overflow-hidden group shadow-[0_0_30px_rgba(212,175,55,0.05)] mt-8"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
      
      <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-8 relative z-10">
        <div className="w-16 h-16 rounded-full bg-slate-950 text-gold-500 flex items-center justify-center border border-gold-500/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
          <ShieldAlert size={32} />
        </div>
        <div>
          <h2 className="font-display text-2xl text-gold-400">Gestión de Administradores</h2>
          <p className="text-slate-400 text-sm">Privilegios RBAC Dinámicos (Solo Super Admins).</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-6">
        <div className="group">
          <label className="text-white/60 text-xs font-medium mb-2 ml-1 flex items-center gap-1.5 uppercase tracking-wider">
            Delegar Acceso (Mail Registrado)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-gold-500 transition-colors">
              <UserPlus size={18} />
            </div>
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresar correo electrónico"
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-11 pr-4 py-4 text-white text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all font-sans placeholder:text-slate-600"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2 px-2">
            El usuario debe haberse registrado previamente en MUNIV para ser elevado a administrador.
          </p>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting || !email}
            className="glass-panel-glow bg-burgundy-600 text-white font-bold py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 hover:bg-burgundy-500 transition-all group disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            {isSubmitting ? (
              <>Autorizando <Loader2 size={18} className="animate-spin" /></>
            ) : (
              <>Agregar Admin <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}



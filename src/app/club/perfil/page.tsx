"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, Lock, AlertCircle, CheckCircle2, UserCircle, Mail, User } from "lucide-react";
import { UpdatePasswordSchema } from "@/schemas/auth";
import type { z } from "zod";
import { updateUserPassword, updateUserData } from "@/actions/auth";
import { createClient } from "@/utils/supabase/client";
import AdminDashboardCard from "./AdminDashboardCard";

type UpdateFormData = z.infer<typeof UpdatePasswordSchema>;

export default function ProfilePage() {
  const [isPending, startTransition] = useTransition();
  const [isDataPending, startDataTransition] = useTransition();
  const [serverState, setServerState] = useState<{ success: boolean; message: string } | null>(null);
  const [dataServerState, setDataServerState] = useState<{ success: boolean; message: string } | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [initialData, setInitialData] = useState({ nombre: "", apellido: "" });

  const {
    register: registerPass,
    handleSubmit: handleSubmitPass,
    reset: resetPass,
    formState: { errors: errorsPass },
  } = useForm<UpdateFormData>({
    resolver: zodResolver(UpdatePasswordSchema),
    mode: "onBlur",
  });

  const {
    register: registerData,
    handleSubmit: handleSubmitData,
    setValue: setDataValue,
  } = useForm({
    defaultValues: { nombre: "", apellido: "" }
  });

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        const nombre = user.user_metadata?.first_name || "";
        const apellido = user.user_metadata?.last_name || "";
        setInitialData({ nombre, apellido });
        setDataValue("nombre", nombre);
        setDataValue("apellido", apellido);
      }
    };
    fetchUser();
  }, [setDataValue]);

  const onPasswordSubmit = (data: UpdateFormData) => {
    setServerState(null);
    startTransition(async () => {
      const result = await updateUserPassword(data);
      setServerState(result);
      if (result.success) resetPass();
    });
  };

  const onDataSubmit = (data: { nombre: string; apellido: string }) => {
    setDataServerState(null);
    startDataTransition(async () => {
      const result = await updateUserData(data);
      setDataServerState(result);
    });
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700 max-w-2xl gap-8 pb-12">
      <header className="mb-4">
        <h1 className="font-display text-4xl text-white tracking-wide">
          Mi <span className="italic text-gold-500">Configuración</span>
        </h1>
        <p className="text-slate-400 mt-3 text-lg font-light">
          Gestioná tus datos personales y credenciales de acceso.
        </p>
      </header>

      {/* Card: Datos Personales */}
      <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-slate-900/40 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-8 relative z-10">
          <div className="w-16 h-16 rounded-full bg-slate-800 text-gold-500 flex items-center justify-center border border-gold-500/10 shadow-[inner_0_0_10px_rgba(212,175,55,0.1)]">
            <UserCircle size={32} />
          </div>
          <div>
            <h2 className="font-display text-2xl text-white">Datos Personales</h2>
            <p className="text-slate-400 text-sm">Información básica de tu perfil de socio.</p>
          </div>
        </div>

        <form onSubmit={handleSubmitData(onDataSubmit)} className="relative z-10 flex flex-col gap-6">
          <div className="group">
            <label className="text-white/60 text-xs font-medium mb-2 ml-1 flex items-center gap-1.5 uppercase tracking-wider">
              Email (No editable)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-600">
                <Mail size={18} />
              </div>
              <input 
                type="email"
                value={userEmail}
                readOnly
                className="w-full bg-slate-950/50 border border-white/5 rounded-xl pl-11 pr-4 py-4 text-slate-500 text-sm cursor-not-allowed font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="text-white/60 text-xs font-medium mb-2 ml-1 flex items-center gap-1.5 uppercase tracking-wider">
                Nombre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-gold-500 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  {...registerData("nombre")}
                  placeholder="Tu nombre"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-11 pr-4 py-4 text-white text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all font-sans"
                />
              </div>
            </div>
            <div className="group">
              <label className="text-white/60 text-xs font-medium mb-2 ml-1 flex items-center gap-1.5 uppercase tracking-wider">
                Apellido
              </label>
              <div className="relative">
                <input 
                  {...registerData("apellido")}
                  placeholder="Tu apellido"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all font-sans"
                />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {dataServerState && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }}
                className={`px-4 py-3 border rounded-xl flex items-center gap-3 text-sm ${dataServerState.success ? 'border-green-500/20 bg-green-500/5 text-green-300' : 'border-rose-700/50 bg-rose-950/50 text-rose-300'}`}
              >
                 {dataServerState.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                 <p>{dataServerState.message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              disabled={isDataPending}
              className="glass-panel-glow bg-burgundy-600 text-white font-bold py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 hover:bg-burgundy-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isDataPending ? <Loader2 size={18} className="animate-spin" /> : <>Guardar Cambios <ArrowRight size={18} /></>}
            </button>
          </div>
        </form>
      </div>

      {/* Card: Seguridad (Cambio de Clave) */}
      <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-slate-900/40 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-8 relative z-10">
          <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center border border-white/10">
            <Lock size={32} />
          </div>
          <div>
            <h2 className="font-display text-2xl text-white">Seguridad</h2>
            <p className="text-slate-400 text-sm">Actualizá tu contraseña para mantener tu cuenta protegida.</p>
          </div>
        </div>

        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {serverState?.success ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-6 border border-green-500/20 bg-green-500/5 rounded-2xl"
              >
                <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-lg text-white mb-2 font-medium">Contraseña Actualizada</h3>
                <button 
                  onClick={() => setServerState(null)}
                  className="mt-2 text-sm text-gold-500 hover:text-white transition-colors"
                >
                  Cambiar de nuevo
                </button>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                onSubmit={handleSubmitPass(onPasswordSubmit)} 
                className="flex flex-col gap-6"
              >
                <div className="group">
                  <label className="text-white/60 text-xs font-medium mb-2 ml-1 flex items-center gap-1.5 uppercase tracking-wider">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-gold-500 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input 
                      type="password"
                      {...registerPass("password")}
                      placeholder="Ingrese nueva credencial"
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-11 pr-4 py-4 text-white text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all font-sans placeholder:text-slate-600"
                    />
                  </div>
                  {errorsPass.password && <span className="text-rose-500 text-xs mt-2 block px-2">{errorsPass.password.message}</span>}
                </div>

                <AnimatePresence>
                  {serverState?.success === false && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4 py-3 border border-rose-700/50 bg-rose-950/50 rounded-xl flex items-center gap-3 text-rose-300 text-sm overflow-hidden"
                    >
                       <AlertCircle size={18} className="text-rose-500 shrink-0" />
                       <p>{serverState.message}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-end pt-4">
                  <button 
                    type="submit" 
                    disabled={isPending}
                    className="glass-panel-glow bg-burgundy-600 text-white font-bold py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 hover:bg-burgundy-500 transition-all group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <>Guardando <Loader2 size={18} className="animate-spin" /></>
                    ) : (
                      <>Actualizar <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AdminDashboardCard />
    </div>
  );
}



"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, Calendar, Mail, Lock, User, AlertCircle, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SignUpSchema, type SignUpFormData } from "@/schemas/auth";
import { signUp } from "@/actions/auth";

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition();
  const [serverState, setServerState] = useState<{ success: boolean; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(SignUpSchema),
    mode: "onBlur", // Reactive validation
  });

  const onSubmit = (data: SignUpFormData) => {
    setServerState(null);
    startTransition(async () => {
      const result = await signUp(data);
      setServerState(result);
    });
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] relative flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Background Abstract Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 -right-1/4 w-[100wv] h-[100wv] bg-gold-500/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[100wv] h-[100wv] bg-rose-700/10 rounded-full blur-[120px]" />
      </div>

      {/* Auth Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="MUNIV Logo"
              width={200}
              height={66}
              className="w-auto h-20 mb-6 object-contain drop-shadow-2xl"
              priority
            />
          </Link>
          <h1 className="font-display text-3xl text-white tracking-wide">
            Asociate al <span className="italic text-gold-500">Club</span>
          </h1>
          <p className="text-slate-400 text-sm mt-3 font-light">
            Experiencias de élite, catas privadas y acceso restringido.
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <AnimatePresence mode="wait">
            {serverState?.success ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-8"
              >
                <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="font-display text-2xl text-white mb-3">Verifica tu Mail</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  {serverState.message}
                </p>
                <Link 
                  href="/login"
                  className="w-full glass-panel-glow bg-gold-500/10 border border-gold-500 text-gold-200 py-3 rounded-xl font-medium flex items-center justify-center hover:bg-gold-500 hover:text-slate-900 transition-all"
                >
                  Ir al Login
                </Link>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit(onSubmit)} 
                className="flex flex-col gap-5"
              >
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-gold-500 transition-colors">
                        <User size={16} />
                      </div>
                      <input 
                        {...register("firstName")}
                        placeholder="Nombre"
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all font-sans placeholder:text-slate-600"
                      />
                    </div>
                    {errors.firstName && <span className="text-rose-500 text-xs mt-1 block px-2">{errors.firstName.message}</span>}
                  </div>
                  <div className="group">
                    <div className="relative">
                      <input 
                        {...register("lastName")}
                        placeholder="Apellido"
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all font-sans placeholder:text-slate-600"
                      />
                    </div>
                    {errors.lastName && <span className="text-rose-500 text-xs mt-1 block px-2">{errors.lastName.message}</span>}
                  </div>
                </div>

                {/* Date of Birth Field -> strict age validation */}
                <div className="group">
                  <label className="text-white/60 text-xs font-medium mb-1.5 ml-1 flex items-center gap-1.5 uppercase tracking-wider">
                    <Calendar size={12} /> Fecha de Nacimiento
                  </label>
                  <div className="relative">
                    <input 
                      type="date"
                      {...register("dob")}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all font-sans appearance-none min-h-[46px]"
                    />
                  </div>
                  {errors.dob && (
                    <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-rose-500 font-medium text-xs mt-1.5 flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">
                      <AlertCircle size={14} /> {errors.dob.message}
                    </motion.span>
                  )}
                </div>

                {/* Email Field */}
                <div className="group mt-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-gold-500 transition-colors">
                      <Mail size={16} />
                    </div>
                    <input 
                      type="email"
                      {...register("email")}
                      placeholder="Email corporativo o personal"
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all font-sans placeholder:text-slate-600"
                    />
                  </div>
                  {errors.email && <span className="text-rose-500 text-xs mt-1 block px-2">{errors.email.message}</span>}
                </div>

                {/* Password Field */}
                <div className="group">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-gold-500 transition-colors">
                      <Lock size={16} />
                    </div>
                    <input 
                      type="password"
                      {...register("password")}
                      placeholder="Contraseña segura"
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all font-sans placeholder:text-slate-600"
                    />
                  </div>
                  {errors.password && <span className="text-rose-500 text-xs mt-1 block px-2">{errors.password.message}</span>}
                </div>

                {/* Server Error Global */}
                {serverState?.success === false && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 border border-rose-700/50 bg-rose-950/50 rounded-xl flex items-center gap-3 text-rose-300 text-xs">
                     <AlertCircle size={16} className="text-rose-500 shrink-0" />
                     <p>{serverState.message}</p>
                  </motion.div>
                )}

                <button 
                  type="submit" 
                  disabled={isPending}
                  className="mt-4 glass-panel-glow bg-gold-500 text-slate-900 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gold-400 transition-all group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>Creando Membresía <Loader2 size={18} className="animate-spin" /></>
                  ) : (
                    <>Solicitar Membresía <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">
            ¿Ya sos miembro?{" "}
            <Link href="/login" className="text-gold-500 hover:text-white transition-colors font-medium">
              Iniciá sesión acá
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, Mail, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoginSchema } from "@/schemas/auth";
import type { z } from "zod";
import { signIn } from "@/actions/auth";

type LoginFormData = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [serverState, setServerState] = useState<{ success: boolean; message: string } | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    mode: "onBlur",
  });

  const onSubmit = (data: LoginFormData) => {
    setServerState(null);
    startTransition(async () => {
      const result = await signIn(data);
      if (result.success) {
        // Redirigimos al Dashboard del Club
        router.push("/club");
        router.refresh();
      } else {
        setServerState(result);
      }
    });
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] relative flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Background Abstract Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 -left-1/4 w-[100wv] h-[100wv] bg-gold-500/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[100wv] h-[100wv] bg-rose-700/10 rounded-full blur-[120px]" />
      </div>

      {/* Auth Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-8 relative z-10 pt-20 md:pt-28">
          <h1 className="font-display text-4xl text-white tracking-wide text-center">
            Bienvenido al <span className="italic text-gold-500">Club</span>
          </h1>
          <p className="text-slate-400 text-sm mt-3 font-light text-center">
            Ingresá tus credenciales para acceder a tus reservas.
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            
            {/* Email Field */}
            <div className="group">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-gold-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email"
                  {...register("email")}
                  placeholder="Email"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-11 pr-4 py-4 text-white text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all font-sans placeholder:text-slate-600"
                />
              </div>
              {errors.email && <span className="text-rose-500 text-xs mt-1 block px-2">{errors.email.message}</span>}
            </div>

            {/* Password Field */}
            <div className="group">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-gold-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password"
                  {...register("password")}
                  placeholder="Contraseña"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-11 pr-4 py-4 text-white text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all font-sans placeholder:text-slate-600"
                />
              </div>
              {errors.password && <span className="text-rose-500 text-xs mt-1 block px-2">{errors.password.message}</span>}
            </div>

            {/* Server Error Global */}
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

            <button 
              type="submit" 
              disabled={isPending}
              className="mt-2 glass-panel-glow bg-gold-500 text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gold-400 transition-all group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>Verificando <Loader2 size={18} className="animate-spin" /></>
              ) : (
                <>Iniciar Sesión <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
            <div className="flex justify-center -mt-2">
              <Link href="/recuperar-password" className="text-slate-400 text-sm hover:text-gold-500 transition-colors font-medium">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">
            ¿Aún no te asociaste?{" "}
            <Link href="/registro" className="text-gold-500 hover:text-white transition-colors font-medium">
              Creá tu cuenta
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}

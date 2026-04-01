"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Clock, Loader2, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { checkPaymentStatus } from "@/actions/payments";

function FeedbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);
  
  const status = searchParams.get("status"); // approved, rejected, pending
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    // Si hay un payment_id en la URL, intentamos conciliar de inmediato
    const paymentId = searchParams.get("payment_id");
    if (paymentId) {
      checkPaymentStatus(paymentId).then(res => {
        if (res.success && res.status === 'approved') {
           clearCart();
        }
      });
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirigir a la sección de experiencias del usuario
          router.push("/comunidad");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, clearCart, router]);

  const renderIcon = () => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="text-emerald-500 w-20 h-20" />;
      case "rejected":
        return <XCircle className="text-rose-500 w-20 h-20" />;
      case "pending":
      case "in_process":
        return <Clock className="text-amber-500 w-20 h-20" />;
      default:
        return <Loader2 className="text-gold-500 w-20 h-20 animate-spin" />;
    }
  };

  const renderMessage = () => {
    switch (status) {
      case "approved":
        return {
          title: "¡Pago Confirmado!",
          desc: "Tu experiencia está lista. Estamos procesando los detalles finales para que solo tengas que disfrutar.",
          buttonText: "Ver mis experiencias"
        };
      case "rejected":
        return {
          title: "Pago Rechazado",
          desc: "Lo sentimos, no pudimos procesar el pago. Por favor, verificá con tu banco o intentá con otro método.",
          buttonText: "Volver a Mis Reservas"
        };
      case "pending":
      case "in_process":
        return {
          title: "Pago en Proceso",
          desc: "Tu pago está siendo verificado por el banco. Verás la actualización en tu panel en unos instantes.",
          buttonText: "Ir a Mis Reservas"
        };
      default:
        return {
          title: "Procesando pago",
          desc: "Estamos verificando la transacción con Mercado Pago. Aguardá un instante por favor.",
          buttonText: "Redirigiendo..."
        };
    }
  };

  const content = renderMessage();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
      >
        {/* Glow Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gold-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-8">
          <motion.div
            initial={{ rotate: -10, scale: 0.5 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            {renderIcon()}
          </motion.div>

          <div className="space-y-4">
            <h1 className="font-display text-3xl md:text-4xl text-white tracking-tight">
              {content.title}
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed px-4">
              {content.desc}
            </p>
          </div>

          <div className="w-full h-[1px] bg-white/10" />

          <div className="flex flex-col items-center gap-6 w-full">
            <button
              onClick={() => router.push("/comunidad")}
              className="group relative w-full overflow-hidden px-8 py-4 bg-gold-500 text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gold-400 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-3"
            >
              <Compass size={14} className="group-hover:rotate-45 transition-transform" />
              {content.buttonText}
            </button>

            <span className="text-[9px] text-slate-600 uppercase font-bold tracking-[0.2em]">
              Redirigiendo automáticamente en {countdown}...
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function MercadoPagoFeedbackPage() {
  return (
    <div className="min-h-screen bg-[#0c0a09] pt-20">
      <Suspense fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-gold-500 w-10 h-10" />
        </div>
      }>
        <FeedbackContent />
      </Suspense>
    </div>
  );
}

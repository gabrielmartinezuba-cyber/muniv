"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useBookingStore } from "@/store/useBookingStore";
import { X, CalendarDays, Clock, Users, ShieldCheck, ChevronRight, Check, Loader2, AlertCircle } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { submitBooking } from "@/actions/booking";
import { useRouter } from "next/navigation";

export default function BookingDrawer() {
  const { 
    isOpen, closeBooking, step, setStep, experienceTitle, experiencePrice,
    date, setDate, time, setTime, guests, setGuests,
    upSells, toggleUpSell, resetDraft 
  } = useBookingStore();

  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const router = useRouter();

  const handleClose = () => {
    if (step === 3) {
      setStep(1);
    }
    closeBooking();
  };

  useEffect(() => { 
    setMounted(true); 
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Init safely
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted) return null;

  const UPSELL_OPTIONS = [
    { id: "SOMMELIER", label: "Sommelier Bilingüe (ENG/POR)", price: 15000 },
    { id: "PREMIUM_PAIRING", label: "Upgrade Maridaje Gran Reserva", price: 25000 },
  ];

  const handleConfirmReservation = () => {
    setGlobalError(null);
    startTransition(async () => {
      const payload = {
        experienceId: useBookingStore.getState().experienceId || "XP-001",
        experienceTitle,
        date, 
        time,
        guests,
        upSells
      };

      const res = await submitBooking(payload);

      if (res.success) {
        resetDraft();
        // Redirigimos al Club para que vea su nueva reserva
        router.push("/club");
        router.refresh(); // Aseguramos que el server rinda la nueva data
        closeBooking();
      } else {
        setGlobalError(res.message);
      }
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-6"
          >
            <div>
              <label className="text-gold-500 text-sm tracking-widest font-semibold flex items-center gap-2 mb-3">
                <CalendarDays size={16} /> FECHA DE RESERVA
              </label>
              <input 
                type="date" 
                value={date || ""}
                onChange={(e) => setDate(e.target.value)}
                className="w-full min-h-[44px] bg-slate-900/50 border border-gold-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all font-sans"
              />
            </div>
            
            <div>
              <label className="text-gold-500 text-sm tracking-widest font-semibold flex items-center gap-2 mb-3">
                <Clock size={16} /> HORARIO
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["12:00", "13:30", "18:00", "20:30"].map(t => (
                  <button 
                    key={t}
                    onClick={() => setTime(t)}
                    className={`min-h-[44px] px-4 py-3 rounded-xl border transition-all ${time === t ? 'bg-gold-500/20 border-gold-500 text-gold-200 shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'bg-slate-900/50 border-white/10 text-slate-300 hover:border-gold-500/50'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            
            <button 
              disabled={!date || !time}
              onClick={() => setStep(2)}
              className="mt-6 min-h-[44px] glass-panel-glow bg-gold-500/10 border border-gold-500 text-gold-200 py-4 rounded-full font-medium tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold-500 hover:text-white transition-all duration-300"
            >
              Continuar <ChevronRight size={18} />
            </button>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
            <div>
              <label className="text-gold-500 text-sm tracking-widest font-semibold flex items-center gap-2 mb-3">
                <Users size={16} /> CANTIDAD DE PERSONAS
              </label>
              <div className="flex items-center gap-6 justify-center bg-slate-900/50 border border-white/10 p-6 rounded-2xl min-h-[44px]">
                <button 
                  onClick={() => guests > 1 && setGuests(guests - 1)}
                  className="w-12 h-12 min-h-[44px] min-w-[44px] rounded-full border border-gold-500/50 text-gold-500 flex items-center justify-center text-xl hover:bg-gold-500/20 transition-colors"
                >
                  -
                </button>
                <span className="text-4xl font-display text-white w-12 text-center">{guests}</span>
                <button 
                  onClick={() => setGuests(guests + 1)}
                  className="w-12 h-12 min-h-[44px] min-w-[44px] rounded-full border border-gold-500/50 text-gold-500 flex items-center justify-center text-xl hover:bg-gold-500/20 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {experiencePrice !== 0 && (
              <div className="mt-4">
                <label className="text-gold-500 text-sm tracking-widest font-semibold flex items-center gap-2 mb-3">
                  UP-SELLS EXCLUSIVOS
                </label>
                <div className="space-y-3">
                  {UPSELL_OPTIONS.map(opt => {
                    const isActive = upSells.includes(opt.id);
                    return (
                      <div 
                        key={opt.id}
                        onClick={() => toggleUpSell(opt.id)}
                        className={`min-h-[44px] cursor-pointer border p-4 rounded-xl flex items-center justify-between transition-all ${isActive ? 'bg-gold-500/10 border-gold-500 shadow-[0_0_10px_rgba(212,175,55,0.2)]' : 'bg-slate-900/50 border-white/10 hover:border-gold-500/30'}`}
                      >
                        <div>
                          <h4 className="text-white font-medium text-sm">{opt.label}</h4>
                          <span className="text-gold-500 font-medium text-xs">+${opt.price.toLocaleString('es-AR')}</span>
                        </div>
                        <div className={`w-6 h-6 rounded border flex items-center justify-center ${isActive ? 'bg-gold-500 border-gold-500 text-slate-900' : 'border-slate-500'}`}>
                          {isActive && <Check size={14} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <button 
                onClick={() => setStep(1)}
                className="min-h-[44px] px-4 md:px-6 py-4 rounded-full border border-white/20 text-slate-300 hover:bg-white/5 transition-colors"
              >
                Volver
              </button>
              <button 
                onClick={handleConfirmReservation}
                disabled={isPending}
                className="min-h-[44px] flex-1 glass-panel-glow bg-gold-500 text-slate-900 font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-gold-400 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>Procesando <Loader2 size={18} className="animate-spin" /></>
                ) : (
                  <>
                    {experiencePrice === 0 ? 'Confirmar Participación' : 'Confirmar Reserva'}
                    <ShieldCheck size={18} />
                  </>
                )}
              </button>
            </div>

            {/* Error Toast */}
            {globalError && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 border border-rose-700/50 bg-rose-950/50 rounded-xl flex items-center gap-3 text-rose-300 text-sm">
                 <AlertCircle size={16} className="text-rose-500 shrink-0" />
                 <p>{globalError}</p>
              </motion.div>
            )}
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 bg-green-500/20 border border-green-500 rounded-full flex items-center justify-center text-green-500 mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
              <Check size={40} />
            </div>
            <h3 className="font-display text-3xl text-white mb-2">
              {experiencePrice === 0 ? '¡Ya estás participando!' : '¡Reserva Confirmada!'}
            </h3>
            <p className="text-slate-400 mb-8 max-w-xs">
              {experiencePrice === 0 
                ? 'Tu participación en el sorteo ha sido registrada. Te notificaremos vía email si resultás ganador/a.'
                : 'Tu experiencia ha sido agendada en nuestro sistema central. El Sommelier asignado recibirá una alerta y te contactaremos en breve para los preparativos.'}
            </p>
            <button 
              onClick={handleClose}
              className="min-h-[44px] border border-gold-500 px-8 py-3 rounded-full text-gold-500 hover:bg-gold-500/10 transition-colors"
            >
              Cerrar
            </button>
          </motion.div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay backdrop-blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-opacity"
          />

          {/* Drawer / Bottom Sheet Panel */}
          <motion.div 
            initial={isMobile ? { y: "100%", opacity: 0 } : { x: "100%", opacity: 0 }}
            animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
            exit={isMobile ? { y: "100%", opacity: 0 } : { x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            drag={isMobile ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.y > 150 || velocity.y > 500) {
                handleClose();
              }
            }}
            className={`fixed z-50 glass-panel shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-[-10px_0_40px_rgba(0,0,0,0.5)] flex flex-col overflow-y-auto ${
              isMobile 
                ? "bottom-0 left-0 w-full h-[90vh] rounded-t-3xl border-t border-white/10"
                : "top-0 right-0 h-full w-[480px] border-l border-white/10"
            }`}
          >
            {isMobile && (
              <div className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 bg-white/20 rounded-full" />
              </div>
            )}

            <div className={`px-6 pb-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-slate-900/80 backdrop-blur-lg z-10 ${!isMobile ? "pt-6" : "pt-2"}`}>
              <div>
                <span className="text-rose-500 text-xs font-bold tracking-widest uppercase block mb-1">
                  {experiencePrice === 0 ? 'Sorteo Exclusivo' : 'Tu Reserva'}
                </span>
                <h2 className="font-display text-2xl text-white">{experienceTitle}</h2>
              </div>
              <button 
                onClick={handleClose}
                className="w-10 h-10 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex-grow">
              {/* Stepper logic */}
              {step < 3 && (
                <div className="flex gap-2 mb-8">
                  {[1, 2].map(s => (
                    <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-gold-500 shadow-[0_0_8px_rgba(212,175,55,0.6)]' : 'bg-white/10'}`} />
                  ))}
                </div>
              )}
              
              <AnimatePresence mode="wait">
                {renderStep()}
              </AnimatePresence>
            </div>
            
            {step < 3 && (
              <div className="p-6 border-t border-white/10 bg-slate-900/50 mt-auto">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Progreso guardado (IndexedDB Draft)</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

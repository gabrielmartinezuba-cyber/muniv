"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Users, Package, Clock, CheckCircle2, AlertTriangle, XCircle, Loader2, CreditCard, MessageCircle } from "lucide-react";
import { requestBookingCancellation } from "@/actions/booking";
import { retryPayment } from "@/actions/payments";
import { toast } from "sonner";

function StatusBadge({ status, isPastEvent }: { status: string, isPastEvent?: boolean }) {
  if (isPastEvent) {
    return (
      <span className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-500/10 border border-slate-500/30 text-slate-500 rounded-full text-[9px] font-black tracking-widest uppercase shadow-[0_0_15px_rgba(255,255,255,0.05)]">
        <Clock size={10} /> ESTADO: FINALIZADO (FECHA PASADA)
      </span>
    );
  }
  if (status === 'PENDIENTE') {
    return (
      <span className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-500 rounded-full text-[9px] font-black tracking-widest uppercase shadow-[0_0_15px_rgba(249,115,22,0.1)]">
        <AlertTriangle size={10} /> A verificar...
      </span>
    );
  }
  if (status === 'PAGADO') {
    return (
      <span className="flex items-center gap-1.5 px-4 py-1.5 bg-sky-500/10 border border-sky-500/30 text-sky-500 rounded-full text-[9px] font-black tracking-widest uppercase shadow-[0_0_15px_rgba(14,165,233,0.1)]">
        <CheckCircle2 size={10} /> Pagado
      </span>
    );
  }
  if (status === 'CONFIRMADO') {
    return (
      <span className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-full text-[9px] font-black tracking-widest uppercase shadow-[0_0_15px_rgba(16,185,129,0.1)]">
        <CheckCircle2 size={10} /> Confirmado
      </span>
    );
  }
  if (status === 'EN_PREPARACION') {
    return (
      <span className="flex items-center gap-1.5 px-4 py-1.5 bg-gold-500/10 border border-gold-500/30 text-gold-500 rounded-full text-[9px] font-black tracking-widest uppercase shadow-[0_0_15px_rgba(212,175,55,0.1)]">
        <Package size={10} /> En preparación
      </span>
    );
  }
  if (status === 'ENTREGADO') {
    return (
      <span className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-full text-[9px] font-black tracking-widest uppercase shadow-[0_0_15px_rgba(16,185,129,0.1)]">
        <CheckCircle2 size={10} /> Entregado
      </span>
    );
  }
  if (status === 'CANCELADO') {
    return (
      <span className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-full text-[9px] font-black tracking-widest uppercase shadow-[0_0_15px_rgba(244,63,94,0.1)]">
        <XCircle size={10} /> Cancelado
      </span>
    );
  }
  return null;
}

export function BookingCard({ booking }: { booking: any }) {
  const type = booking.experiences?.type?.trim().toLowerCase();
  const experience = booking.experiences;

  const isEvento = type === "evento";
  const isPastEvent = isEvento && experience?.event_date && new Date(experience.event_date) <= new Date();

  const [showCancelForm, setShowCancelForm] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isLocallyCancelled, setIsLocallyCancelled] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const isFinalStatus = booking.status === 'ENTREGADO' || booking.status === 'CANCELADO';
  const cancelRequested = (booking.cancel_requested === true || isLocallyCancelled) && !isFinalStatus;

  const handleCancelSubmit = () => {
    if (!reason.trim()) {
      toast.error("Por favor, escribí el motivo de la cancelación.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await requestBookingCancellation(booking.id, reason);
        if (result.success) {
          toast.success(result.message, { 
            duration: 6000,
            icon: <CheckCircle2 className="text-emerald-500" size={20} />
          });
          setIsLocallyCancelled(true);
          setShowCancelForm(false);
        } else {
          toast.error(result.message);
        }
      } catch (err) {
        toast.error("Error crítico de sincronización.");
      }
    });
  };

  const handleRetryPayment = async () => {
    setIsRetrying(true);
    const whatsappNumber = "5491165736669";
    const experienceTitle = experience?.title || "Reserva Muniv";
    const total = booking.total_price.toLocaleString('es-AR');
    
    const message = `Hola Muniv!\n\nQuiero pagar mi reserva pendiente.\n\n*Experiencia:* ${experienceTitle}\n*Total:* $${total}\n\n¿Me pasas los datos para transferir?`;
    
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    setIsRetrying(false);
  };

  return (
    <div className={`relative group/card overflow-hidden rounded-2xl border bg-slate-950/50 p-6 transition-all duration-500 hover:bg-slate-900/80 shadow-2xl ${cancelRequested ? 'border-rose-900/30 ring-1 ring-rose-500/10' : 'border-white/10'}`}>
      {/* Background Experience Image dimmed */}
      <div className="absolute inset-0 opacity-10 group-hover/card:opacity-20 transition-opacity pointer-events-none">
        <Image
          src={experience?.image_url || '/placeholder.jpg'}
          alt=""
          fill
          className="object-cover"
        />
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-slate-500 uppercase font-black tracking-widest">
                {type}
              </span>
            </div>
            <h4 className="text-white font-display text-xl mb-2 tracking-wide group-hover/card:text-gold-400 transition-colors">
              {experience?.title}
            </h4>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-400 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                {type === 'caja' ? <Package size={14} className="text-gold-500" /> : <Users size={14} className="text-gold-500" />}
                {booking.guests_count} {type === 'caja' ? 'cajas' : 'personas'}
              </span>

              {type !== 'caja' && experience?.event_date && (
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Calendar size={14} className="text-gold-500" />
                  <span className="font-bold text-[10px] uppercase tracking-tighter mr-0.5">
                    {type === 'sorteo' ? 'Sorteo:' : 'Evento:'}
                  </span>
                  {new Date(experience.event_date).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit"
                  })} hs
                </span>
              )}

              {type !== 'evento' && (
                <span className={`flex items-center gap-1.5 ${type === 'caja' ? 'text-slate-300 font-medium' : 'opacity-40'}`}>
                  <Clock size={14} /> {new Date(booking.created_at).toLocaleDateString("es-AR")}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center shrink-0">
            <StatusBadge status={booking.status} isPastEvent={isPastEvent} />
          </div>
        </div>

        {/* ── Cancellation Control Flow ── */}
        {!isFinalStatus && (
          <div className="border-t border-white/5 pt-5 mt-2">
            {cancelRequested ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 px-5 py-3 bg-rose-500/5 border border-rose-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.05)]"
              >
                <Clock size={16} className="text-rose-500 animate-pulse" />
                <span>Cancelación en espera — Muniv te contactará</span>
              </motion.div>
            ) : showCancelForm ? (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-rose-500" />
                  <label className="text-[10px] text-rose-500 font-black uppercase tracking-widest">
                    Motivo del Arrepentimiento
                  </label>
                </div>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Por favor, contanos por qué solicitás la cancelación..."
                  rows={3}
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-rose-500/40 focus:ring-1 focus:ring-rose-500/20 transition-all font-sans placeholder:text-slate-600 resize-none shadow-inner"
                />
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleCancelSubmit}
                    disabled={isPending}
                    className="group relative overflow-hidden px-6 py-3 bg-rose-900/40 border border-rose-500/30 text-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all duration-500 disabled:opacity-50 flex items-center gap-2 shadow-lg"
                  >
                    {isPending ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} className="group-hover:rotate-90 transition-transform" />}
                    Solicitar Cancelación
                  </button>
                  <button
                    onClick={() => { setShowCancelForm(false); setReason(""); }}
                    className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-[0.2em] font-black"
                  >
                    Regresar
                  </button>
                </div>
              </div>
            ) : booking.status === 'PENDIENTE' ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  onClick={handleRetryPayment}
                  disabled={isRetrying}
                  className="group flex-1 sm:flex-none relative overflow-hidden px-8 py-3.5 bg-[#25D366] border border-[#22c35e]/50 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isRetrying ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
                  {type === 'sorteo' ? 'Avisar Transferencia / Pago' : 'Avisar Transferencia'}
                </button>
                <button
                  onClick={() => setShowCancelForm(true)}
                  disabled={isRetrying}
                  className="text-[10px] text-slate-500 hover:text-rose-500 transition-colors uppercase tracking-widest font-black flex justify-center items-center gap-1.5"
                >
                  <XCircle size={14} /> Cancelar Reserva
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCancelForm(true)}
                className="group flex items-center gap-2 text-[10px] text-slate-600 hover:text-rose-500 transition-all duration-300 uppercase tracking-widest font-black"
              >
                <XCircle size={14} className="group-hover:scale-125 transition-transform" />
                <span className="group-hover:translate-x-1 transition-transform">Cancelar compra</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

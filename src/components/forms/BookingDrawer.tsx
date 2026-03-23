"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { X, Users, ShieldCheck, Loader2, AlertCircle, ShoppingCart, Trash2, CalendarDays } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { submitBooking } from "@/actions/booking";
import { getBenefits } from "@/actions/benefits";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import Link from "next/link";

export default function BookingDrawer() {
  const { 
    isOpen, closeCart, items, removeItem, updateItemGuests, toggleItemUpSell, clearCart, getTotal
  } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  // Auth & Discount State
  const [user, setUser] = useState<User | null>(null);
  const [maxDiscount, setMaxDiscount] = useState<number>(0);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Guest Form
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  const router = useRouter();

  useEffect(() => { 
    setMounted(true); 
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch session & discounts on open
  useEffect(() => {
    if (isOpen) {
      setCheckingAuth(true);
      const fetchAuthAndDiscounts = async () => {
        try {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          setUser(session?.user || null);

          // Get max discount
          const benefits = await getBenefits();
          const maxPerc = benefits.reduce((max, b) => {
            return b.discount_percentage ? Math.max(max, b.discount_percentage) : max;
          }, 0);
          setMaxDiscount(maxPerc);
        } catch (err) {
          console.error("Error loading auth/discounts:", err);
        } finally {
          setCheckingAuth(false);
        }
      };
      fetchAuthAndDiscounts();
    }
  }, [isOpen]);

  if (!mounted) return null;

  const UPSELL_OPTIONS = [
    { id: "SOMMELIER", label: "Sommelier Bilingüe (ENG/POR)", price: 15000 },
    { id: "PREMIUM_PAIRING", label: "Upgrade Maridaje", price: 25000 },
  ];

  const subtotal = getTotal();
  const rawDiscountAmount = subtotal * (maxDiscount / 100);
  const finalPrice = user ? subtotal - rawDiscountAmount : subtotal;

  const handleCheckout = () => {
    if (items.length === 0) return;

    if (!user && (!guestName || !guestEmail)) {
      setGlobalError("Por favor completa tus datos para confirmar como invitado.");
      return;
    }

    setGlobalError(null);
    startTransition(async () => {
      // In a real e-commerce with multiple items, we would iterate and call submitBooking for each,
      // or the backend would be refactored to accept an array. For now, we process them iteratively.
      
      let hasError = false;
      let lastErrMsg = "";

      for (const item of items) {
        const payload = {
          experienceId: item.experienceId,
          experienceTitle: item.title,
          date: item.eventDate ? item.eventDate.split('T')[0] : new Date().toISOString().split('T')[0], 
          time: item.eventDate ? new Date(item.eventDate).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }) : "00:00",
          guests: item.guests,
          upSells: item.upSells,
          guest_name: user ? "" : guestName,
          guest_email: user ? "" : guestEmail,
          final_price: user ? ((item.price * item.guests) * (1 - maxDiscount / 100)) : (item.price * item.guests)
        };

        const res = await submitBooking(payload);
        if (!res.success) {
          hasError = true;
          lastErrMsg = res.message || "Error al procesar la reserva.";
        }
      }

      if (hasError) {
        toast.error(lastErrMsg);
        setGlobalError(lastErrMsg);
      } else {
        toast.success("¡Compra confirmada con éxito!");
        setTimeout(() => {
          clearCart();
          router.push(user ? "/comunidad" : "/");
          router.refresh();
          closeCart();
        }, 1500);
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-opacity"
          />

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
                closeCart();
              }
            }}
            className={`fixed z-50 glass-panel shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-[-10px_0_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden ${
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
              <div className="flex items-center gap-3">
                <ShoppingCart className="text-gold-500" />
                <h2 className="font-display text-2xl text-white">Tu Selección</h2>
              </div>
              <button 
                onClick={closeCart}
                className="w-10 h-10 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex-grow overflow-y-auto space-y-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4 mt-20">
                  <ShoppingCart size={48} className="opacity-20" />
                  <p>Tu selección está vacía.</p>
                </div>
              ) : (
                <>
                  {items.map((item) => (
                    <motion.div key={item.id} layout className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 relative">
                      <button onClick={() => removeItem(item.id)} className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                      
                      <div>
                        <h3 className="font-display text-lg text-white pr-6">{item.title}</h3>
                        {item.eventDate && (
                          <p className="text-xs text-gold-500 uppercase tracking-widest mt-1">
                             {new Date(item.eventDate).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })} - {new Date(item.eventDate).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}hs
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3 bg-slate-950/50 rounded-full border border-white/10 p-1">
                          <button onClick={() => item.guests > 1 && updateItemGuests(item.id, item.guests - 1)} className="w-8 h-8 rounded-full text-white flex items-center justify-center hover:bg-white/5">-</button>
                          <span className="text-sm font-bold text-white w-4 text-center">{item.guests}</span>
                          <button onClick={() => updateItemGuests(item.id, item.guests + 1)} className="w-8 h-8 rounded-full text-white flex items-center justify-center hover:bg-white/5">+</button>
                        </div>
                        <span className="text-lg font-medium text-white">${(item.price * item.guests).toLocaleString('es-AR')}</span>
                      </div>
                    </motion.div>
                  ))}

                  {/* Summary & Checkout Logic */}
                  <div className="pt-6 border-t border-white/10 space-y-6">
                    {checkingAuth ? (
                      <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gold-500" /></div>
                    ) : (
                      <>
                        {!user && maxDiscount > 0 && (
                          <div className="border border-gold-500/50 bg-gold-500/10 p-4 rounded-xl flex flex-col gap-3">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="text-gold-500 shrink-0 mt-0.5" size={18} />
                              <p className="text-sm text-gold-200">
                                <strong>¡No te pierdas este beneficio!</strong> Registrate gratis a la Comunidad y ahorrá un {maxDiscount}% en esta compra (${rawDiscountAmount.toLocaleString('es-AR')} de ahorro).
                              </p>
                            </div>
                            <Link href="/login" onClick={closeCart} className="text-xs uppercase tracking-widest bg-gold-500 text-slate-950 font-bold py-2 px-4 rounded-full text-center hover:bg-gold-400 mt-2">
                              Ingresar / Registrarme
                            </Link>
                          </div>
                        )}

                        <div className="bg-slate-950/50 rounded-2xl p-5 border border-white/5">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-400">Subtotal</span>
                            <span className={user && maxDiscount > 0 ? "line-through text-slate-500" : "text-white"}>
                              ${subtotal.toLocaleString('es-AR')}
                            </span>
                          </div>
                          
                          {user && maxDiscount > 0 && (
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-burgundy-400">Beneficio Comunidad (-{maxDiscount}%)</span>
                              <span className="text-burgundy-400 font-bold">-${rawDiscountAmount.toLocaleString('es-AR')}</span>
                            </div>
                          )}

                          <div className="pt-4 mt-4 border-t border-white/10 flex justify-between items-center">
                            <span className="text-white font-bold uppercase tracking-widest text-sm">
                              {user ? "Total Miembro" : "Total Final"}
                            </span>
                            <span className="text-2xl text-gold-500 font-display">
                              ${finalPrice.toLocaleString('es-AR')}
                            </span>
                          </div>
                        </div>

                        {!user && (
                          <div className="pt-6 mt-2 border-t border-white/5 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-1 h-4 bg-gold-500 rounded-full" />
                              <h4 className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Datos para tu reserva</h4>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4 p-4 bg-black/40 border border-gold-500/20 rounded-2xl shadow-inner group-hover:border-gold-500/40 transition-colors">
                              <div className="space-y-1.5">
                                <label className="text-[9px] uppercase tracking-widest text-gold-500/70 ml-1 font-bold">Nombre Completo</label>
                                <input 
                                  type="text" 
                                  placeholder="Ej: Juan Pérez"
                                  value={guestName}
                                  onChange={e => setGuestName(e.target.value)}
                                  className="w-full bg-slate-900/60 border border-white/5 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-500/50 transition-all placeholder:text-slate-600 font-light"
                                  required
                                />
                              </div>
                              
                              <div className="space-y-1.5">
                                <label className="text-[9px] uppercase tracking-widest text-gold-500/70 ml-1 font-bold">Email de Contacto</label>
                                <input 
                                  type="email" 
                                  placeholder="juan@ejemplo.com"
                                  value={guestEmail}
                                  onChange={e => setGuestEmail(e.target.value)}
                                  className="w-full bg-slate-900/60 border border-white/5 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-500/50 transition-all placeholder:text-slate-600 font-light"
                                  required
                                />
                                <p className="text-[8px] text-slate-500 italic mt-1 ml-1 leading-tight">Enviaremos tus entradas y confirmación a este correo.</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {globalError && (
                          <div className="p-3 border border-red-500/30 bg-red-500/10 text-red-400 rounded-xl text-xs flex gap-2 items-center">
                            <AlertCircle size={14} /> {globalError}
                          </div>
                        )}

                        <button 
                          onClick={handleCheckout}
                          disabled={isPending}
                          className="w-full mt-4 glass-panel-glow bg-burgundy-600 text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-burgundy-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {isPending ? (
                            <>Procesando <Loader2 size={18} className="animate-spin" /></>
                          ) : (
                            <>Confirmar Reserva Segura <ShieldCheck size={18} /></>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { X, Users, ShieldCheck, Loader2, AlertCircle, ShoppingCart, Trash2, CalendarDays, Package, Minus, Plus, MessageCircle } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { submitBooking } from "@/actions/booking";
import { createCheckoutPreference } from "@/actions/payments";
import { getBenefits } from "@/actions/benefits";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import Link from "next/link";

export default function BookingDrawer() {
  const { 
    isOpen, closeCart, items, removeItem, updateItemGuests, updateItemWines, toggleItemUpSell, clearCart, 
    getSubtotal, getTemporalDiscountAmount, getDiscountAmount, getTotal, setBenefit, benefit
  } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Guest Form
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

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

          // Get max benefit with cap
          const benefits = await getBenefits();
          const bestBenefit = benefits.reduce((best, b) => {
            if (!b.discount_percentage) return best;
            if (!best || b.discount_percentage > best.percentage) {
              return { percentage: b.discount_percentage, cap: (b as any).discount_cap };
            }
            return best;
          }, null as { percentage: number; cap: number | null } | null);
          
          setBenefit(bestBenefit);
        } catch (err) {
          console.error("Error loading auth/discounts:", err);
        } finally {
          setCheckingAuth(false);
        }
      };
      fetchAuthAndDiscounts();
    }
  }, [isOpen, setBenefit]);

  if (!mounted) return null;

  const subtotal = getSubtotal();
  const temporalDiscountAmount = getTemporalDiscountAmount();
  const discountAmount = getDiscountAmount();
  const finalPrice = getTotal();

  const handleCheckout = () => {
    if (items.length === 0) return;

    // Validation: Wine selection for Caja
    for (const item of items) {
      if (item.type?.toLowerCase() === 'caja') {
        const requiredBottles = (item.wine_quantity || 0) * item.guests;
        const selectedCount = item.selected_wines?.filter(w => w && w !== "")?.length || 0;
        
        if (selectedCount < requiredBottles) {
          toast.error(`Por favor, completá la elección de vinos para "${item.title}".`);
          return;
        }
      }
    }

    if (!user && (!guestName || !guestEmail || !guestPhone)) {
      setGlobalError("Por favor completa todos tus datos personales para continuar.");
      return;
    }

    setGlobalError(null);
    startTransition(async () => {
      let hasError = false;
      let lastErrMsg = "";
      const bookingIds: string[] = [];

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
          guest_phone: user ? "" : guestPhone,
          final_price: ((item.price * (1 - (item.temporal_discount || 0) / 100)) * item.guests) * (user ? (1 - (benefit?.percentage || 0) / 100) : 1),
          selected_wines: item.selected_wines
        };

        const res = await submitBooking(payload);
        if (res.success && res.bookingId) {
          bookingIds.push(res.bookingId);
        } else if (!res.success) {
          hasError = true;
          lastErrMsg = res.message || "Error al procesar la reserva.";
        }
      }

      if (hasError) {
        toast.error(lastErrMsg);
        setGlobalError(lastErrMsg);
      } else {
        // Redirección a WhatsApp para terminar la compra (Reemplaza Mercado Pago)
        if (bookingIds.length > 0) {
          const whatsappNumber = "5491165736669"; 
          const name = user ? (user.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim() : user.user_metadata?.full_name || user.user_metadata?.name || user.email) : guestName;
          const userType = user ? "Socio Muniv" : "Invitado";
          
          let itemsList = items.map(item => {
            const base = item.price * item.guests;
            const disc = base * ((item.temporal_discount || 0) / 100);
            return `- ${item.guests}x ${item.title}: $${(base - disc).toLocaleString('es-AR')}`;
          }).join('\n');
          
          const isSorteo = items.some(i => i.type?.toLowerCase() === 'sorteo');
          const intention = isSorteo ? "participar de:" : "terminar mi compra de:";

          const message = `Hola Muniv!\n\nSoy ${name} (${userType}).\nQuiero ${intention}\n${itemsList}\n\n*Total Final: $${finalPrice.toLocaleString('es-AR')}*\n\n¿Me pasas el alias para transferir?`;
          
          const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
          
          toast.success("¡Orden generada! Redirigiendo a WhatsApp...");
          
          setTimeout(() => {
            clearCart();
            closeCart();
            window.open(whatsappUrl, '_blank');
            router.push(user ? "/comunidad" : "/");
            router.refresh();
          }, 1500);
        }
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

            <div className="p-6 flex-grow overflow-y-auto space-y-6 custom-scrollbar">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4 mt-20">
                  <ShoppingCart size={48} className="opacity-20" />
                  <p>Tu selección está vacía.</p>
                </div>
              ) : (
                <>
                  {items.map((item) => {
                    const isSorteo = item.type?.toLowerCase() === 'sorteo';
                    const isCaja = item.type?.toLowerCase() === 'caja';
                    const isEvento = item.type?.toLowerCase() === 'evento';
                    
                    const totalBottles = (item.wine_quantity || 0) * item.guests;

                    return (
                      <motion.div key={item.id} layout className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 flex flex-col gap-5 relative">
                        <button onClick={() => removeItem(item.id)} className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors">
                          <Trash2 size={16} />
                        </button>
                        
                        <div className="flex gap-4">
                           <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                              {isCaja ? <Package className="text-gold-500" /> : <CalendarDays className="text-gold-500" />}
                           </div>
                           <div>
                            <h3 className="font-display text-lg text-white pr-6 leading-tight">{item.title}</h3>
                            {item.eventDate && !isCaja && (
                              <p className="text-[10px] text-gold-500 uppercase tracking-widest font-bold mt-1">
                                 {new Date(item.eventDate).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })} • {new Date(item.eventDate).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}hs
                              </p>
                            )}
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5">{item.type}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
                          {isSorteo ? (
                            <span className="text-[10px] uppercase font-bold tracking-widest text-gold-500/60 bg-gold-500/5 px-3 py-1 rounded-full border border-gold-500/10">1 participación</span>
                          ) : (
                            <div className="flex items-center gap-3 bg-slate-950/50 rounded-full border border-white/10 p-1">
                              <button onClick={() => item.guests > 1 && updateItemGuests(item.id, item.guests - 1)} className="w-8 h-8 rounded-full text-white flex items-center justify-center hover:bg-white/10 transition-colors">
                                <Minus size={14} />
                              </button>
                              <div className="flex items-center gap-1.5 px-2">
                                <span className="text-sm font-bold text-white min-w-[1ch] text-center">{item.guests}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">{isCaja ? 'cajas' : 'personas'}</span>
                              </div>
                              <button onClick={() => updateItemGuests(item.id, item.guests + 1)} className="w-8 h-8 rounded-full text-white flex items-center justify-center hover:bg-white/10 transition-colors">
                                <Plus size={14} />
                              </button>
                            </div>
                          )}
                          <span className="text-lg font-display text-white italic">${(item.price * item.guests).toLocaleString('es-AR')}</span>
                        </div>

                        {/* Wine Selection for Cajas */}
                        {isCaja && item.wine_options && item.wine_options.length > 0 && (
                          <div className="mt-2 space-y-4 pt-4 border-t border-white/5 bg-black/20 -mx-5 px-5 pb-5">
                            <label className="text-[10px] text-gold-500/70 uppercase font-black tracking-widest flex items-center gap-2">
                              Elegí tus vinos ({item.selected_wines?.length || 0}/{totalBottles}):
                            </label>
                            <div className="grid grid-cols-1 gap-3">
                               {Array.from({ length: totalBottles }).map((_, idx) => (
                                 <select
                                   key={idx}
                                   value={item.selected_wines?.[idx] || ""}
                                   onChange={(e) => {
                                      const newWines = [...(item.selected_wines || [])];
                                      newWines[idx] = e.target.value;
                                      updateItemWines(item.id, newWines);
                                   }}
                                   className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500/50 transition-all appearance-none cursor-pointer"
                                 >
                                   <option value="" disabled>Seleccionar vino {idx + 1}...</option>
                                   {item.wine_options?.map((opt, oIdx) => (
                                     <option key={oIdx} value={opt}>{opt}</option>
                                   ))}
                                 </select>
                               ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}

                  {/* Summary & Checkout Logic */}
                  <div className="pt-6 border-t border-white/10 space-y-6 pb-20">
                    {checkingAuth ? (
                      <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gold-500" /></div>
                    ) : (
                      <>
                  {/* Upsell Banner (For all Non-Users) */}
                  {(() => {
                    if (!user && !checkingAuth) {
                      return (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative overflow-hidden group p-5 rounded-[2rem] border border-gold-500/30 bg-gradient-to-br from-gold-500/5 via-gold-500/10 to-transparent backdrop-blur-md shadow-[0_0_40px_rgba(212,175,55,0.05)] mb-6"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/10 blur-[50px] -mr-16 -mt-16 rounded-full group-hover:bg-gold-500/20 transition-all duration-700" />
                          <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center shrink-0">
                                <ShieldCheck className="text-gold-400" size={20} />
                              </div>
                              <h4 className="text-white font-display text-base tracking-tight leading-tight">
                                ¿Sos socio Muniv? 
                                <span className="block text-[10px] text-gold-500 font-black uppercase tracking-[0.2em] mt-1">Beneficio Exclusivo</span>
                              </h4>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed max-w-[90%]">
                              Registrate ahora para acceder a un <strong className="text-gold-400">{benefit?.percentage || 20}% de descuento</strong> en esta compra y ahorrar hasta <strong className="text-white">${(benefit?.cap || 5000).toLocaleString('es-AR')}</strong>.
                            </p>
                            <Link href="/login" onClick={closeCart} className="w-full text-[9px] uppercase tracking-[0.3em] bg-gold-500 text-slate-950 font-black py-4 px-6 rounded-2xl text-center hover:bg-gold-400 hover:shadow-[0_0_25px_rgba(212,175,55,0.3)] hover:-translate-y-0.5 transition-all active:scale-[0.98]">
                              Ingresar / Acceder beneficio
                            </Link>
                          </div>
                        </motion.div>
                      );
                    }
                    return null;
                  })()}

                        <div className="bg-slate-950/80 rounded-3xl p-6 border border-white/5 shadow-2xl">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-slate-500 text-xs uppercase font-bold tracking-widest">Subtotal</span>
                            <span className={user && discountAmount > 0 ? "line-through text-slate-600 text-sm" : "text-white font-display text-lg"}>
                              ${subtotal.toLocaleString('es-AR')}
                            </span>
                          </div>
                           {temporalDiscountAmount > 0 && (
                             <div className="flex justify-between items-center mb-3">
                               <span className="text-red-500 text-[10px] uppercase font-black tracking-widest">
                                 Promoción (-{items.find(i => (i.temporal_discount || 0) > 0)?.temporal_discount}%)
                               </span>
                               <span className="text-red-500 font-display text-lg font-bold">-${temporalDiscountAmount.toLocaleString('es-AR')}</span>
                             </div>
                           )}
                          {user && discountAmount > 0 && (
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-burgundy-400 text-xs uppercase font-bold tracking-widest">
                                Comunidad (-{benefit?.percentage}%)
                                {benefit?.cap && discountAmount === benefit.cap && <span className="text-[8px] ml-1 opacity-70">(Tope alcanzado)</span>}
                              </span>
                              <span className="text-burgundy-400 font-display text-lg font-bold">-${discountAmount.toLocaleString('es-AR')}</span>
                            </div>
                          )}

                          <div className="pt-5 mt-5 border-t border-white/10 flex justify-between items-center">
                            <span className="text-white font-black uppercase tracking-[0.2em] text-[10px]">
                              Total Final
                            </span>
                            <span className="text-3xl text-gold-500 font-display italic">
                              ${finalPrice.toLocaleString('es-AR')}
                            </span>
                          </div>
                        </div>

                        {!user && (
                          <div className="pt-2 space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-1.5 h-1.5 bg-gold-500 rounded-full" />
                              <h4 className="text-[9px] uppercase tracking-[0.3em] text-slate-500 font-black">Datos del Comprador</h4>
                              <div className="flex-grow h-[1px] bg-white/5" />
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4 p-5 bg-black/40 border border-white/5 rounded-3xl shadow-inner group-hover:border-gold-500/40 transition-colors">
                              <div className="space-y-2">
                                <label className="text-[8px] uppercase tracking-widest text-slate-500 ml-1 font-black">Nombre Completo</label>
                                <input 
                                  type="text" 
                                  placeholder="Ej: Juan Pérez"
                                  value={guestName}
                                  onChange={e => setGuestName(e.target.value)}
                                  className="w-full bg-slate-900/60 border border-white/5 text-white rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-gold-500/50 transition-all placeholder:text-slate-700 font-light"
                                  required
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label className="text-[8px] uppercase tracking-widest text-slate-500 ml-1 font-black">Email de Contacto</label>
                                <input 
                                  type="email" 
                                  placeholder="juan@ejemplo.com"
                                  value={guestEmail}
                                  onChange={e => setGuestEmail(e.target.value)}
                                  className="w-full bg-slate-900/60 border border-white/5 text-white rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-gold-500/50 transition-all placeholder:text-slate-700 font-light"
                                  required
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-[8px] uppercase tracking-widest text-slate-500 ml-1 font-black">Teléfono Celular (WhatsApp)</label>
                                <input 
                                  type="tel" 
                                  placeholder="54 9 11 ..."
                                  value={guestPhone}
                                  onChange={e => {
                                    const val = e.target.value.replace(/\D/g, "");
                                    setGuestPhone(val);
                                  }}
                                  className="w-full bg-slate-900/60 border border-white/5 text-white rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-gold-500/50 transition-all placeholder:text-slate-700 font-light"
                                  required
                                />
                                <p className="text-[8px] text-slate-600 italic mt-1 ml-1 leading-tight">Obligatorio para temas de logística y envío de vouchers.</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {globalError && (
                          <div className="p-4 border border-red-500/30 bg-red-500/10 text-red-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex gap-3 items-center">
                            <AlertCircle size={16} className="text-red-500" /> {globalError}
                          </div>
                        )}

                        <button 
                          onClick={handleCheckout}
                          disabled={isPending}
                          className="w-full mt-4 glass-panel-glow bg-[#25D366] text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-[#22c35e] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl tracking-[0.2em] text-[10px] uppercase"
                        >
                          {isPending ? (
                            <>Procesando <Loader2 size={18} className="animate-spin" /></>
                          ) : (
                            <>{items.some(i => i.type?.toLowerCase() === 'sorteo') ? 'Participar en Sorteo' : 'Terminar compra'} <MessageCircle size={18} /></>
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

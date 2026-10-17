"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import {
  X,
  ShieldCheck,
  Loader2,
  AlertCircle,
  ShoppingCart,
  Trash2,
  CalendarDays,
  Package,
  Minus,
  Plus,
  MessageCircle,
  Sparkles,
  Wine,
  UtensilsCrossed,
  GlassWater,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { submitBooking } from "@/actions/booking";
import { getBenefits } from "@/actions/benefits";
import { getExperienceAvailability } from "@/actions/experiences";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function BookingDrawer() {
  const {
    isOpen,
    closeCart,
    items,
    removeItem,
    updateItemGuests,
    updateItemWines,
    clearCart,
    getSubtotal,
    getTemporalDiscountAmount,
    getDiscountAmount,
    getTotal,
    setBenefit,
    benefit,
    updateItemPicada,
    updateItemCopas,
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
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, number>>({});

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
          const {
            data: { session },
          } = await supabase.auth.getSession();
          setUser(session?.user || null);

          // Get max benefit with cap
          const benefits = await getBenefits();
          const bestBenefit = benefits.reduce(
            (best, b) => {
              if (!b.discount_percentage) return best;
              if (!best || b.discount_percentage > best.percentage) {
                return {
                  percentage: b.discount_percentage,
                  cap: (b as any).discount_cap,
                };
              }
              return best;
            },
            null as { percentage: number; cap: number | null } | null
          );

          setBenefit(bestBenefit);
        } catch (err) {
          console.error("Error loading auth/discounts:", err);
        } finally {
          setCheckingAuth(false);
        }
      };
      fetchAuthAndDiscounts();

      // Fetch availability for all items in cart
      const fetchAvailability = async () => {
        const map: Record<string, number> = {};
        for (const item of items) {
          const avail = await getExperienceAvailability(item.experienceId);
          map[item.experienceId] = avail.remaining;
        }
        setAvailabilityMap(map);
      };
      fetchAvailability();
    }
  }, [isOpen, items.length, setBenefit]);

  if (!mounted) return null;

  const subtotal = getSubtotal();
  const temporalDiscountAmount = getTemporalDiscountAmount();
  const discountAmount = getDiscountAmount();
  const finalPrice = getTotal();

  const handleCheckout = () => {
    if (items.length === 0) return;

    // Validation: Wine selection for Caja
    for (const item of items) {
      if (item.type?.toLowerCase() === "caja") {
        const requiredBottles = (item.wine_quantity || 0) * item.guests;
        const selectedCount =
          item.selected_wines?.filter((w) => w && w !== "")?.length || 0;

        if (selectedCount < requiredBottles) {
          toast.error(
            `Por favor, completá la elección de vinos para "${item.title}".`
          );
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
          date: item.eventDate
            ? item.eventDate.split("T")[0]
            : new Date().toISOString().split("T")[0],
          time: item.eventDate
            ? new Date(item.eventDate).toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : "00:00",
          guests: item.guests,
          upSells: item.upSells,
          guest_name: user ? "" : guestName,
          guest_email: user ? "" : guestEmail,
          guest_phone: user ? "" : guestPhone,
          addon_picada_qty: item.addon_picada_qty || 0,
          addon_copas_qty: item.addon_copas_qty || 0,
          final_price:
            Number(item.price || 0) *
            (1 - Number(item.temp_discount || 0) / 100) *
            Number(item.guests || 1) *
            (user ? 1 - Number(benefit?.percentage || 0) / 100 : 1),
          selected_wines: item.selected_wines,
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
        // Redirección a WhatsApp para terminar la compra
        if (bookingIds.length > 0) {
          const whatsappNumber = "5491165736669";
          const name = user
            ? user.user_metadata?.first_name
              ? `${user.user_metadata.first_name} ${
                  user.user_metadata.last_name || ""
                }`.trim()
              : user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.email
            : guestName;
          const userType = user ? "Socio Muniv" : "Invitado";

          const itemsList = items
            .map((item) => {
              const base =
                (Number(item.price) || 0) * (Number(item.guests) || 1);
              const tDiscount = Number(item.temp_discount) || 0;
              const disc = base * (tDiscount / 100);
              let itemLine = `- ${item.guests}x ${item.title}: $${(
                base - disc
              ).toLocaleString("es-AR")}`;

              const picadaQty = item.addon_picada_qty || 0;
              const copasQty = item.addon_copas_qty || 0;
              if (picadaQty > 0 || copasQty > 0) {
                const extras = [];
                if (picadaQty > 0) extras.push(`${picadaQty}x Picada`);
                if (copasQty > 0) extras.push(`${copasQty}x Copas`);
                itemLine += `\n  Extras: ${extras.join(", ")}`;
              }
              return itemLine;
            })
            .join("\n");

          const isSorteo = items.some((i) => i.type?.toLowerCase() === "sorteo");
          const intention = isSorteo ? "participar de:" : "terminar mi compra de:";

          const message = `Hola Muniv!\n\nSoy ${name} (${userType}).\nQuiero ${intention}\n${itemsList}\n\n*Total Final: $${finalPrice.toLocaleString(
            "es-AR"
          )}*\n\n¿Me pasas el alias para transferir?`;

          const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
            message
          )}`;

          toast.success("¡Orden generada! Redirigiendo a WhatsApp...");

          setTimeout(() => {
            clearCart();
            closeCart();
            window.open(whatsappUrl, "_blank");
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
          {/* Backdrop with translucent blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
          />

          {/* Drawer container (Pure Contextual Glass) */}
          <motion.div
            initial={
              isMobile
                ? { y: "100%", opacity: 0 }
                : { x: "100%", opacity: 0 }
            }
            animate={
              isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }
            }
            exit={
              isMobile
                ? { y: "100%", opacity: 0 }
                : { x: "100%", opacity: 0 }
            }
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            drag={isMobile ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.y > 150 || velocity.y > 500) {
                closeCart();
              }
            }}
            className={cn(
              "fixed z-50 bg-black/65 backdrop-blur-2xl flex flex-col overflow-hidden",
              "border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.9)]",
              isMobile
                ? "bottom-0 left-0 w-full h-[90vh] rounded-t-[2.5rem] border-t"
                : "top-0 right-0 h-full w-[520px] border-l"
            )}
          >
            {/* Mobile Drag Indicator */}
            {isMobile && (
              <div className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 bg-white/20 rounded-full" />
              </div>
            )}

            {/* Header */}
            <div
              className={cn(
                "px-7 pb-6 border-b border-white/10 flex items-center justify-between sticky top-0",
                "bg-black/30 backdrop-blur-xl z-10",
                !isMobile ? "pt-7" : "pt-2"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                  <ShoppingCart className="text-gold-400" size={19} />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-white tracking-tight">
                    Tu Selección
                  </h2>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                    {items.length} {items.length === 1 ? "ítem" : "ítems"}
                  </span>
                </div>
              </div>

              <button
                onClick={closeCart}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Cerrar carrito"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-7 flex-grow overflow-y-auto space-y-6 custom-scrollbar">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 mt-24">
                  <div className="w-20 h-20 rounded-full glass-subtle border border-white/5 flex items-center justify-center">
                    <ShoppingCart size={36} className="text-gold-500/30" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-display text-white mb-1">
                      Tu selección está vacía
                    </p>
                    <p className="text-sm text-slate-400 font-light">
                      Explorá el catálogo para sumar una experiencia
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {items.map((item) => {
                    const isSorteo = item.type?.toLowerCase() === "sorteo";
                    const isCaja = item.type?.toLowerCase() === "caja";
                    const totalBottles = (item.wine_quantity || 0) * item.guests;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        className={cn(
                          "rounded-2xl p-5 flex flex-col gap-4 relative",
                          "glass-subtle border border-white/5 hover:border-gold-500/25",
                          "transition-all duration-300"
                        )}
                      >
                        {/* Remove button */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="absolute top-4 right-4 text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                          aria-label="Eliminar ítem"
                        >
                          <Trash2 size={16} />
                        </button>

                        {/* Title and metadata */}
                        <div className="flex gap-3.5 pr-8">
                          <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center shrink-0">
                            {isCaja ? (
                              <Package className="text-gold-400" size={22} />
                            ) : (
                              <CalendarDays className="text-gold-400" size={22} />
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] text-gold-400 uppercase tracking-widest font-bold">
                              {item.type}
                            </span>
                            <h3 className="font-display text-lg text-white leading-snug">
                              {item.title}
                            </h3>
                            {item.eventDate && !isCaja && (
                              <p className="text-[11px] text-slate-400 font-light mt-0.5">
                                {new Date(item.eventDate).toLocaleDateString(
                                  "es-AR",
                                  {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                  }
                                )}{" "}
                                •{" "}
                                {new Date(item.eventDate).toLocaleTimeString(
                                  "es-AR",
                                  { hour: "2-digit", minute: "2-digit" }
                                )}
                                hs
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Stepper & Price */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          {isSorteo ? (
                            <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400 bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/20">
                              1 participación
                            </span>
                          ) : (
                            <div className="flex items-center gap-2 bg-[#0c0a09]/80 rounded-full border border-white/10 p-1">
                              <button
                                onClick={() =>
                                  item.guests > 1 &&
                                  updateItemGuests(item.id, item.guests - 1)
                                }
                                className="w-7 h-7 rounded-full text-slate-300 hover:text-white flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
                              >
                                <Minus size={13} />
                              </button>
                              <div className="flex items-center gap-1 px-1.5">
                                <span className="text-xs font-bold text-white min-w-[1ch] text-center">
                                  {item.guests}
                                </span>
                                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-medium">
                                  {isCaja ? "cajas" : "pers."}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  const remaining =
                                    availabilityMap[item.experienceId] ?? 999;
                                  if (item.guests < remaining) {
                                    updateItemGuests(item.id, item.guests + 1);
                                  } else {
                                    toast.error(
                                      `Lo sentimos, solo quedan ${remaining} lugares.`
                                    );
                                  }
                                }}
                                disabled={
                                  item.guests >=
                                  (availabilityMap[item.experienceId] ?? 999)
                                }
                                className="w-7 h-7 rounded-full text-slate-300 hover:text-white flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                          )}

                          <span className="text-lg font-display text-white font-medium">
                            ${(item.price * item.guests).toLocaleString("es-AR")}
                          </span>
                        </div>

                        {/* Wine Selection for Cajas */}
                        {isCaja &&
                          item.wine_options &&
                          item.wine_options.length > 0 && (
                            <div className="space-y-3 pt-3 border-t border-white/5 bg-black/20 -mx-5 px-5 pb-4">
                              <label className="text-[10px] text-gold-400 uppercase font-bold tracking-widest flex items-center gap-1.5">
                                <Wine size={13} className="text-gold-400" />
                                <span>
                                  Elegí tus vinos ({item.selected_wines?.length || 0}/
                                  {totalBottles}):
                                </span>
                              </label>
                              <div className="grid grid-cols-1 gap-2.5">
                                {Array.from({ length: totalBottles }).map(
                                  (_, idx) => (
                                    <select
                                      key={idx}
                                      value={item.selected_wines?.[idx] || ""}
                                      onChange={(e) => {
                                        const newWines = [
                                          ...(item.selected_wines || []),
                                        ];
                                        newWines[idx] = e.target.value;
                                        updateItemWines(item.id, newWines);
                                      }}
                                      className="w-full bg-black/50 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-400/50 transition-all cursor-pointer"
                                    >
                                      <option value="" disabled>
                                        Seleccionar vino {idx + 1}...
                                      </option>
                                      {item.wine_options?.map((opt, oIdx) => (
                                        <option key={oIdx} value={opt} className="bg-stone-900 text-white">
                                          {opt}
                                        </option>
                                      ))}
                                    </select>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Addons for Cajas */}
                        {isCaja &&
                          ((item.addon_picada_price || 0) > 0 ||
                            (item.addon_copas_price || 0) > 0) && (
                            <div className="space-y-3 pt-3 border-t border-white/10 bg-white/[0.02] -mx-5 px-5 pb-4">
                              <label className="text-[10px] text-burgundy-400 uppercase font-bold tracking-widest flex items-center gap-1.5">
                                <Sparkles size={13} className="text-burgundy-400" />
                                <span>Acompañá tu caja:</span>
                              </label>
                              <div className="space-y-2.5">
                                {(item.addon_picada_price || 0) > 0 && (
                                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                                    <div className="flex items-center gap-2">
                                      <UtensilsCrossed size={14} className="text-gold-400/80" />
                                      <div className="flex flex-col">
                                        <span className="text-xs text-slate-200">
                                          Sumar Picada
                                        </span>
                                        <span className="text-[10px] text-gold-400 font-medium">
                                          +$
                                          {(
                                            item.addon_picada_price || 0
                                          ).toLocaleString("es-AR")}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/5 rounded-full border border-white/10 p-1">
                                      <button
                                        onClick={() =>
                                          updateItemPicada(
                                            item.id,
                                            (item.addon_picada_qty || 0) - 1
                                          )
                                        }
                                        className="w-6 h-6 rounded-full text-slate-300 hover:text-white flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
                                      >
                                        <Minus size={11} />
                                      </button>
                                      <span className="text-xs font-bold text-white min-w-[1ch] text-center">
                                        {item.addon_picada_qty || 0}
                                      </span>
                                      <button
                                        onClick={() =>
                                          updateItemPicada(
                                            item.id,
                                            (item.addon_picada_qty || 0) + 1
                                          )
                                        }
                                        className="w-6 h-6 rounded-full text-slate-300 hover:text-white flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
                                      >
                                        <Plus size={11} />
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {(item.addon_copas_price || 0) > 0 && (
                                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                                    <div className="flex items-center gap-2">
                                      <GlassWater size={14} className="text-gold-400/80" />
                                      <div className="flex flex-col">
                                        <span className="text-xs text-slate-200">
                                          Sumar Copas
                                        </span>
                                        <span className="text-[10px] text-gold-400 font-medium">
                                          +$
                                          {(
                                            item.addon_copas_price || 0
                                          ).toLocaleString("es-AR")}{" "}
                                          c/u
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/5 rounded-full border border-white/10 p-1">
                                      <button
                                        onClick={() =>
                                          updateItemCopas(
                                            item.id,
                                            (item.addon_copas_qty || 0) - 1
                                          )
                                        }
                                        className="w-6 h-6 rounded-full text-slate-300 hover:text-white flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
                                      >
                                        <Minus size={11} />
                                      </button>
                                      <span className="text-xs font-bold text-white min-w-[1ch] text-center">
                                        {item.addon_copas_qty || 0}
                                      </span>
                                      <button
                                        onClick={() =>
                                          updateItemCopas(
                                            item.id,
                                            (item.addon_copas_qty || 0) + 1
                                          )
                                        }
                                        className="w-6 h-6 rounded-full text-slate-300 hover:text-white flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
                                      >
                                        <Plus size={11} />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                      </motion.div>
                    );
                  })}

                  {/* Summary & Checkout Section */}
                  <div className="pt-6 border-t border-white/10 space-y-6 pb-20">
                    {checkingAuth ? (
                      <div className="flex justify-center p-6">
                        <Loader2 className="animate-spin text-gold-400" />
                      </div>
                    ) : (
                      <>
                        {/* Upsell Banner (Non-members) */}
                        {!user && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative overflow-hidden p-6 rounded-3xl border border-gold-500/30 bg-gradient-to-br from-gold-500/10 via-black/30 to-transparent backdrop-blur-xl shadow-[0_0_40px_rgba(182,154,104,0.08)]"
                          >
                            <div className="relative z-10 flex flex-col gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center shrink-0">
                                  <ShieldCheck className="text-gold-400" size={20} />
                                </div>
                                <div>
                                  <h4 className="text-white font-display text-base leading-tight">
                                    ¿Sos socio MUNIV?
                                  </h4>
                                  <span className="text-[10px] text-gold-400 font-bold uppercase tracking-widest">
                                    Beneficio Exclusivo
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-[#e8e0d5]/85 leading-relaxed font-light">
                                Registrate ahora para acceder a un{" "}
                                <strong className="text-gold-400 font-semibold">
                                  {benefit?.percentage || 20}% de descuento
                                </strong>{" "}
                                en esta compra y ahorrar hasta{" "}
                                <strong className="text-white font-semibold">
                                  $
                                  {(benefit?.cap || 5000).toLocaleString(
                                    "es-AR"
                                  )}
                                </strong>
                                .
                              </p>
                              <Link
                                href="/login"
                                onClick={closeCart}
                                className="w-full text-[10px] uppercase tracking-[0.25em] bg-gold-500 text-stone-950 font-bold py-3.5 px-6 rounded-xl text-center hover:bg-gold-400 transition-all active:scale-[0.98] shadow-lg mt-1"
                              >
                                Ingresar / Acceder beneficio
                              </Link>
                            </div>
                          </motion.div>
                        )}

                        {/* Financial Summary Card (Pure Contextual Glass) */}
                        <div className="bg-white/[0.04] backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl space-y-3.5">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400 uppercase text-xs tracking-wider font-medium">
                              Subtotal
                            </span>
                            <span
                              className={
                                user && discountAmount > 0
                                  ? "line-through text-slate-500 text-sm"
                                  : "text-white font-display text-base"
                              }
                            >
                              ${subtotal.toLocaleString("es-AR")}
                            </span>
                          </div>

                          {temporalDiscountAmount > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-amber-300 text-xs uppercase font-bold tracking-wider">
                                Promoción (-
                                {
                                  items.find(
                                    (i) => (i.temp_discount || 0) > 0
                                  )?.temp_discount
                                }
                                %)
                              </span>
                              <span className="text-amber-300 font-display text-base font-bold">
                                -${temporalDiscountAmount.toLocaleString("es-AR")}
                              </span>
                            </div>
                          )}

                          {user && discountAmount > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-burgundy-400 text-xs uppercase font-bold tracking-wider">
                                Comunidad (-{benefit?.percentage}%)
                                {benefit?.cap &&
                                  discountAmount === benefit.cap && (
                                    <span className="text-[9px] ml-1 opacity-70">
                                      (Tope)
                                    </span>
                                  )}
                              </span>
                              <span className="text-burgundy-400 font-display text-base font-bold">
                                -${discountAmount.toLocaleString("es-AR")}
                              </span>
                            </div>
                          )}

                          <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
                            <span className="text-white font-bold uppercase tracking-[0.2em] text-[11px]">
                              Total Final
                            </span>
                            <span className="text-3xl text-gold-400 font-display italic font-semibold drop-shadow">
                              ${finalPrice.toLocaleString("es-AR")}
                            </span>
                          </div>
                        </div>

                        {/* Guest Form (Unauthenticated) */}
                        {!user && (
                          <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-3">
                              <div className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
                              <h4 className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold">
                                Datos del Comprador
                              </h4>
                              <div className="flex-grow h-px bg-white/10" />
                            </div>

                            <div className="grid grid-cols-1 gap-3.5 p-5 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl">
                              <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                                  Nombre Completo
                                </label>
                                <input
                                  type="text"
                                  placeholder="Ej: Juan Pérez"
                                  value={guestName}
                                  onChange={(e) => setGuestName(e.target.value)}
                                  className="w-full bg-white/[0.05] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400/50 transition-all placeholder:text-slate-500 font-light"
                                  required
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                                  Email de Contacto
                                </label>
                                <input
                                  type="email"
                                  placeholder="juan@ejemplo.com"
                                  value={guestEmail}
                                  onChange={(e) => setGuestEmail(e.target.value)}
                                  className="w-full bg-white/[0.05] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400/50 transition-all placeholder:text-slate-500 font-light"
                                  required
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                                  WhatsApp
                                </label>
                                <input
                                  type="tel"
                                  placeholder="54 9 11 ..."
                                  value={guestPhone}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "");
                                    setGuestPhone(val);
                                  }}
                                  className="w-full bg-white/[0.05] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400/50 transition-all placeholder:text-slate-500 font-light"
                                  required
                                />
                                <p className="text-[9px] text-slate-400 font-light mt-0.5">
                                  Para confirmar voucher y coordinar entrega.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Error Notice */}
                        {globalError && (
                          <div className="p-4 border border-red-500/30 bg-red-500/10 text-red-200 rounded-2xl text-xs flex gap-3 items-center">
                            <AlertCircle size={17} className="text-red-400 shrink-0" />
                            <span>{globalError}</span>
                          </div>
                        )}

                        {/* WhatsApp Checkout CTA */}
                        <button
                          onClick={handleCheckout}
                          disabled={isPending}
                          className={cn(
                            "w-full py-4 px-6 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs",
                            "bg-emerald-600 hover:bg-emerald-500 text-white",
                            "flex items-center justify-center gap-2.5",
                            "shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)]",
                            "transition-all duration-300 active:scale-[0.98] cursor-pointer disabled:opacity-50"
                          )}
                        >
                          {isPending ? (
                            <>
                              <span>Procesando</span>
                              <Loader2 size={16} className="animate-spin" />
                            </>
                          ) : (
                            <>
                              <span>
                                {items.some(
                                  (i) => i.type?.toLowerCase() === "sorteo"
                                )
                                  ? "Participar en Sorteo"
                                  : "Finalizar por WhatsApp"}
                              </span>
                              <MessageCircle size={18} />
                            </>
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

"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getActiveExperiences,
  getExperienceAvailability,
  type Experience,
} from "@/actions/experiences";
import { useCartStore } from "@/store/useCartStore";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { submitBooking } from "@/actions/booking";
import { Skeleton } from "@/components/ui/Skeleton";
import { BottleBentoCard } from "@/components/catalog/BottleBentoCard";
import { ExperienceDetailModal } from "@/components/catalog/ExperienceDetailModal";

export default function ExperienceList() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [availability, setAvailability] = useState<
    Record<string, { remaining: number }>
  >({});
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);

  const { addItem, openCart } = useCartStore();
  const router = useRouter();

  // Map transparent bottle assets provided by the user
  const getBottleAsset = (exp: Experience, index: number) => {
    // If the experience has a caja or bottle, alternate the user's transparent PNG assets
    return index % 2 === 0 ? "/botella-1.png" : "/botella-2.png";
  };

  const executeBookingFlow = async (
    exp: Experience,
    options?: {
      picadaQty?: number;
      copasQty?: number;
      selectedWines?: string[];
    }
  ) => {
    // SECURITY: Raffle Gatekeeping
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (exp.type?.toLowerCase() === "sorteo") {
      if (!session) {
        toast.error("¡Evento exclusivo!", {
          description:
            "Para participar de los sorteos tenés que ser miembro. ¡Registrate ahora!",
          icon: <ShieldCheck className="text-gold-400" size={20} />,
        });
        return;
      }

      // SORTEO: Bypasses cart entirely and submits participation directly
      setProcessingId(exp.id);
      startTransition(async () => {
        const res = await submitBooking({
          experienceId: exp.id,
          experienceTitle: exp.title,
          date: exp.event_date
            ? exp.event_date.split("T")[0]
            : new Date().toISOString().split("T")[0],
          time: exp.event_date
            ? new Date(exp.event_date).toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : "00:00",
          guests: 1,
          upSells: [],
          final_price: 0,
        });

        if (res.success) {
          toast.success("¡Participación Confirmada!", {
            description: `Ya estás participando en el sorteo de ${exp.title}. ¡Mucha suerte!`,
            icon: <CheckCircle2 className="text-emerald-400" size={20} />,
          });
        } else {
          toast.error("Atención", {
            description: res.message || "Error al participar del sorteo.",
          });
        }
        setProcessingId(null);
      });

      return;
    }

    // Normal Cart Flow for Cajas and Eventos
    if (!session && exp.type?.toLowerCase() !== "sorteo") {
      toast("¡Te estás perdiendo de un descuento!", {
        description:
          "Como miembro de Muniv adquirís precios especiales y múltiples beneficios.",
        action: { label: "Crear cuenta", onClick: () => router.push("/login") },
        icon: <ShieldCheck className="text-gold-400" size={20} />,
      });
    }

    addItem({
      experienceId: exp.id,
      type: exp.type,
      title: exp.title,
      price: exp.price,
      status: exp.status,
      eventDate: exp.event_date,
      guests: 1,
      upSells: [],
      temp_discount: exp.temp_discount || (exp as any).temporal_discount || 0,
      wine_quantity: (exp as any).wine_quantity,
      wine_options: (exp as any).wine_options,
      addon_picada_price: exp.addon_picada_price || 0,
      addon_copas_price: exp.addon_copas_price || 0,
      addon_picada_qty: options?.picadaQty || 0,
      addon_copas_qty: options?.copasQty || 0,
      selected_wines: options?.selectedWines || [],
    });

    openCart();
  };

  const handleQuickBuy = (exp: Experience, e: React.MouseEvent) => {
    e.stopPropagation();
    executeBookingFlow(exp);
  };

  const handleModalConfirm = (
    exp: Experience,
    options: {
      picadaQty: number;
      copasQty: number;
      selectedWines: string[];
    }
  ) => {
    setSelectedExp(null);
    executeBookingFlow(exp, options);
  };

  useEffect(() => {
    getActiveExperiences().then(async (data: Experience[]) => {
      setExperiences(data);

      // Fetch availability for each
      const availMap: Record<string, { remaining: number }> = {};
      for (const exp of data) {
        if (exp.max_capacity && exp.max_capacity > 0) {
          const res = await getExperienceAvailability(exp.id);
          availMap[exp.id] = { remaining: res.remaining };
        } else {
          availMap[exp.id] = { remaining: 999 };
        }
      }
      setAvailability(availMap);
      setLoading(false);
    });
  }, []);

  // Premium Shimmer Loading State
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 py-6">
        <div className="md:col-span-2 md:row-span-2 h-[480px] rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 flex flex-col justify-between">
          <Skeleton variant="card" className="w-full h-64 rounded-2xl" />
          <div className="space-y-3">
            <Skeleton variant="text" lines={2} />
            <div className="flex justify-between items-center pt-2">
              <Skeleton variant="button" className="w-24 h-6" />
              <Skeleton variant="button" className="w-32 h-10 rounded-full" />
            </div>
          </div>
        </div>
        <div className="md:col-span-1 md:row-span-1 h-[280px] rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-5 space-y-3">
          <Skeleton variant="card" className="w-full h-32 rounded-xl" />
          <Skeleton variant="text" lines={1} />
        </div>
        <div className="md:col-span-1 md:row-span-1 h-[280px] rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-5 space-y-3">
          <Skeleton variant="card" className="w-full h-32 rounded-xl" />
          <Skeleton variant="text" lines={1} />
        </div>
      </div>
    );
  }

  const selectedIndex = selectedExp
    ? experiences.findIndex((e) => e.id === selectedExp.id)
    : 0;

  return (
    <>
      {/* 2.5D Bento Grid with Floating Bottles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-4">
        {experiences.map((exp, index) => {
          const isSoldOut = availability[exp.id]?.remaining <= 0;
          const isComingSoon = exp.status === "COMING_SOON";
          const tempDiscount =
            exp.temp_discount || (exp as any).temporal_discount || 0;
          const bottleAsset = getBottleAsset(exp, index);

          return (
            <BottleBentoCard
              key={exp.id}
              exp={exp}
              index={index}
              isSoldOut={isSoldOut}
              isComingSoon={isComingSoon}
              tempDiscount={tempDiscount}
              bottleAsset={bottleAsset}
              onSelect={(selected) => setSelectedExp(selected)}
              onQuickBuy={handleQuickBuy}
              isProcessing={processingId === exp.id}
            />
          );
        })}
      </div>

      {/* 2.5D FLIP Bottle Detail Modal */}
      <ExperienceDetailModal
        exp={selectedExp}
        bottleAsset={
          selectedExp ? getBottleAsset(selectedExp, selectedIndex) : "/botella-1.png"
        }
        onClose={() => setSelectedExp(null)}
        onConfirm={handleModalConfirm}
        isProcessing={processingId === selectedExp?.id}
        remainingCapacity={
          selectedExp ? availability[selectedExp.id]?.remaining ?? 999 : 999
        }
      />
    </>
  );
}

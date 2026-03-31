import { getAdminReport, checkIsAdmin } from "@/actions/admin";
import OrderManager from "./OrderManager";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";

export const metadata = {
  title: "MUNIV | Gestión de Órdenes 🍷",
  description: "Panel de administración para el despacho de experiencias.",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) redirect("/login");

  // Format filters for the action
  const filters = {
    date_range: (searchParams.date_range as string) || "ALL",
    status: (searchParams.status as string) || "ALL",
    type: (searchParams.type as string) || "ALL",
  };

  const orders = await getAdminReport(filters);

  return (
    <div className="min-h-screen bg-[#0c0a09] px-6 lg:px-12 py-12">
       <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-4">
             <div className="w-1.5 h-6 bg-gold-500 rounded-full" />
             <h4 className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-black">Módulo OMS</h4>
           </div>
           <h1 className="font-display text-5xl text-white tracking-tight">Órdenes Activas</h1>
           <p className="text-slate-400 font-light mt-3 max-w-lg text-sm leading-relaxed italic">
             Gestión centralizada para el despacho de cajas, coordinación de eventos y seguimiento de sorteos.
           </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/30 px-6 py-4 rounded-3xl border border-white/5 backdrop-blur-md">
           <Package className="text-gold-500/80" size={24} />
           <div className="flex flex-col">
              <span className="text-2xl font-display text-white">{orders.length}</span>
              <span className="text-[8px] uppercase tracking-widest text-slate-500 font-black">Órdenes Totales</span>
           </div>
        </div>
      </div>

      <OrderManager orders={orders} />
    </div>
  );
}

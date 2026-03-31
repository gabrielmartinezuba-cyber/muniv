"use client";

import { useTransition, useState } from "react";
import { motion } from "framer-motion";
import { AdminReportRow, updateBookingStatus } from "@/actions/admin";
import { toast } from "sonner";
import { Package, User, Calendar, Tag, Filter, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface OrderManagerProps {
  orders: AdminReportRow[];
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  'PENDIENTE': { label: 'Pendiente', bg: 'bg-slate-500/10', text: 'text-slate-400', icon: Clock },
  'CONFIRMADO': { label: 'Confirmado', bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: CheckCircle2 },
  'EN_PREPARACION': { label: 'En preparación', bg: 'bg-gold-500/10', text: 'text-gold-500', icon: Package },
  'ENTREGADO': { label: 'Entregado', bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: CheckCircle2 },
  'CANCELADO': { label: 'Cancelado', bg: 'bg-red-500/10', text: 'text-red-500', icon: XCircle },
};

export default function OrderManager({ orders }: OrderManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState({
    date_range: 'ALL',
    status: 'ALL',
    type: 'ALL',
  });
  const [onlyCancelRequests, setOnlyCancelRequests] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    startTransition(async () => {
      const res = await updateBookingStatus(bookingId, newStatus);
      if (res.success) {
        toast.success("Estado actualizado con éxito");
      } else {
        toast.error(res.error || "Error al actualizar estado");
      }
    });
  };

  const filteredOrders = orders.filter(order => {
    // 0. Quick filter: only cancel requests (excluding already cancelled)
    if (onlyCancelRequests && !(order.cancel_requested && order.status !== 'CANCELADO')) return false;

    // 1. Filter by Status
    if (filters.status !== 'ALL' && order.status !== filters.status) return false;

    // 2. Filter by Type
    if (filters.type !== 'ALL' && order.experience_type?.trim().toUpperCase() !== filters.type) return false;

    // 3. Filter by Date Range
    if (filters.date_range !== 'ALL') {
      const orderDate = new Date(order.created_at);
      const now = new Date();

      if (filters.date_range === 'HOY') {
        if (orderDate.toDateString() !== now.toDateString()) return false;
      } else if (filters.date_range === 'SEMANA') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        if (orderDate < sevenDaysAgo) return false;
      } else if (filters.date_range === 'MES') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setMonth(now.getMonth() - 1);
        if (orderDate < thirtyDaysAgo) return false;
      }
    }

    return true;
  });

  const cancelRequestCount = orders.filter(o => o.cancel_requested && o.status !== 'CANCELADO').length;

  return (
    <div className="space-y-8 pb-20">
      {/* Header Filters */}
      <div className="flex flex-col gap-4 bg-slate-900/40 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center border border-gold-500/20">
              <Filter className="text-gold-500" size={18} />
            </div>
            <div>
              <h2 className="text-white font-display text-xl leading-tight">Gestión de Despachos</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-1">Órdenes de Catálogo</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] uppercase tracking-widest text-slate-500 font-bold ml-1">Periodo</label>
              <select
                value={filters.date_range}
                onChange={(e) => handleFilterChange('date_range', e.target.value)}
                className="bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500/50 transition-all cursor-pointer min-w-[120px]"
              >
                <option className="bg-slate-950 text-slate-100" value="ALL">Todas las fechas</option>
                <option className="bg-slate-950 text-slate-100" value="HOY">Hoy</option>
                <option className="bg-slate-950 text-slate-100" value="SEMANA">Esta semana</option>
                <option className="bg-slate-950 text-slate-100" value="MES">Este mes</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] uppercase tracking-widest text-slate-500 font-bold ml-1">Estado</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500/50 transition-all cursor-pointer min-w-[140px]"
              >
                <option className="bg-slate-950 text-slate-100" value="ALL">Todos los estados</option>
                <option className="bg-slate-950 text-slate-100" value="PENDIENTE">Pendientes</option>
                <option className="bg-slate-950 text-slate-100" value="CONFIRMADO">Confirmados</option>
                <option className="bg-slate-950 text-slate-100" value="EN_PREPARACION">En preparación</option>
                <option className="bg-slate-950 text-slate-100" value="ENTREGADO">Entregados</option>
                <option className="bg-slate-950 text-slate-100" value="CANCELADO">Cancelados</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] uppercase tracking-widest text-slate-500 font-bold ml-1">Tipo</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500/50 transition-all cursor-pointer min-w-[120px]"
              >
                <option className="bg-slate-950 text-slate-100" value="ALL">Todos los tipos</option>
                <option className="bg-slate-950 text-slate-100" value="CAJA">Cajas</option>
                <option className="bg-slate-950 text-slate-100" value="EVENTO">Eventos</option>
                <option className="bg-slate-950 text-slate-100" value="SORTEO">Sorteos</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Quick Filter: Solicitudes de Cancelación ── */}
        <div className="border-t border-white/5 pt-4 flex items-center gap-4">
          <button
            onClick={() => setOnlyCancelRequests(prev => !prev)}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
              onlyCancelRequests
                ? 'bg-rose-500/20 border-rose-500/50 text-white shadow-[0_0_25px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/20'
                : 'bg-slate-900/50 border-white/10 text-slate-400 hover:border-rose-500/40 hover:text-rose-400 hover:bg-rose-500/5'
            }`}
          >
            <AlertTriangle size={14} className={onlyCancelRequests ? 'text-rose-100 animate-pulse' : 'text-slate-500'} />
            Ver solicitudes de cancelación {cancelRequestCount > 0 ? `(${cancelRequestCount})` : ''}
          </button>
          {onlyCancelRequests && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] text-rose-500/50 font-bold uppercase tracking-widest italic"
            >
              • Filtrado activo
            </motion.span>
          )}
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full py-20 bg-slate-900/40 rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 gap-4">
            <Package size={48} className="opacity-20" />
            <p className="font-display text-lg">No se encontraron órdenes activos con estos filtros.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG['PENDIENTE'];
            const StatusIcon = statusInfo.icon;
            const isCaja = order.experience_type?.trim().toLowerCase() === 'caja';
            const hasCancelRequest = order.cancel_requested === true;

            return (
              <motion.div
                key={order.id}
                layout
                className={`group relative bg-slate-950/40 border rounded-[2rem] p-6 hover:bg-slate-900/60 transition-all duration-500 overflow-hidden shadow-2xl ${
                  hasCancelRequest && order.status !== 'CANCELADO'
                    ? 'border-rose-800/60 shadow-[0_0_25px_rgba(220,38,38,0.12)]'
                    : 'border-white/5'
                }`}
              >
                {/* ── Alerta de Cancelación ── */}
                {hasCancelRequest && order.status !== 'CANCELADO' && (
                  <div className="mb-5 p-4 rounded-2xl bg-rose-950/50 border border-rose-700/40 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-rose-400">
                      <AlertTriangle size={16} className="shrink-0" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                        🚨 Solicitud de Cancelación
                      </span>
                    </div>
                    {order.cancel_reason && (
                      <p className="text-[11px] text-rose-200/80 font-light leading-relaxed pl-6 italic">
                        "{order.cancel_reason}"
                      </p>
                    )}
                    <p className="text-[9px] text-rose-500/60 uppercase tracking-widest font-bold pl-6">
                      Contactar al cliente para coordinar devolución
                    </p>
                  </div>
                )}

                {/* Top Badge: Type */}
                <div className="absolute top-0 right-0 px-6 py-2 bg-white/5 border-l border-b border-white/5 rounded-bl-3xl">
                  <span className="text-[9px] uppercase font-black tracking-[0.2em] text-gold-500/80">{order.experience_type}</span>
                </div>

                {/* User Info */}
                <div className="flex gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-500/20 to-burgundy-900/20 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
                    <User className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-display text-lg group-hover:text-gold-400 transition-colors uppercase tracking-wide">{order.client_name}</h3>
                    <p className="text-[10px] text-slate-500 font-bold tracking-wider">{order.client_email}</p>
                  </div>
                </div>

                {/* Order Specifics */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Calendar size={14} className="text-gold-500/50" />
                    <span className="text-[11px] font-medium">{new Date(order.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Tag size={14} className="text-gold-500/50 mt-1" />
                    <div>
                      <p className="text-sm text-white font-medium">{order.experience_title}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-0.5">{order.guests_count || 1} Unidades adquiridas</p>
                    </div>
                  </div>

                  {/* Wine Selection Display */}
                  {order.selected_wines && order.selected_wines.length > 0 && (
                    <div className="mt-4 p-4 rounded-2xl bg-burgundy-900/10 border border-burgundy-500/10">
                      <p className="text-[9px] text-burgundy-400 font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        Variedades Seleccionadas
                      </p>
                      <p className="text-xs text-slate-300 font-light italic leading-relaxed">
                        {order.selected_wines.join(' • ')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="pt-6 border-t border-white/5 flex items-center justify-between gap-4">
                  <div className={`px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2 ${statusInfo.bg}`}>
                    <StatusIcon size={14} className={statusInfo.text} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${statusInfo.text}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="flex-1 max-w-[160px]">
                    <select
                      value={order.status}
                      disabled={isPending}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={cn(
                        "w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-[10px] uppercase font-black tracking-widest focus:outline-none transition-all cursor-pointer",
                        order.status === 'PENDIENTE' ? 'text-slate-400 border-slate-500/20' :
                        (order.status === 'EN_PREPARACION' || order.status === 'CONFIRMADO') ? 'text-gold-500 border-gold-500/40 bg-gold-500/5' :
                        order.status === 'ENTREGADO' ? 'text-emerald-500 border-emerald-500/40 bg-emerald-500/5' :
                        'text-red-500 border-red-500/40 bg-red-500/5'
                      )}
                    >
                      <option className="bg-slate-950 text-slate-100" value="PENDIENTE">PENDIENTE</option>

                      {isCaja ? (
                        <>
                          <option className="bg-slate-950 text-slate-100" value="EN_PREPARACION">EN PREPARACIÓN</option>
                          <option className="bg-slate-950 text-slate-100" value="ENTREGADO">ENTREGADO</option>
                        </>
                      ) : (
                        <option className="bg-slate-950 text-slate-100" value="CONFIRMADO">CONFIRMADO</option>
                      )}

                      <option className="bg-slate-950 text-slate-100" value="CANCELADO">CANCELADO</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

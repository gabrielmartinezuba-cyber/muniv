"use client";

import { useTransition, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminReportRow, updateBookingStatus, dismissCancellation, confirmCancellation } from "@/actions/admin";
import { toast } from "sonner";
import { Package, User, Calendar, Tag, Filter, Clock, CheckCircle2, XCircle, AlertTriangle, ChevronDown, MessageCircle, AlertCircle, Trash2, RefreshCcw, Gift, PartyPopper } from "lucide-react";

interface OrderManagerProps {
  orders: AdminReportRow[];
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  'PENDIENTE': { label: 'Pendiente', bg: 'bg-slate-500/10', text: 'text-slate-400', icon: Clock },
  'PAGADO': { label: 'Pagado', bg: 'bg-sky-500/10', text: 'text-sky-500', icon: CheckCircle2 },
  'CONFIRMADO': { label: 'Confirmado', bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: CheckCircle2 },
  'EN_PREPARACION': { label: 'En preparación', bg: 'bg-gold-500/10', text: 'text-gold-500', icon: Package },
  'ENTREGADO': { label: 'Entregado', bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: CheckCircle2 },
  'CANCELADO': { label: 'Cancelado', bg: 'bg-red-500/10', text: 'text-red-500', icon: XCircle },
};

export default function OrderManager({ orders }: OrderManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState({ date_range: 'ALL' });
  const [activeTab, setActiveTab] = useState<'CAJAS' | 'EVENTOS' | 'SORTEOS' | 'CANCELACIONES'>('CAJAS');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const toggleOrder = (id: string) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

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

  const handleDismissCancel = (bookingId: string) => {
    startTransition(async () => {
      const res = await dismissCancellation(bookingId);
      if (res.success) toast.success("Cancelación desestimada");
      else toast.error(res.error || "Error");
    });
  };

  const handleConfirmCancel = (bookingId: string) => {
    startTransition(async () => {
      const res = await confirmCancellation(bookingId);
      if (res.success) toast.success("Cancelación confirmada y orden cerrada");
      else toast.error(res.error || "Error");
    });
  };

  const filteredOrders = orders.filter(order => {
    // 1. By Type & View
    if (activeTab === 'CANCELACIONES') {
      if (!(order.cancel_requested && order.status !== 'CANCELADO')) return false;
    } else {
      if (order.status === 'CANCELADO') return false; 
      
      const typeStr = order.experience_type?.trim().toLowerCase();
      if (activeTab === 'CAJAS' && typeStr !== 'caja') return false;
      if (activeTab === 'EVENTOS' && typeStr !== 'evento') return false;
      if (activeTab === 'SORTEOS' && typeStr !== 'sorteo') return false;
    }

    // 2. Filter by Date Range
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

  const renderOrderList = (groupOrders: AdminReportRow[]) => {
    if (groupOrders.length === 0) {
       return (
         <div className="w-full py-8 text-center bg-slate-900/20 rounded-2xl border border-dashed border-white/5 text-slate-500 font-display text-sm">
           No hay órdenes en este estado.
         </div>
       );
    }

    return (
      <div className="flex flex-col gap-3">
        {groupOrders.map((order) => {
          const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG['PENDIENTE'];
          const StatusIcon = statusInfo.icon;
          const isCaja = order.experience_type?.trim().toLowerCase() === 'caja';
          const hasCancelRequest = order.cancel_requested === true;
          const isExpanded = expandedOrderId === order.id;

          return (
            <motion.div
              layout
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`group relative bg-slate-950/40 border rounded-3xl overflow-hidden transition-colors duration-500 ${
                hasCancelRequest && order.status !== 'CANCELADO'
                  ? 'border-rose-800/60 shadow-[0_0_20px_rgba(220,38,38,0.1)]'
                  : 'border-white/5 hover:border-white/10'
              }`}
            >
              {/* Collapsed Row Header */}
              <div 
                onClick={() => toggleOrder(order.id)}
                className="w-full p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer select-none relative z-10"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border border-white/10 transition-transform duration-300 group-hover:scale-105 ${
                    activeTab === 'SORTEOS' 
                      ? 'bg-gradient-to-br from-purple-500/20 to-indigo-900/20' 
                      : 'bg-gradient-to-br from-gold-500/20 to-burgundy-900/20'
                  }`}>
                    {activeTab === 'SORTEOS' ? <PartyPopper className="text-white" size={18} /> : <User className="text-white" size={20} />}
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-display text-base md:text-lg truncate tracking-wide">{order.client_name}</h3>
                      {!order.user_id && (
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[8px] text-amber-500 font-black uppercase tracking-tighter">INVITADO</span>
                      )}
                      {hasCancelRequest && order.status !== 'CANCELADO' && (
                        <AlertTriangle size={14} className="text-rose-500 shrink-0 animate-pulse" />
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest">
                      <span className="text-gold-500/80">{order.experience_type || 'Experiencia'}</span>
                      {activeTab !== 'SORTEOS' && (
                        <>
                          <span className="opacity-40">•</span>
                          <span>{new Date(order.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} hs</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 mt-2 sm:mt-0">
                  {/* Status Badge - Hidden in Sorteos since they are just participants */}
                  {activeTab !== 'SORTEOS' && (
                    <div className={`px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2 shrink-0 ${statusInfo.bg}`}>
                      <StatusIcon size={12} className={statusInfo.text} />
                      <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest ${statusInfo.text}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  )}

                  <ChevronDown 
                    size={20} 
                    className={`text-slate-500 transition-transform duration-300 shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </div>
              </div>

              {/* Expanded Content */}
              <div 
                className="grid transition-all duration-300 ease-in-out" 
                style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <div className="p-5 pt-0 border-t border-white/5 mt-2 space-y-6">
                    
                    {!order.user_id && (
                      <div className="p-3 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.1)] mt-4">
                        <AlertCircle size={14} className="shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">⚠️ NO ES USUARIO REGISTRADO</span>
                      </div>
                    )}

                    {hasCancelRequest && order.status !== 'CANCELADO' && (
                      <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/30 flex flex-col gap-2 mt-4">
                        <div className="flex items-center gap-2 text-rose-400 mb-1">
                          <AlertTriangle size={14} />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Solicitud de Cancelación</span>
                        </div>
                        {order.cancel_reason && (
                          <p className="text-[11px] text-rose-200/70 font-light leading-relaxed pl-6 italic max-w-xl">
                            "{order.cancel_reason}"
                          </p>
                        )}
                        <p className="text-[9px] text-rose-500/50 uppercase tracking-widest font-bold pl-6 mt-1">
                          Contactar al cliente para coordinar devolución
                        </p>
                        
                        {activeTab === 'CANCELACIONES' && (
                           <div className="mt-4 flex flex-col sm:flex-row gap-3 pt-4 border-t border-rose-900/30 pl-6">
                             <button
                               onClick={() => handleConfirmCancel(order.id)}
                               disabled={isPending}
                               className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-colors"
                             >
                               <Trash2 size={14} />
                               Confirmar Cancelación
                             </button>
                             <button
                               onClick={() => handleDismissCancel(order.id)}
                               disabled={isPending}
                               className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-colors"
                             >
                               <RefreshCcw size={14} />
                               Desestimar Cancelación
                             </button>
                           </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      {/* Order Details */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1">
                            {activeTab === 'SORTEOS' ? 'Sorteo Participado' : 'Experiencia Adquirida'}
                          </p>
                          <p className="text-sm text-slate-200 font-medium">{order.experience_title}</p>
                          {activeTab !== 'SORTEOS' && (
                             <p className="text-[10px] text-gold-500/70 font-bold tracking-widest mt-1">
                               {order.guests_count || 1} {isCaja ? 'CAJAS' : 'LUGARES'}
                             </p>
                          )}
                        </div>
                        
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1">Email de Contacto</p>
                          <p className="text-xs text-slate-300 font-medium tracking-wide">{order.client_email}</p>
                        </div>

                        {order.selected_wines && order.selected_wines.length > 0 && (
                          <div className="p-3 rounded-xl bg-burgundy-900/10 border border-burgundy-500/10">
                            <p className="text-[9px] text-burgundy-400 font-black uppercase tracking-[0.2em] mb-1">
                              Variedades Seleccionadas
                            </p>
                            <p className="text-xs text-slate-300 font-light italic">
                              {order.selected_wines.join(' • ')}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions & Logistics */}
                      <div className="flex flex-col justify-between space-y-4">
                         
                         {activeTab !== 'SORTEOS' && activeTab !== 'CANCELACIONES' && (
                           <div className="flex-1 flex flex-col gap-3 justify-start">
                             <div className="w-full">
                              <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-2">Estado Logístico</label>
                              <select
                                value={order.status}
                                disabled={isPending}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                className={cn(
                                  "w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-[10px] uppercase font-black tracking-widest focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-all cursor-pointer",
                                  order.status === 'PENDIENTE' ? 'text-slate-400 border-slate-500/20' :
                                  order.status === 'PAGADO' ? 'text-sky-500 border-sky-500/40 bg-sky-500/5' :
                                  (order.status === 'EN_PREPARACION' || order.status === 'CONFIRMADO') ? 'text-gold-500 border-gold-500/40 bg-gold-500/5' :
                                  order.status === 'ENTREGADO' ? 'text-emerald-500 border-emerald-500/40 bg-emerald-500/5' :
                                  'text-red-500 border-red-500/40 bg-red-500/5'
                                )}
                              >
                                <option className="bg-slate-950 text-slate-100" value="PENDIENTE">PENDIENTE</option>
                                <option className="bg-slate-950 text-slate-100" value="PAGADO">PAGADO</option>

                                {isCaja ? (
                                  <>
                                    <option className="bg-slate-950 text-slate-100" value="EN_PREPARACION">EN PREPARACIÓN</option>
                                    <option className="bg-slate-950 text-slate-100" value="ENTREGADO">ENTREGADO</option>
                                  </>
                                ) : (
                                  <option className="bg-slate-950 text-slate-100" value="CONFIRMADO">CONFIRMADO</option>
                                )}
                                
                                {/* Opcional: Permitimos marcar cancelado manually */}
                                <option className="bg-red-950/50 text-red-400" value="CANCELADO">CANCELADO</option>
                              </select>
                            </div>
                           </div>
                         )}

                        {/* WhatsApp Action directly to link */}
                        <div className={`pt-4 border-white/5 flex gap-3 items-center ${activeTab !== 'SORTEOS' && activeTab !== 'CANCELACIONES' ? 'border-t' : ''}`}>
                          {order.client_phone ? (
                             <a 
                               href={`https://wa.me/${order.client_phone.replace(/\D/g, '')}`} 
                               target="_blank" 
                               rel="noreferrer"
                               className="flex-1 flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] px-4 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden"
                             >
                               <MessageCircle size={16} className="relative z-10" />
                               <span className="text-[10px] uppercase tracking-widest font-black relative z-10">Contactar Cliente</span>
                             </a>
                          ) : (
                             <div className="flex-1 flex items-center justify-center gap-2 bg-slate-900/50 border border-slate-800 text-slate-500 px-4 py-3 rounded-xl cursor-not-allowed">
                               <MessageCircle size={16} />
                               <span className="text-[10px] uppercase tracking-widest font-black">Sin Teléfono</span>
                             </div>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderCurrentTab = () => {
    if (activeTab === 'CAJAS') {
      return (
        <div className="space-y-12">
          <div>
            <h3 className="text-gold-500/80 font-display text-xl mb-4 flex items-center gap-3"><Clock size={20} /> Pendientes</h3>
            {renderOrderList(filteredOrders.filter(o => o.status === 'PENDIENTE'))}
          </div>
          <div>
            <h3 className="text-sky-500/80 font-display text-xl mb-4 flex items-center gap-3"><CheckCircle2 size={20} /> Pagadas</h3>
            {renderOrderList(filteredOrders.filter(o => o.status === 'PAGADO'))}
          </div>
          <div>
            <h3 className="text-orange-400 font-display text-xl mb-4 flex items-center gap-3"><Package size={20} /> En Preparación</h3>
            {renderOrderList(filteredOrders.filter(o => o.status === 'EN_PREPARACION'))}
          </div>
          <div>
            <h3 className="text-emerald-500/80 font-display text-xl mb-4 flex items-center gap-3"><Gift size={20} /> Entregadas</h3>
            {renderOrderList(filteredOrders.filter(o => o.status === 'ENTREGADO'))}
          </div>
        </div>
      );
    }
    if (activeTab === 'EVENTOS') {
      return (
        <div className="space-y-12">
          <div>
            <h3 className="text-gold-500/80 font-display text-xl mb-4 flex items-center gap-3"><Clock size={20} /> Pendientes</h3>
            {renderOrderList(filteredOrders.filter(o => o.status === 'PENDIENTE'))}
          </div>
          <div>
            <h3 className="text-sky-500/80 font-display text-xl mb-4 flex items-center gap-3"><CheckCircle2 size={20} /> Pagadas</h3>
            {renderOrderList(filteredOrders.filter(o => o.status === 'PAGADO'))}
          </div>
          <div>
            <h3 className="text-emerald-500/80 font-display text-xl mb-4 flex items-center gap-3"><Calendar size={20} /> Confirmadas</h3>
            {renderOrderList(filteredOrders.filter(o => o.status === 'CONFIRMADO'))}
          </div>
        </div>
      );
    }
    if (activeTab === 'SORTEOS') {
      return (
        <div className="space-y-12">
          <div>
            <h3 className="text-purple-400 font-display text-xl mb-4 flex items-center gap-3"><PartyPopper size={20} /> Participantes</h3>
            {renderOrderList(filteredOrders)}
          </div>
        </div>
      );
    }
    if (activeTab === 'CANCELACIONES') {
      return (
        <div className="space-y-12">
          <div>
            <h3 className="text-rose-500 font-display text-xl mb-4 flex items-center gap-3"><AlertTriangle size={20} /> Solicitudes Pendientes</h3>
            {renderOrderList(filteredOrders)}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* ── Main Navigation Tabs ── */}
      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 pb-4 px-2">
        <button
          onClick={() => { setActiveTab('CAJAS'); setExpandedOrderId(null); }}
          className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl transition-all duration-300 ${activeTab === 'CAJAS' ? 'bg-gold-500 text-slate-950 shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-slate-900/50 text-slate-400 border border-white/5 hover:bg-slate-800'}`}
        >
          <Package size={15} /> Cajas
        </button>
        <button
          onClick={() => { setActiveTab('EVENTOS'); setExpandedOrderId(null); }}
          className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl transition-all duration-300 ${activeTab === 'EVENTOS' ? 'bg-gold-500 text-slate-950 shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-slate-900/50 text-slate-400 border border-white/5 hover:bg-slate-800'}`}
        >
          <Calendar size={15} /> Eventos
        </button>
        <button
          onClick={() => { setActiveTab('SORTEOS'); setExpandedOrderId(null); }}
          className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl transition-all duration-300 ${activeTab === 'SORTEOS' ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-500' : 'bg-slate-900/50 text-slate-400 border border-white/5 hover:bg-slate-800'}`}
        >
          <PartyPopper size={15} /> Sorteos
        </button>
        <button
          onClick={() => { setActiveTab('CANCELACIONES'); setExpandedOrderId(null); }}
          className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl transition-all duration-300 ${activeTab === 'CANCELACIONES' ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)] border border-rose-500' : 'bg-slate-900/50 text-rose-500/70 border border-rose-500/10 hover:bg-rose-500/10 hover:text-rose-500'}`}
        >
          <AlertTriangle size={15} /> Cancelaciones {cancelRequestCount > 0 && `(${cancelRequestCount})`}
        </button>
      </div>

      {/* Header Filters */}
      <div className="flex flex-col gap-4 bg-slate-900/40 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center border border-gold-500/20">
              <Filter className="text-gold-500" size={18} />
            </div>
            <div>
              <h2 className="text-white font-display text-xl leading-tight">Gestión de Órdenes</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-1">
                {activeTab === 'CANCELACIONES' ? 'Revisiones Pendientes' : 'Filtro Rápido'}
              </p>
            </div>
          </div>

          <div className="flex items-end">
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
          </div>
        </div>
      </div>

      {/* Render Current Tab Components */}
      {renderCurrentTab()}
      
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

"use client";

import { useState, useRef, useEffect } from "react";
import { getBenefits, upsertBenefit, deleteBenefit, saveBenefitOrder, getNextBenefitOrder } from "@/actions/benefits";
import { toggleBenefitStatus } from "@/actions/admin";
import { Plus, Loader2, Save, Trash2, Image as ImageIcon, Upload, GripVertical, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Image from "next/image";

// D&D Kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface BenefitItem {
  id: string;
  title: string;
  image_url: string;
  status: string;
}

// Sub-component for Sortable Item
function SortableBenefitCard({ 
  benefit, 
  isSelected, 
  onSelect,
  onToggleStatus
}: { 
  benefit: BenefitItem; 
  isSelected: boolean; 
  onSelect: (id: string) => void;
  onToggleStatus: (id: string, current: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: benefit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.6 : 1,
    touchAction: 'none',
  };

  const isActive = benefit.status === 'ACTIVE';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-2xl overflow-hidden transition-all duration-300 border shadow-lg ${
        isSelected 
          ? "border-burgundy-500 ring-2 ring-burgundy-500/20 scale-[1.02]" 
          : "border-white/10 bg-slate-900/60"
      }`}
    >
      <div className="aspect-video relative overflow-hidden group/img">
        <Image 
          src={benefit.image_url || "/placeholder.jpg"} 
          alt={benefit.title}
          fill
          className="object-cover transition-transform duration-500 group-hover/img:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />
        
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners}
          className="absolute top-2 right-2 p-1.5 bg-slate-950/50 backdrop-blur-md rounded-lg text-white/50 hover:text-burgundy-400 transition-colors cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100"
        >
          <GripVertical size={16} />
        </div>
      </div>
      
      <div className="p-4 bg-slate-900/40 backdrop-blur-md relative border-t border-white/5 space-y-3">
        <h4 className="text-white text-[10px] font-display tracking-widest truncate uppercase italic opacity-90">
          {benefit.title}
        </h4>

        <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/5">
          <button
            onClick={() => onSelect(benefit.id)}
            className="flex-grow py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest text-slate-300 transition-all active:scale-95"
          >
            Editar
          </button>

          <div className="flex items-center gap-2">
             <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-emerald-500' : 'text-slate-600'}`}>
               {isActive ? 'Activo' : 'Draft'}
             </span>
             <button
                onClick={(e) => { e.stopPropagation(); onToggleStatus(benefit.id, benefit.status); }}
                className={`relative w-10 h-5 rounded-full transition-colors duration-300 p-1 ${isActive ? 'bg-emerald-500' : 'bg-slate-700'}`}
             >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-300 ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BenefitManager() {
  const [benefits, setBenefits] = useState<BenefitItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  
  // Image handling
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // DND Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadBenefits = async () => {
    const data = await getBenefits();
    setBenefits(data.map(b => ({ id: b.id, title: b.title, image_url: b.image_url, status: b.status })));
  };

  const handleToggleStatus = async (id: string, current: string) => {
    // Optimistic update
    setBenefits(prev => prev.map(b => b.id === id ? { ...b, status: current === 'ACTIVE' ? 'DRAFT' : 'ACTIVE' } : b));
    
    const res = await toggleBenefitStatus(id, current);
    if (res.success) {
      toast.success("Estado actualizado");
    } else {
      toast.error("Error al actualizar estado");
      // Rollback
      setBenefits(prev => prev.map(b => b.id === id ? { ...b, status: current } : b));
    }
  };

  useEffect(() => {
    loadBenefits();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setFormData(null);
      setImageFile(null);
      setPreviewUrl(null);
      return;
    }

    if (selectedId === "NEW") {
      setIsLoadingForm(true);
      getNextBenefitOrder().then(nextOrder => {
        setFormData({
          title: "",
          description: "",
          discount_percentage: 0,
          display_order: nextOrder
        });
        setIsLoadingForm(false);
      });
      setImageFile(null);
      setPreviewUrl(null);
      return;
    }

    // Load existing
    setIsLoadingForm(true);
    getBenefits().then((all) => {
      const data = all.find(b => b.id === selectedId);
      if (data) {
        setFormData(data);
        setPreviewUrl(data.image_url);
        setImageFile(null);
      } else {
        toast.error("Error al cargar el beneficio");
        setSelectedId(null);
      }
      setIsLoadingForm(false);
    });
  }, [selectedId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = benefits.findIndex((item) => item.id === active.id);
      const newIndex = benefits.findIndex((item) => item.id === over.id);

      const newOrderArray = arrayMove(benefits, oldIndex, newIndex);
      setBenefits(newOrderArray);

      // Save to database
      setIsOrdering(true);
      const orderedIds = newOrderArray.map(b => b.id);
      const result = await saveBenefitOrder(orderedIds);
      setIsOrdering(false);

      if (!result.success) {
        toast.error("Error al guardar el nuevo orden");
        loadBenefits();
      } else {
        toast.success("Orden actualizado");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    setIsSaving(true);
    const formPayload = new FormData();
    if (selectedId !== "NEW") formPayload.append("id", selectedId!);
    formPayload.append("title", formData.title);
    formPayload.append("description", formData.description);
    formPayload.append("discount_percentage", formData.discount_percentage?.toString() || "0");
    formPayload.append("discount_cap", formData.discount_cap?.toString() || "");
    formPayload.append("display_order", formData.display_order?.toString() || "0");
    
    if (imageFile) {
      formPayload.append("image", imageFile);
    }

    const { success, error } = await upsertBenefit(formPayload);
    setIsSaving(false);

    if (success) {
      toast.success(selectedId === "NEW" ? "Beneficio creado" : "Beneficio actualizado");
      await loadBenefits();
      setSelectedId(null);
    } else {
      toast.error(error || "Error al guardar");
    }
  };

  const handleDelete = async () => {
    if (!selectedId || selectedId === "NEW") return;
    if (!confirm("¿Estás seguro de que deseas eliminar este beneficio?")) return;

    setIsDeleting(true);
    const { success, error } = await deleteBenefit(selectedId);
    setIsDeleting(false);

    if (success) {
      toast.success("Beneficio eliminado");
      setSelectedId(null);
      await loadBenefits();
    } else {
      toast.error(error || "Error al eliminar");
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 mt-6 pb-20">
      
      {/* Visual Orderable Grid */}
      <section className="relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-burgundy-500 uppercase tracking-widest flex items-center gap-2">
            Catálogo de Beneficios
            {isOrdering && <Loader2 size={12} className="animate-spin text-burgundy-500/50" />}
          </h3>
          <p className="text-[10px] text-slate-500 italic">Arrastrá para reordenar los beneficios del club</p>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <SortableContext
              items={benefits.filter(b => b !== null).map((b) => b.id)}
              strategy={rectSortingStrategy}
            >
              {benefits.map((b) => {
                if (!b) return null;
                return (
                  <SortableBenefitCard
                    key={b.id}
                    benefit={b}
                    isSelected={selectedId === b.id}
                    onSelect={setSelectedId}
                    onToggleStatus={handleToggleStatus}
                  />
                );
              })}
            </SortableContext>

            {/* Create New Card */}
            <div
              onClick={() => setSelectedId("NEW")}
              className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all duration-300 group cursor-pointer ${
                selectedId === "NEW" 
                  ? "border-burgundy-500 bg-burgundy-500/5 text-burgundy-500" 
                  : "border-white/10 hover:border-burgundy-500/30 text-slate-500 hover:text-burgundy-500 bg-slate-900/20"
              }`}
            >
              <div className="p-3 rounded-full bg-slate-950/50 group-hover:scale-110 transition-transform">
                <Plus size={24} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest italic group-hover:tracking-[0.15em] transition-all">
                Crear nuevo
              </span>
            </div>
          </div>
        </DndContext>
      </section>

      {/* Editor Panel */}
      <AnimatePresence mode="wait">
        {selectedId && (
          <motion.div
            key={selectedId}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="pt-8 border-t border-white/5"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-burgundy-500/10 flex items-center justify-center text-burgundy-500 border border-burgundy-500/20">
                 <Gift size={20} />
              </div>
              <div>
                <h2 className="font-display text-2xl text-white tracking-wide">
                  {selectedId === "NEW" ? "Nuevo Beneficio" : "Editar Beneficio"}
                </h2>
                <p className="text-xs text-slate-400">
                  {selectedId === "NEW" ? "Define las ventajas exclusivas para los miembros" : `ID: ${selectedId}`}
                </p>
              </div>
            </div>

            {(isLoadingForm || !formData) ? (
              <div className="flex justify-center items-center py-20 glass-panel rounded-3xl border border-white/5 bg-slate-900/40">
                <Loader2 className="w-8 h-8 text-burgundy-500 animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSave} className="glass-panel rounded-3xl border border-white/5 bg-slate-900/40 p-6 md:p-8 space-y-8 relative overflow-hidden shadow-2xl">
                {isSaving && (
                  <div className="absolute inset-0 bg-slate-950/60 z-20 flex items-center justify-center backdrop-blur-sm rounded-3xl">
                    <Loader2 className="w-8 h-8 text-burgundy-500 animate-spin" />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mb-3 block">Posición / Orden</label>
                      <input
                        type="number"
                        required
                        value={formData.display_order || 0}
                        onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                        className="w-full bg-black/70 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-burgundy-500 focus:outline-none focus:border-burgundy-500/50 transition-all font-bold"
                        placeholder="1"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mb-3 block">Título del Beneficio</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-black/70 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-burgundy-500/50 transition-all font-light"
                        placeholder="Ej. 20% de Descuento en Bodegas"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mb-3 block">Instrucciones de Canje</label>
                      <textarea
                        rows={6}
                        required
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-burgundy-500/50 transition-all resize-none font-light leading-relaxed"
                        placeholder="Explica cómo usar este beneficio..."
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mb-3 block">Porcentaje de Descuento (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discount_percentage || 0}
                        onChange={e => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-burgundy-500/50 transition-all font-light"
                        placeholder="Ej. 15 (0 si es físico)"
                      />
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-2 px-1">
                        Si el beneficio es para usar en otro local o presencialmente (sin descuento dentro de la web), dejalo en 0.
                      </p>
                    </div>

                    {(formData.discount_percentage > 0) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="overflow-hidden"
                      >
                        <label className="text-[10px] text-burgundy-400 uppercase tracking-[0.2em] font-bold mb-3 block">Tope máximo de descuento ($) (Opcional)</label>
                        <input
                          type="number"
                          value={formData.discount_cap || ""}
                          onChange={e => setFormData({ ...formData, discount_cap: parseInt(e.target.value) || null })}
                          className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-burgundy-500/50 transition-all font-light"
                          placeholder="Ej. 5000"
                        />
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-2 px-1">
                          Define el monto máximo que se restará en esta compra.
                        </p>
                      </motion.div>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mb-3 block">Miniatura Representativa</label>
                    <div 
                      className={`relative w-full aspect-video rounded-3xl overflow-hidden border-2 border-dashed ${!previewUrl ? 'border-white/10 bg-slate-950/50' : 'border-transparent'} group transition-all duration-500 shadow-inner`}
                    >
                      {previewUrl ? (
                        <>
                          <Image src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-6 py-2.5 bg-burgundy-600 text-white rounded-full text-xs font-bold hover:bg-burgundy-500 transition-all flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-xl"
                            >
                              <Upload size={14} /> REEMPLAZAR
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-600 cursor-pointer hover:bg-white/5 transition-all" onClick={() => fileInputRef.current?.click()}>
                          <div className="w-16 h-16 rounded-full bg-slate-900/50 flex items-center justify-center border border-white/5">
                            <ImageIcon size={32} className="opacity-40" />
                          </div>
                          <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Click para subir</span>
                        </div>
                      )}
                      
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handleImageChange}
                        className="hidden" 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                  {selectedId !== "NEW" ? (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting || isSaving}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-red-500/20 text-red-500/70 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center justify-center gap-2"
                    >
                      {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} 
                      Eliminar
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      className="flex-1 sm:flex-initial px-8 py-3.5 border border-white/10 text-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                    >
                      Cerrar
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving || isDeleting}
                      className="flex-1 sm:flex-initial px-10 py-3.5 bg-burgundy-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-burgundy-500 transition-all shadow-lg hover:shadow-burgundy-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Save size={14} /> Guardar Beneficio
                    </button>
                  </div>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

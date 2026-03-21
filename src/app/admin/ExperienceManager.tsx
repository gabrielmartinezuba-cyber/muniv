"use client";

import { useState, useRef, useEffect } from "react";
import { getAdminExperiences, getAdminExperienceDetails, upsertExperience, deleteExperience, saveExperienceOrder } from "@/actions/admin";
import { Plus, Loader2, Save, Trash2, Image as ImageIcon, Upload, GripVertical } from "lucide-react";
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

interface ExperienceItem {
  id: string;
  title: string;
  image_url: string;
}

// Sub-component for Sortable Item
function SortableExperienceCard({ 
  exp, 
  isSelected, 
  onSelect 
}: { 
  exp: ExperienceItem; 
  isSelected: boolean; 
  onSelect: (id: string) => void; 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exp.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.6 : 1,
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border shadow-lg ${
        isSelected 
          ? "border-gold-500 ring-2 ring-gold-500/20 scale-[1.02]" 
          : "border-white/10 hover:border-gold-500/50 bg-slate-900/60"
      }`}
      onClick={() => onSelect(exp.id)}
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        <Image 
          src={exp.image_url || "/placeholder.jpg"} 
          alt={exp.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60" />
        
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners}
          className="absolute top-2 right-2 p-1.5 bg-slate-950/50 backdrop-blur-md rounded-lg text-white/50 hover:text-gold-500 transition-colors cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={16} />
        </div>
      </div>
      
      <div className="p-3 bg-slate-900/40 backdrop-blur-md relative border-t border-white/5">
        <h4 className="text-white text-xs font-display tracking-wide truncate pr-2 uppercase italic opacity-90">
          {exp.title}
        </h4>
      </div>
    </div>
  );
}

export default function ExperienceManager() {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
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

  const loadExperiences = async () => {
    const exps = await getAdminExperiences();
    setExperiences(exps);
  };

  useEffect(() => {
    loadExperiences();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setFormData(null);
      setImageFile(null);
      setPreviewUrl(null);
      return;
    }

    if (selectedId === "NEW") {
      setFormData({
        title: "",
        status: "ACTIVE",
        type: "sorteo",
        price: "",
        description: "",
      });
      setImageFile(null);
      setPreviewUrl(null);
      return;
    }

    // Load existing
    setIsLoadingForm(true);
    getAdminExperienceDetails(selectedId).then((data) => {
      if (data) {
        // Format price with thousands separator for display
        const formattedPrice = data.price ? data.price.toLocaleString("es-AR") : "";
        setFormData({ ...data, price: formattedPrice });
        setPreviewUrl(data.image_url);
        setImageFile(null);
      } else {
        toast.error("Error al cargar la experiencia");
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
      const oldIndex = experiences.findIndex((item) => item.id === active.id);
      const newIndex = experiences.findIndex((item) => item.id === over.id);

      const newOrderArray = arrayMove(experiences, oldIndex, newIndex);
      setExperiences(newOrderArray);

      // Save to database
      setIsOrdering(true);
      const orderedIds = newOrderArray.map(exp => exp.id);
      const result = await saveExperienceOrder(orderedIds);
      setIsOrdering(false);

      if (!result.success) {
        toast.error("Error al guardar el nuevo orden");
        // Revert UI to previous state if wanted, but usually better to let user try again
        loadExperiences();
      } else {
        toast.success("Orden actualizado");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.type || !formData.status) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    setIsSaving(true);
    const formPayload = new FormData();
    if (selectedId !== "NEW") formPayload.append("id", selectedId!);
    formPayload.append("title", formData.title);
    formPayload.append("type", formData.type);
    formPayload.append("status", formData.status);
    
    const cleanPrice = formData.price?.toString().replace(/\./g, "") || "0";
    formPayload.append("price", cleanPrice);
    formPayload.append("description", formData.description || "");
    
    if (imageFile) {
      formPayload.append("image", imageFile);
    }

    const { success, error } = await upsertExperience(formPayload);
    setIsSaving(false);

    if (success) {
      toast.success(selectedId === "NEW" ? "Experiencia creada" : "Experiencia actualizada");
      await loadExperiences();
      setSelectedId(null);
    } else {
      toast.error(error || "Error al guardar");
    }
  };

  const handleDelete = async () => {
    if (!selectedId || selectedId === "NEW") return;
    if (!confirm("¿Estás seguro de que deseas eliminar esta experiencia?")) return;

    setIsDeleting(true);
    const { success, error } = await deleteExperience(selectedId);
    setIsDeleting(false);

    if (success) {
      toast.success("Experiencia eliminada");
      setSelectedId(null);
      await loadExperiences();
    } else {
      toast.error(error || "Error al eliminar");
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 mt-6 pb-20">
      
      {/* Visual Orderable Grid */}
      <section className="relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-gold-500 uppercase tracking-widest flex items-center gap-2">
            Catálogo Visual
            {isOrdering && <Loader2 size={12} className="animate-spin text-gold-500/50" />}
          </h3>
          <p className="text-[10px] text-slate-500 italic">Arrastrá para reordenar el catálogo público</p>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <SortableContext
              items={experiences.map((exp) => exp.id)}
              strategy={rectSortingStrategy}
            >
              {experiences.map((exp) => (
                <SortableExperienceCard
                  key={exp.id}
                  exp={exp}
                  isSelected={selectedId === exp.id}
                  onSelect={setSelectedId}
                />
              ))}
            </SortableContext>

            {/* Create New Card */}
            <div
              onClick={() => setSelectedId("NEW")}
              className={`aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all duration-300 group cursor-pointer ${
                selectedId === "NEW" 
                  ? "border-gold-500 bg-gold-500/5 text-gold-500" 
                  : "border-white/10 hover:border-gold-500/30 text-slate-500 hover:text-gold-500 bg-slate-900/20"
              }`}
            >
              <div className="p-3 rounded-full bg-slate-950/50 group-hover:scale-110 transition-transform">
                <Plus size={24} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest italic group-hover:tracking-[0.15em] transition-all">
                Crear nueva
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
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-500 border border-gold-500/20">
                {selectedId === "NEW" ? <Plus size={20} /> : <ImageIcon size={20} />}
              </div>
              <div>
                <h2 className="font-display text-2xl text-white tracking-wide">
                  {selectedId === "NEW" ? "Nueva Experiencia" : "Editar Experiencia"}
                </h2>
                <p className="text-xs text-slate-400">
                  {selectedId === "NEW" ? "Completá los detalles para publicar" : `ID: ${selectedId}`}
                </p>
              </div>
            </div>

            {isLoadingForm ? (
              <div className="flex justify-center items-center py-20 glass-panel rounded-3xl border border-white/5 bg-slate-900/40">
                <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
              </div>
            ) : formData ? (
              <form onSubmit={handleSave} className="glass-panel rounded-3xl border border-white/5 bg-slate-900/40 p-6 md:p-8 space-y-8 relative overflow-hidden shadow-2xl">
                {isSaving && (
                  <div className="absolute inset-0 bg-slate-950/60 z-20 flex items-center justify-center backdrop-blur-sm rounded-3xl">
                    <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mb-3 block">Título</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all font-light"
                        placeholder="Ej. Sorteo Premium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mb-3 block">Estado</label>
                        <select
                          value={formData.status}
                          onChange={e => setFormData({ ...formData, status: e.target.value })}
                          className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-gold-500/50 appearance-none italic"
                        >
                          <option value="ACTIVE">ACTIVA</option>
                          <option value="COMING_SOON">PRÓXIMAMENTE</option>
                          <option value="SOLD_OUT">AGOTADA</option>
                          <option value="DRAFT">BORRADOR</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mb-3 block">Tipo</label>
                        <select
                          value={formData.type}
                          onChange={e => setFormData({ ...formData, type: e.target.value })}
                          className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-gold-500/50 appearance-none italic"
                        >
                          <option value="sorteo">Sorteo</option>
                          <option value="evento">Evento</option>
                          <option value="caja">Caja / Gifting</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mb-3 block">Precio ($)</label>
                        <input
                          type="text"
                          value={formData.price}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, "");
                            const formatted = val ? Number(val).toLocaleString("es-AR") : "";
                            setFormData({ ...formData, price: formatted });
                          }}
                          className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all font-display tracking-widest"
                          placeholder="Ej. 15.000"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mb-3 block">Fecha</label>
                        <input
                          type="date"
                          value={formData.date || ''}
                          onChange={e => setFormData({ ...formData, date: e.target.value })}
                          className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mb-3 block">Descripción</label>
                      <textarea
                        rows={5}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all resize-none font-light leading-relaxed"
                        placeholder="Detalles sobre la experiencia..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mb-3 block">Media</label>
                    <div 
                      className={`relative w-full aspect-[4/3] rounded-3xl overflow-hidden border-2 border-dashed ${!previewUrl ? 'border-white/10 bg-slate-950/50' : 'border-transparent'} group transition-all duration-500 shadow-inner`}
                    >
                      {previewUrl ? (
                        <>
                          <Image src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-6 py-2.5 bg-gold-500 text-slate-950 rounded-full text-xs font-bold hover:bg-gold-400 transition-all flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                            >
                              <Upload size={14} /> REEMPLAZAR
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-600 cursor-pointer hover:bg-white/5 transition-all" onClick={() => fileInputRef.current?.click()}>
                          <div className="w-16 h-16 rounded-full bg-slate-900/50 flex items-center justify-center border border-white/5">
                            <ImageIcon size={32} />
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
                    <div className="mt-4 p-4 rounded-2xl bg-burgundy-900/10 border border-burgundy-500/10">
                      <p className="text-[10px] text-slate-500 font-medium italic opacity-80 leading-relaxed uppercase">
                        Recomendado: 1200x900px (4:3) para miniaturas óptimas.
                      </p>
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
                      className="flex-1 sm:flex-initial px-10 py-3.5 bg-gold-500 text-slate-950 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gold-400 transition-all shadow-lg hover:shadow-gold-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Save size={14} /> Guardar
                    </button>
                  </div>
                </div>
              </form>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

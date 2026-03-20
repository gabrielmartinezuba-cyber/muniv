"use client";

import { useState, useRef, useEffect } from "react";
import { getAdminExperiences, getAdminExperienceDetails, upsertExperience, deleteExperience } from "@/actions/admin";
import { ChevronDown, Check, Loader2, Save, Trash2, Image as ImageIcon, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Image from "next/image";

export default function ExperienceManager() {
  const [experiences, setExperiences] = useState<{ id: string; title: string }[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<any>(null);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Image handling
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadExperiences = async () => {
    const exps = await getAdminExperiences();
    setExperiences(exps);
  };

  useEffect(() => {
    loadExperiences();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    
    // Clean price string for backend (remove dots)
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
      if (selectedId === "NEW") {
        // Optionally switch to the newly created exp if backend returned ID, but since it doesn't we just clear
        setSelectedId(null);
      }
    } else {
      toast.error(error || "Error al guardar");
    }
  };

  const handleDelete = async () => {
    if (!selectedId || selectedId === "NEW") return;
    if (!confirm("¿Estás seguro de que deseas eliminar esta experiencia? Esta acción no se puede deshacer.")) return;

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

  const currentOptionLabel = selectedId === "NEW" 
    ? "Crear nueva"
    : experiences.find(e => e.id === selectedId)?.title || "Seleccionar Experiencia";

  return (
    <div className="space-y-6 animate-in fade-in duration-500 mt-6 pb-20">
      <div>
        {/* Custom Dropdown */}
        <div className="glass-panel rounded-2xl border border-white/10 bg-slate-900/60 p-5 relative z-40">
          <div className="flex-1 relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-gold-500 flex items-center justify-between hover:border-gold-500/30 transition-all shadow-lg active:scale-[0.99]"
            >
              <span className="truncate pr-4 font-medium">{currentOptionLabel}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 5, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 right-0 z-[999] mt-1 bg-slate-950/95 backdrop-blur-md border border-gold-500/20 rounded-2xl shadow-2xl overflow-hidden py-2"
                >
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {experiences.map((exp) => (
                      <div
                        key={exp.id}
                        onClick={() => { setSelectedId(exp.id); setIsDropdownOpen(false); }}
                        className={`px-4 py-3 text-sm cursor-pointer flex items-center justify-between transition-all duration-200 ${
                          selectedId === exp.id ? "bg-gold-500/20 text-gold-400" : "text-slate-100 hover:bg-gold-500/10 hover:text-gold-400"
                        }`}
                      >
                        <span className="truncate">{exp.title}</span>
                        {selectedId === exp.id && <Check className="w-4 h-4 shrink-0 ml-2" />}
                      </div>
                    ))}
                    
                    <div className="h-px bg-white/5 mx-2 my-1" />
                    
                    <div
                      onClick={() => { setSelectedId("NEW"); setIsDropdownOpen(false); }}
                      className={`px-4 py-3 text-sm cursor-pointer flex items-center justify-between transition-all duration-200 ${
                        selectedId === "NEW" ? "bg-gold-500/20 text-gold-400" : "text-gold-500 hover:bg-gold-500/10"
                      }`}
                    >
                      <span className="font-bold">✨ Crear nueva experiencia</span>
                      {selectedId === "NEW" && <Check className="w-4 h-4 shrink-0 ml-2" />}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {isLoadingForm && (
        <div className="flex justify-center items-center py-20 min-h-[300px] glass-panel rounded-3xl border border-white/5 bg-slate-900/40">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
        </div>
      )}

      {!isLoadingForm && formData && selectedId && (
        <form onSubmit={handleSave} className="glass-panel rounded-3xl border border-white/5 bg-slate-900/40 p-6 md:p-8 space-y-8 relative overflow-hidden">
          {isSaving && (
            <div className="absolute inset-0 bg-slate-950/50 z-20 flex items-center justify-center backdrop-blur-sm rounded-3xl">
              <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Col - Data */}
            <div className="space-y-5">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 block">Título</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-colors"
                  placeholder="Ej. Sorteo Premium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 block">Estado</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/50 appearance-none"
                  >
                    <option value="ACTIVE">ACTIVA</option>
                    <option value="COMING_SOON">PRÓXIMAMENTE</option>
                    <option value="SOLD_OUT">AGOTADA</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 block">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/50 appearance-none"
                  >
                    <option value="sorteo">Sorteo</option>
                    <option value="evento">Evento</option>
                    <option value="caja">Caja / Gifting</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 block">Precio Base ($)</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, "");
                      const formatted = val ? Number(val).toLocaleString("es-AR") : "";
                      setFormData({ ...formData, price: formatted });
                    }}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-colors"
                    placeholder="Ej. 15.000"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 block">Fecha</label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 block">Descripción</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-colors resize-none"
                  placeholder="Detalles sobre la experiencia..."
                />
              </div>
            </div>

            {/* Right Col - Image */}
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 block">Imagen de Portada</label>
              <div 
                className={`relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-dashed ${!previewUrl ? 'border-white/20 bg-slate-950/50' : 'border-transparent'} group transition-all`}
              >
                {previewUrl ? (
                  <>
                    <Image src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-2 bg-slate-900 border border-white/10 rounded-full text-sm font-medium hover:bg-white/5 transition-colors flex items-center gap-2"
                      >
                        <Upload size={16} /> Reemplazar
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => fileInputRef.current?.click()}>
                    <ImageIcon size={32} className="opacity-50" />
                    <span className="text-sm font-medium">Click para adjuntar imagen</span>
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
              <p className="text-[11px] text-slate-500 mt-3 text-center">
                Resolución recomendada: 1920x1080px (16:9). Peso máx: 2MB.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            {selectedId !== "NEW" ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSaving}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} 
                Eliminar Experiencia
              </button>
            ) : (
              <div /> // Placeholder for space-between flex
            )}

            <button
              type="submit"
              disabled={isSaving || isDeleting}
              className="w-full sm:w-auto px-8 py-3 bg-gold-500 text-slate-950 rounded-xl font-bold text-sm hover:bg-gold-400 transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save size={16} /> Guardar Experiencia
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

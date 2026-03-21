"use client";

import { useState, useRef, useEffect } from "react";
import { getBenefits, upsertBenefit, deleteBenefit } from "@/actions/benefits";
import { ChevronDown, Check, Loader2, Save, Trash2, Image as ImageIcon, Upload, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Image from "next/image";

export default function BenefitManager() {
  const [benefits, setBenefits] = useState<{ id: string; title: string }[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<any>(null);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadBenefits = async () => {
    const data = await getBenefits();
    setBenefits(data.map(b => ({ id: b.id, title: b.title })));
  };

  useEffect(() => {
    loadBenefits();

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
        description: "",
      });
      setImageFile(null);
      setPreviewUrl(null);
      return;
    }

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

  const currentOptionLabel = selectedId === "NEW" 
    ? "Crear nuevo"
    : benefits.find(b => b.id === selectedId)?.title || "Seleccionar Beneficio";

  return (
    <div className="space-y-6 animate-in fade-in duration-500 mt-6 pb-20">
      <div>
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
                    {benefits.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => { setSelectedId(b.id); setIsDropdownOpen(false); }}
                        className={`px-4 py-3 text-sm cursor-pointer flex items-center justify-between transition-all duration-200 ${
                          selectedId === b.id ? "bg-gold-500/20 text-gold-400" : "text-slate-100 hover:bg-gold-500/10 hover:text-gold-400"
                        }`}
                      >
                        <span className="truncate">{b.title}</span>
                        {selectedId === b.id && <Check className="w-4 h-4 shrink-0 ml-2" />}
                      </div>
                    ))}
                    
                    <div className="h-px bg-white/5 mx-2 my-1" />
                    
                    <div
                      onClick={() => { setSelectedId("NEW"); setIsDropdownOpen(false); }}
                      className={`px-4 py-3 text-sm cursor-pointer flex items-center justify-between transition-all duration-200 ${
                        selectedId === "NEW" ? "bg-gold-500/20 text-gold-400" : "text-gold-500 hover:bg-gold-500/10"
                      }`}
                    >
                      <span className="font-bold">✨ Crear nuevo beneficio</span>
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
            <div className="space-y-5">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 block">Título del Beneficio</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-colors"
                  placeholder="Ej. 20% en Bodega X"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 block">Descripción / Instrucciones</label>
                <textarea
                  required
                  rows={6}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-colors resize-none"
                  placeholder="Describe el beneficio y cómo usarlo..."
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 block">Imagen Representativa</label>
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
                    <span className="text-sm font-medium">Adjuntar imagen</span>
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

          <div className="pt-6 border-t border-white/5 flex items-center justify-between gap-4">
            {selectedId !== "NEW" && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSaving}
                className="px-6 py-3 rounded-xl border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/10 transition-colors flex items-center gap-2"
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} 
                Eliminar
              </button>
            )}

            <button
              type="submit"
              disabled={isSaving || isDeleting}
              className="ml-auto px-8 py-3 bg-gold-500 text-slate-950 rounded-xl font-bold text-sm hover:bg-gold-400 transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={16} /> Guardar Beneficio
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

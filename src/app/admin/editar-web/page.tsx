"use client";

import { useTransition, useState, useEffect } from "react";
import { updateLandingContent, getLandingContent } from "@/actions/admin";
import { toast } from "sonner";
import { Layout, Type, FileBox, Save, Loader2, Link as LinkIcon, BookOpen } from "lucide-react";

export default function EditarWebPage() {
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    button_text: "",
    conoce_descripcion: ""
  });

  useEffect(() => {
    getLandingContent().then(data => {
      if (data) {
        setFormData({
          title: data.title || "",
          description: data.description || "",
          button_text: data.button_text || "",
          conoce_descripcion: data.conoce_descripcion || ""
        });
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("description", formData.description);
    fd.append("button_text", formData.button_text);
    fd.append("conoce_descripcion", formData.conoce_descripcion);

    startTransition(async () => {
      const res = await updateLandingContent(fd);
      if (res.success) {
        toast.success("Contenido actualizado con éxito.");
      } else {
        toast.error("Error al actualizar: " + res.error);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
        <p className="mt-4 text-slate-400">Cargando contenido...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-gold-500/10 border border-gold-500/30 rounded-2xl flex items-center justify-center text-gold-500">
           <Layout size={24} />
        </div>
        <div>
          <h1 className="font-display text-4xl text-white">Editar Web</h1>
          <p className="text-slate-400">Administrá el contenido principal de la Landing Page.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="glass-panel p-8 rounded-3xl border border-white/5 space-y-6">
          
          <div>
            <label className="text-white text-sm font-medium mb-3 flex items-center gap-2">
              <Type size={16} className="text-gold-500" /> Título Principal (Hero)
            </label>
            <textarea
              required
              rows={3}
              placeholder="Ej. Vinos y experiencias para compartir"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all font-sans text-lg"
            />
            <p className="text-xs text-slate-500 mt-2 italic">Podés usar &lt;br/&gt; para forzar saltos de línea.</p>
          </div>

          <div>
            <label className="text-white text-sm font-medium mb-3 flex items-center gap-2">
              <FileBox size={16} className="text-gold-500" /> Descripción
            </label>
            <textarea
              required
              rows={3}
              placeholder="Descripción corta debajo del título..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all font-sans"
            />
          </div>

          <div>
             <label className="text-white text-sm font-medium mb-3 flex items-center gap-2">
              <LinkIcon size={16} className="text-gold-500" /> Texto del Botón (CTA)
            </label>
            <input
              required
              type="text"
              placeholder="Conocé MUNIV"
              value={formData.button_text}
              onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all font-sans"
            />
          </div>

          <div>
            <label className="text-white text-sm font-medium mb-3 flex items-center gap-2">
              <BookOpen size={16} className="text-gold-500" /> Contenido de "Conocé MUNIV"
            </label>
            <textarea
              required
              rows={8}
              placeholder="Descripción larga de la marca..."
              value={formData.conoce_descripcion}
              onChange={(e) => setFormData({ ...formData, conoce_descripcion: e.target.value })}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all font-sans leading-relaxed"
            />
          </div>

        </div>

        <div className="flex justify-end pt-4">
          <button
            disabled={isPending}
            type="submit"
            className="flex items-center gap-3 px-10 py-4 bg-burgundy-600 text-white font-bold rounded-2xl hover:bg-burgundy-500 transition-all shadow-[0_0_20px_rgba(108,26,26,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
          >
            {isPending ? (
              <>Guardando... <Loader2 size={18} className="animate-spin" /></>
            ) : (
              <>Guardar Cambios <Save size={18} /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

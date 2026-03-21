"use client";

import { useEffect, useState, useRef } from "react";
import { getAdminReport, getAdminExperiences, type AdminReportRow } from "@/actions/admin";
import { Loader2, Download, Search, Filter, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [report, setReport] = useState<AdminReportRow[]>([]);
  const [experiences, setExperiences] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [filterExpId, setFilterExpId] = useState<string>("ALL");
  const [isFiltering, setIsFiltering] = useState(false);
  

  // Initial Load
  useEffect(() => {
    Promise.all([
      getAdminReport(),
      getAdminExperiences()
    ]).then(([reportData, expData]) => {
      setReport(reportData);
      setExperiences(expData);
      setLoading(false);
    });

  }, []);

  // Handle Filter Application
  useEffect(() => {
    // Avoid running on very first mount as it's handled above
    if (loading) return; 

    setIsFiltering(true);
    getAdminReport({
      experience_id: filterExpId
    }).then(data => {
      setReport(data);
      setIsFiltering(false);
    });
  }, [filterExpId]);

  const downloadCSV = () => {
    if (!report.length) return;

    const isMembersReport = filterExpId === 'MEMBERS_ONLY';

    const headers = isMembersReport
      ? ["Fecha Registro", "Cliente", "Email", "Rol"]
      : [
          "Fecha Res.",
          "Cliente",
          "Email",
          "Experiencia",
          "Tipo",
          "Cant. Personas",
          "Monto ($)",
          "Estado",
        ];

    const rows = report.map(r => {
      const dateStr = new Date(r.created_at).toLocaleDateString("es-AR", {
        day: "2-digit", month: "2-digit", year: "numeric"
      });

      if (isMembersReport) {
        return [
          dateStr,
          `"${r.client_name}"`,
          `"${r.client_email}"`,
          r.experience_type
        ];
      }

      // Handle $0 or null explicitly for sales report
      const amount = r.experience_title === 'Socio Registrado' || !r.experience_title ? '-' : (r.total_price === 0 ? "SORTEO" : `$${r.total_price}`);
      const guests = r.experience_title === 'Socio Registrado' || !r.experience_title ? '-' : r.guests_count;

      return [
        dateStr,
        `"${r.client_name}"`, // Quote to escape internal commas
        `"${r.client_email}"`,
        `"${r.experience_title}"`,
        r.experience_type,
        guests,
        amount,
        r.status
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `reporte-muniv-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentOptionLabel = filterExpId === "MEMBERS_ONLY" 
    ? "Todos los Miembros Registrados" 
    : filterExpId === "ALL" 
    ? "Todas las Experiencias (Ventas/Reservas)" 
    : experiences.find(e => e.id === filterExpId)?.title || "Seleccionar Reporte";

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[400px] glass-panel rounded-3xl border border-white/5 bg-slate-900/40">
        <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl font-serif text-white flex items-center gap-3">
            <Filter size={28} className="text-gold-500" /> 
            Generador de <span className="italic text-gold-500">Reportes</span>
          </h2>
          <p className="text-slate-400 mt-2 text-sm font-light">Seleccioná un tipo de reporte para exportar los datos actualizados.</p>
        </div>
         <button 
           onClick={downloadCSV}
           disabled={!report.length || isFiltering}
           className="flex items-center gap-3 px-8 py-4 bg-gold-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gold-400 transition-all shadow-[0_0_20px_rgba(212,175,55,0.1)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
         >
            <Download size={18} /> {isFiltering ? "PROCESANDO..." : "Descargar Reporte (CSV)"}
         </button>
      </div>

      <div className="space-y-6">
        <label className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black block ml-1">
          Tipo de Reporte a Generar
        </label>
        
        <div className="flex flex-wrap gap-3">
          {/* Special Option: Members */}
          <button
            onClick={() => setFilterExpId("MEMBERS_ONLY")}
            className={cn(
              "px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all border flex items-center gap-2",
              filterExpId === "MEMBERS_ONLY"
                ? "bg-burgundy-600 border-burgundy-400 text-white shadow-[0_0_20px_rgba(153,27,27,0.3)] scale-105"
                : "bg-white/5 border-white/5 text-slate-400 hover:border-white/20 hover:bg-white/[0.08]"
            )}
          >
            {filterExpId === "MEMBERS_ONLY" && <Check size={14} className="animate-in zoom-in" />}
            Todos los Miembros
          </button>

          {/* Special Option: All Sales */}
          <button
            onClick={() => setFilterExpId("ALL")}
            className={cn(
              "px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all border flex items-center gap-2",
              filterExpId === "ALL"
                ? "bg-burgundy-600 border-burgundy-400 text-white shadow-[0_0_20px_rgba(153,27,27,0.3)] scale-105"
                : "bg-white/5 border-white/5 text-slate-400 hover:border-white/20 hover:bg-white/[0.08]"
            )}
          >
            {filterExpId === "ALL" && <Check size={14} className="animate-in zoom-in" />}
            Todas las Reservas
          </button>

          {/* Divider */}
          <div className="w-px h-12 bg-white/5 mx-2 hidden md:block" />

          {/* Dynamic Experiences */}
          {experiences.map((exp) => (
            <button
              key={exp.id}
              onClick={() => setFilterExpId(exp.id)}
              className={cn(
                "px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all border flex items-center gap-2",
                filterExpId === exp.id
                  ? "bg-burgundy-600 border-burgundy-400 text-white shadow-[0_0_20px_rgba(153,27,27,0.3)] scale-105"
                  : "bg-white/5 border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/[0.08]"
              )}
            >
              {filterExpId === exp.id && <Check size={14} className="animate-in zoom-in" />}
              {exp.title}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12 p-10 glass-panel rounded-[2.5rem] border border-white/5 bg-slate-900/40 text-center space-y-4">
        <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-gold-500 border border-gold-500/10">
          <Download size={32} strokeWidth={1.5} />
        </div>
        <h3 className="text-xl text-white font-medium">Previsualización de Reporte Optimizada</h3>
        <p className="max-w-md mx-auto text-slate-400 text-sm font-light">
          Para mejorar el rendimiento del panel, la previsualización en tabla ha sido desactivada.
          Utilice el botón superior para descargar el archivo <span className="text-gold-500 font-bold">CSV completo</span> con todos los datos procesados.
        </p>
        
        <div className="pt-6 flex justify-center items-center gap-4 text-[10px] text-slate-500 uppercase tracking-widest font-black">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Sincronizado
          </div>
          <div className="w-1 h-1 rounded-full bg-white/20" />
          <div>CSV Export Ready</div>
        </div>
      </div>
    </div>
  );
}

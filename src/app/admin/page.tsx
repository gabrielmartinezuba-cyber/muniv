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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-serif text-white flex items-center gap-3">
            <Filter size={28} className="text-gold-500" /> 
            Generador de <span className="italic text-gold-500">Reportes</span>
          </h2>
          <p className="text-slate-400 mt-2 text-sm font-light">Seleccioná un tipo de reporte para exportar los datos actualizados de forma directa.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-end gap-6 bg-slate-900/40 p-8 rounded-3xl border border-white/5 shadow-inner">
        <div className="flex-1 w-full relative">
          <label className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black block mb-3 ml-2">
            Tipo de Reporte a Generar
          </label>
          
          <div className="relative group">
            <select
              value={filterExpId}
              onChange={(e) => setFilterExpId(e.target.value)}
              className="w-full appearance-none bg-slate-950 border border-gold-500/20 text-white rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-gold-500 transition-colors cursor-pointer pr-12 shadow-[0_4px_20px_rgba(0,0,0,0.5)] group-hover:border-gold-500/40"
            >
              <option value="MEMBERS_ONLY" className="bg-slate-900">Todos los Miembros Registrados</option>
              <option value="ALL" className="bg-slate-900">Todas las Reservas (General)</option>
              {experiences.map((exp) => (
                <option key={exp.id} value={exp.id} className="bg-slate-900">
                  Reserva: {exp.title}
                </option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gold-500/50 group-hover:text-gold-500 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        <button 
           onClick={downloadCSV}
           disabled={!report.length || isFiltering}
           className="w-full md:w-auto h-[54px] flex justify-center items-center gap-3 px-8 bg-gold-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gold-400 transition-all shadow-[0_0_20px_rgba(212,175,55,0.1)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transform"
         >
            <Download size={18} /> {isFiltering ? "PROCESANDO..." : "Descargar Reporte (CSV)"}
         </button>
      </div>
    </div>
  );
}

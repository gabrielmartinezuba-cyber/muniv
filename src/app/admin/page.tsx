"use client";

import { useEffect, useState, useRef } from "react";
import { getAdminReport, getAdminExperiences, type AdminReportRow } from "@/actions/admin";
import { Loader2, Download, Search, Filter, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboardPage() {
  const [report, setReport] = useState<AdminReportRow[]>([]);
  const [experiences, setExperiences] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [filterExpId, setFilterExpId] = useState<string>("ALL");
  const [isFiltering, setIsFiltering] = useState(false);
  
  // Dropdown UI state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl text-white font-medium flex items-center gap-2">
            <Filter size={20} className="text-gold-500" /> Generador de Reportes Detallado 
          </h2>
        </div>
         <button 
           onClick={downloadCSV}
           disabled={!report.length || isFiltering}
           className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-slate-950 rounded-full font-bold text-sm hover:bg-gold-400 transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap active:scale-95 transition-transform"
         >
            <Download size={16} /> Descargar Reporte (CSV)
         </button>
      </div>

      {/* Filter Bar Glassmorphism - Added positioning and z-index to manage dropdown stacking */}
      <div className="glass-panel rounded-2xl border border-white/10 bg-slate-900/60 p-5 flex flex-col md:flex-row md:items-center gap-4 relative z-40">
        
        {/* Custom Experience Dropdown */}
        <div className="flex-1 relative" ref={dropdownRef}>
          <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1.5 block">
            Tipo de Reporte
          </label>
          
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
                  {/* Special Options */}
                  <div
                    onClick={() => { setFilterExpId("MEMBERS_ONLY"); setIsDropdownOpen(false); }}
                    className={`px-4 py-3 text-sm cursor-pointer flex items-center justify-between transition-all duration-200 ${
                      filterExpId === "MEMBERS_ONLY" ? "bg-gold-500/20 text-gold-400" : "text-slate-100 hover:bg-gold-500/10 hover:text-gold-400"
                    }`}
                  >
                    <span className="font-bold italic">Todos los Miembros Registrados</span>
                    {filterExpId === "MEMBERS_ONLY" && <Check className="w-4 h-4" />}
                  </div>
                  
                  <div
                    onClick={() => { setFilterExpId("ALL"); setIsDropdownOpen(false); }}
                    className={`px-4 py-3 text-sm cursor-pointer flex items-center justify-between transition-all duration-200 ${
                      filterExpId === "ALL" ? "bg-gold-500/20 text-gold-400" : "text-slate-100 hover:bg-gold-500/10 hover:text-gold-400"
                    }`}
                  >
                    <span>Todas las Reservas (Ventas)</span>
                    {filterExpId === "ALL" && <Check className="w-4 h-4" />}
                  </div>

                  <div className="h-px bg-white/5 mx-2 my-1" />

                  {/* Dynamic Experiences */}
                  {experiences.map((exp) => (
                    <div
                      key={exp.id}
                      onClick={() => { setFilterExpId(exp.id); setIsDropdownOpen(false); }}
                      className={`px-4 py-3 text-sm cursor-pointer flex items-center justify-between transition-all duration-200 ${
                        filterExpId === exp.id ? "bg-gold-500/20 text-gold-400" : "text-slate-100 hover:bg-gold-500/10 hover:text-gold-400"
                      }`}
                    >
                      <span>{exp.title}</span>
                      {filterExpId === exp.id && <Check className="w-4 h-4" />}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-end self-end">
          <button 
            onClick={() => { setFilterExpId("ALL"); setIsDropdownOpen(false); }}
            className="w-full md:w-auto h-[46px] px-8 rounded-xl border border-white/10 text-sm text-slate-300 hover:bg-white/5 transition-colors"
          >
            Limpiar Filtro
          </button>
        </div>
      </div>

      {/* Table Container - Removed overflow-hidden to allow dropdown visibility */}
      <div className="glass-panel rounded-3xl border border-white/5 bg-slate-900/40 relative">
        {isFiltering && (
           <div className="absolute inset-0 bg-slate-950/50 z-20 flex items-center justify-center backdrop-blur-sm rounded-3xl">
             <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
           </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-8 py-5 font-bold align-middle">Fecha</th>
                <th className="px-8 py-5 font-bold align-middle">Cliente</th>
                <th className="px-8 py-5 font-bold align-middle">
                  {filterExpId === 'MEMBERS_ONLY' ? 'ROL' : 'EXPERIENCIA'}
                </th>
                {filterExpId !== 'MEMBERS_ONLY' && (
                  <>
                    <th className="px-8 py-5 font-bold text-center align-middle">Cant.</th>
                    <th className="px-8 py-5 font-bold text-right align-middle">Monto</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {report.map((row) => (
                <tr key={row.id} className="hover:bg-white/5 transition-colors duration-200">
                  <td className="px-8 py-5 whitespace-nowrap align-middle">
                    {new Date(row.created_at).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric"
                    })}
                  </td>
                  <td className="px-8 py-5 align-middle">
                    <div className="font-medium text-white mb-0.5">{row.client_name}</div>
                    <div className="text-[11px] text-slate-500">{row.client_email}</div>
                  </td>
                  <td className="px-8 py-5 align-middle">
                    {filterExpId === 'MEMBERS_ONLY' || !row.experience_title ? (
                      <div className="text-base text-gold-500 font-semibold uppercase tracking-wider">
                        {row.experience_type}
                      </div>
                    ) : (
                      <>
                        <div className="font-medium text-white mb-0.5">{row.experience_title}</div>
                        <div className="text-[10px] text-gold-500 font-bold uppercase tracking-wider">{row.experience_type}</div>
                      </>
                    )}
                  </td>
                  {filterExpId !== 'MEMBERS_ONLY' && (
                    <>
                      <td className="px-8 py-5 text-center align-middle font-display text-xl text-white">
                        {row.experience_title === 'Socio Registrado' || !row.experience_title ? '-' : row.guests_count}
                      </td>
                      <td className="px-8 py-5 text-right align-middle">
                        {row.experience_title === 'Socio Registrado' || !row.experience_title ? (
                          <span className="text-slate-500">-</span>
                        ) : row.total_price === 0 ? (
                          <span className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded text-xs font-bold text-slate-300 tracking-widest">
                            SORTEO
                          </span>
                        ) : (
                          <span className="font-medium text-white text-base">
                            ${row.total_price?.toLocaleString('es-AR')}
                          </span>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {!report.length && (
                <tr>
                  <td colSpan={filterExpId === 'MEMBERS_ONLY' ? 3 : 5} className="px-8 py-16 text-center text-slate-500 bg-slate-900/20">
                     No se encontraron registros para estos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useBookingStore } from "@/store/useBookingStore";

const MOCK_EXPERIENCES = [
  {
    id: "uuid-1",
    slug: "cata-privada-en-bodega",
    title: "Cata Privada High-End",
    tagline: "El silencio de una barrica",
    description: "Una experiencia inmersiva con vinos de más de 95 puntos y maridaje premium.",
    type: "TASTING_PRIVATE",
    badgeLabel: "CATA",
    status: "ACTIVE",
    basePrice: 45000,
    media: { heroImage: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=800&auto=format&fit=crop" },
    highlights: ["Sommelier Exclusivo", "Maridaje 5 Pasos", "Vinos de Colección"],
    capacity: { minLimit: 2, maxLimit: 6 },
    durationHours: 3
  },
  {
    id: "uuid-2",
    slug: "asado-y-fuego",
    title: "Asado, Fuego y Tinto",
    tagline: "Volver al origen de lo nuestro",
    description: "Momentos rodeados de naturaleza, amigos y cortes de carne seleccionados con nuestro blend insignia.",
    type: "EVENT",
    badgeLabel: "EVENTO",
    status: "ACTIVE",
    basePrice: 85000,
    media: { heroImage: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop" },
    highlights: ["Asador Profesional", "Ambiente Natural", "Cortes Premium"],
    capacity: { minLimit: 4, maxLimit: 12 },
    durationHours: 5
  },
  {
    id: "uuid-3",
    slug: "caja-curada-ruby-box",
    title: "The Ruby Box",
    tagline: "Un tesoro en tu casa",
    description: "Una selección de tres exponentes de Valle de Uco para descubrir en tu mesa.",
    type: "BOX",
    badgeLabel: "CAJA",
    status: "ACTIVE",
    basePrice: 22000,
    media: { heroImage: "https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?q=80&w=800&auto=format&fit=crop" },
    highlights: ["3 Botellas Premium", "Guía de Cata Interactiva"],
    capacity: { minLimit: 1, maxLimit: 1 },
    durationHours: 1
  }
];

export default function ExperienceList() {
  const listRef = useRef<HTMLDivElement>(null);
  const { openBooking } = useBookingStore();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!listRef.current) return;
    
    gsap.registerPlugin(ScrollTrigger);
    
    const cards = listRef.current.querySelectorAll('.experience-card');
    
    gsap.fromTo(cards, 
      { opacity: 0, y: 50 },
      {
        opacity: 1, 
        y: 0,
        stagger: 0.2, // Sequenced fade-in
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: listRef.current,
          start: "top 80%",
        }
      }
    );
  }, []);

  return (
    <div ref={listRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {MOCK_EXPERIENCES.map((exp) => (
        <div key={exp.id} className="experience-card group">
          <div className="glass-panel glass-panel-glow rounded-3xl overflow-hidden h-full flex flex-col cursor-pointer transition-transform duration-500 hover:scale-[1.03]">
            {/* Image Container with inner shadow */}
            <div className="relative h-64 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] to-transparent z-10 opacity-80 mix-blend-multiply"></div>
              <img 
                src={exp.media.heroImage} 
                alt={exp.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1" 
              />
              <div className="absolute top-4 right-4 z-20">
                <span className="bg-slate-900/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-gold-200 border border-gold-500/30 uppercase tracking-wider">
                  {exp.badgeLabel}
                </span>
              </div>
            </div>
            
            <div className="p-6 flex-grow flex flex-col z-20 bg-slate-900/50">
              <h3 className="font-display text-2xl mb-1 text-white group-hover:text-gold-200 transition-colors duration-300">
                {exp.title}
              </h3>
              <p className="text-rose-400 text-sm mb-4 font-medium italic">
                {exp.tagline}
              </p>
              
              <ul className="mb-6 space-y-2 flex-grow">
                {exp.highlights.map((hl, i) => (
                  <li key={i} className="text-slate-300 text-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold-500 shadow-[0_0_5px_rgba(212,175,55,1)]"></div>
                    {hl}
                  </li>
                ))}
              </ul>
              
              <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                <div className="text-white font-semibold flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-normal">Desde</span>
                  ${exp.basePrice.toLocaleString('es-AR')}
                </div>
                <button
                  onClick={() => openBooking(exp.id, exp.title)}
                  className="bg-white/5 hover:bg-gold-500/20 px-4 py-2 rounded-full text-gold-500 transition-colors duration-300 text-sm font-medium border border-gold-500/20 active:scale-95 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                >
                  Reservar
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

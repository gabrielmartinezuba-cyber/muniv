"use client";

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Lazy load the heaviest part (Three.js WebGL canvas) to protect First Load as requested.
const Scene3D = dynamic(() => import('@/components/3d/HeroScene'), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0B0F19]">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-t-2 border-gold-500 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-r-2 border-rose-700 animate-spin flex-reverse shadow-[0_0_15px_rgba(190,18,60,0.6)]"></div>
      </div>
    </div>
  )
});

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      if (containerRef.current && textRef.current) {
        gsap.to(textRef.current, {
          y: 120,
          opacity: 0,
          scale: 0.95,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1, // Smooth dampening
          }
        });
      }
    }
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* 3D Background Encapsulated */}
      <div className="absolute inset-0 z-0">
        <ErrorBoundary fallbackMessage="El motor WebGL encontró un inconveniente en el procesador gráfico. Continuamos en modo lectura a 60fps.">
          <Scene3D />
        </ErrorBoundary>
      </div>
      
      {/* Foreground Content */}
      <div ref={textRef} className="z-10 text-center flex flex-col items-center max-w-4xl px-4 pointer-events-none">
        <h1 className="font-display font-medium text-5xl md:text-7xl lg:text-8xl tracking-tight text-white mb-6 drop-shadow-2xl">
          Diseñadores de <br/>
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-gold-500 to-gold-400">
            Momentos
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-300 font-light max-w-2xl mb-10 leading-relaxed drop-shadow-lg backdrop-blur-sm rounded-lg py-2">
          Más que una vinoteca. Un club de experiencias vínicas curadas de alto perfil para quienes buscan conectar a través de lo extraordinario.
        </p>
        <div className="pointer-events-auto flex items-center gap-6">
          <button className="glass-panel glass-panel-glow px-8 py-4 rounded-full text-gold-200 font-medium tracking-wide transition-all duration-500 transform hover:scale-105 flex items-center gap-2 group">
            <span className="group-hover:text-white transition-colors duration-300">Descubrir</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gold-500 group-hover:translate-x-1 group-hover:text-white transition-all duration-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs uppercase tracking-[0.2em] text-gold-500/70 font-semibold">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-gold-500/70 to-transparent"></div>
      </div>
    </section>
  );
}

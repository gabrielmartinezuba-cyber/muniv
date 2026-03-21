"use client";

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Lazy load the heaviest part (Three.js WebGL canvas) to protect First Load as requested.
const Scene3D = dynamic(() => import('@/components/3d/HeroScene'), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0c0a09]">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-t-2 border-gold-500 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-r-2 border-burgundy-600 animate-spin flex-reverse shadow-[0_0_15px_rgba(108,26,26,0.6)]"></div>
      </div>
    </div>
  )
});

interface HeroProps {
  title?: string;
  description?: string;
  button_text?: string;
  conoce_descripcion?: string;
}

const DEFAULT_CONOCE = `MUNIV es una marca creada para convertir el vino en una experiencia que se disfruta, se comparte y se recuerda. Nacimos con la intención de acercar vinos con identidad, calidad y sentido, pero sobre todo de darle a cada botella un lugar dentro de momentos reales: una juntada, una comida, un regalo, una celebración o simplemente el placer de frenar y disfrutar.

En MUNIV no creemos en el vino como algo lejano o complicado. Creemos en una forma más simple, cercana y auténtica de vivirlo. Por eso seleccionamos propuestas con criterio, cuidamos cada detalle y buscamos que cada experiencia tenga valor, tanto en lo que ofrece como en lo que genera.

Más que vender vino, en MUNIV queremos acompañar momentos. Crear una conexión entre buenas etiquetas, buenas historias y personas que valoran compartir algo distinto.

MUNIV es calidad, experiencia y disfrute. Una invitación a descubrir vinos con personalidad y a hacer de cada ocasión algo digno de repetir.`;

export default function Hero({ 
  title = "Vinos y experiencias <br/> para compartir",
  description = "Club de vinos y experiencias pensado para descubrir, regalar y disfrutar momentos que valen la pena repetir.",
  button_text = "Conocé MUNIV",
  conoce_descripcion = DEFAULT_CONOCE
}: HeroProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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
        <h1 
          className="font-display font-medium text-5xl md:text-7xl lg:text-8xl tracking-tight text-white mb-6 drop-shadow-2xl h-auto"
          dangerouslySetInnerHTML={{ __html: title }}
        />
        <p className="text-lg md:text-xl text-slate-300 font-light max-w-2xl mb-10 leading-relaxed drop-shadow-lg">
          {description}
        </p>
        <div className="pointer-events-auto flex items-center gap-6">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="glass-panel glass-panel-glow px-8 py-4 rounded-full text-gold-400 font-medium tracking-wide transition-all duration-500 transform hover:scale-105 flex items-center gap-2 group"
          >
            <span className="group-hover:text-white transition-colors duration-300">{button_text}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gold-400 group-hover:translate-x-1 group-hover:text-gold-200 transition-all duration-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs uppercase tracking-[0.2em] text-gold-500/60 font-semibold">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-gold-500/60 to-transparent"></div>
      </div>

      {/* Side Drawer: Info */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            
            {/* Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full md:w-[500px] backdrop-blur-xl border-l z-[101] flex flex-col shadow-2xl"
              style={{ background: 'rgba(12,10,9,0.95)', borderColor: 'rgba(182,154,104,0.12)' }}
            >
              <div className="p-8 md:p-12 flex flex-col h-full">
                <div className="flex justify-end mb-8">
                  <button 
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                  <h2 className="font-display text-4xl md:text-5xl text-white mb-10 leading-tight">
                    ¿Qué es <br/>
                    <span className="italic text-gold-400">MUNIV?</span>
                  </h2>
                  
                  <div className="text-slate-300 font-light leading-relaxed space-y-6 text-lg">
                    {conoce_descripcion.split('\n\n').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </div>
                
                <div className="pt-12 mt-auto border-t border-white/5">
                   <button 
                    onClick={() => setIsDrawerOpen(false)}
                     className="w-full py-4 bg-burgundy-600 text-white font-bold rounded-xl hover:bg-burgundy-500 transition-colors shadow-[0_0_20px_rgba(108,26,26,0.3)]"
                   >
                     Continuar Explorando
                   </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}



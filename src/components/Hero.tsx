"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowDown, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { VideoBackground } from "@/components/ui/VideoBackground";
import { MagneticButton } from "@/components/ui/MagneticButton";

// Lazy load the Three.js WebGL canvas to protect initial load performance
const Scene3D = dynamic(() => import("@/components/3d/HeroScene"), {
  ssr: false,
  loading: () => null,
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
  description = "Comunidad de vinos y experiencias pensado para descubrir, regalar y disfrutar momentos que valen la pena repetir.",
  button_text = "Conocé MUNIV",
  conoce_descripcion = DEFAULT_CONOCE,
}: HeroProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      if (containerRef.current && textRef.current) {
        gsap.to(textRef.current, {
          y: 120,
          opacity: 0,
          scale: 0.94,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      }
    }
  }, []);

  const scrollToExperiences = () => {
    const el = document.getElementById("experiencias");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-[92vh] lg:min-h-screen w-full flex items-center justify-center overflow-hidden"
    >
      {/* 1. Cinematic Realistic AI Video Background */}
      <VideoBackground
        src="/videos/hero.mp4"
        overlay={true}
        overlayOpacity={0.65}
        className="z-0"
      >
        {/* 2. WebGL 3D Floating Embers layered on top of video */}
        <div className="absolute inset-0 z-[1] pointer-events-none opacity-60">
          <ErrorBoundary fallbackMessage="WebGL ambient layer fallback">
            <Scene3D />
          </ErrorBoundary>
        </div>

        {/* Ambient mesh vignettes */}
        <div className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-t from-[#0c0a09] via-transparent to-[#0c0a09]/50" />
        <div className="absolute inset-0 z-[2] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(12,10,9,0.7)_85%)]" />
      </VideoBackground>

      {/* 3. Hero Foreground Content */}
      <div
        ref={textRef}
        className="z-10 text-center flex flex-col items-center max-w-5xl px-6 py-20 relative pointer-events-none"
      >
        {/* Subtle pill badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-subtle border border-gold-500/20 text-gold-400 text-xs tracking-[0.2em] uppercase font-medium mb-8 pointer-events-auto"
        >
          <Sparkles size={13} className="text-gold-400 animate-pulse" />
          <span>Experiencias de autor & Comunidad</span>
        </motion.div>

        {/* Display Title with extreme contrast */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25 }}
          className="font-display font-medium text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-white mb-6 drop-shadow-[0_12px_36px_rgba(0,0,0,0.8)] leading-[1.08]"
          dangerouslySetInnerHTML={{ __html: title }}
        />

        {/* Descriptive copy with refined typography */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="text-base sm:text-lg md:text-xl text-[#e8e0d5]/85 font-light max-w-2xl mb-12 leading-relaxed drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
        >
          {description}
        </motion.p>

        {/* Interactive Action CTAs with Magnetic Effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="pointer-events-auto flex flex-wrap items-center justify-center gap-4"
        >
          <MagneticButton
            variant="secondary"
            size="lg"
            glow={true}
            magnetic={true}
            onClick={() => setIsDrawerOpen(true)}
            className="group"
          >
            <span>{button_text}</span>
            <span className="text-gold-400 group-hover:translate-x-1 transition-transform duration-300">
              →
            </span>
          </MagneticButton>

          <MagneticButton
            variant="primary"
            size="lg"
            glow={true}
            magnetic={true}
            onClick={scrollToExperiences}
          >
            Explorar Catálogo
          </MagneticButton>
        </motion.div>
      </div>

      {/* Scroll indicator prompt */}
      <motion.button
        onClick={scrollToExperiences}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 z-10 flex flex-col items-center gap-2 text-gold-400/60 hover:text-gold-400 transition-colors pointer-events-auto group cursor-pointer"
        aria-label="Desplazarse al catálogo"
      >
        <span className="text-[11px] tracking-[0.25em] uppercase font-light">Explorar</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown size={16} />
        </motion.div>
      </motion.button>

      {/* Side Drawer: Conocé MUNIV */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100]"
            />

            {/* Slide-over Drawer with heavy glass */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-full md:w-[540px] z-[101] flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.9)] glass-heavy border-l border-gold-500/20"
            >
              <div className="p-8 md:p-12 flex flex-col h-full">
                {/* Header with Close Button */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                  <span className="text-xs uppercase tracking-[0.25em] text-gold-400/80 font-medium">
                    Manifiesto MUNIV
                  </span>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all cursor-pointer"
                    aria-label="Cerrar panel"
                  >
                    <X size={22} />
                  </button>
                </div>

                {/* Content body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-6">
                  <h2 className="font-display text-4xl md:text-5xl text-white leading-tight">
                    ¿Qué es <br />
                    <span className="gradient-text-gold italic">MUNIV?</span>
                  </h2>

                  <div className="text-[#e8e0d5]/85 font-light leading-relaxed space-y-6 text-base md:text-lg">
                    {conoce_descripcion.split("\n\n").map((paragraph, idx) => (
                      <p key={idx} className="leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Footer CTA */}
                <div className="pt-8 mt-auto border-t border-white/10">
                  <MagneticButton
                    variant="primary"
                    size="md"
                    glow={true}
                    magnetic={false}
                    onClick={() => {
                      setIsDrawerOpen(false);
                      scrollToExperiences();
                    }}
                    className="w-full font-bold shadow-[0_0_30px_rgba(108,26,26,0.5)]"
                  >
                    Continuar Explorando
                  </MagneticButton>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}

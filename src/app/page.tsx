import Hero from "@/components/Hero";
import ExperienceList from "@/components/ExperienceList";
import BenefitList from "@/components/BenefitList";
import { getLandingContent } from "@/actions/admin";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionDivider } from "@/components/ui/SectionDivider";

export const dynamic = "force-dynamic";

export default async function Home() {
  const landingData = await getLandingContent();

  return (
    <main className="min-h-screen bg-[#0c0a09] selection:bg-gold-500/30 selection:text-white">
      {/* 1. Cinematic Hero with AI Realistic Video Background */}
      <Hero
        title={landingData?.hero_title}
        description={landingData?.hero_description}
        button_text={landingData?.hero_button_text}
        conoce_descripcion={landingData?.conoce_descripcion}
      />

      {/* 2. Catálogo de Experiencias */}
      <section
        id="experiencias"
        className="px-6 sm:px-8 md:px-12 py-24 md:py-32 mx-auto max-w-7xl relative z-10 scroll-mt-12"
      >
        <AnimatedSection variant="fadeInUp" className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-subtle border border-gold-500/20 text-gold-400 text-[11px] uppercase tracking-[0.2em] font-medium mb-4">
            Curaduría Exclusiva
          </div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-white mb-5 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
            Catálogo de <span className="gradient-text-gold italic">Experiencias</span>
          </h2>
          <SectionDivider variant="gold" className="my-6" />
          <p className="mt-4 text-[#e8e0d5]/70 font-light max-w-xl mx-auto text-base sm:text-lg">
            Etiquetas seleccionadas, cajas temáticas y encuentros en vivo diseñados para celebrar momentos auténticos.
          </p>
        </AnimatedSection>

        <ExperienceList />
      </section>

      {/* Decorative Transition Line */}
      <div className="max-w-5xl mx-auto px-6">
        <SectionDivider variant="ember" className="opacity-40" />
      </div>

      {/* 3. Beneficios para Miembros */}
      <section
        id="beneficios"
        className="px-6 sm:px-8 md:px-12 py-24 md:py-32 mx-auto max-w-7xl relative z-10 scroll-mt-12"
      >
        <AnimatedSection variant="fadeInUp" className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-subtle border border-burgundy-500/30 text-burgundy-400 text-[11px] uppercase tracking-[0.2em] font-medium mb-4">
            Club Privado
          </div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-white mb-5 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
            Beneficios para <span className="gradient-text-burgundy italic">miembros</span>
          </h2>
          <SectionDivider variant="burgundy" className="my-6" />
          <p className="mt-4 text-[#e8e0d5]/70 font-light max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Accedé a descuentos en bodegas asociadas, cortesías directas y privilegios reservados para la comunidad MUNIV.
          </p>
        </AnimatedSection>

        <BenefitList />
      </section>
    </main>
  );
}

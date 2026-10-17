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
    <main className="relative min-h-screen bg-transparent selection:bg-gold-500/30 selection:text-white overflow-hidden">
      {/* 1. Cinematic Hero with Editorial Display Typography */}
      <Hero
        title={landingData?.hero_title}
        description={landingData?.hero_description}
        button_text={landingData?.hero_button_text}
        conoce_descripcion={landingData?.conoce_descripcion}
      />

      {/* 2. Bento Grid Catálogo de Experiencias */}
      <section
        id="experiencias"
        className="px-4 sm:px-6 md:px-10 lg:px-12 py-24 md:py-32 mx-auto max-w-[1440px] relative z-10 scroll-mt-12 bg-transparent"
      >
        <AnimatedSection variant="fadeInUp" className="text-center mb-16 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-subtle border border-gold-500/20 text-gold-400 text-xs uppercase tracking-[0.25em] font-medium mb-6">
            Edición Limitada 2026
          </div>
          <h2 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white mb-6 drop-shadow-[0_8px_32px_rgba(0,0,0,0.9)] tracking-tight leading-[0.98]">
            Catálogo de <span className="gradient-text-gold italic font-light">Experiencias</span>
          </h2>
          <SectionDivider variant="gold" className="my-6" />
          <p className="mt-4 text-[#e8e0d5]/85 font-light max-w-2xl mx-auto text-base sm:text-lg md:text-xl leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            Curaduría de autor, cajas sensoriales y encuentros exclusivos. Cada tarjeta desbloquea un momento diseñado para repetirse.
          </p>
        </AnimatedSection>

        <ExperienceList />
      </section>

      {/* Decorative Transition Line */}
      <div className="max-w-6xl mx-auto px-6">
        <SectionDivider variant="gold" className="opacity-30" />
      </div>

      {/* 3. Bento Grid Beneficios para Miembros */}
      <section
        id="beneficios"
        className="px-4 sm:px-6 md:px-10 lg:px-12 py-24 md:py-32 mx-auto max-w-[1440px] relative z-10 scroll-mt-12 bg-transparent"
      >
        <AnimatedSection variant="fadeInUp" className="text-center mb-16 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-subtle border border-burgundy-500/30 text-burgundy-400 text-xs uppercase tracking-[0.25em] font-medium mb-6">
            Membresía & Privilegios
          </div>
          <h2 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white mb-6 drop-shadow-[0_8px_32px_rgba(0,0,0,0.9)] tracking-tight leading-[0.98]">
            Beneficios para <span className="gradient-text-burgundy italic font-light">miembros</span>
          </h2>
          <SectionDivider variant="burgundy" className="my-6" />
          <p className="mt-4 text-[#e8e0d5]/85 font-light max-w-2xl mx-auto text-base sm:text-lg md:text-xl leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            Accedé a recompensas exclusivas, descuentos directos en bodegas aliadas y cortesías reservadas para la comunidad MUNIV.
          </p>
        </AnimatedSection>

        <BenefitList />
      </section>
    </main>
  );
}

import Hero from "@/components/Hero";
import ExperienceList from "@/components/ExperienceList";
import BenefitList from "@/components/BenefitList";
import { getLandingContent } from "@/actions/admin";
import { getRedeemedBenefitIds } from "@/actions/benefits";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const landingData = await getLandingContent();


  return (
    <main className="min-h-screen bg-[#0c0a09]">
      <Hero 
        title={landingData?.hero_title}
        description={landingData?.hero_description}
        button_text={landingData?.hero_button_text}
        conoce_descripcion={landingData?.conoce_descripcion}
      />
      <div className="px-4 py-32 mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-4 drop-shadow-lg">
            Catálogo de <span className="text-gold-400 italic">Experiencias</span>
          </h2>
          <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto opacity-40"></div>
        </div>
        <ExperienceList />
      </div>

      <div className="px-4 py-32 mx-auto max-w-7xl relative z-10 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-4 drop-shadow-lg">
            Beneficios para <span className="text-burgundy-500 italic">miembros</span>
          </h2>
          <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-burgundy-600 to-transparent mx-auto opacity-40"></div>
          <p className="mt-6 text-slate-400 font-light max-w-2xl mx-auto">
            Accedé a recompensas exclusivas, descuentos en bodegas y experiencias de cortesía por ser parte de MUNIV.
          </p>
        </div>
        <BenefitList />
      </div>
    </main>
  );
}


import Hero from "@/components/Hero";
import ExperienceList from "@/components/ExperienceList";
import { getLandingContent } from "@/actions/admin";

export default async function Home() {
  const landingData = await getLandingContent();

  return (
    <main className="min-h-screen bg-[#0c0a09]">
      <Hero 
        title={landingData?.title}
        description={landingData?.description}
        button_text={landingData?.button_text}
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
    </main>
  );
}


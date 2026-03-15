import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import LogoutButton from "@/components/auth/LogoutButton";
import { User, CalendarCheck, Crown, Settings } from "lucide-react";

export default async function ClubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col md:flex-row relative overflow-hidden">
      {/* Abstract Backgrounds */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 -left-1/4 w-[80vw] h-[80vw] bg-rose-700/5 rounded-full blur-[150px]" />
      </div>

      {/* Sidebar for Desktop / Top Navigation for Mobile */}
      <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-white/10 bg-slate-950/50 backdrop-blur-xl z-20 flex flex-col pt-8 md:pt-12 px-6 pb-6 shadow-[10px_0_30px_rgba(0,0,0,0.2)]">
        <div className="flex justify-between items-center md:flex-col md:items-center gap-8 mb-10 border-b border-white/5 pb-10">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <Image
              src="/logo.png"
              alt="MUNIV Logo"
              width={160}
              height={53}
              className="w-auto h-12 md:h-16 object-contain"
              priority
            />
          </Link>

          <div className="md:mt-4">
            <LogoutButton />
          </div>
        </div>

        <nav className="flex-1 hidden md:flex flex-col gap-2">
          <span className="text-xs tracking-[0.2em] text-gold-500 font-bold uppercase mb-4 ml-1">Tu Espacio</span>
          <Link href="/club" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gold-500/10 border border-gold-500 text-gold-500 font-medium">
            <User size={18} /> Resumen
          </Link>
          <Link href="/club/reservas" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-300 transition-colors">
            <CalendarCheck size={18} /> Mis Reservas
          </Link>
          <Link href="/club/beneficios" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-300 transition-colors">
            <Crown size={18} /> Beneficios
          </Link>
          <div className="mt-8 border-t border-white/5 pt-8">
            <Link href="/club/perfil" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-300 transition-colors">
              <Settings size={18} /> Mi Perfil
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative z-10 min-h-screen">
        <div className="h-full overflow-y-auto w-full p-6 md:p-12 lg:px-20">
          {children}
        </div>
      </main>
    </div>
  );
}

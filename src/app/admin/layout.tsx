import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { checkIsAdmin } from '@/actions/admin';
import Link from "next/link";
import Image from "next/image";
import LogoutButton from "@/components/auth/LogoutButton";
import SidebarNav from "@/components/layout/SidebarNav";
import MobileNav from "@/components/layout/MobileNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdminCheck = await checkIsAdmin();

  if (!isAdminCheck) {
    redirect('/');
  }

  const isAdmin = true;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row relative overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-white/10 bg-slate-950/50 backdrop-blur-xl z-20 flex flex-col pt-8 md:pt-12 px-6 pb-6 shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
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

        <SidebarNav isAdmin={isAdmin} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative z-10 min-h-screen">
        <div className="h-full overflow-y-auto w-full p-6 md:p-12 lg:px-20 pb-32 md:pb-12">
          <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl text-white tracking-wide">
                Panel de Control <span className="text-gold-500 italic">MUNIV</span>
              </h1>
              <p className="text-slate-400 mt-2">
                Gestión centralizada de reservas y miembros del club.
              </p>
            </div>
          </header>

          <div className="flex-grow">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav isAdmin={isAdmin} />
    </div>
  );
}


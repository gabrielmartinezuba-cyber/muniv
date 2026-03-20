import { createClient } from "@/utils/supabase/server";
import { checkIsAdmin } from "@/actions/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import LogoutButton from "@/components/auth/LogoutButton";
import SidebarNav from "@/components/layout/SidebarNav";
import MobileNav from "@/components/layout/MobileNav";

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

  const isAdmin = await checkIsAdmin();

  return (
    <div className="min-h-screen bg-[#0c0a09] text-white flex flex-col md:flex-row relative overflow-hidden">
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

        <SidebarNav isAdmin={isAdmin} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative z-10 min-h-screen">
        <div className="h-full overflow-y-auto w-full p-6 md:p-12 lg:px-20 pb-32 md:pb-12">
          {children}
        </div>
      </main>

      <MobileNav isAdmin={isAdmin} />
    </div>
  );
}



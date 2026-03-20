import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== 'gabrielmartinezuba@gmail.com') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col pt-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto w-full">
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

        <main className="flex-grow">
          {children}
        </main>
      </div>
    </div>
  );
}

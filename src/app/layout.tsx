import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import BookingDrawer from "@/components/forms/BookingDrawer";
import { createClient } from "@/utils/supabase/server";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MUNIV | Diseñador de Momentos",
  description: "Club de experiencias vínicas curadas de alto perfil.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch user session on the server to pass to the Navbar
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="es" className="dark" style={{ colorScheme: "dark" }}>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased text-white bg-[#0B0F19] min-h-screen selection:bg-gold-500/30 selection:text-white`}
      >
        <Navbar initialUser={user} />
        {children}
        <BookingDrawer />
      </body>
    </html>
  );
}

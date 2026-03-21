import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import BookingDrawer from "@/components/forms/BookingDrawer";
import { createClient } from "@/utils/supabase/server";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MUNIV | La experiencia que nos gusta repetir 🍷",
  description: "Experiencias de vino para descubrir cómo disfrutarlo.",
  manifest: "/manifest.json",
  appleWebApp: {
    title: "MUNIV",
    statusBarStyle: "black-translucent",
    capable: true,
  },
  icons: {
    apple: "/logo.png",
  },
  openGraph: {
    title: "MUNIV | La experiencia que nos gusta repetir 🍷",
    description: "Experiencias de vino para descubrir cómo disfrutarlo.",
    siteName: "MUNIV",
    images: ["/logo.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MUNIV | La experiencia que nos gusta repetir 🍷",
    description: "Experiencias de vino para descubrir cómo disfrutarlo.",
    images: ["/logo.png"],
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#7c2020",
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
        className={`${inter.variable} ${playfair.variable} font-sans antialiased text-white bg-[#0c0a09] min-h-screen selection:bg-gold-500/30 selection:text-white`}
      >
        <Navbar initialUser={user} />
        {children}
        <BookingDrawer />
        <Toaster richColors position="top-right" theme="dark" />
      </body>
    </html>
  );
}


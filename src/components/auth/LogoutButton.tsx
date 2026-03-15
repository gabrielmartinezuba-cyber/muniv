"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOutUser } from "@/actions/auth";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLogout = () => {
    startTransition(async () => {
      await signOutUser();
      router.push("/");
      router.refresh();
    });
  };

  return (
    <button 
      onClick={handleLogout}
      disabled={isPending}
      className="flex items-center gap-2 text-sm text-slate-300 hover:text-rose-500 transition-colors"
      title="Cerrar Sesión"
    >
      <LogOut size={16} />
      Cerrar Sesión
    </button>
  );
}

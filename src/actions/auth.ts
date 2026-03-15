"use server";

import { createClient } from "@/utils/supabase/server";
import { SignUpSchema } from "@/schemas/auth";

export async function signUp(data: unknown) {
  try {
    // 1. Zod Validation en el server (El frontend ya lo hizo, pero no confiamos)
    const formData = SignUpSchema.parse(data);

    // 2. Inicializar Supabase Client con SSR Auth context
    const supabase = await createClient();

    // 3. Crear usuario inyectando metadata
    const { data: user, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      // URL para redirigir luego de confirmación
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          dob: formData.dob,
        },
      },
    });

    if (error) {
      if (error.status === 400 || error.message.toLowerCase().includes("already registered")) {
        return { success: false, message: "Este email ya está registrado o es inválido." };
      }
      throw error;
    }

    return { 
      success: true, 
      message: "Registro exitoso. Te enviamos un email para confirmar tu cuenta." 
    };

  } catch (error: any) {
    console.error("Auth Server Action CRASH:", error);
    if (error.name === "ZodError") {
      return { success: false, message: "Validación estricta fallida." };
    }
    return { success: false, message: "Ocurrió un error inesperado en el servidor." };
  }
}

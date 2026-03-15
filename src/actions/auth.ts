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
      if (error.status === 400 && error.message.toLowerCase().includes("already registered")) {
        return { success: false, message: "Este email ya está registrado." };
      }
      // Devolver error exacto de Supabase para UI handling
      return { success: false, message: error.message };
    }

    return { 
      success: true, 
      message: "Registro exitoso. Te enviamos un email para confirmar tu cuenta." 
    };

  } catch (error: any) {
    if (error?.name === "ZodError") {
      return { success: false, message: "Validación de formulario estricta fallida." };
    }
    
    // Observabilidad Crítica
    console.error("Auth Server Action CRASH COMPLETE:", error);
    
    return { success: false, message: "Ocurrió un error inesperado en el servidor." };
  }
}

export async function signIn(data: unknown) {
  try {
    const { email, password } = data as any; // Podríamos usar LoginSchema.parse(data), pero simplificamos

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Supabase devuelve "Invalid login credentials"
      return { success: false, message: "Correo o contraseña incorrectos." };
    }

    return { success: true, message: "Login exitoso" };
  } catch (error: any) {
    console.error("Auth SignIn CRASH:", error);
    return { success: false, message: "Ocurrió un error al intentar iniciar sesión." };
  }
}

export async function signOutUser() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function sendPasswordResetEmail(email: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/actualizar-password`,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: "Enlace de recuperación enviado. Revisa tu correo electrónico." };
  } catch (error: any) {
    console.error("Auth Reset Password CRASH:", error);
    return { success: false, message: "Ocurrió un error inesperado al enviar el correo." };
  }
}

export async function updateUserPassword(data: unknown) {
  try {
    const supabase = await createClient();
    const { password } = data as any; // Valdación básica extra

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: "Contraseña actualizada con éxito." };
  } catch (error: any) {
    console.error("Auth Update Password CRASH:", error);
    return { success: false, message: "Ocurrió un error inesperado al actualizar credenciales." };
  }
}


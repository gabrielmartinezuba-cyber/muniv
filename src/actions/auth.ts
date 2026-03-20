"use server";

import { createClient } from "@/utils/supabase/server";
import { SignUpSchema } from "@/schemas/auth";
import { headers } from "next/headers";

export async function signUp(data: unknown) {
  try {
    const formData = SignUpSchema.parse(data);
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
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
    console.error("Auth Server Action CRASH COMPLETE:", error);
    return { success: false, message: "Ocurrió un error inesperado en el servidor." };
  }
}

export async function signIn(data: unknown) {
  try {
    const { email, password } = data as any;
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
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
    const origin = (await headers()).get("origin") || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/actualizar-contrasena`,
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
    const { password } = data as any;

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

export async function updateUserData(data: { nombre: string; apellido: string }) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: data.nombre,
        last_name: data.apellido,
      },
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: "Datos actualizados correctamente." };
  } catch (error: any) {
    console.error("Auth Update User Data CRASH:", error);
    return { success: false, message: "Ocurrió un error inesperado al actualizar los datos." };
  }
}

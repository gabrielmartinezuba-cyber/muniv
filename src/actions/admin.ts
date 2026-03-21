"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export type AdminReportRow = {
  id: string;
  created_at: string;
  user_id: string;
  client_name: string;
  client_email: string;
  experience_title: string;
  experience_type: string;
  guests_count: number | null;
  total_price: number | null;
  status: string;
};

export async function getAdminExperiences(): Promise<{ id: string; title: string, image_url: string }[]> {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      throw new Error("Unauthorized access.");
    }

    const supabaseSession = await createClient();
    const { data, error } = await supabaseSession
      .from('experiences')
      .select('id, title, image_url')
      .order('display_order', { ascending: true });

    if (error || !data) {
      console.error("Error fetching admin experiences:", error);
      return [];
    }

    return data;
  } catch (error) {
    console.error("getAdminExperiences CRASH:", error);
    return [];
  }
}

export type AdminReportFilters = {
  experience_id?: string;
}

export async function getAdminReport(filters?: AdminReportFilters): Promise<AdminReportRow[]> {
  try {
    // 1. Verify Super Admin Access
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      throw new Error("Unauthorized access.");
    }

    // 2. Fetch data using PRIVILEGED client to bypass RLS
    const supabaseAdmin = createAdminClient();

    // SPECIAL CASE: Only Registered Members (Leads)
    if (filters?.experience_id === 'MEMBERS_ONLY') {
      const { data: admins } = await supabaseAdmin.from('admins').select('email');
      const adminEmails = new Set(admins?.map(a => a.email) || []);

      const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
      if (usersError) {
        console.error("Error fetching members:", usersError);
        throw new Error("Failed to retrieve members data.");
      }

      return users.map(u => {
        const rawMeta = u.user_metadata || {};
        const clientName = rawMeta.first_name 
          ? `${rawMeta.first_name} ${rawMeta.last_name || ''}`.trim() 
          : rawMeta.name || "Sin Nombre";

        const isAdminUser = u.email && adminEmails.has(u.email);

        return {
          id: u.id,
          created_at: u.created_at,
          user_id: u.id,
          client_name: clientName,
          client_email: u.email || "Sin Email",
          experience_title: '',
          experience_type: isAdminUser ? 'ADMIN' : 'MIEMBRO',
          guests_count: null,
          total_price: null,
          status: '-'
        };
      }).sort((a, b) => {
        if (a.experience_type === 'ADMIN' && b.experience_type !== 'ADMIN') return -1;
        if (a.experience_type !== 'ADMIN' && b.experience_type === 'ADMIN') return 1;
        return 0;
      });
    }

    let query = supabaseAdmin
      .from('bookings')
      .select('*, experiences!inner(title, type)')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.experience_id && filters.experience_id !== "ALL") {
      query = query.eq('experience_id', filters.experience_id);
    }

    const { data: bookings, error: bookingsError } = await query;

    if (bookingsError || !bookings) {
      console.error("Error fetching bookings:", bookingsError);
      throw new Error("Failed to retrieve bookings data.");
    }

    // 3. Fetch all users using Admin Client to bypass RLS on auth.users
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      console.error("Error fetching admin users:", usersError);
      throw new Error("Failed to cross-reference user data.");
    }

    // 4. Map and inject user data into bookings
    const reportData: AdminReportRow[] = bookings.map(booking => {
      const clientUser = users.find(u => u.id === booking.user_id);
      
      const rawMeta = clientUser?.user_metadata || {};
      const clientName = rawMeta.first_name 
        ? `${rawMeta.first_name} ${rawMeta.last_name || ''}`.trim() 
        : rawMeta.name || "Sin Nombre";
        
      return {
        id: booking.id,
        created_at: booking.created_at,
        user_id: booking.user_id,
        client_name: clientName,
        client_email: clientUser?.email || "Sin Email",
        experience_title: booking.experiences?.title || "N/A",
        experience_type: booking.experiences?.type || "N/A",
        guests_count: booking.guests_count,
        total_price: booking.total_price,
        status: booking.status
      };
    });

    return reportData;


  } catch (error) {
    console.error("Admin Report Action CRASH:", error);
    return [];
  }
}

export async function upsertExperience(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return { success: false, error: "Unauthorized access." };
    }

    const supabaseAdmin = createAdminClient();
    const id = formData.get('id') as string;
    const isNew = !id;
    const title = formData.get('title') as string;
    
    // We omit 'date' to prevent DB errors as the column doesn't exist, but we capture the rest
    const updates: any = {
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: formData.get('description') as string,
      type: formData.get('type') as string,
      status: formData.get('status') as string,
      price: parseFloat(formData.get('price') as string) || 0,
    };

    if (!isNew) {
      updates.id = id;
    }

    // Image Upload Logic
    const imageFile = formData.get('image') as File;
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop() || 'png';
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const bucketName = 'experiencias';

      const { error: uploadError } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        return { success: false, error: "Error al subir la imagen." };
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      updates.image_url = publicUrlData.publicUrl;
    }
    
    if (isNew) {
      // Create logic needs an image if none provided
      if (!updates.image_url) {
        updates.image_url = '/placeholder.jpg';
      }
      
      const { error: dbError } = await supabaseAdmin
        .from('experiences')
        .insert(updates);

      if (dbError) {
        console.error("Insert experience error:", dbError);
        return { success: false, error: dbError.message };
      }
    } else {
      const { error: dbError } = await supabaseAdmin
        .from('experiences')
        .update(updates)
        .eq('id', id);

      if (dbError) {
        console.error("Update experience error:", dbError);
        return { success: false, error: dbError.message };
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("upsertExperience exception:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteExperience(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return { success: false, error: "Unauthorized access." };
    }

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
      .from('experiences')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAdminExperienceDetails(id: string) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      throw new Error("Unauthorized access.");
    }

    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from('experiences')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("getAdminExperienceDetails error:", error);
    return null;
  }
}

export async function checkIsAdmin(): Promise<boolean> {
  try {
    const supabaseSession = await createClient();
    const { data: { user } } = await supabaseSession.auth.getUser();
    if (!user || !user.email) return false;
    
    // Check if the email exists in the `admins` table
    const { data } = await supabaseSession
      .from('admins')
      .select('email')
      .eq('email', user.email)
      .single();
      
    return !!data;
  } catch (error) {
    return false;
  }
}

export async function addAdmin(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return { success: false, error: "Unauthorized access." };
    }
    
    const email = formData.get("email")?.toString().trim();
    if (!email) return { success: false, error: "El email es requerido." };
    
    const supabaseAdmin = createAdminClient();
    
    // Validate if the user exists in auth.users
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      return { success: false, error: "Error de conexión al listar usuarios." };
    }
    
    const userExists = users.some(u => u.email === email);
    if (!userExists) {
      return { success: false, error: "El usuario debe registrarse primero." };
    }
    
    // Check if already in the admins table to avoid generic duplicate errors
    const { data: existingAdmin } = await supabaseAdmin
      .from('admins')
      .select('email')
      .eq('email', email)
      .single();
      
    if (existingAdmin) {
      return { success: false, error: "El usuario ya es administrador." };
    }
    
    const { error: insertError } = await supabaseAdmin
      .from('admins')
      .insert({ email });
      
    if (insertError) {
      console.error("Insert error for new admin:", insertError);
      return { success: false, error: insertError.message || "Error al asignar el rol." };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


export async function getLandingContent() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('landing_content')
      .select('*')
      .maybeSingle(); // handle case where table is empty without throwing error
    
    if (error) {
       console.error("Error fetching landing content:", error);
       return null;
    }
    return data;
  } catch (error) {
    return null;
  }
}

export async function updateLandingContent(formData: FormData) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) return { success: false, error: "Unauthorized." };

    const supabaseAdmin = createAdminClient();
    const hero_title = formData.get("title");
    const hero_description = formData.get("description");
    const hero_button_text = formData.get("button_text");
    const conoce_descripcion = formData.get("conoce_descripcion");

    const { data: existing } = await supabaseAdmin.from('landing_content').select('id').maybeSingle();
    
    let dbError;
    const payload = { 
      hero_title, 
      hero_description, 
      hero_button_text, 
      conoce_descripcion 
    };

    if (existing) {
      const { error } = await supabaseAdmin
        .from('landing_content')
        .update(payload)
        .eq('id', existing.id);
      dbError = error;
    } else {
      const { error } = await supabaseAdmin
        .from('landing_content')
        .insert(payload);
      dbError = error;
    }

    if (dbError) {
      console.error("Database error updating landing content:", dbError);
      return { success: false, error: dbError.message };
    }

    revalidatePath('/');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error("updateLandingContent exception:", error);
    return { success: false, error: error.message };
  }
}

export async function saveExperienceOrder(orderedIds: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) return { success: false, error: "Unauthorized." };

    const supabaseAdmin = createAdminClient();
    
    // Serial updates for order to ensure consistency
    for (let i = 0; i < orderedIds.length; i++) {
      const { error } = await supabaseAdmin
        .from('experiences')
        .update({ display_order: i + 1 })
        .eq('id', orderedIds[i]);
      
      if (error) throw error;
    }

    revalidatePath('/admin/experiencias');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error("saveExperienceOrder error:", error);
    return { success: false, error: error.message };
  }
}


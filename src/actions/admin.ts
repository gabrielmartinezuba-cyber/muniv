"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

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

export async function getAdminExperiences(): Promise<{ id: string; title: string }[]> {
  try {
    const supabaseSession = await createClient();
    const { data: { user } } = await supabaseSession.auth.getUser();

    if (!user || user.email !== 'gabrielmartinezuba@gmail.com') {
      throw new Error("Unauthorized access.");
    }

    const { data, error } = await supabaseSession
      .from('experiences')
      .select('id, title')
      .order('title', { ascending: true });

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
    const supabaseSession = await createClient();
    const { data: { user } } = await supabaseSession.auth.getUser();

    if (!user || user.email !== 'gabrielmartinezuba@gmail.com') {
      throw new Error("Unauthorized access.");
    }

    // 2. Fetch data using PRIVILEGED client to bypass RLS
    const supabaseAdmin = createAdminClient();

    // SPECIAL CASE: Only Registered Members (Leads)
    if (filters?.experience_id === 'MEMBERS_ONLY') {
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

        return {
          id: u.id,
          created_at: u.created_at,
          user_id: u.id,
          client_name: clientName,
          client_email: u.email || "Sin Email",
          experience_title: 'Socio Registrado',
          experience_type: 'MIEMBRO',
          guests_count: null,
          total_price: null,
          status: '-'
        };
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
    const supabaseSession = await createClient();
    const { data: { user } } = await supabaseSession.auth.getUser();
    if (!user || user.email !== 'gabrielmartinezuba@gmail.com') {
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
    const supabaseSession = await createClient();
    const { data: { user } } = await supabaseSession.auth.getUser();
    if (!user || user.email !== 'gabrielmartinezuba@gmail.com') {
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
    const supabaseSession = await createClient();
    const { data: { user } } = await supabaseSession.auth.getUser();
    if (!user || user.email !== 'gabrielmartinezuba@gmail.com') {
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

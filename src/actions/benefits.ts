"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { checkIsAdmin } from "./admin";
import { revalidatePath } from "next/cache";

export type Benefit = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  created_at?: string;
};

// --- ADMIN ACTIONS ---

export async function getBenefits(): Promise<Benefit[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('benefits')
      .select('*')
      .order('title', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("getBenefits error:", error);
    return [];
  }
}

export async function upsertBenefit(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) return { success: false, error: "Unauthorized." };

    const supabaseAdmin = createAdminClient();
    const id = formData.get('id') as string;
    const isNew = !id || id === 'new';
    
    const updates: any = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
    };

    // Image Upload Logic (reused from experiences)
    const imageFile = formData.get('image') as File;
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop() || 'png';
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const bucketName = 'experiencias'; // Using the established bucket to ensure it exists

      const { error: uploadError } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(fileName, imageFile);

      if (!uploadError) {
        const { data: publicUrlData } = supabaseAdmin.storage
          .from(bucketName)
          .getPublicUrl(fileName);
        updates.image_url = publicUrlData.publicUrl;
      } else {
         console.error("Upload error:", uploadError);
      }
    }

    if (isNew) {
      if (!updates.image_url) updates.image_url = '/placeholder.jpg';
      const { error } = await supabaseAdmin.from('benefits').insert(updates);
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin.from('benefits').update(updates).eq('id', id);
      if (error) throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("upsertBenefit error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteBenefit(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) return { success: false, error: "Unauthorized." };

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.from('benefits').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}



// --- USER ACTIONS ---

export async function redeemBenefit(benefitId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return { success: false, error: "Debes iniciar sesión para canjear beneficios." };
    }

    // 1. Check if already redeemed
    const { data: existing } = await supabase
      .from('user_benefits')
      .select('id')
      .eq('benefit_id', benefitId)
      .eq('user_email', user.email)
      .maybeSingle();

    if (existing) {
      return { success: false, error: "Ya has canjeado este beneficio." };
    }

    // 2. Redeem
    const { error } = await supabase
      .from('user_benefits')
      .insert({ benefit_id: benefitId, user_email: user.email });

    if (error) throw error;

    // 3. Purge Cache
    revalidatePath('/', 'layout');
    revalidatePath('/club/beneficios');

    return { success: true };
  } catch (error: any) {
    console.error("redeemBenefit error:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserBenefits(userEmail: string): Promise<Benefit[]> {
  try {
    const supabase = await createClient();
    
    // 1. Get IDs
    const { data: redeemed, error: rError } = await supabase
      .from('user_benefits')
      .select('benefit_id')
      .eq('user_email', userEmail);

    if (rError) throw rError;
    if (!redeemed || redeemed.length === 0) return [];

    const benefitIds = redeemed.map(r => r.benefit_id);

    // 2. Get full details
    const { data: benefits, error: bError } = await supabase
      .from('benefits')
      .select('*')
      .in('id', benefitIds);

    if (bError) throw bError;
    return benefits || [];
  } catch (error) {
    console.error("getUserBenefits error:", error);
    return [];
  }
}
export async function getRedeemedBenefitIds(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return [];

    const { data, error } = await supabase
      .from('user_benefits')
      .select('benefit_id')
      .eq('user_email', user.email);

    if (error) throw error;
    return data?.map(item => item.benefit_id) || [];
  } catch (error) {
    console.error("getRedeemedBenefitIds error:", error);
    return [];
  }
}

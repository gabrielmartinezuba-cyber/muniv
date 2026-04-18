"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export type Experience = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  type: string;
  image_url: string;
  status: 'ACTIVE' | 'SOLD_OUT' | 'COMING_SOON' | 'INACTIVE';
  event_date: string | null;
  temp_discount: number | null;
  max_capacity: number | null;
};

export async function getActiveExperiences(): Promise<Experience[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .in('status', ['ACTIVE', 'SOLD_OUT', 'COMING_SOON'])
    .order('display_order', { ascending: true });

  if (error) {
    console.error("Error fetching experiences:", error);
    return [];
  }

  return data as Experience[];
}


export async function getExperienceAvailability(id: string): Promise<{ sold: number, total: number, remaining: number }> {
  try {
    const supabaseAdmin = createAdminClient();
    
    // 1. Get max capacity
    const { data: exp } = await supabaseAdmin
      .from('experiences')
      .select('max_capacity')
      .eq('id', id)
      .single();
    
    const total = exp?.max_capacity || 0;
    if (total === 0) return { sold: 0, total: 0, remaining: 999 }; // Unlimited if not set

    // 2. Count active bookings (not canceled)
    const { data: bookings } = await supabaseAdmin
      .from('bookings')
      .select('guests_count')
      .eq('experience_id', id)
      .not('status', 'eq', 'CANCELADO');
    
    const sold = bookings?.reduce((acc, b) => acc + (b.guests_count || 0), 0) || 0;
    
    return {
      sold,
      total,
      remaining: Math.max(0, total - sold)
    };
  } catch (error) {
    console.error("Error getting availability:", error);
    return { sold: 0, total: 0, remaining: 0 };
  }
}

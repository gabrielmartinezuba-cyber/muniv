"use server";

import { createClient } from "@/utils/supabase/server";

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
  temporal_discount: number | null;
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


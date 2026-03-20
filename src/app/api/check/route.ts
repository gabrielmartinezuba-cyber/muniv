import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('experiences').select('*').limit(1);
  return NextResponse.json({ keys: data ? Object.keys(data[0]) : error });
}


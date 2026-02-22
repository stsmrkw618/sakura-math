import { createClient } from '@supabase/supabase-js';

let supabase = null;

function getClient() {
  if (supabase) return supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  supabase = createClient(url, key);
  return supabase;
}

function getFamilyId() {
  return process.env.NEXT_PUBLIC_FAMILY_ID || 'default-family';
}

export function isSupabaseEnabled() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function fetchProgress() {
  try {
    const client = getClient();
    if (!client) return null;
    const { data, error } = await client
      .from('progress')
      .select('data, updated_at')
      .eq('family_id', getFamilyId())
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null; // row not found
      console.warn('[supabase] fetch error:', error.message);
      return null;
    }
    return data?.data || null;
  } catch (e) {
    console.warn('[supabase] fetch error:', e.message);
    return null;
  }
}

export async function pushProgress(progress) {
  try {
    const client = getClient();
    if (!client) return;
    const { error } = await client
      .from('progress')
      .upsert({
        family_id: getFamilyId(),
        data: progress,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'family_id' });
    if (error) {
      console.warn('[supabase] push error:', error.message);
    }
  } catch (e) {
    console.warn('[supabase] push error:', e.message);
  }
}

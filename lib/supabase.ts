import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function hasSupabase(): boolean {
  return Boolean(supabase);
}

export async function uploadCourseFile(file: File, folder: string) {
  if (!supabase) {
    return { ok: false, url: '', message: 'Supabase no está configurado.' };
  }

  const cleanName = file.name.replace(/\s+/g, '-');
  const filePath = `${folder}/${Date.now()}-${cleanName}`;

  const { error } = await supabase.storage.from('course-materials').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    return { ok: false, url: '', message: error.message };
  }

  const { data } = supabase.storage.from('course-materials').getPublicUrl(filePath);
  return { ok: true, url: data.publicUrl, message: 'Archivo subido correctamente.' };
}

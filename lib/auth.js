import { createClient } from "@supabase/supabase-js";

export function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// 🔐 obtener sesión
export async function getUser() {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

// 🔐 proteger rutas (frontend)
export async function requireAuth() {
  const user = await getUser();

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  return user;
}

// 🔥 helper SaaS clave
export function getBusinessId(user) {
  // simple multi-tenant base (luego lo mejoras con profiles)
  return user?.id;
}

import { supabase } from './supabase';

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getAccessToken(): Promise<string | null> {
  // refreshSession ensures we always have a valid non-expired token
  const { data } = await supabase.auth.refreshSession();
  if (data.session) return data.session.access_token;
  // fallback to existing session
  const { data: existing } = await supabase.auth.getSession();
  return existing.session?.access_token ?? null;
}

export async function signOut() {
  await supabase.auth.signOut();
}

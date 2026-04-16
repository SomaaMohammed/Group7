import { getSupabaseServer } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

function normalize(user) {
  if (!user) return null;
  return { id: user.id, username: user.username, email: user.email };
}

export async function getSession() {
  const supabase = await getSupabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) return null;
  const profile = await prisma.user.findUnique({
    where: { id: data.user.id },
    select: { id: true, username: true, email: true },
  });
  return normalize(profile);
}

export async function requireUser() {
  const user = await getSession();
  if (!user) throw new Response("Unauthorized", { status: 401 });
  return user;
}

export async function signUp({ email, username, password }) {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  const profile = await prisma.user.create({
    data: { id: data.user.id, email, username },
    select: { id: true, username: true, email: true },
  });
  return normalize(profile);
}

export async function signIn({ email, password }) {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const profile = await prisma.user.findUnique({
    where: { id: data.user.id },
    select: { id: true, username: true, email: true },
  });
  return normalize(profile);
}

export async function signOut() {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
}
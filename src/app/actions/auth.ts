"use server";
import { createClient } from "@/src/lib/server"; // Use server-side supabase client

export async function signInAction(formData: FormData) {
  const ALLOWED_ADMIN_EMAIL = "frinapv@gmail.com"; // YOUR ACTUAL ADMIN EMAIL

  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (email.toLowerCase() !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
      return { error: "Access Denied: Only the store administrator can log in." };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
  } catch (err: any) {
    console.error("signInAction exception:", err);
    return { error: `Server exception: ${err.message}` };
  }
  
  // Return success to let the client handle the redirect
  return { success: true };
}

export async function signUpAction(formData: FormData) {
  return { error: "Public registration is disabled. Only authorized administrators can access this portal." };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { success: true };
}

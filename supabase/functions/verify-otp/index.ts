import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Generic response used for any non-success path so we never leak account
  // existence (or lack thereof) to unauthenticated callers.
  const genericInvalid = () =>
    new Response(JSON.stringify({ error: "Código inválido ou expirado" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const SITE_URL = Deno.env.get("SITE_URL") ?? "";

    const { phone, code } = await req.json();
    if (!phone || !code || typeof phone !== "string" || typeof code !== "string") {
      return genericInvalid();
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const hashedCode = await hashCode(code);

    // Find valid OTP by comparing hashed code
    const { data: otpData, error: otpError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("phone", phone)
      .eq("code", hashedCode)
      .eq("verified", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError) {
      console.error("verify-otp DB error:", otpError.message);
      return genericInvalid();
    }

    if (!otpData) {
      return genericInvalid();
    }

    // Mark as verified
    await supabase.from("otp_codes").update({ verified: true }).eq("id", otpData.id);

    // Find user by phone number in profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("whatsapp_number", phone)
      .maybeSingle();

    // If no matching profile, return success without revealing it.
    // The user simply won't get an email — this prevents account enumeration.
    if (!profile) {
      return new Response(JSON.stringify({ verified: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user email (server-side only, never returned to client)
    const { data: userData } = await supabase.auth.admin.getUserById(profile.user_id);
    const email = userData?.user?.email;

    if (email) {
      // Send the password recovery email server-side via Supabase Auth.
      // This delivers the reset link to the user's verified inbox — so even if
      // an attacker brute-forces the OTP they cannot intercept the recovery
      // link (it goes to email, not to the API response).
      const redirectTo = SITE_URL
        ? `${SITE_URL}/reset-password`
        : undefined;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        redirectTo ? { redirectTo } : undefined,
      );

      if (resetError) {
        console.error("verify-otp reset email error:", resetError.message);
      }
    }

    // Never return email or recovery token to the client.
    return new Response(JSON.stringify({ verified: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("verify-otp error:", msg);
    // Generic message to client, detail stays in server logs.
    return new Response(JSON.stringify({ error: "Erro ao verificar código" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

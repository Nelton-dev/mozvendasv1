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

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const { phone, code } = await req.json();
    if (!phone || !code) {
      return new Response(JSON.stringify({ error: "Telefone e código são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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

    if (otpError) throw new Error(`DB error: ${otpError.message}`);

    if (!otpData) {
      return new Response(JSON.stringify({ error: "Código inválido ou expirado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark as verified
    await supabase.from("otp_codes").update({ verified: true }).eq("id", otpData.id);

    // Find user by phone number in profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("whatsapp_number", phone)
      .maybeSingle();

    if (!profile) {
      return new Response(JSON.stringify({ error: "Nenhuma conta encontrada com este número" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user email
    const { data: userData } = await supabase.auth.admin.getUserById(profile.user_id);
    if (!userData?.user?.email) {
      return new Response(JSON.stringify({ error: "Erro ao recuperar dados do usuário" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate recovery link for this user
    const { data: recoveryData, error: recoveryError } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: userData.user.email,
    });

    if (recoveryError) throw new Error(`Recovery error: ${recoveryError.message}`);

    return new Response(JSON.stringify({
      success: true,
      verified: true,
      recovery_token: recoveryData.properties?.hashed_token,
      email: userData.user.email,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("verify-otp error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

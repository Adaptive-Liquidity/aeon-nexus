import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// @ts-ignore
const HCAPTCHA_SECRET = Deno.env.get("HCAPTCHA_SECRET") || "ES_DEMO_SECRET_PLACEHOLDER"
const SITEKEY = "c3ea7102-0442-4b92-b390-a45ec2ca10e6"

serve(async (req: Request) => {
  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, name, captchaToken } = await req.json()

    // Verify hCaptcha
    const params = new URLSearchParams({
      secret: HCAPTCHA_SECRET,
      response: captchaToken,
      sitekey: SITEKEY,
    })

    const res = await fetch("https://api.hcaptcha.com/siteverify", {
      method: "POST",
      body: params,
    })

    const data = await res.json()

    if (!data.success) {
      return new Response(
        JSON.stringify({ error: "Captcha verification failed", details: data["error-codes"] }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: "Nexus Passport authorized" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    })
  }
})

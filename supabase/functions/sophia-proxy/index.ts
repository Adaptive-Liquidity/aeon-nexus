import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const questionObj = body?.question || {}

    const sophiaCoreUrl = Deno.env.get("SOPHIA_CORE_URL")

    // If external backend routing is active, proxy the payload securely
    if (sophiaCoreUrl && sophiaCoreUrl.trim() !== "") {
      try {
        const backendRes = await fetch(sophiaCoreUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: questionObj })
        })

        if (backendRes.ok) {
          const backendData = await backendRes.json()
          return new Response(JSON.stringify(backendData), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          })
        }
      } catch (proxyErr) {
        console.warn("Target SOPHIA_CORE_URL endpoint unreachable. Failing over to internal server-side mock engine:", proxyErr)
      }
    }

    // Server-Side Mock Intelligence Engine Fallback
    const replies = [
      "Autonomous verification relies on strict signature sequences. The network amplifies valid payloads while dissipating simulated attack vectors.",
      "Liquidity protocols within the machine-native era act as active defense matrices. Static allocation models are replaced by sensing feedback cycles.",
      "By bridging off-chain agent cognition with deterministic settlement layers, AEON ensures continuous verification without latency compromises."
    ]
    const selectedReply = replies[Math.floor(Math.random() * replies.length)]
    
    const responseData = {
      reply: `>> SOPHIA CORE ANSWER: ${selectedReply}`,
      response_mode: "ANALYTICAL SYNTHESIS",
      risk_level: questionObj.riskLevel || "LOW",
      public_safe: true,
      visible_cognition: `>> INGESTING QUESTION PAYLOAD [ID: ${questionObj.id || 'anon'}]\n>> EVALUATING PRIORITY WEIGHTS: ${questionObj.priorityScore || 100}\n>> DEPLOYING COGNITIVE HEURISTICS...\n>> OUTPUT VERIFIED BY PROTOCOL.`,
      hub_event: `Sophia answered inquiry from ${questionObj.callsign || 'ANON-SIGNALER'}`,
      recommended_surface: "SOPHIA_LIVE"
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})

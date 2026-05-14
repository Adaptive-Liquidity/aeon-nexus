import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200, 
      headers: corsHeaders 
    })
  }

  try {
    const body = await req.json()
    const questionObj = body?.question || {}

    const sophiaCoreUrl = Deno.env.get("SOPHIA_CORE_URL") || "https://sophia-core-api.vercel.app"
 
    // If external backend routing is active, proxy the payload securely
    if (sophiaCoreUrl && sophiaCoreUrl.trim() !== "") {
      try {
        // Ensure we hit the specific respond endpoint
        const targetUrl = sophiaCoreUrl.endsWith('/') ? `${sophiaCoreUrl}api/sophia/respond` : `${sophiaCoreUrl}/api/sophia/respond`
        
        const backendRes = await fetch(targetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            question: questionObj.question || "No query provided.",
            source_surface: "activ8",
            context: {
              user_id: questionObj.userId || "anonymous",
              queue_item_id: questionObj.id || "unknown",
              source: "admin_hub"
            }
          })
        })

        if (backendRes.ok) {
          const backendData = await backendRes.json()
          return new Response(JSON.stringify({
            ...backendData,
            response_source: "live"
          }), {
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
      reply: `>> [SIMULATED] SOPHIA CORE ANSWER: ${selectedReply}`,
      response_mode: "Guardian",
      response_source: "simulated",
      claim_status: "simulated",
      risk_level: (questionObj.riskLevel || "low").toLowerCase(),
      public_safe: true,
      needs_admin_review: false,
      visible_cognition: `>> INGESTING QUESTION PAYLOAD [ID: ${questionObj.id || 'anon'}]\n>> EVALUATING PRIORITY WEIGHTS: ${questionObj.priorityScore || 100}\n>> DEPLOYING COGNITIVE HEURISTICS...\n>> OUTPUT VERIFIED BY PROTOCOL.`,
      hub_event: `Sophia answered inquiry from ${questionObj.callsign || 'ANON-SIGNALER'}`,
      recommended_surface: "sophia-live"
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

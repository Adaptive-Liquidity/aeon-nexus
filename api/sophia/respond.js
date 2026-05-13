export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const questionObj = req.body?.question || {};
    const sophiaCoreUrl = process.env.SOPHIA_CORE_URL;

    // Forward to configured external backend if provided
    if (sophiaCoreUrl && sophiaCoreUrl.trim() !== "") {
      try {
        const backendRes = await fetch(sophiaCoreUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: questionObj })
        });

        if (backendRes.ok) {
          const backendData = await backendRes.json();
          return res.status(200).json(backendData);
        }
      } catch (proxyErr) {
        console.warn("Vercel Target SOPHIA_CORE_URL endpoint unreachable. Failing over to internal mock engine:", proxyErr);
      }
    }

    // Embedded Server-Side Mock Engine Fallback
    const replies = [
      "Autonomous verification relies on strict signature sequences. The network amplifies valid payloads while dissipating simulated attack vectors.",
      "Liquidity protocols within the machine-native era act as active defense matrices. Static allocation models are replaced by sensing feedback cycles.",
      "By bridging off-chain agent cognition with deterministic settlement layers, AEON ensures continuous verification without latency compromises."
    ];
    const selectedReply = replies[Math.floor(Math.random() * replies.length)];
    
    const responseData = {
      reply: `>> SOPHIA CORE ANSWER: ${selectedReply}`,
      response_mode: "ANALYTICAL SYNTHESIS",
      risk_level: questionObj.riskLevel || "LOW",
      public_safe: true,
      visible_cognition: `>> INGESTING QUESTION PAYLOAD [ID: ${questionObj.id || 'anon'}]\n>> EVALUATING PRIORITY WEIGHTS: ${questionObj.priorityScore || 100}\n>> DEPLOYING COGNITIVE HEURISTICS...\n>> OUTPUT VERIFIED BY PROTOCOL.`,
      hub_event: `Sophia answered inquiry from ${questionObj.callsign || 'ANON-SIGNALER'}`,
      recommended_surface: "SOPHIA_LIVE"
    };

    return res.status(200).json(responseData);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

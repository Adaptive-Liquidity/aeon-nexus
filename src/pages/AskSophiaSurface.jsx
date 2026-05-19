import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { storageController } from '../lib/storage';
import { callSophiaCoreProxy } from '../lib/api';

export default function AskSophiaSurface({ user, onNavigate }) {
  const [qText, setQText] = useState("");
  const [category, setCategory] = useState("ARCHITECTURE");
  const [risk, setRisk] = useState("LOW");
  const [statusMsg, setStatusMsg] = useState(null);
  const links = storageController.safeGet("official_links") || {};
  const queryClient = useQueryClient();

  // Compute live priority scores
  const repScore = user?.rep || 10;
  const questCount = Object.keys(user?.tasks || {}).length;
  const calculatedPriority = 100 + repScore + (questCount * 25) - (risk === "HIGH" ? 200 : 0);

  const mutation = useMutation({
    mutationFn: async (newQ) => {
      // Get the real supabase session id if available
      const { data: { session } } = await supabase.auth.getSession();
      
      // 1. Insert into Postgres
      const { data: question, error } = await supabase
        .from('questions')
        .insert({
          user_id: session?.user?.id || null, // Allow null for MVP local demo users if RLS allows, or wait, RLS requires matching uid. 
          // Wait, if RLS fails, it fails. We assume Phase 4 or Auth is hooked up eventually.
          // For now, if no session, RLS will reject. But we'll try:
          callsign: newQ.callsign,
          question: newQ.question,
          priority_score: newQ.priorityScore,
          status: newQ.status,
          category: newQ.category,
          risk_level: newQ.riskLevel
        })
        .select()
        .single();
        
      if (error) {
        console.error("Supabase Error:", error);
        throw error;
      }

      // 2. Broadcast Hub Event
      await supabase.from('hub_events').insert({
        text: `New inquiry added to Sophia queue by ${newQ.callsign}`,
        time_label: "Just now",
        type: "QUEUE"
      });

      return question;
    },
    onSuccess: (question) => {
      setStatusMsg(`Inquiry logged successfully. [ID: ${question.id}] Initiating secure uplink to Sophia Core...`);
      setQText("");
      queryClient.invalidateQueries(['questions']);
      
      // AUTO-SYNTHESIS: Trigger the server-side proxy call immediately
      callSophiaCoreProxy({ ...question, priorityScore: question.priority_score, riskLevel: question.risk_level }, async (resData) => {
        // Save the response to the Postgres answers table
        await supabase.from('answers').insert({
          question_id: question.id,
          reply: resData.reply,
          response_mode: resData.response_mode || resData.responseMode,
          visible_cognition: resData.visible_cognition || resData.visibleCognition,
          featured: false
        });
        
        // Update question status to 'answered'
        await supabase.from('questions').update({ status: 'answered' }).eq('id', question.id);
        
        queryClient.invalidateQueries(['questions']);
        queryClient.invalidateQueries(['answers']);
        setStatusMsg(`Inquiry processed. Synthesis captured and routed to ACTIV8 Admin for final review.`);
      });
    },
    onError: (err) => {
      setStatusMsg(`Error logging inquiry: ${err.message}. Please sign in with Supabase Auth to bypass RLS.`);
    }
  });

  const handleSubmit = () => {
    if (!qText.trim()) return;
    mutation.mutate({
      callsign: user?.name || "ANON-SIGNALER",
      question: qText,
      priorityScore: calculatedPriority,
      status: "submitted",
      category,
      riskLevel: risk,
    });
  };

  return (
    <div className="surface-card">
      <div className="sl">SOPHIA CORE INTAKE TERMINAL</div>
      <p className="sd">Submit queries directly to the intelligence layer. High priority assignments receive accelerated autonomous synthesis.</p>
      
      {statusMsg && <div className="status-box success">{statusMsg}</div>}

      <div className="form-grid">
        <div className="fi">
          <label>INQUIRY PAYLOAD</label>
          <textarea rows="4" placeholder="Enter continuous text prompt for Sophia..." value={qText} onChange={e=>setQText(e.target.value)} className="q-area" />
        </div>
        <div className="grid-2">
          <div className="fi">
            <label>ROUTING CATEGORY</label>
            <select value={category} onChange={e=>setCategory(e.target.value)} className="q-sel">
              <option value="ARCHITECTURE">ARCHITECTURE</option>
              <option value="LIQUIDITY">LIQUIDITY</option>
              <option value="GOVERNANCE">GOVERNANCE</option>
              <option value="SAFETY">SAFETY / VERIFICATION</option>
            </select>
          </div>
          <div className="fi">
            <label>RISK PROFILE</label>
            <select value={risk} onChange={e=>setRisk(e.target.value)} className="q-sel">
              <option value="LOW">LOW RISK (STANDARD)</option>
              <option value="HIGH">HIGH RISK (REQUIRES AUDIT)</option>
            </select>
          </div>
        </div>
      </div>

      <button className="bp" onClick={handleSubmit}>TRANSMIT TO SOPHIA QUEUE</button>

      {/* Priority Engine Score Visualizer */}
      <div className="priority-engine-view">
        <div className="pev-title">PRIORITY SCORING ENGINE MATH</div>
        <div className="pev-formula">
          <span>Score = HolderBonus(+100) + RepScore(+{repScore}) + QuestsBonus(+{questCount*25}) - RiskPenalty({risk==="HIGH"?200:0})</span>
        </div>
        <div className="pev-result">Calculated Priority Index: <strong>{calculatedPriority}</strong></div>
        <p className="dis">Note: Safety-critical alerts and protocol link access are permanently unblocked for all tiers.</p>
      </div>

      {/* Official links safety block reminder */}
      <div className="safety-block-reminder">
        <div className="sbr-title">🔒 VERIFIED ENDPOINTS & DEFENSE REMINDER</div>
        <div className="sbr-links">
          <a href={links.ca || "#"} target="_blank" rel="noreferrer">Contract: {links.ca?.slice(0,18)}...</a>
          <a href={links.telegram || "#"} target="_blank" rel="noreferrer">Official Telegram</a>
          <a href={links.x || "#"} target="_blank" rel="noreferrer">Official 𝕏</a>
        </div>
        <div className="sbr-rule">{links.warning}</div>
      </div>
    </div>
  );
}

// ROUTE: /admin/sophia (Protected by Admin Identity & Passcode)

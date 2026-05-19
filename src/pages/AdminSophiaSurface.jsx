import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { callSophiaCoreProxy } from '../lib/api';

export default function AdminSophiaSurface({ user, onNavigate }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [simOutput, setSimOutput] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Fallback to local user check for MVP demo if no real auth exists yet, but secure it better later
        if (user?.email === "contact@adaptiveliquidity.com" && user?.is_admin) {
          setIsAdmin(true);
          setAuthed(true);
        } else {
          onNavigate("/hub");
        }
        return;
      }
      // Check if real user has admin role in profiles
      const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', session.user.id).single();
      if (profile?.is_admin) {
        setIsAdmin(true);
        setAuthed(true);
      } else {
        onNavigate("/hub");
      }
    };
    checkAdmin();
  }, [user, onNavigate]);

  const { data: questions = [], refetch: refreshQ } = useQuery({
    queryKey: ['questions', 'admin'],
    queryFn: async () => {
      const { data, error } = await supabase.from('questions').select('*').order('priority_score', { ascending: false });
      if (error) throw error;
      return data.map(q => ({ ...q, priorityScore: q.priority_score, riskLevel: q.risk_level, submittedAt: q.submitted_at }));
    },
    enabled: authed,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const { error } = await supabase.from('questions').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries(['questions']),
  });

  const boostScoreMutation = useMutation({
    mutationFn: async ({ id, newScore }) => {
      const { error } = await supabase.from('questions').update({ priority_score: newScore }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries(['questions']),
  });

  const updateStatus = (id, newStatus) => updateStatusMutation.mutate({ id, status: newStatus });
  const boostScore = (id) => {
    const q = questions.find(q => q.id === id);
    if (q) boostScoreMutation.mutate({ id, newScore: q.priorityScore + 100 });
  };

  const handleProxyCall = async (qObj) => {
    const { data: existing } = await supabase.from('answers').select('*').eq('question_id', qObj.id).single();

    if (existing) {
      setSimOutput({
        ...existing,
        visible_cognition: existing.visible_cognition,
        response_mode: existing.response_mode
      });
      return;
    }

    updateStatus(qObj.id, "answering");
    callSophiaCoreProxy(qObj, async (resData) => {
      setSimOutput(resData);
      
      await supabase.from('answers').insert({
        question_id: qObj.id,
        reply: resData.reply,
        response_mode: resData.response_mode || resData.responseMode,
        visible_cognition: resData.visible_cognition || resData.visibleCognition,
        featured: false
      });
      
      updateStatus(qObj.id, "answered");
    });
  };

  const handleFlush = async () => {
    if (window.confirm("Flush all queue memory rows? This will execute a DELETE on the Postgres tables.")) {
      await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('answers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      queryClient.invalidateQueries();
    }
  };

  if (!authed) {
    return (
      <div className="surface-card admin-gate">
        <div className="sl" style={{color:"#ff4d4d"}}>VERIFYING CLEARANCE</div>
        <p className="sd">Checking cryptographic signatures for administrative access...</p>
      </div>
    );
  }

  const filtered = filterStatus === "ALL" ? questions : questions.filter(q => q.status.toUpperCase() === filterStatus.toUpperCase());

  return (
    <div className="surface-card admin-panel">
      <div className="ap-header">
        <div className="sl" style={{color:"#d7b15b"}}>ACTIV8 COMMAND PIPELINE</div>
        <div className="ap-actions">
          <button className="qbt" onClick={refreshQ}>REFRESH QUEUE</button>
          <button className="qbt" onClick={handleFlush} style={{color:"#ff4d4d",borderColor:"#ff4d4d"}}>FLUSH DATABASE</button>
          <button className="qbt" onClick={()=>storageController.safeSet("activ8_admin_unlocked",false)&setAuthed(false)}>LOCK GATE</button>
        </div>
      </div>

      {simOutput && (
        <div className="admin-briefing-overlay">
          <div className="briefing-card">
            <div className="briefing-header">
              <div className="bh-left">
                <div className="bh-tag">EXECUTIVE SYNTHESIS PREVIEW</div>
                <h3 className="bh-title">MODE: {simOutput.response_mode}</h3>
              </div>
              <div className="bh-right">
                <div className={`risk-tag ${simOutput.risk_level}`}>RISK: {simOutput.risk_level}</div>
                <button className="close-briefing" onClick={()=>setSimOutput(null)}>×</button>
              </div>
            </div>
            
            <div className="briefing-body">
              <div className="brief-section">
                <label>PROPOSED PUBLIC RESPONSE</label>
                <div className="brief-content reply">{simOutput.reply}</div>
              </div>
              
              <div className="brief-grid">
                <div className="brief-section">
                  <label>COGNITIVE TELEMETRY (VISIBLE)</label>
                  <pre className="brief-content cognition">{simOutput.visible_cognition}</pre>
                </div>
                <div className="brief-section">
                  <label>INTERNAL ROUTING</label>
                  <div className="brief-meta">
                    <div className="bm-row"><span>SOURCE</span> <strong>{simOutput.response_source}</strong></div>
                    <div className="bm-row"><span>CLAIM STATUS</span> <strong>{simOutput.claim_status}</strong></div>
                    <div className="bm-row"><span>HUB EVENT</span> <strong>{simOutput.hub_event}</strong></div>
                    <div className="bm-row"><span>SAFE BROADCAST</span> <strong style={{color: simOutput.public_safe ? "var(--lq)" : "#ff4d4d"}}>{simOutput.public_safe ? "VERIFIED" : "WARNING"}</strong></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="briefing-footer">
              <button className="act-btn approve" onClick={()=>{updateStatus(simOutput.questionId || simOutput.id, "approved"); setSimOutput(null)}}>APPROVE SYNTHESIS</button>
              <button className="act-btn feature" onClick={()=>{updateStatus(simOutput.questionId || simOutput.id, "featured"); setSimOutput(null)}}>FEATURE ON LIVE STREAM</button>
              <button className="act-btn reject" onClick={()=>{updateStatus(simOutput.questionId || simOutput.id, "rejected"); setSimOutput(null)}}>REJECT OUTPUT</button>
            </div>
          </div>
        </div>
      )}

      <div className="filter-bar">
        <span className="wlk">Canonical Status Filter:</span>
        {["ALL","SUBMITTED","QUEUED","APPROVED","ANSWERED","FEATURED","REJECTED","ESCALATED","FAQ"].map(st => (
          <button key={st} className={`f-btn ${filterStatus===st?"ac":""}`} onClick={()=>setFilterStatus(st)}>{st}</button>
        ))}
      </div>

      <div className="q-table">
        {filtered.length === 0 ? <div className="pn">No records matching active query criteria.</div> : filtered.map(q => (
          <div key={q.id} className={`q-row-v2 ${q.status}`}>
            <div className="qrv2-sidebar">
              <div className="qrv2-dot" />
            </div>
            <div className="qrv2-main">
              <div className="qrv2-header">
                <div className="qrv2-info">
                  <span className="qrv2-callsign">{q.callsign}</span>
                  <span className="qrv2-meta">{q.category} • P{q.priorityScore}</span>
                </div>
                <div className="qrv2-tags">
                  <span className={`qrv2-status-tag ${q.status}`}>{q.status}</span>
                  <span className={`qrv2-risk-tag ${q.riskLevel}`}>{q.riskLevel}</span>
                </div>
              </div>
              <div className="qrv2-body">"{q.question}"</div>
              <div className="qrv2-controls">
                <div className="qrv2-primary-actions">
                  {q.status === "submitted" && <button className="act-btn-v2" onClick={()=>updateStatus(q.id, "queued")}>Queue</button>}
                  <button className={`act-btn-v2 highlight ${q.status === 'answered' ? 'pulse' : ''}`} onClick={()=>handleProxyCall(q)}>
                    {q.status === 'answered' ? 'Review & Approve' : 'Trigger Synthesis'}
                  </button>
                </div>
                <div className="qrv2-secondary-actions">
                  <button className="act-btn-v2" onClick={()=>boostScore(q.id)}>Boost</button>
                  <button className="act-btn-v2" onClick={()=>updateStatus(q.id, "faq")}>FAQ</button>
                  <button className="act-btn-v2 reject" onClick={()=>updateStatus(q.id, "rejected")}>Reject</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
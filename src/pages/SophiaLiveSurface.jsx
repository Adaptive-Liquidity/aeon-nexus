import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export default function SophiaLiveSurface({ onNavigate }) {
  const queryClient = useQueryClient();

  // Setup Realtime Subscription
  useEffect(() => {
    const channel = supabase.channel('sophia-live-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'answers' }, () => {
        queryClient.invalidateQueries(['answers', 'live']);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, () => {
        queryClient.invalidateQueries(['questions', 'live']);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: answers = [], isLoading: loadingAnswers } = useQuery({
    queryKey: ['answers', 'live'],
    queryFn: async () => {
      const { data, error } = await supabase.from('answers').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: questions = [], isLoading: loadingQs } = useQuery({
    queryKey: ['questions', 'live'],
    queryFn: async () => {
      const { data, error } = await supabase.from('questions').select('id, callsign, question');
      if (error) throw error;
      return data;
    }
  });

  if (loadingAnswers || loadingQs) return <div className="pn" style={{padding: 40}}>SYNCHRONIZING WITH CORE...</div>;

  const featuredAnswers = answers.filter(a => a.featured).slice(0, 5);
  const others = answers.filter(a => !featuredAnswers.find(f => f.question_id === a.question_id)).slice(0, 6);

  return (
    <div className="surface-card sophia-live-view">
      <div className="live-header">
        <div className="lh-status"><span className="spd" /> SOPHIA COGNITIVE TELEMETRY STREAM</div>
        <div className="lh-mode">ACTIVE UPLINK: {featuredAnswers.length > 0 ? "STABLE" : "IDLE"}</div>
      </div>

      <div className="featured-feed">
        {featuredAnswers.length > 0 ? featuredAnswers.map((ans, idx) => {
          const rq = questions.find(q => q.id === ans.question_id);
          return (
            <div key={idx} className="featured-cognition-box" style={{animationDelay: `${idx * 0.1}s`}}>
              <div className="fcb-top">
                <span className="fcb-label">CORE SYNTHESIS {idx === 0 ? "[LATEST]" : ""}</span>
                <span className="fcb-author">INQUIRY BY: {rq?.callsign || "GENESIS PROTOCOL"}</span>
              </div>
              <div className="fcb-question">"{rq?.question || "Awaiting target input stream."}"</div>
              <div className="fcb-reply">{ans.reply}</div>
              
              <details className="cognition-details">
                <summary className="fcb-term-title">EXPAND COGNITION ENGINE LOGS</summary>
                <pre className="fcb-cognition-term">{ans.visible_cognition}</pre>
              </details>
            </div>
          );
        }) : (
          <div className="pn">No featured answers streaming. Submit an inquiry through the intake queue.</div>
        )}
      </div>

      {others.length > 0 && (
        <div className="recent-answers-block" style={{marginTop: 30}}>
          <div className="sl">ARCHIVED TELEMETRY OUTPUTS</div>
          <div className="ra-grid">
            {others.map((ans, idx) => {
              const rq = questions.find(q => q.id === ans.question_id);
              return (
                <div key={idx} className="ra-card">
                  <div className="ra-author">{rq?.callsign || "SIGNALER"}</div>
                  <div className="ra-reply">{ans.reply.slice(0, 90)}...</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="live-cta-box">
        <button className="bp" onClick={()=>onNavigate("/ask-sophia")}>TRANSMIT NEW INQUIRY TO SOPHIA</button>
      </div>
    </div>
  );
}
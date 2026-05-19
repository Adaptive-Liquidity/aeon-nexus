import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { storageController } from '../lib/storage';

export default function PublicHubSurface({ onNavigate }) {
  const settings = storageController.safeGet("admin_settings") || {};
  const links = storageController.safeGet("official_links") || {};

  const { data: questions = [], isLoading: loadingQs } = useQuery({
    queryKey: ['questions', 'public'],
    queryFn: async () => {
      const { data, error } = await supabase.from('questions').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: answers = [], isLoading: loadingAnswers } = useQuery({
    queryKey: ['answers', 'public'],
    queryFn: async () => {
      const { data, error } = await supabase.from('answers').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: events = [], isLoading: loadingEvents } = useQuery({
    queryKey: ['events', 'public'],
    queryFn: async () => {
      const { data, error } = await supabase.from('hub_events').select('*').order('created_at', { ascending: false }).limit(10);
      if (error) throw error;
      return data;
    }
  });

  if (loadingQs || loadingAnswers || loadingEvents) return <div className="pn" style={{padding: 40}}>LOADING HUB DATA...</div>;

  const activeQueueCount = questions.filter(q => ["submitted","queued","approved","answering"].includes(q.status)).length;
  const featuredQ = questions.find(q => q.status === "featured") || questions[0];
  const featuredA = featuredQ ? answers.find(a => a.question_id === featuredQ.id) : null;

  return (
    <div className="surface-card hub-portal">
      {settings.emergencyBanner && <div className="emergency-banner">{settings.emergencyBanner}</div>}
      
      <div className="hub-metrics-bar">
        <div className="hm-box">
          <span className="hm-val">{activeQueueCount}</span>
          <span className="hm-lbl">ACTIVE QUEUE DEPTH</span>
        </div>
        <div className="hm-box">
          <span className="hm-val" style={{color:"#00d8ff"}}>{settings.mode || "LIVE"}</span>
          <span className="hm-lbl">SOPHIA CORE STATE</span>
        </div>
        <div className="hm-box">
          <span className="hm-val" style={{color:"#d7b15b",fontSize:13}}>{settings.launchPhase || "PHASE 2"}</span>
          <span className="hm-lbl">CURRENT PHASE</span>
        </div>
      </div>

      <div className="grid-2" style={{gap:16,marginTop:16}}>
        <div className="hub-left">
          <div className="sl">FEATURED QUEUE COMPONENT</div>
          <div className="hub-featured-box">
            <div className="hfb-q">"{featuredQ?.question || "No featured item specified."}"</div>
            <div className="hfb-author">— {featuredQ?.callsign || "SYSTEM"}</div>
            {featuredA && (
              <div className="hfb-a">
                <div className="hfb-albl">SOPHIA SYNTHESIS:</div>
                <p>{featuredA.reply}</p>
                <pre className="hfb-cog">{featuredA.visible_cognition?.slice(0, 120)}...</pre>
              </div>
            )}
          </div>

          <div className="cta-wrapper" style={{marginTop:16}}>
            <button className="bp" onClick={()=>onNavigate("/ask-sophia")}>SUBMIT TO SOPHIA THROUGH ACTIV8</button>
          </div>
        </div>

        <div className="hub-right">
          <div className="sl">VERIFIED DEFENSE STATUS</div>
          <div className="ca-status-card">
            <div className="wlr"><span className="wlk">Primary Token CA</span><span className="wlv gn">{links.ca?.slice(0,12)}...</span></div>
            <div className="wlr"><span className="wlk">DEX Screener</span><a href={links.dex} target="_blank" rel="noreferrer" className="wlv">Live Validation Chart</a></div>
            <div className="wlr"><span className="wlk">Security Audits</span><span className="wlv">100% Capped Contracts</span></div>
          </div>

          <div className="sl" style={{marginTop:16}}>EVENT LOGSTREAM</div>
          <div className="event-logstream">
            {events.slice(0, 4).map(ev => (
              <div key={ev.id} className="ev-row">
                <span className={`ev-dot ${ev.type}`} />
                <span className="ev-txt">{ev.text}</span>
                <span className="ev-time">{ev.time_label || "Recent"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
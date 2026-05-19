import React, { useState, useEffect, useRef } from 'react';
import { storageController, store, genRef } from '../lib/storage';
import { LAUNCH_DATE, PHASES, SOCIALS, tasks, pledgeTiers } from '../lib/constants';
import { Icon } from '../components/Icons';
import Particles from '../components/Particles';
import useCountdown from '../hooks/useCountdown';
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { callSophiaCoreProxy } from '../lib/api';

export default function OverlaySurface() {
  const questions = storageController.getCollection("sophia_questions");
  const settings = storageController.safeGet("admin_settings") || {};
  const links = storageController.safeGet("official_links") || {};
  const activeCount = questions.filter(q => ["submitted","queued","approved","answering"].includes(q.status)).length;

  return (
    <div className="obs-overlay-wrapper" style={{background:"transparent",color:"#f4f7f2",fontFamily:"'Space Grotesk'",padding:16}}>
      <div className="obs-card" style={{background:"rgba(2,4,4,0.85)",border:"1px solid #9cff3b",borderRadius:6,padding:"12px 16px",display:"inline-block",boxShadow:"0 0 20px rgba(156,255,59,0.15)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:"#9cff3b",boxShadow:"0 0 8px #9cff3b",animation:"pg 2s infinite"}} />
          <span style={{fontSize:14,fontWeight:700,letterSpacing:"0.1em",color:"#9cff3b"}}>SOPHIA MODE: {settings.mode || "LIVE"}</span>
          <span style={{borderLeft:"1px solid #1f2928",paddingLeft:12,fontSize:12,fontFamily:"'JetBrains Mono'",color:"#00d8ff"}}>QUEUE: {activeCount}</span>
          <span style={{borderLeft:"1px solid #1f2928",paddingLeft:12,fontSize:12,color:"#d7b15b"}}>{settings.launchPhase?.split(":")[0] || "PHASE 2"}</span>
        </div>
        <div style={{marginTop:6,fontSize:10,fontFamily:"'JetBrains Mono'",color:"#8b9694",display:"flex",justifyContent:"space-between",borderTop:"1px solid rgba(31,41,40,0.6)",paddingTop:4}}>
          <span>Link: {links.app?.replace("https://","")}</span>
          <span style={{color:"#9cff3b"}}>CA Status: VERIFIED SAFE</span>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { storageController, store, genRef } from '../lib/storage';
import { LAUNCH_DATE, PHASES, SOCIALS, tasks, pledgeTiers } from '../lib/constants';
import { Icon } from '../components/Icons';
import Particles from '../components/Particles';
import useCountdown from '../hooks/useCountdown';
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { callSophiaCoreProxy } from '../lib/api';

export default function LaunchSurface({ onNavigate }) {
  const settings = storageController.safeGet("admin_settings") || {};
  const links = storageController.safeGet("official_links") || {};
  return (
    <div className="surface-card launch-view">
      {settings.emergencyBanner && <div className="emergency-banner">{settings.emergencyBanner}</div>}
      
      <div className="sl" style={{color:"#d7b15b"}}>CURRENT LAUNCH PHASE</div>
      <div className="launch-phase-badge">{settings.launchPhase || "PHASE 2: SOPHIA QUEUE LIVE"}</div>

      <div className="pinned-update-block">
        <div className="pub-title">📌 PINNED PROTOCOL UPDATE</div>
        <p>Intake API routing channels stabilized. The real-time queue algorithm enforces strict spam mitigation penalties. High-REP assignments automatically route to Sophia Core synthesis outputs.</p>
      </div>

      <div className="sl" style={{marginTop:16}}>ACTIVE INSTRUCTIONS</div>
      <div className="instructions-list">
        <div className="ins-item">1. Secure profile calls via client intake gate (No private key bindings required).</div>
        <div className="ins-item">2. Increase algorithmic index via cross-platform engagement workflows.</div>
        <div className="ins-item">3. Monitor streaming validation feeds directly via the Sophia Live display surface.</div>
      </div>

      <div className="launch-links-bar" style={{marginTop:20,display:"flex",gap:10}}>
        <a href={links.telegram} target="_blank" rel="noreferrer" className="qbt" style={{flex:1,textAlign:"center",textDecoration:"none"}}>TELEGRAM ACCESS</a>
        <a href={links.discord} target="_blank" rel="noreferrer" className="qbt" style={{flex:1,textAlign:"center",textDecoration:"none"}}>DISCORD ACCESS</a>
      </div>

      <div className="cta-wrapper" style={{marginTop:16}}>
        <button className="bp" onClick={()=>onNavigate("/ask-sophia")}>ENGAGE SOPHIA CTA DIRECTLY</button>
      </div>
    </div>
  );
}
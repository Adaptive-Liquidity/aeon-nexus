import React, { useState, useEffect, useRef } from 'react';
import { storageController, store, genRef } from '../lib/storage';
import { LAUNCH_DATE, PHASES, SOCIALS, tasks, pledgeTiers } from '../lib/constants';
import { Icon } from '../components/Icons';
import Particles from '../components/Particles';
import useCountdown from '../hooks/useCountdown';
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { callSophiaCoreProxy } from '../lib/api';

export default function StandbySurface() {
  const links = storageController.safeGet("official_links") || {};
  return (
    <div className="surface-card standby-view" style={{textAlign:"center",padding:"40px 20px"}}>
      <div className="lr" style={{borderColor:"#00d8ff"}}><div className="ld" style={{background:"#00d8ff"}} /></div>
      <div className="standby-title" style={{fontFamily:"'Space Grotesk'",fontSize:28,color:"#00d8ff",fontWeight:700,letterSpacing:"0.1em"}}>SIGNAL STABILIZING</div>
      <div className="standby-subtitle" style={{fontFamily:"'JetBrains Mono'",fontSize:14,color:"#f4f7f2",marginTop:8,letterSpacing:"0.2em"}}>SOPHIA HUB STANDBY MODE</div>
      <p className="sd" style={{marginTop:16,maxWidth:320,margin:"16px auto"}}>Primary inference modules are recalibrating. Queue records and access parameters remain completely immutable during protocol stabilization.</p>
      
      <div className="ca-verify-box" style={{marginTop:24,textAlign:"left"}}>
        <div className="cvb-label" style={{color:"#st"}}>IMMUTABLE OFFICIAL LINKS REMAIN UNCHANGED:</div>
        <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:4,fontFamily:"'JetBrains Mono'",fontSize:11}}>
          <a href={links.website} style={{color:"#9cff3b"}}>Website: {links.website}</a>
          <a href={links.x} style={{color:"#00d8ff"}}>𝕏 Signal: {links.x}</a>
          <span style={{color:"#d7b15b"}}>Verified CA: {links.ca?.slice(0,24)}...</span>
        </div>
      </div>
    </div>
  );
}
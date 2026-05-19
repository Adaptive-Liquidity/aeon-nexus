import React, { useState, useEffect, useRef } from 'react';
import { storageController, store, genRef } from '../lib/storage';
import { LAUNCH_DATE, PHASES, SOCIALS, tasks, pledgeTiers } from '../lib/constants';
import { Icon } from '../components/Icons';
import Particles from '../components/Particles';
import useCountdown from '../hooks/useCountdown';
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { callSophiaCoreProxy } from '../lib/api';

export default function LinksSurface() {
  const links = storageController.safeGet("official_links") || {};
  return (
    <div className="surface-card links-view">
      <div className="scam-warning-header">
        ⚠️ CRITICAL SAFETY NOTICE: FAKE LINK DEFENSE ACTIVE. ONLY TRUST URLs DISPLAYED WITHIN THIS MATRIX. WE NEVER DM SOLICITATIONS.
      </div>

      <div className="sl" style={{textAlign:"center",fontSize:12,color:"#bn",marginTop:16}}>VERIFIED PLATFORM RESOURCES</div>
      <p className="sd" style={{textAlign:"center"}}>Cross-reference contract addresses dynamically to verify client authenticity.</p>

      <div className="links-grid">
        <a href={links.app} target="_blank" rel="noreferrer" className="v-link-btn primary">
          <span className="vlb-title">ACTIV8 INTAKE APP</span>
          <span className="vlb-sub">{links.app}</span>
        </a>
        <a href={links.website} target="_blank" rel="noreferrer" className="v-link-btn">
          <span className="vlb-title">OFFICIAL WEBSITE</span>
          <span className="vlb-sub">{links.website}</span>
        </a>
        <a href={links.x} target="_blank" rel="noreferrer" className="v-link-btn social">
          <span className="vlb-title">𝕏 (TWITTER) SIGNAL</span>
          <span className="vlb-sub">{links.x}</span>
        </a>
        <a href={links.telegram} target="_blank" rel="noreferrer" className="v-link-btn social">
          <span className="vlb-title">TELEGRAM HUB</span>
          <span className="vlb-sub">{links.telegram}</span>
        </a>
        <a href={links.discord} target="_blank" rel="noreferrer" className="v-link-btn social">
          <span className="vlb-title">DISCORD BUILDERS</span>
          <span className="vlb-sub">{links.discord}</span>
        </a>
        <a href={links.dex} target="_blank" rel="noreferrer" className="v-link-btn chart">
          <span className="vlb-title">DEX TELEMETRY / CHARTS</span>
          <span className="vlb-sub">Real-time Trading Curve</span>
        </a>
      </div>

      <div className="ca-verify-box" style={{marginTop:20}}>
        <div className="cvb-label">PRIMARY CONTRACT IDENTIFIER (CA) STATUS</div>
        <div className="cvb-val">{links.ca}</div>
        <div className="cvb-disclaimer">Verified cryptographically. Ensure string hash arrays correspond before executing approvals.</div>
      </div>
    </div>
  );
}
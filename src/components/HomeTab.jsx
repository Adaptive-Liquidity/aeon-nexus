import React, { useState } from 'react';
import useCountdown from '../hooks/useCountdown';
import { LAUNCH_DATE, SOCIALS, tasks, pledgeTiers } from '../lib/constants';
import { Icon } from './Icons';

export default function HomeTab({ user, refLink, copied, onCopy, onNavigate }) {
  const cd = useCountdown(LAUNCH_DATE);
  const done = Object.keys(user.tasks || {}).filter(k=>user.tasks[k]).length;
  return (
    <div className="tc">
      <div className="pp">
        <div className="ppt"><span className="ppl">ACTIV8 PASSPORT</span><span className="ppb">{user.badge || "GENESIS"}</span></div>
        <div className="ppd"><div className="ppa">{user.name[0].toUpperCase()}</div><div><div className="ppn">{user.name}</div><div className="ppm">GENESIS OBSERVER · COHORT 001</div></div></div>
        <div className="pps"><div className="ps"><span className="pv">{user.rep || 50}</span><span className="pk">REP</span></div><div className="ps"><span className="pv">{done}/{tasks.length}</span><span className="pk">QUESTS</span></div><div className="ps"><span className="pv">{user.pledge?"✓":"—"}</span><span className="pk">PLEDGE</span></div><div className="ps"><span className="pv">1</span><span className="pk">BADGES</span></div></div>
      </div>
      
      {/* Priority navigation actions */}
      <div className="priority-action-cards" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
        <button className="bp" onClick={()=>onNavigate("/ask-sophia")} style={{margin:0}}>ASK SOPHIA</button>
        <button className="bp" onClick={()=>onNavigate("/sophia-live")} style={{margin:0,background:"rgba(0,216,255,0.08)",color:"#00d8ff",borderColor:"rgba(0,216,255,0.3)"}}>LIVE TELEMETRY</button>
      </div>

      <div className="hcd"><div className="hcdl">GENESIS WINDOW</div><div className="cdg c">{[["d",cd.d],["h",cd.h],["m",cd.m],["s",cd.s]].map(([l,v])=><div key={l} className="cdc s"><span className="cdv">{String(v).padStart(2,"0")}</span><span className="cdu">{l}</span></div>)}</div></div>
      <div className="rq"><div className="rqt"><span className="rql">YOUR REFERRAL VECTOR</span><span className="rqb">+25 REP / referral</span></div><div className="rqr"><input readOnly value={refLink} className="rqi" /><button className="rqc" onClick={onCopy}>{copied?"✓":"COPY"}</button></div></div>
      <div className="sl">ACTIV8 FEED</div>
      <div className="fd">
        <FL c="#9cff3b" t="NOW" x="Your ACTIV8 Passport client binding validated successfully." />
        <FL c="#00d8ff" t="2m" x="Sophia Core proxy connection endpoint mapped." />
        <FL c="#d7b15b" t="5m" x="Algorithmic queues operating under standard low-risk heuristics." />
      </div>
    </div>
  );
}
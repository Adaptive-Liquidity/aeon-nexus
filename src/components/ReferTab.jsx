import React, { useState } from 'react';
import useCountdown from '../hooks/useCountdown';
import { LAUNCH_DATE, SOCIALS, tasks, pledgeTiers } from '../lib/constants';
import { Icon } from './Icons';

export default function ReferTab({ user: _user, refLink, copied, onCopy }) {
  const msg = `I just joined AEON ACTIV8 — the coordination layer for adaptive economic infrastructure. Genesis spots are limited.\n\nJoin before the window closes: ${refLink}\n\n@all4aeon`;
  const copyMsg = () => { navigator.clipboard?.writeText(msg).catch(()=>{}); };
  return (
    <div className="tc">
      <div className="sl">NETWORK EXPANSION</div>
      <p className="sd">Every referral strengthens the coordination network. Earn REP and climb the queue priority tier.</p>
      <div className="rq" style={{marginBottom:16}}>
        <div className="rqt"><span className="rql">YOUR REFERRAL VECTOR</span><span className="rqb">+25 REP / verified join</span></div>
        <div className="rqr"><input readOnly value={refLink} className="rqi" /><button className="rqc" onClick={onCopy}>{copied?"✓":"COPY"}</button></div>
        <div className="sb">{[["Share on 𝕏",()=>window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(msg)}`,"_blank")],["Copy Message",copyMsg],["Telegram",()=>window.open(`https://t.me/share/url?url=${encodeURIComponent(refLink)}`,"_blank")]].map(([l,fn],i)=><button key={i} className="sbt" onClick={fn}>{l}</button>)}</div>
      </div>
      <div className="sl" style={{marginTop:20}}>REFERRAL TIERS</div>
      <div className="tg">{[{n:"OBSERVER",r:"0 referrals",p:"Base access",a:true},{n:"SIGNALER",r:"3 referrals",p:"Priority quest access"},{n:"AMPLIFIER",r:"10 referrals",p:"Queue boost"},{n:"ARCHITECT",r:"25 referrals",p:"Fast-track output"}].map(t=><div key={t.n} className={`ti ${t.a?"ta":""}`}><div className="tn">{t.n}</div><div className="tr">{t.r}</div><div className="tp">{t.p}</div></div>)}</div>
    </div>
  );
}
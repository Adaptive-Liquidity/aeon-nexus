import React, { useState } from 'react';
import useCountdown from '../hooks/useCountdown';
import { LAUNCH_DATE, SOCIALS, tasks, pledgeTiers } from '../lib/constants';
import { Icon } from './Icons';

export default function PledgeTab({ user, onPledge }) {
  return (
    <div className="tc">
      <div className="sl">PLEDGE & LOCK</div>
      <p className="sd">Lock holdings during the Genesis Window to unlock early access, exclusive builds, and permanent whitelist status.</p>
      <div className="pg">
        {pledgeTiers.map(tier => {
          const ac = user?.pledge === tier.id;
          return (
            <div key={tier.id} className={`pc ${tier.featured?"ft":""} ${ac?"pa":""}`} style={{"--tc":tier.color}}>
              {tier.featured && <div className="pcb">MOST CHOSEN</div>}
              <div className="pcn" style={{color:tier.color}}>{tier.name}</div>
              <div className="pcc">{tier.cost}</div>
              <div className="pcl">Lock for {tier.lock}</div>
              <div className="pcp">{tier.perks.map((p,i)=><div key={i} className="pci"><span className="pcx" style={{color:tier.color}}>✓</span>{p}</div>)}</div>
              {ac ? <div className="pca" style={{borderColor:tier.color,color:tier.color}}>PLEDGED</div> : <button className="pcbt" style={{borderColor:tier.color,color:tier.color}} onClick={()=>onPledge(tier.id)}>PLEDGE {tier.name}</button>}
            </div>
          );
        })}
      </div>
      <div className="pn">Pledging is a signal of commitment. When the official token launches, pledged members receive priority allocation. No funds move until the token launch event.</div>
    </div>
  );
}
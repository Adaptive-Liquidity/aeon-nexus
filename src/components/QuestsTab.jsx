import React, { useState } from 'react';
import useCountdown from '../hooks/useCountdown';
import { LAUNCH_DATE, SOCIALS, tasks, pledgeTiers } from '../lib/constants';
import { Icon } from './Icons';

export default function QuestsTab({ user, onComplete }) {
  return (
    <div className="tc">
      <div className="sl">GENESIS QUESTS</div>
      <p className="sd">Complete quests to earn REP, unlock badges, and climb the priority index queue. Every action strengthens the network.</p>
      {tasks.map(t => {
        const d = user?.tasks?.[t.id];
        return (
          <div key={t.id} className={`q ${d?"qd":""}`}>
            <div className="qi">{t.icon}</div>
            <div className="qb"><div className="qt">{t.label}</div><div className="qd2">{t.desc}</div></div>
            <div className="qr">
              <span className="qrp">+{t.rep} REP</span>
              {d ? <span className="qdn">COMPLETED</span> : <button className="qbt" onClick={()=>{if(t.link)window.open(t.link,"_blank");onComplete(t.id);}}>{t.link?"GO & VERIFY":"MARK DONE"}</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
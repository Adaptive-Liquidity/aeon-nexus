import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { store } from '../lib/storage';
import { tasks } from '../lib/constants';
import Particles from '../components/Particles';

import AskSophiaSurface from './AskSophiaSurface';
import AdminSophiaSurface from './AdminSophiaSurface';
import SophiaLiveSurface from './SophiaLiveSurface';
import PublicHubSurface from './PublicHubSurface';
import LinksSurface from './LinksSurface';
import LaunchSurface from './LaunchSurface';
import StandbySurface from './StandbySurface';

import HomeTab from '../components/HomeTab';
import QuestsTab from '../components/QuestsTab';
import PledgeTab from '../components/PledgeTab';
import ReferTab from '../components/ReferTab';

export default function Hub({ user: init, setUser }) {
  const [user, setLocalUser] = useState(init);
  const isAdmin = user?.email === "contact@adaptiveliquidity.com";
  const [tab, setTab] = useState("home");
  const [copied, setCopied] = useState(false);
  const refLink = `https://aeon.activ8.network/join?ref=${user?.ref || "GENESIS"}`;
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
 
  const saveUser = async (u) => { 
    setLocalUser(u); 
    if (setUser) setUser(u);
    await store.set("activ8-user", u); 
  };
  const completeTask = async (id) => { const u = { ...user, tasks: { ...user.tasks, [id]: true }, rep: (user?.rep||0) + tasks.find(t=>t.id===id).rep }; await saveUser(u); };
  const selectPledge = async (tier) => { await saveUser({ ...user, pledge: tier }); };
  const copy = () => { navigator.clipboard?.writeText(refLink).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),2000); };
 
  const tabs = [{ id:"home", label:"ACTIV8 HQ", icon:"◈" },{ id:"quests", label:"QUESTS", icon:"◇" },{ id:"pledge", label:"PLEDGE", icon:"⬡" },{ id:"refer", label:"NETWORK", icon:"◎" }];
 
  return (
    <div className="hb">
      <Particles count={30} color="rgba(156,255,59,0.06)" />
      
      {/* Universal navigation bar supporting direct MVP surface routing */}
      <header className="hd">
        <div className="hl" onClick={()=>navigate("/hub")} style={{cursor:"pointer"}}>
          <div className="hld" />
          <span className="hlt">AEON ACTIV8</span>
        </div>
        <div className="h-nav">
          <button className={`hn-btn ${currentPath==="/ask-sophia"?"ac":""}`} onClick={()=>navigate("/ask-sophia")}>/ask-sophia</button>
          <button className={`hn-btn ${currentPath==="/sophia-live"?"ac":""}`} onClick={()=>navigate("/sophia-live")}>/sophia-live</button>
          <button className={`hn-btn ${currentPath==="/hub"?"ac":""}`} onClick={()=>navigate("/hub")}>/hub</button>
          <button className={`hn-btn ${currentPath==="/links"?"ac":""}`} onClick={()=>navigate("/links")}>/links</button>
          <button className={`hn-btn ${currentPath==="/launch"?"ac":""}`} onClick={()=>navigate("/launch")}>/launch</button>
          <button className={`hn-btn ${currentPath==="/standby"?"ac":""}`} onClick={()=>navigate("/standby")}>/standby</button>
          {isAdmin && <button className={`hn-btn admin ${currentPath==="/admin/sophia"?"ac":""}`} onClick={()=>navigate("/admin/sophia")}>[Admin]</button>}
        </div>
        {user ? (
          <div className="hu">
            <div className="ha">{user.name[0].toUpperCase()}</div>
            <span>{user.name}</span>
          </div>
        ) : (
          <button className="hn-btn" onClick={()=>navigate("/")}>Sign In</button>
        )}
      </header>

      {/* Production Storage Advisory Notice */}
      <div className="dev-banner">
        <span>💡 MVP Persistence: LocalStorage controller active. Production deployment path provisions Supabase/Postgres relational architecture.</span>
      </div>

      {/* Surface Multiplexer based on Path State */}
      <div className="surface-container">
        <Routes>
          <Route path="ask-sophia" element={<AskSophiaSurface user={user} onNavigate={navigate} />} />
          <Route path="admin/sophia" element={<AdminSophiaSurface user={user} onNavigate={navigate} />} />
          <Route path="sophia-live" element={<SophiaLiveSurface onNavigate={navigate} />} />
          <Route path="links" element={<LinksSurface />} />
          <Route path="launch" element={<LaunchSurface onNavigate={navigate} />} />
          <Route path="standby" element={<StandbySurface />} />
          <Route path="hub" element={<PublicHubSurface onNavigate={navigate} />} />
          <Route path="*" element={
            user ? (
              <>
                <nav className="nv">{tabs.map(t=><button key={t.id} className={`nb ${tab===t.id?"ac":""}`} onClick={()=>setTab(t.id)}><span className="ni">{t.icon}</span><span className="nl">{t.label}</span></button>)}</nav>
                <main className="mn">
                  {tab==="home" && <HomeTab user={user} refLink={refLink} copied={copied} onCopy={copy} onNavigate={navigate} />}
                  {tab==="quests" && <QuestsTab user={user} onComplete={completeTask} />}
                  {tab==="pledge" && <PledgeTab user={user} onPledge={selectPledge} />}
                  {tab==="refer" && <ReferTab user={user} refLink={refLink} copied={copied} onCopy={copy} />}
                </main>
              </>
            ) : null
          } />
        </Routes>
      </div>
    </div>
  );
}
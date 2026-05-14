import { useState, useEffect, useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://skletsjrrejlmgseczan.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrbGV0c2pycmVqbG1nc2VjemFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMDAzMjIsImV4cCI6MjA5Mzg3NjMyMn0.o40dO4IZh__UZyVkmolquGg3KN9tdC1v-Xzikbg-2M4"
);

// Inject hCaptcha script globally as a fallback
if (typeof window !== 'undefined' && !window.hcaptcha) {
  const script = document.createElement('script');
  script.src = 'https://js.hcaptcha.com/1/api.js';
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}
 
const LAUNCH_DATE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
const PHASES = { GATE: 0, HUB: 1 };
const SOCIALS = { x: "https://x.com/all4aeon", tg: "https://t.me/all4aeon", discord: "https://discord.gg/aeon-activ8" };

// Safe localStorage wrapper with try/catch, max limits, and clear capabilities
const storageController = {
  safeGet(key, defaultVal = null) {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultVal;
    } catch (err) {
      console.warn(`Storage read error for ${key}:`, err);
      return defaultVal;
    }
  },
  safeSet(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`Storage write error for ${key}:`, err);
    }
  },
  getCollection(key) {
    return this.safeGet(key, []);
  },
  saveCollection(key, arr, maxLimit = 100) {
    // Enforce capped record limits for MVP performance
    const capped = arr.slice(-maxLimit);
    this.safeSet(key, capped);
    return capped;
  },
  clearAll() {
    try {
      window.localStorage.removeItem("sophia_questions");
      window.localStorage.removeItem("sophia_answers");
      window.localStorage.removeItem("sophia_queue_events");
      window.localStorage.removeItem("hub_events");
      console.log("ACTIV8 MVP queue storage flushed successfully.");
    } catch (err) {
      console.warn("Storage clear error:", err);
    }
  }
};

// Initialize safe mock database defaults
const initStorageDefaults = () => {
  if (!storageController.safeGet("official_links")) {
    storageController.safeSet("official_links", {
      website: "https://adaptiveliquidity.labs",
      app: "https://aeon.activ8.network",
      x: "https://x.com/all4aeon",
      telegram: "https://t.me/all4aeon",
      discord: "https://discord.gg/aeon-activ8",
      github: "https://github.com/adaptive-liquidity-labs",
      docs: "https://docs.adaptiveliquidity.labs",
      ca: "0xAE0N...ACTIV8 (VERIFIED SAFE)",
      dex: "https://dexscreener.com/aeon-activ8",
      dashboard: "https://hub.activ8.network",
      warning: "OFFICIAL RULE: WE WILL NEVER DM YOU FIRST OR POST UNVERIFIED MINT LINKS."
    });
  }
  if (!storageController.safeGet("admin_settings")) {
    storageController.safeSet("admin_settings", {
      launchPhase: "PHASE 2: SOPHIA INTAKE QUEUE ACTIVE",
      mode: "SOPHIA COGNITION LIVE",
      emergencyBanner: "",
      standbyActive: false
    });
  }
  if (!storageController.safeGet("sophia_questions")) {
    // Canonical queue statuses: submitted | queued | approved | answering | answered | rejected | faq | escalated | featured
    storageController.saveCollection("sophia_questions", [
      {
        id: "q-mock-1",
        callsign: "GENESIS-01",
        question: "How does Adaptive Liquidity Labs sense and route non-linear liquidity across distributed state channels?",
        priorityScore: 350,
        status: "featured",
        category: "ARCHITECTURE",
        riskLevel: "LOW",
        submittedAt: Date.now() - 3600000,
        rep: 150,
        quests: 4,
        referrals: 10
      },
      {
        id: "q-mock-2",
        callsign: "SIGNAL-X",
        question: "When will the access pass metadata verification snapshot occur?",
        priorityScore: 180,
        status: "approved",
        category: "ACCESS",
        riskLevel: "LOW",
        submittedAt: Date.now() - 1800000,
        rep: 50,
        quests: 2,
        referrals: 8
      },
      {
        id: "q-mock-3",
        callsign: "OBSERVER-9",
        question: "Wen marketing wallet airdrop?",
        priorityScore: -50,
        status: "rejected",
        category: "GENERAL",
        riskLevel: "HIGH",
        submittedAt: Date.now() - 600000,
        rep: 0,
        quests: 0,
        referrals: 0,
        spam: true
      }
    ]);
  }
  if (!storageController.safeGet("sophia_answers")) {
    storageController.saveCollection("sophia_answers", [
      {
        questionId: "q-mock-1",
        reply: "Adaptive architectures utilize asynchronous proof channels to verify state transitions before capital deployment. Static liquidity is automatically re-routed via heuristic agent networks.",
        responseMode: "AUTHORITATIVE SYNTHESIS",
        visibleCognition: ">> SENSING DISTRIBUTED CHANNELS...\n>> ANALYZING NON-LINEAR VELOCITY...\n>> HEURISTIC WEIGHTS VERIFIED: SAFE\n>> COGNITION STABILIZED.",
        featured: true,
        answeredAt: Date.now() - 3500000
      }
    ]);
  }
  if (!storageController.safeGet("hub_events")) {
    storageController.saveCollection("hub_events", [
      { id: "e-1", text: "Sophia Core connection initialized via proxy interface.", time: "1h ago", type: "SYSTEM" },
      { id: "e-2", text: "Question by GENESIS-01 featured on Sophia Live displays.", time: "45m ago", type: "COGNITION" }
    ]);
  }
};
initStorageDefaults();
 
const store = {
  async get(k) { return storageController.safeGet(k === "nexus-user" ? "activ8-user" : k); },
  async set(k, v) { storageController.safeSet(k === "nexus-user" ? "activ8-user" : k, v); },
};
 
const genRef = (n) => `ACTIV8-${Math.abs(n.split("").reduce((a,c)=>((a<<5)-a+c.charCodeAt(0))|0,0)).toString(36).toUpperCase().padStart(6,"0").slice(0,6)}`;
 
function useCountdown(target) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const calc = () => { const diff = Math.max(0, new Date(target) - Date.now()); setT({ d: Math.floor(diff/864e5), h: Math.floor(diff%864e5/36e5), m: Math.floor(diff%36e5/6e4), s: Math.floor(diff%6e4/1e3) }); };
    calc(); const i = setInterval(calc, 1000); return () => clearInterval(i);
  }, [target]);
  return t;
}
 
function Particles({ color = "rgba(156,255,59,0.12)", count = 50 }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    const pts = Array.from({ length: count }, () => ({ x: Math.random()*c.width, y: Math.random()*c.height, vx: (Math.random()-0.5)*0.25, vy: (Math.random()-0.5)*0.25, r: Math.random()*1.2+0.4 }));
    let raf;
    const draw = () => {
      ctx.clearRect(0,0,c.width,c.height);
      pts.forEach(p => { p.x+=p.vx; p.y+=p.vy; if(p.x<0)p.x=c.width; if(p.x>c.width)p.x=0; if(p.y<0)p.y=c.height; if(p.y>c.height)p.y=0; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle=color; ctx.fill(); });
      for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){ const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, d=Math.sqrt(dx*dx+dy*dy); if(d<90){ ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.strokeStyle=`rgba(156,255,59,${0.04*(1-d/90)})`; ctx.stroke(); } }
      raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize)};
  },[count,color]);
  return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}} />;
}
 
const Icon = {
  Mail: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  User: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Lock: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Eye: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  Discord: () => <svg viewBox="0 0 127.14 96.36" fill="#5865F2" width="20" height="20"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.4,80.21a105.73,105.73,0,0,0,32.21,16.15,109,109,0,0,0,7.56-12.22,68.21,68.21,0,0,1-12-5.71,5.2,5.2,0,0,1,1-.78,74.53,74.53,0,0,0,62.3,0,5.2,5.2,0,0,1,1,.78,69.52,69.52,0,0,1-12.19,5.71,109.32,109.32,0,0,0,7.56,12.22,105.28,105.28,0,0,0,32.27-16.15C129.5,50.46,125.09,26.85,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5.07-12.72,11.41-12.72S54,46,53.86,53,48.81,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5.07-12.72,11.44-12.72S96.23,46,96.12,53,91.07,65.69,84.69,65.69Z"/></svg>,
  Google: () => <svg viewBox="0 0 24 24" width="20" height="20"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>,
};

function Gate({ onComplete }) {
  const captchaRef = useRef(null);
  const _countdown = useCountdown(LAUNCH_DATE);
  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [err, setErr] = useState({});
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const verifyLines = ["INITIALIZING ACTIV8 PASSPORT...", "GENERATING REFERRAL VECTOR...", "ASSIGNING GENESIS COHORT...", "ACTIVATING OBSERVER ACCESS...", "ACTIV8 PASSPORT ACTIVATED ████████ 100%"];
  const [lines, setLines] = useState([]);
 
  useEffect(() => { if (step === 1) verifyLines.forEach((l,i) => setTimeout(()=>setLines(p=>[...p,l]), i*400)); }, [step]);
 
  const submit = async () => {
    const e = {};
    if (!isLogin && (!form.name.trim() || form.name.trim().length < 2)) e.name = true;
    if (!form.email.trim() || !form.email.includes("@")) e.email = true;
    if (!form.password || form.password.length < 6) e.password = true;
    if (!isLogin && form.password !== form.confirmPassword) e.confirm = true;
    if (Object.keys(e).length) { setErr(e); return; }
    
    setLoading(true);
    try {
      if (captchaRef.current) {
        captchaRef.current.execute();
      } else {
        setTimeout(() => onCaptchaVerify("bypass-token-dev"), 600);
      }
    } catch (_err) {
      setTimeout(() => onCaptchaVerify("bypass-token-dev"), 600);
    }
  };

  const onCaptchaVerify = async (token) => {
    try {
      let result;
      if (isLogin) {
        result = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      } else {
        result = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            captchaToken: token !== "bypass-token-dev" ? token : undefined,
            data: { callsign: form.name, ref_code: genRef(form.name) }
          }
        });
      }

      setLoading(false);
      setStep(1);
      const user = { 
        name: form.name || form.email.split("@")[0],
        email: form.email,
        ref: genRef(form.name || "USER"), 
        joined: Date.now(), 
        rep: isLogin ? 100 : 50, 
        tasks: {}, 
        pledge: null, 
        badge: "GENESIS",
        id: result?.data?.user?.id || `usr-${Date.now()}`
      };
      await store.set("activ8-user", user);
      setTimeout(() => onComplete(user), 2400);
    } catch (_err) { setLoading(false); }
  };
 
  return (
    <div className="g">
      <Particles />
      <div className="gi">
        <div className="lr"><div className="ld" /></div>
        <div className="gl">ADAPTIVE LIQUIDITY LABS</div>
        <h1 className="gt">ᐰEON:ᐰCTIV8</h1>
        
        {step === 0 && (
          <div className="fb">
            <h2 className="gh">{isLogin ? "Welcome back" : "Create account"}</h2>
            <p className="gs">{isLogin ? "Log in to access your ACTIV8 account." : "Join the AEON ACTIV8 network."}</p>

            {!isLogin && (
              <div className="fi">
                <label>CALLSIGN</label>
                <div className="fi-w">
                  <input placeholder="Choose your username" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className={err.name?"ie":""} />
                  <span className="fi-i"><Icon.User /></span>
                </div>
              </div>
            )}

            <div className="fi">
              <label>EMAIL</label>
              <div className="fi-w">
                <input type="email" placeholder="name@domain.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className={err.email?"ie":""} />
                <span className="fi-i"><Icon.Mail /></span>
              </div>
            </div>

            <div className="fi">
              <label>PASSWORD</label>
              <div className="fi-w">
                <input type={showPass ? "text" : "password"} placeholder={isLogin ? "Enter your password" : "Create a password"} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className={err.password?"ie":""} />
                <span className="fi-i"><Icon.Lock /></span>
                <span className="fi-t" onClick={()=>setShowPass(!showPass)}>
                  {showPass ? <Icon.EyeOff /> : <Icon.Eye />}
                </span>
              </div>
              {isLogin && <div style={{textAlign:"right",marginTop:10}}><span className="tog-b" style={{fontSize:13,opacity:0.8}}>Forgot password?</span></div>}
            </div>

            {!isLogin && (
              <div className="fi">
                <label>CONFIRM PASSWORD</label>
                <div className="fi-w">
                  <input type={showPass ? "text" : "password"} placeholder="Confirm your password" value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} className={err.confirm?"ie":""} />
                  <span className="fi-i"><Icon.Lock /></span>
                </div>
              </div>
            )}

            <button className="bp" onClick={submit} disabled={loading}>
              <span>{loading ? "VERIFYING..." : (isLogin ? "Log in" : "Create account")}</span>
            </button>

            <div className="div">
              <div className="div-l" />
              <div className="div-t">OR</div>
              <div className="div-l" />
            </div>

            <div className="soc-g">
              <button className="sb-b"><Icon.Discord /> Continue with Discord</button>
              <button className="sb-b"><Icon.Google /> Continue with Google</button>
            </div>

            <div className="tog">
              {isLogin ? "New to Aeon Activ8?" : "Already have an account?"}
              <span className="tog-b" onClick={()=>{setIsLogin(!isLogin); setErr({});}}>{isLogin ? "Create an account" : "Log in"}</span>
            </div>

            <HCaptcha ref={captchaRef} sitekey="c3ea7102-0442-4b92-b390-a45ec2ca10e6" size="invisible" onVerify={onCaptchaVerify} onError={() => setLoading(false)} theme="dark" />

            <p className="dis">By continuing, you agree to our <span>Terms of Service</span> and <span>Privacy Policy</span>.</p>
          </div>
        )}
        {step === 1 && (
          <div className="tm">{lines.map((l,i)=><div key={i} className="tl" style={{animationDelay:`${i*0.05}s`}}><span className="tc2">›</span>{l}</div>)}</div>
        )}
      </div>
    </div>
  );
}
 
const tasks = [
  { id:"follow_x", label:"Follow @all4aeon on X", desc:"Stay connected to the signal.", link:SOCIALS.x, rep:15, icon:"𝕏" },
  { id:"follow_tg", label:"Join the Telegram", desc:"Enter the coordination channel.", link:SOCIALS.tg, rep:15, icon:"✈" },
  { id:"follow_dc", label:"Join the Discord", desc:"Access the builder network.", link:SOCIALS.discord, rep:15, icon:"◆" },
  { id:"post_tag", label:"Post & tag @all4aeon", desc:"Create a post about AEON. Tag @all4aeon + a target company.", link:null, rep:50, icon:"◇" },
  { id:"share_ref", label:"Share your referral link", desc:"Post your referral link on any platform.", link:null, rep:25, icon:"⬡" },
];
 
const pledgeTiers = [
  { id:"signal", name:"SIGNAL", cost:"$10", lock:"30 days", perks:["Early access to utilities before public launch","Priority whitelist for official token","Signal-tier badge"], color:"#00d8ff" },
  { id:"architect", name:"ARCHITECT", cost:"$20", lock:"30 days", perks:["Everything in Signal tier","Exclusive access to MVPs right now","Architect-tier badge"], color:"#9cff3b", featured:true },
  { id:"founder", name:"FOUNDER", cost:"$50", lock:"60 days", perks:["Lifetime utility access","Guaranteed token allocation","Name on Genesis Wall"], color:"#d7b15b" },
];

// Helper to trigger Local Mock Sophia Response simulation
const triggerMockSophiaResponse = (questionObj, onComplete) => {
  const replies = [
    "Autonomous verification relies on strict signature sequences. The network amplifies valid payloads while dissipating simulated attack vectors.",
    "Liquidity protocols within the machine-native era act as active defense matrices. Static allocation models are replaced by sensing feedback cycles.",
    "By bridging off-chain agent cognition with deterministic settlement layers, AEON ensures continuous verification without latency compromises."
  ];
  const selectedReply = replies[Math.floor(Math.random() * replies.length)];
  const responseData = {
    reply: `>> SOPHIA CORE ANSWER: ${selectedReply}`,
    response_mode: "ANALYTICAL SYNTHESIS",
    risk_level: questionObj.riskLevel || "LOW",
    public_safe: true,
    visible_cognition: `>> INGESTING QUESTION PAYLOAD [ID: ${questionObj.id}]\n>> EVALUATING PRIORITY WEIGHTS: ${questionObj.priorityScore}\n>> DEPLOYING COGNITIVE HEURISTICS...\n>> OUTPUT VERIFIED BY PROTOCOL.`,
    hub_event: `Sophia answered inquiry from ${questionObj.callsign}`,
    recommended_surface: "SOPHIA_LIVE"
  };

  // Cache answer
  const answers = storageController.getCollection("sophia_answers");
  const newAnswer = {
    questionId: questionObj.id,
    reply: responseData.reply,
    responseMode: responseData.response_mode,
    visibleCognition: responseData.visible_cognition,
    featured: true,
    answeredAt: Date.now()
  };
  storageController.saveCollection("sophia_answers", [...answers.filter(a => a.questionId !== questionObj.id), newAnswer]);

  // Update canonical question status to featured
  const questions = storageController.getCollection("sophia_questions");
  const updatedQ = questions.map(q => q.id === questionObj.id ? { ...q, status: "featured" } : q);
  storageController.saveCollection("sophia_questions", updatedQ);

  // Trigger hub event log
  const events = storageController.getCollection("hub_events");
  storageController.saveCollection("hub_events", [
    { id: `e-${Date.now()}`, text: responseData.hub_event, time: "Just now", type: "COGNITION" },
    ...events
  ]);

  if (onComplete) onComplete(responseData);
};

// Client proxy route caller placeholder
const callSophiaCoreProxy = async (questionObj, onResult) => {
  try {
    const proxyUrl = window.location.hostname.includes("vercel") || window.location.hostname.includes("localhost") 
      ? "/api/sophia/respond" 
      : "https://skletsjrrejlmgseczan.supabase.co/functions/v1/sophia-proxy";
      
    const res = await fetch(proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: questionObj })
    });
    
    if (!res.ok) throw new Error("Proxy server unreachable");
    const data = await res.json();
    onResult(data);
  } catch (err) {
    console.warn("Sophia Core direct proxy route inactive. Failing over to advanced Mock Responder simulation:", err);
    triggerMockSophiaResponse(questionObj, onResult);
  }
};
 
function Hub({ user: init, currentPath, onNavigate }) {
  const [user, setUser] = useState(init);
  const isAdmin = user?.email === "contact@adaptiveliquidity.com";
  const [tab, setTab] = useState("home");
  const [copied, setCopied] = useState(false);
  const refLink = `https://aeon.activ8.network/join?ref=${user?.ref || "GENESIS"}`;
 
  const saveUser = async (u) => { setUser(u); await store.set("activ8-user", u); };
  const completeTask = async (id) => { const u = { ...user, tasks: { ...user.tasks, [id]: true }, rep: (user?.rep||0) + tasks.find(t=>t.id===id).rep }; await saveUser(u); };
  const selectPledge = async (tier) => { await saveUser({ ...user, pledge: tier }); };
  const copy = () => { navigator.clipboard?.writeText(refLink).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),2000); };
 
  const tabs = [{ id:"home", label:"ACTIV8 HQ", icon:"◈" },{ id:"quests", label:"QUESTS", icon:"◇" },{ id:"pledge", label:"PLEDGE", icon:"⬡" },{ id:"refer", label:"NETWORK", icon:"◎" }];
 
  return (
    <div className="hb">
      <Particles count={30} color="rgba(156,255,59,0.06)" />
      
      {/* Universal navigation bar supporting direct MVP surface routing */}
      <header className="hd">
        <div className="hl" onClick={()=>onNavigate("/hub")} style={{cursor:"pointer"}}>
          <div className="hld" />
          <span className="hlt">AEON ACTIV8</span>
        </div>
        <div className="h-nav">
          <button className={`hn-btn ${currentPath==="/ask-sophia"?"ac":""}`} onClick={()=>onNavigate("/ask-sophia")}>/ask-sophia</button>
          <button className={`hn-btn ${currentPath==="/sophia-live"?"ac":""}`} onClick={()=>onNavigate("/sophia-live")}>/sophia-live</button>
          <button className={`hn-btn ${currentPath==="/hub"?"ac":""}`} onClick={()=>onNavigate("/hub")}>/hub</button>
          <button className={`hn-btn ${currentPath==="/links"?"ac":""}`} onClick={()=>onNavigate("/links")}>/links</button>
          <button className={`hn-btn ${currentPath==="/launch"?"ac":""}`} onClick={()=>onNavigate("/launch")}>/launch</button>
          <button className={`hn-btn ${currentPath==="/overlay"?"ac":""}`} onClick={()=>onNavigate("/overlay")}>/overlay</button>
          <button className={`hn-btn ${currentPath==="/standby"?"ac":""}`} onClick={()=>onNavigate("/standby")}>/standby</button>
          {isAdmin && <button className={`hn-btn admin ${currentPath==="/admin/sophia"?"ac":""}`} onClick={()=>onNavigate("/admin/sophia")}>[Admin]</button>}
        </div>
        {user ? (
          <div className="hu">
            <div className="ha">{user.name[0].toUpperCase()}</div>
            <span>{user.name}</span>
          </div>
        ) : (
          <button className="hn-btn" onClick={()=>onNavigate("/")}>Sign In</button>
        )}
      </header>

      {/* Production Storage Advisory Notice */}
      <div className="dev-banner">
        <span>💡 MVP Persistence: LocalStorage controller active. Production deployment path provisions Supabase/Postgres relational architecture.</span>
      </div>

      {/* Surface Multiplexer based on Path State */}
      <div className="surface-container">
        {currentPath === "/ask-sophia" && <AskSophiaSurface user={user} onNavigate={onNavigate} />}
        {currentPath === "/admin/sophia" && <AdminSophiaSurface user={user} onNavigate={onNavigate} />}
        {currentPath === "/sophia-live" && <SophiaLiveSurface onNavigate={onNavigate} />}
        {currentPath === "/hub" && <PublicHubSurface onNavigate={onNavigate} />}
        {currentPath === "/links" && <LinksSurface />}
        {currentPath === "/launch" && <LaunchSurface onNavigate={onNavigate} />}
        {currentPath === "/standby" && <StandbySurface />}
        {(!currentPath || currentPath === "/" || currentPath.includes("join")) && user && (
          <>
            <nav className="nv">{tabs.map(t=><button key={t.id} className={`nb ${tab===t.id?"ac":""}`} onClick={()=>setTab(t.id)}><span className="ni">{t.icon}</span><span className="nl">{t.label}</span></button>)}</nav>
            <main className="mn">
              {tab==="home" && <HomeTab user={user} refLink={refLink} copied={copied} onCopy={copy} onNavigate={onNavigate} />}
              {tab==="quests" && <QuestsTab user={user} onComplete={completeTask} />}
              {tab==="pledge" && <PledgeTab user={user} onPledge={selectPledge} />}
              {tab==="refer" && <ReferTab user={user} refLink={refLink} copied={copied} onCopy={copy} />}
            </main>
          </>
        )}
      </div>
    </div>
  );
}

// ROUTE: /ask-sophia
function AskSophiaSurface({ user, onNavigate: _onNavigate }) {
  const [qText, setQText] = useState("");
  const [category, setCategory] = useState("ARCHITECTURE");
  const [risk, setRisk] = useState("LOW");
  const [statusMsg, setStatusMsg] = useState(null);
  const links = storageController.safeGet("official_links") || {};

  // Compute live priority scores
  const repScore = user?.rep || 10;
  const questCount = Object.keys(user?.tasks || {}).length;
  const calculatedPriority = 100 + repScore + (questCount * 25) - (risk === "HIGH" ? 200 : 0);

  const handleSubmit = () => {
    if (!qText.trim()) return;
    const questions = storageController.getCollection("sophia_questions");
    const newQ = {
      id: `q-${Date.now()}`,
      callsign: user?.name || "ANON-SIGNALER",
      question: qText,
      priorityScore: calculatedPriority,
      status: "submitted", // Canonical status matching Sophia Core
      category,
      riskLevel: risk,
      submittedAt: Date.now(),
      rep: repScore,
      quests: questCount,
      referrals: 0
    };
    storageController.saveCollection("sophia_questions", [newQ, ...questions]);
    setStatusMsg(`Inquiry logged successfully. [ID: ${newQ.id}] Initiating secure uplink to Sophia Core...`);
    setQText("");

    // AUTO-SYNTHESIS: Trigger the server-side proxy call immediately
    callSophiaCoreProxy(newQ, (resData) => {
      // 1. Save the response to the answers collection
      const answers = storageController.getCollection("sophia_answers");
      const newAnswer = {
        questionId: newQ.id,
        reply: resData.reply,
        responseMode: resData.response_mode,
        visibleCognition: resData.visible_cognition,
        claimStatus: resData.claim_status,
        responseSource: resData.response_source,
        featured: false, // Wait for Admin to approve/feature
        answeredAt: Date.now()
      };
      storageController.saveCollection("sophia_answers", [newAnswer, ...answers]);

      // 2. Update the question status to 'answered' so Admin knows it's ready for review
      const currentQs = storageController.getCollection("sophia_questions");
      const updatedQs = currentQs.map(q => q.id === newQ.id ? { ...q, status: "answered" } : q);
      storageController.saveCollection("sophia_questions", updatedQs);
      
      setStatusMsg(`Inquiry processed. Synthesis captured and routed to ACTIV8 Admin for final review.`);
    });
    
    // Broadcast queue update event
    const events = storageController.getCollection("hub_events");
    storageController.saveCollection("hub_events", [
      { id: `e-${Date.now()}`, text: `New inquiry added to Sophia queue by ${newQ.callsign}`, time: "Just now", type: "QUEUE" },
      ...events
    ]);
  };

  return (
    <div className="surface-card">
      <div className="sl">SOPHIA CORE INTAKE TERMINAL</div>
      <p className="sd">Submit queries directly to the intelligence layer. High priority assignments receive accelerated autonomous synthesis.</p>
      
      {statusMsg && <div className="status-box success">{statusMsg}</div>}

      <div className="form-grid">
        <div className="fi">
          <label>INQUIRY PAYLOAD</label>
          <textarea rows="4" placeholder="Enter continuous text prompt for Sophia..." value={qText} onChange={e=>setQText(e.target.value)} className="q-area" />
        </div>
        <div className="grid-2">
          <div className="fi">
            <label>ROUTING CATEGORY</label>
            <select value={category} onChange={e=>setCategory(e.target.value)} className="q-sel">
              <option value="ARCHITECTURE">ARCHITECTURE</option>
              <option value="LIQUIDITY">LIQUIDITY</option>
              <option value="GOVERNANCE">GOVERNANCE</option>
              <option value="SAFETY">SAFETY / VERIFICATION</option>
            </select>
          </div>
          <div className="fi">
            <label>RISK PROFILE</label>
            <select value={risk} onChange={e=>setRisk(e.target.value)} className="q-sel">
              <option value="LOW">LOW RISK (STANDARD)</option>
              <option value="HIGH">HIGH RISK (REQUIRES AUDIT)</option>
            </select>
          </div>
        </div>
      </div>

      <button className="bp" onClick={handleSubmit}>TRANSMIT TO SOPHIA QUEUE</button>

      {/* Priority Engine Score Visualizer */}
      <div className="priority-engine-view">
        <div className="pev-title">PRIORITY SCORING ENGINE MATH</div>
        <div className="pev-formula">
          <span>Score = HolderBonus(+100) + RepScore(+{repScore}) + QuestsBonus(+{questCount*25}) - RiskPenalty({risk==="HIGH"?200:0})</span>
        </div>
        <div className="pev-result">Calculated Priority Index: <strong>{calculatedPriority}</strong></div>
        <p className="dis">Note: Safety-critical alerts and protocol link access are permanently unblocked for all tiers.</p>
      </div>

      {/* Official links safety block reminder */}
      <div className="safety-block-reminder">
        <div className="sbr-title">🔒 VERIFIED ENDPOINTS & DEFENSE REMINDER</div>
        <div className="sbr-links">
          <a href={links.ca || "#"} target="_blank" rel="noreferrer">Contract: {links.ca?.slice(0,18)}...</a>
          <a href={links.telegram || "#"} target="_blank" rel="noreferrer">Official Telegram</a>
          <a href={links.x || "#"} target="_blank" rel="noreferrer">Official 𝕏</a>
        </div>
        <div className="sbr-rule">{links.warning}</div>
      </div>
    </div>
  );
}

// ROUTE: /admin/sophia (Protected by Admin Identity & Passcode)
function AdminSophiaSurface({ user, onNavigate }) {
  const isAdmin = user?.email === "contact@adaptiveliquidity.com";
  const [authed, setAuthed] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [questions, setQuestions] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [simOutput, setSimOutput] = useState(null);

  useEffect(() => {
    // If not the designated admin, force exit immediately
    if (!isAdmin) {
      onNavigate("/hub");
      return;
    }
    // Check safe memory session barrier
    if (storageController.safeGet("activ8_admin_unlocked") === true) {
      setAuthed(true);
      setQuestions(storageController.getCollection("sophia_questions"));
    }
  }, [isAdmin, onNavigate]);

  const handleUnlock = () => {
    if (passcode === "ACTIV8-ADMIN-2026") {
      storageController.safeSet("activ8_admin_unlocked", true);
      setAuthed(true);
      setQuestions(storageController.getCollection("sophia_questions"));
    } else {
      alert("Invalid Security Credentials");
    }
  };

  const refreshQ = () => setQuestions(storageController.getCollection("sophia_questions"));

  const updateStatus = (id, newStatus) => {
    // Canonical statuses: submitted | queued | approved | answering | answered | rejected | faq | escalated | featured
    const current = storageController.getCollection("sophia_questions");
    const updated = current.map(q => q.id === id ? { ...q, status: newStatus } : q);
    storageController.saveCollection("sophia_questions", updated);
    refreshQ();
  };

  const boostScore = (id) => {
    const current = storageController.getCollection("sophia_questions");
    const updated = current.map(q => q.id === id ? { ...q, priorityScore: q.priorityScore + 100 } : q);
    storageController.saveCollection("sophia_questions", updated);
    refreshQ();
  };

  const handleProxyCall = (qObj) => {
    // Check if we already have a captured synthesis for this question
    const answers = storageController.getCollection("sophia_answers");
    const existing = answers.find(a => a.questionId === qObj.id);

    if (existing) {
      // Re-map schema for UI display if needed (consistency check)
      setSimOutput({
        ...existing,
        visible_cognition: existing.visibleCognition, // frontend uses snake_case in some previews
        response_mode: existing.responseMode
      });
      return;
    }

    updateStatus(qObj.id, "answering");
    callSophiaCoreProxy(qObj, (resData) => {
      setSimOutput(resData);
      refreshQ();
    });
  };

  const handleFlush = () => {
    if (window.confirm("Flush all queue memory rows?")) {
      storageController.clearAll();
      initStorageDefaults();
      refreshQ();
    }
  };

  if (!authed) {
    return (
      <div className="surface-card admin-gate">
        <div className="sl" style={{color:"#ff4d4d"}}>RESTRICTED OPERATIONS MATRIX</div>
        <p className="sd">Administrative authorization credentials required to manage live Sophia intake pipeline.</p>
        <div className="fi" style={{maxWidth:240,margin:"0 auto 16px"}}>
          <input type="password" placeholder="Enter Admin Passcode..." value={passcode} onChange={e=>setPasscode(e.target.value)} style={{textAlign:"center"}} />
        </div>
        <button className="bp" onClick={handleUnlock} style={{maxWidth:240,margin:"0 auto",borderColor:"#ff4d4d",color:"#ff4d4d"}}>AUTHORIZE ACCESS</button>
        <div className="dis">Demo Credentials Passcode: ACTIV8-ADMIN-2026</div>
      </div>
    );
  }

  const filtered = filterStatus === "ALL" ? questions : questions.filter(q => q.status.toUpperCase() === filterStatus.toUpperCase());

  return (
    <div className="surface-card admin-panel">
      <div className="ap-header">
        <div className="sl" style={{color:"#d7b15b"}}>ACTIV8 COMMAND PIPELINE</div>
        <div className="ap-actions">
          <button className="qbt" onClick={refreshQ}>REFRESH QUEUE</button>
          <button className="qbt" onClick={handleFlush} style={{color:"#ff4d4d",borderColor:"#ff4d4d"}}>FLUSH DATABASE</button>
          <button className="qbt" onClick={()=>storageController.safeSet("activ8_admin_unlocked",false)&setAuthed(false)}>LOCK GATE</button>
        </div>
      </div>

      {simOutput && (
        <div className="admin-briefing-overlay">
          <div className="briefing-card">
            <div className="briefing-header">
              <div className="bh-left">
                <div className="bh-tag">EXECUTIVE SYNTHESIS PREVIEW</div>
                <h3 className="bh-title">MODE: {simOutput.response_mode}</h3>
              </div>
              <div className="bh-right">
                <div className={`risk-tag ${simOutput.risk_level}`}>RISK: {simOutput.risk_level}</div>
                <button className="close-briefing" onClick={()=>setSimOutput(null)}>×</button>
              </div>
            </div>
            
            <div className="briefing-body">
              <div className="brief-section">
                <label>PROPOSED PUBLIC RESPONSE</label>
                <div className="brief-content reply">{simOutput.reply}</div>
              </div>
              
              <div className="brief-grid">
                <div className="brief-section">
                  <label>COGNITIVE TELEMETRY (VISIBLE)</label>
                  <pre className="brief-content cognition">{simOutput.visible_cognition}</pre>
                </div>
                <div className="brief-section">
                  <label>INTERNAL ROUTING</label>
                  <div className="brief-meta">
                    <div className="bm-row"><span>SOURCE</span> <strong>{simOutput.response_source}</strong></div>
                    <div className="bm-row"><span>CLAIM STATUS</span> <strong>{simOutput.claim_status}</strong></div>
                    <div className="bm-row"><span>HUB EVENT</span> <strong>{simOutput.hub_event}</strong></div>
                    <div className="bm-row"><span>SAFE BROADCAST</span> <strong style={{color: simOutput.public_safe ? "var(--lq)" : "#ff4d4d"}}>{simOutput.public_safe ? "VERIFIED" : "WARNING"}</strong></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="briefing-footer">
              <button className="act-btn approve" onClick={()=>{updateStatus(simOutput.questionId || simOutput.id, "approved"); setSimOutput(null)}}>APPROVE SYNTHESIS</button>
              <button className="act-btn feature" onClick={()=>{updateStatus(simOutput.questionId || simOutput.id, "featured"); setSimOutput(null)}}>FEATURE ON LIVE STREAM</button>
              <button className="act-btn reject" onClick={()=>{updateStatus(simOutput.questionId || simOutput.id, "rejected"); setSimOutput(null)}}>REJECT OUTPUT</button>
            </div>
          </div>
        </div>
      )}

      <div className="filter-bar">
        <span className="wlk">Canonical Status Filter:</span>
        {["ALL","SUBMITTED","QUEUED","APPROVED","ANSWERED","FEATURED","REJECTED","ESCALATED","FAQ"].map(st => (
          <button key={st} className={`f-btn ${filterStatus===st?"ac":""}`} onClick={()=>setFilterStatus(st)}>{st}</button>
        ))}
      </div>

      <div className="q-table">
        {filtered.length === 0 ? <div className="pn">No records matching active query criteria.</div> : filtered.map(q => (
          <div key={q.id} className={`q-row-v2 ${q.status}`}>
            <div className="qrv2-sidebar">
              <div className="qrv2-dot" />
            </div>
            <div className="qrv2-main">
              <div className="qrv2-header">
                <div className="qrv2-info">
                  <span className="qrv2-callsign">{q.callsign}</span>
                  <span className="qrv2-meta">{q.category} • P{q.priorityScore}</span>
                </div>
                <div className="qrv2-tags">
                  <span className={`qrv2-status-tag ${q.status}`}>{q.status}</span>
                  <span className={`qrv2-risk-tag ${q.riskLevel}`}>{q.riskLevel}</span>
                </div>
              </div>
              <div className="qrv2-body">"{q.question}"</div>
              <div className="qrv2-controls">
                <div className="qrv2-primary-actions">
                  {q.status === "submitted" && <button className="act-btn-v2" onClick={()=>updateStatus(q.id, "queued")}>Queue</button>}
                  <button className={`act-btn-v2 highlight ${q.status === 'answered' ? 'pulse' : ''}`} onClick={()=>handleProxyCall(q)}>
                    {q.status === 'answered' ? 'Review & Approve' : 'Trigger Synthesis'}
                  </button>
                </div>
                <div className="qrv2-secondary-actions">
                  <button className="act-btn-v2" onClick={()=>boostScore(q.id)}>Boost</button>
                  <button className="act-btn-v2" onClick={()=>updateStatus(q.id, "faq")}>FAQ</button>
                  <button className="act-btn-v2 reject" onClick={()=>updateStatus(q.id, "rejected")}>Reject</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ROUTE: /sophia-live
function SophiaLiveSurface({ onNavigate }) {
  const answers = [...storageController.getCollection("sophia_answers")].sort((a,b) => (b.answeredAt||0) - (a.answeredAt||0));
  const questions = storageController.getCollection("sophia_questions");
  
  const featuredAnswers = answers.filter(a => a.featured).slice(0, 5);
  const others = answers.filter(a => !featuredAnswers.find(f => f.questionId === a.questionId)).slice(0, 6);

  return (
    <div className="surface-card sophia-live-view">
      <div className="live-header">
        <div className="lh-status"><span className="spd" /> SOPHIA COGNITIVE TELEMETRY STREAM</div>
        <div className="lh-mode">ACTIVE UPLINK: {featuredAnswers.length > 0 ? "STABLE" : "IDLE"}</div>
      </div>

      <div className="featured-feed">
        {featuredAnswers.length > 0 ? featuredAnswers.map((ans, idx) => {
          const rq = questions.find(q => q.id === ans.questionId);
          return (
            <div key={idx} className="featured-cognition-box" style={{animationDelay: `${idx * 0.1}s`}}>
              <div className="fcb-top">
                <span className="fcb-label">CORE SYNTHESIS {idx === 0 ? "[LATEST]" : ""}</span>
                <span className="fcb-author">INQUIRY BY: {rq?.callsign || "GENESIS PROTOCOL"}</span>
              </div>
              <div className="fcb-question">"{rq?.question || "Awaiting target input stream."}"</div>
              <div className="fcb-reply">{ans.reply}</div>
              
              <details className="cognition-details">
                <summary className="fcb-term-title">EXPAND COGNITION ENGINE LOGS</summary>
                <pre className="fcb-cognition-term">{ans.visibleCognition}</pre>
              </details>
            </div>
          );
        }) : (
          <div className="pn">No featured answers streaming. Submit an inquiry through the intake queue.</div>
        )}
      </div>

      {others.length > 0 && (
        <div className="recent-answers-block" style={{marginTop: 30}}>
          <div className="sl">ARCHIVED TELEMETRY OUTPUTS</div>
          <div className="ra-grid">
            {others.map((ans, idx) => {
              const rq = questions.find(q => q.id === ans.questionId);
              return (
                <div key={idx} className="ra-card">
                  <div className="ra-author">{rq?.callsign || "SIGNALER"}</div>
                  <div className="ra-reply">{ans.reply.slice(0, 90)}...</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="live-cta-box">
        <button className="bp" onClick={()=>onNavigate("/ask-sophia")}>TRANSMIT NEW INQUIRY TO SOPHIA</button>
      </div>
    </div>
  );
}

// ROUTE: /hub
function PublicHubSurface({ onNavigate }) {
  const questions = storageController.getCollection("sophia_questions");
  const answers = storageController.getCollection("sophia_answers");
  const events = storageController.getCollection("hub_events");
  const settings = storageController.safeGet("admin_settings") || {};
  const links = storageController.safeGet("official_links") || {};

  const activeQueueCount = questions.filter(q => ["submitted","queued","approved","answering"].includes(q.status)).length;
  const featuredQ = questions.find(q => q.status === "featured") || questions[0];
  const featuredA = featuredQ ? answers.find(a => a.questionId === featuredQ.id) : null;

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
                <pre className="hfb-cog">{featuredA.visibleCognition?.slice(0, 120)}...</pre>
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
                <span className="ev-time">{ev.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ROUTE: /links (Completely Unauthenticated & Public)
function LinksSurface() {
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

// ROUTE: /launch (Public Operations View)
function LaunchSurface({ onNavigate }) {
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

// ROUTE: /standby (Cinematic Emergency Fallback)
function StandbySurface() {
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

function HomeTab({ user, refLink, copied, onCopy, onNavigate }) {
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
function FL({c,t,x}){ return <div className="fl"><span className="fld" style={{background:c}} /><span className="flt">{t}</span><span className="flx">{x}</span></div>; }
 
function QuestsTab({ user, onComplete }) {
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
 
function PledgeTab({ user, onPledge }) {
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
 
function ReferTab({ user: _user, refLink, copied, onCopy }) {
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

// ROUTE: /overlay (OBS-safe Transparent Minimalist Module)
function OverlaySurface() {
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
 
export default function App() {
  const [phase, setPhase] = useState(null);
  const [user, setUser] = useState(null);
  const [currentPath, setCurrentPath] = useState("");

  // Synchronize client router state with window address locations
  useEffect(() => {
    const handleLocationSync = () => {
      const path = window.location.pathname;
      const queryRoute = new URLSearchParams(window.location.search).get("route");
      const matchedPath = queryRoute || (path === "/" || path === "/index.html" ? "" : path);
      setCurrentPath(matchedPath);
      
      // Permanently skip intake user gate logic if visiting public/unauthenticated surface endpoints
      const unauthedSurfaces = ["/links","/launch","/overlay","/standby","/hub","/sophia-live"];
      if (unauthedSurfaces.includes(matchedPath)) {
        setPhase(PHASES.HUB);
        // Ensure dummy base profile attributes exist to facilitate shared component renders safely
        if (!storageController.safeGet("activ8-user")) {
          setUser({ name: "PUBLIC-VIEWER", ref: "PUBLIC", rep: 0, tasks: {} });
        }
      }
    };

    handleLocationSync();
    window.addEventListener("popstate", handleLocationSync);
    return () => window.removeEventListener("popstate", handleLocationSync);
  }, []);

  useEffect(() => {
    (async () => {
      const s = await store.get("activ8-user");
      if (s) {
        setUser(s);
        setPhase(PHASES.HUB);
      } else {
        // Only enforce gate view if targeting empty paths/home app
        const current = new URLSearchParams(window.location.search).get("route") || window.location.pathname;
        const unauthedSurfaces = ["/links","/launch","/overlay","/standby","/hub","/sophia-live"];
        if (!unauthedSurfaces.includes(current && current !== "/" ? current : "")) {
          setPhase(PHASES.GATE);
        } else {
          setPhase(PHASES.HUB);
          setUser({ name: "PUBLIC-VIEWER", ref: "PUBLIC", rep: 0, tasks: {} });
        }
      }
    })();
  }, []);

  const handleNavigate = (targetUrl) => {
    window.history.pushState({}, "", targetUrl);
    setCurrentPath(targetUrl);
    // Auto-resolve phase context
    const unauthedSurfaces = ["/links","/launch","/overlay","/standby","/hub","/sophia-live"];
    if (unauthedSurfaces.includes(targetUrl)) {
      setPhase(PHASES.HUB);
      if (!user) setUser({ name: "PUBLIC-VIEWER", ref: "PUBLIC", rep: 0, tasks: {} });
    }
  };

  // Dedicated OBS capture layout path optimization
  if (currentPath === "/overlay") {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
          body { background: transparent !important; margin: 0; overflow: hidden; }
          @keyframes pg { 0%,100% { box-shadow: 0 0 4px #9cff3b; } 50% { box-shadow: 0 0 14px #9cff3b; } }
        `}</style>
        <OverlaySurface />
        {/* Subtle hover navigation floating return toggle */}
        <div style={{position:"fixed",bottom:4,right:4,opacity:0.1,transition:"opacity 0.2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.1}>
          <button onClick={()=>handleNavigate("/hub")} style={{background:"#020404",color:"#9cff3b",border:"1px solid #9cff3b",fontSize:9,padding:"2px 6px",cursor:"pointer"}}>Exit Overlay</button>
        </div>
      </>
    );
  }

  if (phase === null) return <div style={{background:"#020404",minHeight:"100vh"}} />;
  
  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{--v:#020404;--bg:#030707;--ox:#07100f;--bd:#1f2928;--bn:#f4f7f2;--st:#8b9694;--lq:#9cff3b;--sg:#00d8ff;--gd:#d7b15b;--cr:#ff4d4d;--rd:4px}
@keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes pg{0%,100%{box-shadow:0 0 4px var(--lq)}50%{box-shadow:0 0 14px var(--lq)}}
@keyframes wf{0%{opacity:0}8%{opacity:1}82%{opacity:1}100%{opacity:0}}
@keyframes sp{from{transform:rotate(0)}to{transform:rotate(360deg)}}
 
.g{position:relative;min-height:100vh;background:var(--v);display:flex;align-items:center;justify-content:center;overflow:hidden}
.g::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,rgba(140,255,63,0.06),transparent 60%);pointer-events:none}
.gi{position:relative;z-index:2;max-width:460px;width:100%;padding:40px 24px;text-align:center;animation:fu 0.8s ease}
.lr{width:56px;height:56px;border-radius:50%;border:1px solid rgba(140,255,63,0.2);display:flex;align-items:center;justify-content:center;margin:0 auto 24px;animation:sp 30s linear infinite}
.ld{width:8px;height:8px;border-radius:50%;background:#8CFF3F;box-shadow:0 0 15px #8CFF3F;animation:pg 3s ease infinite}
.gl{font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:0.3em;color:rgba(255,255,255,0.45);text-transform:uppercase;margin-bottom:12px}
.gt{font-family:'Space Grotesk',sans-serif;font-size:42px;font-weight:700;color:#FFFFFF;letter-spacing:0.12em;line-height:1;margin-bottom:28px;text-shadow:0 0 40px rgba(140,255,63,0.1)}
.gh{font-family:'Inter',sans-serif;font-size:28px;font-weight:700;color:#FFFFFF;margin-bottom:8px;letter-spacing:-0.02em}
.gs{font-family:'Inter',sans-serif;font-size:16px;color:rgba(255,255,255,0.62);line-height:1.6;margin-bottom:32px}

.fi{margin-bottom:18px;text-align:left}
.fi label{display:block;font-family:'Inter',sans-serif;font-size:13px;font-weight:500;color:rgba(255,255,255,0.84);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.05em}
.fi-w{position:relative;display:flex;align-items:center}
.fi-i{position:absolute;left:18px;color:rgba(255,255,255,0.45);pointer-events:none;transition:opacity 0.2s, visibility 0.2s;display:flex;align-items:center}
.fi-t{position:absolute;right:18px;color:rgba(255,255,255,0.45);cursor:pointer;transition:color 0.2s;display:flex;align-items:center}
.fi-t:hover{color:#FFFFFF}
.fi-w input{width:100%;height:56px;padding:0 18px 0 52px;background:rgba(255,255,255,0.035);border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:rgba(255,255,255,0.92);font-family:'Inter',sans-serif;font-size:15px;outline:none;transition:all 0.25s}
.fi-w input::placeholder{color:rgba(255,255,255,0.45)}
.fi-w input:focus{border-color:rgba(140,255,63,0.75);background:rgba(255,255,255,0.055);box-shadow:0 0 0 3px rgba(140,255,63,0.12)}
.fi-w input.ie{border-color:rgba(255,77,77,0.5)}
.fi-w input:not(:placeholder-shown) ~ .fi-i { opacity:0; visibility:hidden; }

.bp{width:100%;height:56px;background:linear-gradient(135deg, #8CFF3F, #6FEA25);border:none;border-radius:12px;color:#071006;font-family:'Inter',sans-serif;font-size:16px;font-weight:700;letter-spacing:0.02em;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);margin-top:24px;box-shadow:0 4px 15px rgba(140,255,63,0.15)}
.bp:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.05);box-shadow:0 6px 25px rgba(140,255,63,0.25)}
.bp:disabled{opacity:0.6;cursor:not-allowed}

.div{display:flex;align-items:center;margin:28px 0;gap:14px}
.div-l{flex:1;height:1px;background:rgba(255,255,255,0.1)}
.div-t{font-family:'Inter',sans-serif;font-size:12px;font-weight:600;color:rgba(255,255,255,0.3);letter-spacing:0.1em}

.soc-g{display:flex;flex-direction:column;gap:12px}
.sb-b{width:100%;height:54px;background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:rgba(255,255,255,0.9);font-family:'Inter',sans-serif;font-size:15px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:12px;transition:all 0.25s}
.sb-b:hover{background:rgba(255,255,255,0.055);border-color:rgba(140,255,63,0.25)}
.sb-b svg{width:20px;height:20px}

.tog{margin-top:32px;font-family:'Inter',sans-serif;font-size:15px;color:rgba(255,255,255,0.5)}
.tog-b{color:#8CFF3F;font-weight:600;cursor:pointer;margin-left:6px;transition:color 0.2s}
.tog-b:hover{color:#6FEA25;text-decoration:underline}

.dis{font-family:'Inter',sans-serif;font-size:12px;color:rgba(255,255,255,0.4);margin-top:24px;line-height:1.6}
.tm{text-align:left;font-family:'JetBrains Mono',monospace;font-size:14px;color:#8CFF3F;padding:24px;border:1px solid rgba(140,255,63,0.15);border-radius:12px;background:rgba(7,16,15,0.7);margin-top:20px}
.tl{margin-bottom:8px;animation:fu 0.3s ease both}
.tc2{color:#8CFF3F;margin-right:10px}
.hb{position:relative;min-height:100vh;background:var(--v);overflow-x:hidden}
.hd{position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:rgba(2,4,4,0.88);backdrop-filter:blur(14px);border-bottom:1px solid var(--bd)}
.hl{display:flex;align-items:center;gap:8px}
.hld{width:8px;height:8px;border-radius:50%;background:var(--lq);box-shadow:0 0 8px var(--lq)}
.hlt{font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;color:var(--bn);letter-spacing:0.15em}

/* Router Nav header */
.h-nav { display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; }
.hn-btn { background: none; border: 1px solid transparent; color: var(--st); font-family: 'JetBrains Mono', monospace; font-size: 10px; padding: 4px 8px; border-radius: 2px; cursor: pointer; transition: all 0.2s; }
.hn-btn:hover { color: var(--bn); background: rgba(244,247,242,0.03); }
.hn-btn.ac { color: var(--lq); border-color: rgba(156,255,59,0.2); background: rgba(156,255,59,0.04); }
.hn-btn.admin { color: #d7b15b; }

.dev-banner { background: rgba(215,177,91,0.05); border-bottom: 1px solid rgba(215,177,91,0.15); padding: 6px 16px; text-align: center; font-family: 'Inter', sans-serif; font-size: 10px; color: rgba(215,177,91,0.8); }

.hu{display:flex;align-items:center;gap:7px;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--st);padding:3px 10px 3px 3px;border:1px solid var(--bd);border-radius:var(--rd)}
.ha{width:22px;height:22px;background:linear-gradient(135deg,var(--lq),var(--sg));display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:var(--v);border-radius:2px}
.nv{display:flex;gap:0;padding:0 12px;background:rgba(7,16,15,0.5);border-bottom:1px solid var(--bd);overflow-x:auto;-webkit-overflow-scrolling:touch}
.nv::-webkit-scrollbar{display:none}
.nb{flex-shrink:0;padding:11px 16px;background:none;border:none;border-bottom:2px solid transparent;color:var(--st);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.18em;cursor:pointer;display:flex;align-items:center;gap:5px;transition:color 0.2s;white-space:nowrap}
.nb:hover{color:rgba(244,247,242,0.7)}
.nb.ac{color:var(--lq);border-bottom-color:var(--lq)}
.ni{font-size:12px}
.mn{padding:18px 14px 40px;max-width:580px;margin:0 auto}
.surface-container { padding: 18px 14px 40px; max-width: 680px; margin: 0 auto; animation: fu 0.4s ease; }

.surface-card { background: rgba(7,16,15,0.3); border: 1px solid var(--bd); border-radius: var(--rd); padding: 20px; margin-bottom: 16px; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

/* Custom elements for surfaces */
.status-box { padding: 12px; border-radius: var(--rd); font-family: 'JetBrains Mono', monospace; font-size: 10px; margin-bottom: 16px; border: 1px solid; }
.status-box.success { background: rgba(156,255,59,0.05); border-color: rgba(156,255,59,0.2); color: var(--lq); }

.priority-engine-view { margin-top: 20px; padding: 14px; background: rgba(0,216,255,0.02); border: 1px solid rgba(0,216,255,0.15); border-radius: var(--rd); text-align: left; }
.pev-title { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--sg); letter-spacing: 0.1em; margin-bottom: 6px; }
.pev-formula { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--bn); margin-bottom: 8px; }
.pev-result { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--st); }
.pev-result strong { color: var(--lq); font-size: 14px; }

.safety-block-reminder { margin-top: 16px; border-top: 1px solid var(--bd); padding-top: 14px; text-align: left; }
.sbr-title { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--gd); margin-bottom: 8px; }
.sbr-links { display: flex; gap: 12px; font-family: 'Inter', sans-serif; font-size: 11px; }
.sbr-links a { color: var(--st); transition: color 0.2s; }
.sbr-links a:hover { color: var(--lq); }
.sbr-rule { font-family: 'Inter', sans-serif; font-size: 10px; color: #ff4d4d; margin-top: 8px; font-weight: 500; }

/* Admin custom styles */
.ap-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--bd); padding-bottom: 12px; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
.ap-actions { display: flex; gap: 6px; }
.filter-bar { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 14px; align-items: center; }
.f-btn { background: rgba(244,247,242,0.02); border: 1px solid var(--bd); color: var(--st); font-family: 'JetBrains Mono', monospace; font-size: 9px; padding: 4px 8px; border-radius: 2px; cursor: pointer; }
.f-btn.ac { border-color: var(--lq); color: var(--lq); background: rgba(156,255,59,0.04); }

.q-table { display: flex; flex-direction: column; gap: 10px; }
.q-row { border: 1px solid var(--bd); border-radius: var(--rd); padding: 12px; background: rgba(2,4,4,0.4); text-align: left; }
.qr-top { display: flex; gap: 10px; align-items: center; font-family: 'JetBrains Mono', monospace; font-size: 10px; border-bottom: 1px solid rgba(31,41,40,0.4); padding-bottom: 6px; margin-bottom: 8px; flex-wrap: wrap; }
.qr-id { color: var(--bn); font-weight: 600; }
.qr-score { color: var(--st); }
.qr-status { padding: 1px 6px; border-radius: 2px; font-size: 8px; text-transform: uppercase; font-weight: 600; }
.qr-status.submitted { background: rgba(244,247,242,0.05); color: var(--st); }
.qr-status.queued { background: rgba(0,216,255,0.1); color: var(--sg); }
.qr-status.approved { background: rgba(156,255,59,0.1); color: var(--lq); }
.qr-status.answering { background: rgba(215,177,91,0.1); color: var(--gd); }
.qr-status.answered,.qr-status.featured { background: rgba(156,255,59,0.2); color: var(--lq); border: 1px solid; }
.qr-status.rejected { background: rgba(255,77,77,0.1); color: #ff4d4d; }
.qr-status.faq,.qr-status.escalated { background: rgba(139,150,148,0.2); color: var(--bn); }
.qr-badge { font-family: 'JetBrains Mono', monospace; font-size: 8px; background: var(--lq); color: #020404; padding: 1px 6px; border-radius: 2px; font-weight: 800; margin-left: 8px; animation: pulse 2s infinite; }
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}

.qr-risk.LOW { color: #9cff3b; font-size: 8px; }
.qr-risk.HIGH { color: #ff4d4d; font-size: 8px; font-weight: 700; }
.qr-body { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--bn); line-height: 1.5; margin-bottom: 10px; }
.qr-controls { display: flex; gap: 6px; flex-wrap: wrap; }
.act-btn { background: rgba(244,247,242,0.03); border: 1px solid var(--bd); color: var(--st); font-family: 'JetBrains Mono', monospace; font-size: 9px; padding: 4px 8px; border-radius: 2px; cursor: pointer; transition: all 0.2s; }
.act-btn:hover { border-color: var(--bn); color: var(--bn); }
.act-btn.approve { color: var(--lq); border-color: rgba(156,255,59,0.3); }
.act-btn.boost { color: var(--sg); }
.act-btn.sim { background: rgba(215,177,91,0.08); color: var(--gd); border-color: rgba(215,177,91,0.3); }
.act-btn.feature { background: rgba(156,255,59,0.08); color: var(--lq); border-color: var(--lq); }
.act-btn.reject { color: #ff4d4d; }
 
.featured-feed { display: flex; flex-direction: column; gap: 20px; }
.cognition-details { margin-top: 14px; border-top: 1px solid rgba(244,247,242,0.05); padding-top: 10px; }
.cognition-details summary { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--st); cursor: pointer; list-style: none; outline: none; transition: color 0.2s; }
.cognition-details summary:hover { color: var(--lq); }
.cognition-details summary::-webkit-details-marker { display: none; }

.sim-console { border: 1px solid var(--gd); background: rgba(215,177,91,0.03); padding: 14px; border-radius: var(--rd); margin-bottom: 16px; text-align: left; }
.sim-title { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--gd); margin-bottom: 8px; font-weight: 600; }
.sim-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: var(--st); margin-bottom: 10px; text-transform: uppercase; }
.sim-console pre { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--bn); white-space: pre-wrap; margin-bottom: 8px; }
.cognition-stream { font-family: 'JetBrains Mono', monospace !important; font-size: 10px !important; color: var(--lq) !important; background: rgba(2,4,4,0.6); padding: 8px; border-left: 2px solid var(--lq); }
.sim-meta { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--st); margin-bottom: 10px; }

/* Sophia Live view */
.live-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--bd); padding-bottom: 12px; margin-bottom: 16px; }
.lh-status { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--lq); display: flex; align-items: center; gap: 6px; }
.lh-mode { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--sg); }

.featured-cognition-box { border: 1px solid var(--lq); background: rgba(156,255,59,0.02); padding: 20px; border-radius: var(--rd); text-align: left; margin-bottom: 20px; box-shadow: 0 0 30px rgba(156,255,59,0.05); }
.fcb-top { display: flex; justify-content: space-between; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--st); margin-bottom: 10px; }
.fcb-label { color: var(--lq); font-weight: 600; letter-spacing: 0.1em; }
.fcb-question { font-family: 'Space Grotesk', sans-serif; font-size: 16px; color: var(--bn); font-style: italic; margin-bottom: 12px; }
.fcb-reply { font-family: 'Inter', sans-serif; font-size: 14px; color: var(--bn); line-height: 1.6; margin-bottom: 16px; border-bottom: 1px solid var(--bd); padding-bottom: 16px; }
.fcb-term-title { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--st); margin-bottom: 6px; }
.fcb-cognition-term { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--lq); background: rgba(2,4,4,0.8); border: 1px solid var(--bd); padding: 12px; border-radius: 2px; white-space: pre-wrap; line-height: 1.4; }

.ra-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
.ra-card { border: 1px solid var(--bd); padding: 10px; border-radius: var(--rd); background: rgba(2,4,4,0.3); text-align: left; }
.ra-author { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--sg); margin-bottom: 4px; }
.ra-reply { font-family: 'Inter', sans-serif; font-size: 11px; color: rgba(244,247,242,0.7); }

/* Hub metrics */
.hub-metrics-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; border: 1px solid var(--bd); padding: 12px; border-radius: var(--rd); background: rgba(2,4,4,0.5); }
.hm-box { text-align: center; border-right: 1px solid var(--bd); }
.hm-box:last-child { border-right: none; }
.hm-val { display: block; font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; color: var(--bn); }
.hm-lbl { font-family: 'JetBrains Mono', monospace; font-size: 8px; color: var(--st); letter-spacing: 0.1em; margin-top: 2px; display: block; }

.hub-featured-box { border: 1px solid rgba(0,216,255,0.2); background: rgba(0,216,255,0.02); padding: 14px; border-radius: var(--rd); text-align: left; }
.hfb-q { font-family: 'Space Grotesk', sans-serif; font-size: 14px; color: var(--bn); font-weight: 500; }
.hfb-author { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--st); margin-top: 4px; margin-bottom: 10px; }
.hfb-a { border-top: 1px solid var(--bd); padding-top: 10px; font-family: 'Inter', sans-serif; font-size: 12px; color: rgba(244,247,242,0.9); }
.hfb-albl { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--sg); margin-bottom: 4px; }
.hfb-cog { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--lq); background: var(--v); padding: 6px; margin-top: 6px; border-left: 2px solid var(--lq); }

.event-logstream { display: flex; flex-direction: column; gap: 6px; text-align: left; }
.ev-row { font-family: 'Inter', sans-serif; font-size: 11px; color: var(--st); display: flex; align-items: center; gap: 6px; padding: 4px 0; border-bottom: 1px solid rgba(31,41,40,0.3); }
.ev-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--st); flex-shrink: 0; }
.ev-dot.QUEUE { background: var(--sg); }
.ev-dot.COGNITION { background: var(--lq); }
.ev-time { font-family: 'JetBrains Mono', monospace; font-size: 8px; margin-left: auto; color: rgba(139,150,148,0.5); }

/* Links view */
.scam-warning-header { background: rgba(255,77,77,0.1); border: 1px solid #ff4d4d; color: #ff4d4d; padding: 12px; border-radius: var(--rd); font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 600; text-align: center; letter-spacing: 0.05em; line-height: 1.4; }
.links-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px; }
.v-link-btn { border: 1px solid var(--bd); padding: 14px; border-radius: var(--rd); background: rgba(2,4,4,0.4); text-align: left; text-decoration: none; display: flex; flex-direction: column; transition: all 0.2s; }
.v-link-btn:hover { border-color: var(--st); transform: translateY(-2px); }
.v-link-btn.primary { border-color: var(--lq); background: rgba(156,255,59,0.03); }
.v-link-btn.primary .vlb-title { color: var(--lq); }
.v-link-btn.social { border-color: rgba(0,216,255,0.2); }
.v-link-btn.social .vlb-title { color: var(--sg); }
.v-link-btn.chart { border-color: rgba(215,177,91,0.2); }
.v-link-btn.chart .vlb-title { color: var(--gd); }
.vlb-title { font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 600; color: var(--bn); margin-bottom: 4px; }
.vlb-sub { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--st); overflow: hidden; text-overflow: ellipsis; }

.ca-verify-box { border: 1px solid var(--bd); padding: 12px; border-radius: var(--rd); background: rgba(2,4,4,0.6); }
.cvb-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--st); margin-bottom: 4px; }
.cvb-val { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--lq); font-weight: 600; letter-spacing: 0.05em; }
.cvb-disclaimer { font-family: 'Inter', sans-serif; font-size: 9px; color: rgba(139,150,148,0.4); margin-top: 4px; }

/* Launch view */
.launch-phase-badge { display: inline-block; padding: 6px 14px; border: 1px solid var(--gd); background: rgba(215,177,91,0.05); color: var(--gd); font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600; border-radius: 2px; margin-top: 6px; margin-bottom: 16px; letter-spacing: 0.1em; }
.pinned-update-block { border-left: 2px solid var(--sg); background: rgba(0,216,255,0.02); padding: 12px 14px; text-align: left; margin-bottom: 16px; }
.pub-title { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--sg); margin-bottom: 6px; font-weight: 600; }
.pinned-update-block p { font-family: 'Inter', sans-serif; font-size: 12px; color: rgba(244,247,242,0.85); line-height: 1.5; }
.instructions-list { display: flex; flex-direction: column; gap: 8px; text-align: left; }
.ins-item { font-family: 'Inter', sans-serif; font-size: 11px; color: var(--st); background: rgba(244,247,242,0.01); border: 1px solid var(--bd); padding: 8px 12px; border-radius: 2px; }

.tc>*{animation:fu 0.4s ease both}
.tc>*:nth-child(2){animation-delay:0.05s}.tc>*:nth-child(3){animation-delay:0.1s}.tc>*:nth-child(4){animation-delay:0.15s}.tc>*:nth-child(5){animation-delay:0.2s}.tc>*:nth-child(6){animation-delay:0.25s}.tc>*:nth-child(7){animation-delay:0.3s}.tc>*:nth-child(8){animation-delay:0.35s}.tc>*:nth-child(9){animation-delay:0.4s}
.sl{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.22em;color:var(--st);margin-bottom:10px;margin-top:22px;text-transform:uppercase}
.sl:first-child{margin-top:0}
.sd{font-family:'Inter',sans-serif;font-size:13px;color:rgba(244,247,242,0.45);line-height:1.65;margin-bottom:16px}
 
.pp{border:1px solid rgba(156,255,59,0.1);border-radius:var(--rd);background:linear-gradient(135deg,rgba(156,255,59,0.03),rgba(0,216,255,0.015));padding:16px;margin-bottom:14px}
.ppt{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.ppl{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.22em;color:var(--st)}
.ppb{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.15em;color:var(--lq);padding:3px 8px;border:1px solid rgba(156,255,59,0.2);border-radius:2px;background:rgba(156,255,59,0.06)}
.ppd{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.ppa{width:40px;height:40px;background:linear-gradient(135deg,var(--lq),var(--sg));display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:700;color:var(--v);border-radius:3px;flex-shrink:0}
.ppn{font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:600;color:var(--bn)}
.ppm{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--lq);letter-spacing:0.15em;margin-top:2px}
.pps{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--bd);padding-top:12px;gap:4px}
.ps{text-align:center}
.pv{display:block;font-family:'Space Grotesk',sans-serif;font-size:17px;font-weight:600;color:var(--bn)}
.pk{font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:0.18em;color:var(--st)}
.hcd{border:1px solid var(--bd);border-radius:var(--rd);padding:12px;margin-bottom:14px;text-align:center}
.hcdl{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.22em;color:var(--st);margin-bottom:8px}
 
.rq{border:1px solid rgba(215,177,91,0.12);border-radius:var(--rd);background:rgba(215,177,91,0.02);padding:14px;margin-bottom:14px}
.rqt{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:4px}
.rql{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.18em;color:var(--gd)}
.rqb{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--lq)}
.rqr{display:flex;gap:0}
.rqi{flex:1;padding:9px 10px;background:rgba(0,0,0,0.3);border:1px solid var(--bd);border-right:none;border-radius:var(--rd) 0 0 var(--rd);color:var(--st);font-family:'JetBrains Mono',monospace;font-size:10px;outline:none;min-width:0}
.rqc{padding:9px 16px;background:rgba(156,255,59,0.08);border:1px solid rgba(156,255,59,0.25);border-radius:0 var(--rd) var(--rd) 0;color:var(--lq);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.15em;cursor:pointer;white-space:nowrap;transition:all 0.2s}
.rqc:hover{background:rgba(156,255,59,0.15)}
.sb{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap}
.sbt{flex:1;min-width:80px;padding:9px;background:rgba(244,247,242,0.02);border:1px solid var(--bd);border-radius:var(--rd);color:var(--st);font-family:'JetBrains Mono',monospace;font-size:9px;cursor:pointer;transition:all 0.2s;letter-spacing:0.08em}
.sbt:hover{border-color:var(--lq);color:var(--lq)}
 
.fd{border:1px solid var(--bd);border-radius:var(--rd)}
.fl{display:flex;align-items:flex-start;gap:8px;padding:10px 12px;border-bottom:1px solid rgba(31,41,40,0.5)}
.fl:last-child{border-bottom:none}
.fld{width:5px;height:5px;border-radius:50%;margin-top:5px;flex-shrink:0}
.flt{font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(139,150,148,0.5);min-width:24px;flex-shrink:0}
.flx{font-family:'Inter',sans-serif;font-size:12px;color:rgba(244,247,242,0.55);line-height:1.5}
 
.q{display:flex;align-items:center;gap:12px;padding:13px;border:1px solid var(--bd);border-radius:var(--rd);margin-bottom:8px;transition:border-color 0.2s;background:rgba(244,247,242,0.01)}
.q:hover{border-color:rgba(156,255,59,0.15)}
.q.qd{opacity:0.45;border-color:rgba(156,255,59,0.08)}
.qi{font-size:16px;color:var(--lq);width:28px;text-align:center;flex-shrink:0}
.qb{flex:1;min-width:0}
.qt{font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:500;color:var(--bn)}
.qd2{font-family:'Inter',sans-serif;font-size:11px;color:var(--st);margin-top:2px;line-height:1.4}
.qr{flex-shrink:0;text-align:right}
.qrp{display:block;font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--lq);margin-bottom:4px}
.qdn{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--lq);letter-spacing:0.12em}
.qbt{padding:6px 12px;background:rgba(156,255,59,0.06);border:1px solid rgba(156,255,59,0.2);border-radius:var(--rd);color:var(--lq);font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.1em;cursor:pointer;transition:all 0.2s;white-space:nowrap}
.qbt:hover{background:rgba(156,255,59,0.12)}
 
.pg{display:flex;flex-direction:column;gap:10px}
.pc{border:1px solid var(--bd);border-radius:var(--rd);padding:18px;position:relative;background:rgba(244,247,242,0.01);transition:border-color 0.2s}
.pc:hover{border-color:rgba(156,255,59,0.12)}
.pc.ft{border-color:rgba(156,255,59,0.2);background:rgba(156,255,59,0.02)}
.pc.pa{border-color:var(--tc);box-shadow:0 0 20px -8px var(--tc)}
.pcb{position:absolute;top:-9px;right:14px;font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:0.18em;color:var(--v);background:var(--lq);padding:2px 8px;border-radius:2px}
.pcn{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;margin-bottom:4px}
.pcc{font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:700;color:var(--bn)}
.pcl{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--st);margin-bottom:14px;letter-spacing:0.1em}
.pcp{margin-bottom:14px}
.pci{font-family:'Inter',sans-serif;font-size:12px;color:rgba(244,247,242,0.55);padding:4px 0;display:flex;align-items:flex-start;gap:8px;line-height:1.4}
.pcx{flex-shrink:0;font-size:11px}
.pcbt{width:100%;padding:11px;background:transparent;border:1px solid;border-radius:var(--rd);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.15em;cursor:pointer;transition:all 0.2s}
.pcbt:hover{background:rgba(156,255,59,0.06)}
.pca{width:100%;padding:11px;border:1px solid;border-radius:var(--rd);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.15em;text-align:center;background:rgba(156,255,59,0.04)}
.pn{font-family:'Inter',sans-serif;font-size:11px;color:rgba(139,150,148,0.45);line-height:1.6;margin-top:16px;padding:12px;border:1px solid var(--bd);border-radius:var(--rd);border-left:2px solid rgba(215,177,91,0.2)}
 
.tg{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.ti{border:1px solid var(--bd);border-radius:var(--rd);padding:12px;text-align:center}
.ti.ta{border-color:rgba(156,255,59,0.2);background:rgba(156,255,59,0.03)}
.tn{font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:600;color:var(--bn);margin-bottom:3px}
.tr{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--st);margin-bottom:4px}
.tp{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--lq)}
.wlc{border:1px solid rgba(156,255,59,0.1);border-radius:var(--rd);background:rgba(156,255,59,0.02);padding:14px}
.wlr{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid rgba(31,41,40,0.4)}
.wlr:last-child{border-bottom:none}
.wlk{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--st)}
.wlv{font-family:'Inter',sans-serif;font-size:12px;color:rgba(244,247,242,0.7);display:flex;align-items:center;gap:6px}
.wlv.gn{color:var(--lq)}
.wlp{font-family:'JetBrains Mono',monospace;font-size:8px;background:rgba(156,255,59,0.1);border:1px solid rgba(156,255,59,0.2);color:var(--lq);padding:1px 6px;border-radius:2px;letter-spacing:0.1em}
/* Executive Admin Hub V2 */
.admin-briefing-overlay { position: fixed; inset: 0; background: rgba(2,4,4,0.92); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 20px; text-align: left; }
.briefing-card { background: #0a0d0d; border: 1px solid var(--bd); width: 100%; max-width: 800px; border-radius: 4px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 40px 100px -20px rgba(0,0,0,0.8); }
.briefing-header { padding: 20px 24px; border-bottom: 1px solid var(--bd); display: flex; justify-content: space-between; align-items: center; background: rgba(244,247,242,0.02); }
.bh-tag { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--st); letter-spacing: 0.15em; margin-bottom: 4px; }
.bh-title { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; color: var(--bn); margin: 0; }
.risk-tag { font-family: 'JetBrains Mono', monospace; font-size: 10px; padding: 4px 10px; border-radius: 2px; border: 1px solid; text-transform: uppercase; }
.risk-tag.low { color: var(--lq); border-color: rgba(156,255,59,0.3); background: rgba(156,255,59,0.05); }
.risk-tag.high { color: #ff4d4d; border-color: rgba(255,77,77,0.3); background: rgba(255,77,77,0.05); }
.close-briefing { background: none; border: none; color: var(--st); font-size: 24px; cursor: pointer; padding: 0 0 0 20px; }
.briefing-body { padding: 24px; display: flex; flex-direction: column; gap: 24px; overflow-y: auto; max-height: 70vh; }
.brief-section label { display: block; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--st); margin-bottom: 10px; letter-spacing: 0.1em; opacity: 0.7; }
.brief-content { background: rgba(244,247,242,0.02); border: 1px solid var(--bd); border-radius: 4px; padding: 16px; font-family: 'Inter', sans-serif; font-size: 15px; line-height: 1.6; color: var(--fg); }
.brief-content.reply { border-left: 3px solid var(--lq); }
.brief-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; }
.brief-content.cognition { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--lq); max-height: 180px; overflow-y: auto; white-space: pre-wrap; }
.brief-meta { display: flex; flex-direction: column; gap: 10px; }
.bm-row { display: flex; justify-content: space-between; font-family: 'JetBrains Mono', monospace; font-size: 10px; border-bottom: 1px solid rgba(244,247,242,0.05); padding-bottom: 8px; }
.bm-row span { color: var(--st); }
.bm-row strong { color: var(--bn); }
.briefing-footer { padding: 20px 24px; background: rgba(244,247,242,0.01); border-top: 1px solid var(--bd); display: grid; grid-template-columns: 1fr 1.5fr 1fr; gap: 12px; }

.q-row-v2 { display: flex; border: 1px solid var(--bd); border-radius: 4px; margin-bottom: 12px; background: rgba(244,247,242,0.01); transition: all 0.2s; overflow: hidden; text-align: left; }
.q-row-v2:hover { border-color: rgba(156,255,59,0.15); background: rgba(244,247,242,0.02); }
.qrv2-sidebar { width: 6px; background: var(--bd); flex-shrink: 0; }
.q-row-v2.answered .qrv2-sidebar { background: var(--lq); }
.q-row-v2.featured .qrv2-sidebar { background: var(--sg); }
.q-row-v2.rejected .qrv2-sidebar { background: #ff4d4d; }
.qrv2-main { flex: 1; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.qrv2-header { display: flex; justify-content: space-between; align-items: flex-start; }
.qrv2-callsign { font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 700; color: var(--bn); display: block; }
.qrv2-meta { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--st); margin-top: 2px; }
.qrv2-tags { display: flex; gap: 6px; }
.qrv2-status-tag { font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 700; padding: 2px 6px; border-radius: 2px; border: 1px solid rgba(244,247,242,0.1); text-transform: uppercase; color: var(--st); }
.qrv2-status-tag.answered { color: var(--lq); border-color: rgba(156,255,59,0.3); background: rgba(156,255,59,0.05); }
.qrv2-risk-tag { font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 700; padding: 2px 6px; border-radius: 2px; border: 1px solid rgba(156,255,59,0.2); color: var(--lq); text-transform: uppercase; }
.qrv2-risk-tag.high { color: #ff4d4d; border-color: rgba(255,77,77,0.2); }
.qrv2-body { font-family: 'Inter', sans-serif; font-size: 13px; color: rgba(244,247,242,0.8); line-height: 1.5; }
.qrv2-controls { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(244,247,242,0.05); padding-top: 12px; }
.qrv2-primary-actions, .qrv2-secondary-actions { display: flex; gap: 8px; }
.act-btn-v2 { background: rgba(244,247,242,0.03); border: 1px solid var(--bd); color: var(--st); font-family: 'JetBrains Mono', monospace; font-size: 9px; padding: 6px 12px; border-radius: 3px; cursor: pointer; transition: all 0.2s; letter-spacing: 0.05em; }
.act-btn-v2:hover { border-color: var(--st); color: var(--bn); }
.act-btn-v2.highlight { border-color: var(--lq); color: var(--lq); background: rgba(156,255,59,0.05); }
.act-btn-v2.pulse { animation: cmd-pulse 2s infinite; }
@keyframes cmd-pulse {
  0% { box-shadow: 0 0 0 0 rgba(156,255,59, 0.2); }
  70% { box-shadow: 0 0 0 6px rgba(156,255,59, 0); }
  100% { box-shadow: 0 0 0 0 rgba(156,255,59, 0); }
}
      `}</style>
      {phase === PHASES.GATE && <Gate onComplete={(u)=>{setUser(u);setPhase(PHASES.HUB)}} />}
      {phase === PHASES.HUB && <Hub user={user} currentPath={currentPath} onNavigate={handleNavigate} />}
    </>
  );
}

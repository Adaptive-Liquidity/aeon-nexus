import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import HCaptcha from "@hcaptcha/react-hcaptcha";
import Particles from '../components/Particles';
import { supabase } from '../lib/supabase';
import { genRef } from '../lib/storage';

export default function Gate({ onComplete }) {
  const captchaRef = useRef(null);
  const navigate = useNavigate();
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
    } catch (err) {
      setTimeout(() => onCaptchaVerify("bypass-token-dev"), 600);
    }
  };

  const onCaptchaVerify = async (token) => {
    try {
      let result;
      if (isLogin) {
        result = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (result.error) throw result.error;
      } else {
        result = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            captchaToken: token !== "bypass-token-dev" ? token : undefined,
            data: { callsign: form.name, ref_code: genRef(form.name) }
          }
        });
        if (result.error) throw result.error;
        
        // Ensure profile is created
        if (result.data?.user) {
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: result.data.user.id,
            callsign: form.name,
            reputation: 50,
            access_tier: 'INITIATE',
            is_admin: false
          });
          if (profileError) console.error("Profile creation error:", profileError);
        }
      }

      setLoading(false);
      setStep(1);
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', result.data.user.id).single();
      
      const user = { 
        name: profile?.callsign || form.name || form.email.split("@")[0],
        email: form.email,
        ref: genRef(form.name || "USER"), 
        joined: Date.now(), 
        rep: profile?.reputation || (isLogin ? 100 : 50), 
        tasks: {}, 
        pledge: null, 
        badge: "GENESIS",
        id: result?.data?.user?.id || `usr-${Date.now()}`,
        role: profile?.access_tier || 'INITIATE'
      };
      
      setTimeout(() => {
        onComplete(user);
        navigate('/hub');
      }, 2400);

    } catch (error) {
      setLoading(false);
      setErr({ auth: error.message });
    }
  };
 
  return (
    <div className="g">
      <Particles count={60} color="rgba(156,255,59,0.15)" />
      <div className="gi">
        <div className="lr"><div className="ld" /></div>
        <div className="gl">ADAPTIVE LIQUIDITY LABS</div>
        <h1 className="gt">AEON ACTIV8</h1>
        
        {step === 0 && (
          <div className="fb">
            <h2 style={{color:"var(--bn)",fontFamily:"'Space Grotesk'",fontSize:24,fontWeight:600,marginBottom:8}}>{isLogin ? "Welcome back" : "Create account"}</h2>
            <p className="gs">{isLogin ? "Log in to access your ACTIV8 account." : "Join the AEON ACTIV8 network."}</p>

            {err.auth && <div className="dis" style={{color: '#ff4d4d', marginBottom: '16px'}}>{err.auth}</div>}

            {!isLogin && (
              <div className="fi">
                <label>CALLSIGN</label>
                <div className="fi-w">
                  <span className="fi-i">👤</span>
                  <input placeholder="Choose your username" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className={err.name?"ie":""} style={err.name ? {borderColor: '#ff4d4d'} : {}} />
                </div>
              </div>
            )}

            <div className="fi">
              <label>EMAIL</label>
              <div className="fi-w">
                <span className="fi-i">✉</span>
                <input type="email" placeholder="name@domain.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className={err.email?"ie":""} style={err.email ? {borderColor: '#ff4d4d'} : {}} />
              </div>
            </div>

            <div className="fi">
              <label>PASSWORD</label>
              <div className="fi-w">
                <span className="fi-i">🔒</span>
                <input type={showPass ? "text" : "password"} placeholder={isLogin ? "Enter your password" : "Create a password"} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className={err.password?"ie":""} style={err.password ? {borderColor: '#ff4d4d'} : {}} />
                <span className="fi-t" onClick={()=>setShowPass(!showPass)} style={{cursor: 'pointer'}}>{showPass ? "👁" : "🙈"}</span>
              </div>
              {isLogin && <div style={{textAlign:"right",marginTop:8}}><span className="tog-b" style={{fontSize:12, cursor: 'pointer', color: 'var(--lq)'}}>Forgot password?</span></div>}
            </div>

            {!isLogin && (
              <div className="fi">
                <label>CONFIRM PASSWORD</label>
                <div className="fi-w">
                  <span className="fi-i">🔒</span>
                  <input type={showPass ? "text" : "password"} placeholder="Confirm your password" value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} className={err.confirm?"ie":""} style={err.confirm ? {borderColor: '#ff4d4d'} : {}} />
                </div>
              </div>
            )}

            <button className="bp" onClick={submit} disabled={loading} style={{marginTop: '24px'}}>
              <span>{loading ? "VERIFYING..." : (isLogin ? "Log in" : "Create account")}</span>
            </button>

            <div className="div" style={{display: 'flex', alignItems: 'center', margin: '24px 0', opacity: 0.5}}>
              <div className="div-l" style={{flex: 1, height: '1px', background: 'rgba(255,255,255,0.2)'}} />
              <div className="div-t" style={{margin: '0 12px', fontSize: '12px'}}>OR</div>
              <div className="div-l" style={{flex: 1, height: '1px', background: 'rgba(255,255,255,0.2)'}} />
            </div>

            <div className="soc-g" style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <button className="sb-b" style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}><span style={{fontSize:18}}>💬</span> Continue with Discord</button>
              <button className="sb-b" style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}><span style={{fontSize:18}}>G</span> Continue with Google</button>
            </div>

            <div className="tog" style={{marginTop: '32px', fontSize: '14px', opacity: 0.8}}>
              {isLogin ? "New to Aeon Activ8? " : "Already have an account? "}
              <span className="tog-b" onClick={()=>{setIsLogin(!isLogin); setErr({});}} style={{color: 'var(--lq)', cursor: 'pointer', fontWeight: 600}}>{isLogin ? "Create an account" : "Log in"}</span>
            </div>

            <HCaptcha
              ref={captchaRef}
              sitekey="10000000-ffff-ffff-ffff-000000000001"
              size="invisible"
              onVerify={onCaptchaVerify}
              onError={() => setLoading(false)}
              theme="dark"
            />

            <p className="dis" style={{marginTop: '24px', fontSize: '12px', opacity: 0.5}}>By continuing, you agree to our <span style={{color:"var(--lq)"}}>Terms of Service</span> and <span style={{color:"var(--lq)"}}>Privacy Policy</span>.</p>
          </div>
        )}
        {step === 1 && (
          <div className="tm" style={{textAlign: 'left', background: 'rgba(0,0,0,0.5)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(140,255,63,0.2)'}}>
            {lines.map((l,i)=><div key={i} className="tl" style={{animationDelay:`${i*0.05}s`, color: '#8CFF3F', fontFamily: 'monospace', margin: '8px 0'}}><span className="tc2" style={{marginRight: '8px', opacity: 0.5}}>{'>'}</span>{l}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}
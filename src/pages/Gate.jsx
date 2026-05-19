import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { genRef } from '../lib/storage';
import { LAUNCH_DATE } from '../lib/constants';
import Particles from '../components/Particles';
import useCountdown from '../hooks/useCountdown';
import { supabase } from '../lib/supabase';

export default function Gate({ onComplete }) {
  const captchaRef = useRef(null);
  const _countdown = useCountdown(LAUNCH_DATE);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [invite, setInvite] = useState("");
  const [step, setStep] = useState(0);
  const [err, setErr] = useState("");
  const [diag, setDiag] = useState([]);
  const [isBot, setIsBot] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const navigate = useNavigate();

  const handleVerify = (token) => { setCaptchaToken(token); setErr(""); };
  const handleExpire = () => { setCaptchaToken(null); setErr("Verification expired. Try again."); };
  
  const dLog = (msg, delay) => new Promise(r => setTimeout(() => { setDiag(p => [...p, msg]); r(); }, delay));
  
  const auth = async () => {
    if (!email || !email.includes("@")) return setErr("INVALID_EMAIL_FORMAT");
    
    try {
      if (step === 0) {
        if (!captchaToken) return setErr("VERIFICATION_REQUIRED");
        setErr(""); setDiag([]); setStep(1);
        await dLog("> INITIATING PROTOCOL...", 300);
        await dLog(`> IDENTIFIER: ${email}`, 400);
        await dLog("> CONTACTING SUPABASE AUTH NODE...", 600);
        
        // 1. Send OTP Email
        const { error: signInError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            captchaToken,
          }
        });
        
        if (signInError) throw signInError;

        await dLog("> HANDSHAKE PING TRANSMITTED.", 400);
        await dLog("> AWAITING SECURE RETURN TOKEN...", 500);
        setStep(2); // Go to OTP verification step
        
      } else if (step === 2) {
        if (!invite || invite.length !== 6) return setErr("INVALID_TOKEN_FORMAT");
        setErr("");
        
        // 2. Verify OTP
        const { data: { session }, error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token: invite,
          type: 'email'
        });
        
        if (verifyError) throw verifyError;
        if (!session) throw new Error("NO_SESSION_RETURNED");

        setSessionData(session);
        
        // 3. Check if profile exists
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        
        if (profile) {
          // User exists, login complete
          const nu = {
            ...profile,
            email: session.user.email,
            name: profile.callsign,
            verified: true,
            tasks: {} // Ensure tasks object exists
          };
          onComplete(nu);
          navigate('/hub');
        } else {
          // New user, need callsign
          setStep(3); 
        }
        
      } else if (step === 3) {
        if (!name) return setErr("CALLSIGN_REQUIRED");
        setErr("");
        
        // 4. Create Profile
        const { error: profileError } = await supabase.from('profiles').insert({
          id: sessionData.user.id,
          callsign: name,
          reputation: 10,
          access_tier: 'INITIATE',
          is_admin: false
        });
        
        if (profileError) throw profileError;
        
        const nu = {
          id: sessionData.user.id,
          email,
          name,
          verified: true,
          rep: 10,
          tasks: {},
          role: "INITIATE"
        };
        onComplete(nu);
        navigate('/hub');
      }
    } catch (e) {
      console.error(e);
      // Fallback for demo logic if rate limited or failing locally
      if (e.status === 429 && step === 2 && invite === "000000") {
          // Fallback bypass logic for demo
          const nu = { email, name: name || "DEMO-USER", verified: true, rep: 10, tasks: {} };
          onComplete(nu);
          navigate('/hub');
      } else {
        setErr(e.message || "AUTHENTICATION_FAILURE");
      }
    }
  };

  if (isBot) return <div className="g"><div className="gt" style={{color: '#ff4d4d'}}>FATAL_ERROR: AUTOMATED_REQUEST_DENIED</div></div>;

  return (
    <div className="g">
      <Particles count={60} color="rgba(156,255,59,0.15)" />
      <div className="gi">
        <div className="gl">A E O N : N E X U S</div>
        <div className="gt">ACTIV8<br/><span className="gh" style={{fontSize: '24px', opacity: 0.8}}>TERMINAL v1.0.0</span></div>
        
        {step === 0 && (
          <div>
            <div className="fi">
              <div className="fi-w" style={{paddingLeft: 0}}>
                <input type="email" placeholder="ENTER_EMAIL_IDENTIFIER" style={{paddingLeft: '18px'}} value={email} onChange={(e)=>setEmail(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&auth()} />
              </div>
            </div>
            <div style={{margin:"20px 0", display:"flex", justifyContent:"center"}}>
              <HCaptcha sitekey="10000000-ffff-ffff-ffff-000000000001" onVerify={handleVerify} onExpire={handleExpire} theme="dark" ref={captchaRef} />
            </div>
            {err && <div className="dis" style={{color: '#ff4d4d'}}>{err}</div>}
            <button className="bp" onClick={auth}>INITIALIZE_HANDSHAKE</button>
          </div>
        )}

        {step === 1 && <div className="tm">{diag.map((l,i) => <div className="tl" key={i}>{l}</div>)}</div>}

        {step === 2 && (
          <div>
            <div className="tm" style={{marginBottom: '20px'}}>{diag.map((l,i) => <div className="tl" key={i}>{l}</div>)}</div>
            <div className="fi">
              <div className="fi-w" style={{paddingLeft: 0}}>
                <input type="text" placeholder="ENTER_6_DIGIT_CODE" style={{paddingLeft: '18px'}} value={invite} onChange={(e)=>setInvite(e.target.value)} maxLength={6} onKeyDown={(e)=>e.key==='Enter'&&auth()} />
              </div>
            </div>
            <div className="dis">Check your inbox for the Secure Token.</div>
            {err && <div className="dis" style={{color: '#ff4d4d'}}>{err}</div>}
            <button className="bp" onClick={auth}>VERIFY_CONNECTION</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="tm" style={{marginBottom: '20px'}}>{diag.map((l,i) => <div className="tl" key={i}>{l}</div>)}</div>
            <div className="fi">
              <div className="fi-w" style={{paddingLeft: 0}}>
                <input type="text" placeholder="ENTER_CALLSIGN" style={{paddingLeft: '18px'}} value={name} onChange={(e)=>setName(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&auth()} />
              </div>
            </div>
            {err && <div className="dis" style={{color: '#ff4d4d'}}>{err}</div>}
            <button className="bp" onClick={auth}>REGISTER_IDENTITY</button>
          </div>
        )}
      </div>
    </div>
  );
}
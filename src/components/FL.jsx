import React, { useState } from 'react';
import useCountdown from '../hooks/useCountdown';
import { LAUNCH_DATE, SOCIALS, tasks, pledgeTiers } from '../lib/constants';
import { Icon } from './Icons';

export default function FL({c,t,x}){ return <div className="fl"><span className="fld" style={{background:c}} /><span className="flt">{t}</span><span className="flx">{x}</span></div>; }
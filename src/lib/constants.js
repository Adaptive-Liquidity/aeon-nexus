export const LAUNCH_DATE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
export const PHASES = { GATE: 0, HUB: 1 };
export const SOCIALS = { x: "https://x.com/all4aeon", tg: "https://t.me/all4aeon", discord: "https://discord.gg/aeon-activ8" };

export const tasks = [
  { id:"follow_x", label:"Follow @all4aeon on X", desc:"Stay connected to the signal.", link:SOCIALS.x, rep:15, icon:"𝕏" },
  { id:"follow_tg", label:"Join the Telegram", desc:"Enter the coordination channel.", link:SOCIALS.tg, rep:15, icon:"✈" },
  { id:"follow_dc", label:"Join the Discord", desc:"Access the builder network.", link:SOCIALS.discord, rep:15, icon:"◆" },
  { id:"post_tag", label:"Post & tag @all4aeon", desc:"Create a post about AEON. Tag @all4aeon + a target company.", link:null, rep:50, icon:"◇" },
  { id:"share_ref", label:"Share your referral link", desc:"Post your referral link on any platform.", link:null, rep:25, icon:"⬡" },
];

export const pledgeTiers = [
  { id:"signal", name:"SIGNAL", cost:"$10", lock:"30 days", perks:["Early access to utilities before public launch","Priority whitelist for official token","Signal-tier badge"], color:"#00d8ff" },
  { id:"architect", name:"ARCHITECT", cost:"$20", lock:"30 days", perks:["Everything in Signal tier","Exclusive access to MVPs right now","Architect-tier badge"], color:"#9cff3b", featured:true },
  { id:"founder", name:"FOUNDER", cost:"$50", lock:"60 days", perks:["Lifetime utility access","Guaranteed token allocation","Name on Genesis Wall"], color:"#d7b15b" },
];

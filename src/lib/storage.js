// Safe localStorage wrapper with try/catch, max limits, and clear capabilities
export const storageController = {
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

export const initStorageDefaults = () => {
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
};

export const store = {
  async get(k) { return storageController.safeGet(k === "nexus-user" ? "activ8-user" : k); },
  async set(k, v) { storageController.safeSet(k === "nexus-user" ? "activ8-user" : k, v); },
};

export const genRef = (n) => `ACTIV8-${Math.abs(n.split("").reduce((a,c)=>((a<<5)-a+c.charCodeAt(0))|0,0)).toString(36).toUpperCase().padStart(6,"0").slice(0,6)}`;

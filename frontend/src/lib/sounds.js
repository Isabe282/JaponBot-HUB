/* Japanese-inspired synthesized sound effects using Web Audio API.
   No external files needed. AudioContext is created lazily on first user
   interaction to comply with browser autoplay policies. */

let ctx = null;
let masterGain = null;
let muted = (typeof window !== "undefined") && localStorage.getItem("sfx_muted") === "1";

const getCtx = () => {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.35;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
};

export const setMuted = (v) => {
  muted = !!v;
  try { localStorage.setItem("sfx_muted", muted ? "1" : "0"); } catch (e) {}
};
export const isMuted = () => muted;

const env = (param, t0, peak, attack, decay) => {
  param.setValueAtTime(0, t0);
  param.linearRampToValueAtTime(peak, t0 + attack);
  param.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
};

/* 1. Soft "wood tock" click — short percussive Japanese woodblock vibe. */
export const playClick = () => {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  const t0 = ac.currentTime;

  const osc = ac.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(820, t0);
  osc.frequency.exponentialRampToValueAtTime(380, t0 + 0.06);

  const g = ac.createGain();
  env(g.gain, t0, 0.18, 0.002, 0.08);

  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 2400;

  osc.connect(filter).connect(g).connect(masterGain);
  osc.start(t0);
  osc.stop(t0 + 0.12);
};

/* 2. Koto pluck — page transition. Short string-like decay. */
export const playPage = () => {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  const t0 = ac.currentTime;

  // Pentatonic note (around A4)
  const fundamentals = [440, 660]; // root + perfect 5th
  fundamentals.forEach((f, i) => {
    const osc = ac.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(f, t0);
    osc.frequency.exponentialRampToValueAtTime(f * 0.985, t0 + 0.5);

    const g = ac.createGain();
    env(g.gain, t0 + i * 0.02, 0.16 - i * 0.04, 0.005, 0.45);

    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(3500, t0);
    filter.frequency.exponentialRampToValueAtTime(900, t0 + 0.5);

    osc.connect(filter).connect(g).connect(masterGain);
    osc.start(t0 + i * 0.02);
    osc.stop(t0 + 0.6);
  });
};

/* 3. Suzu bell — success / save notification. Inharmonic bell with shimmer. */
export const playSuccess = () => {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  const t0 = ac.currentTime;

  // Bell partials (inharmonic ratios typical of metal bells)
  const partials = [
    { f: 880, gain: 0.18, decay: 1.2 },
    { f: 1320, gain: 0.12, decay: 0.9 },
    { f: 1760, gain: 0.08, decay: 0.6 },
    { f: 2640, gain: 0.05, decay: 0.45 },
  ];

  partials.forEach((p) => {
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(p.f, t0);

    const g = ac.createGain();
    env(g.gain, t0, p.gain, 0.004, p.decay);

    osc.connect(g).connect(masterGain);
    osc.start(t0);
    osc.stop(t0 + p.decay + 0.1);
  });

  // A second softer chime 120ms later (shimmer)
  const t1 = t0 + 0.12;
  const osc2 = ac.createOscillator();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(1318.5, t1); // E6
  const g2 = ac.createGain();
  env(g2.gain, t1, 0.1, 0.005, 0.8);
  osc2.connect(g2).connect(masterGain);
  osc2.start(t1);
  osc2.stop(t1 + 0.95);
};

/* Convenience: toast + bell. */
import { toast } from "sonner";
export const successToast = (msg, opts) => {
  playSuccess();
  return toast.success(msg, opts);
};

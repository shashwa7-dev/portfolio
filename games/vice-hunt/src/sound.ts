export type Sound = { shot(): void; hit(): void; kill(): void; close(): void };

const SHOT_LEN = 0.12;
const THUMP_LEN = 0.15;
const SHOT_GAIN = 0.35;

const silent: Sound = { shot() {}, hit() {}, kill() {}, close() {} };

// Synthesised effects. Silent when muted or under automation, so test runs
// never make a sound. The AudioContext is created on the first effect.
export function createSound(muted: boolean): Sound {
  if (muted || typeof AudioContext === "undefined" || (typeof navigator !== "undefined" && navigator.webdriver)) {
    return silent;
  }
  let ctx: AudioContext | null = null;
  let noise: AudioBuffer | null = null;

  const audio = () => {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  };

  // Gain node that peaks at `peak` and decays exponentially over `len` seconds.
  const envelope = (c: AudioContext, t: number, peak: number, len: number) => {
    const g = c.createGain();
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + len);
    g.connect(c.destination);
    return g;
  };

  const tone = (c: AudioContext, t: number, freq: number, len: number, peak: number, type: OscillatorType) => {
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.connect(envelope(c, t, peak, len));
    o.start(t);
    o.stop(t + len);
  };

  return {
    shot() {
      const c = audio();
      const t = c.currentTime;
      if (!noise) {
        noise = c.createBuffer(1, Math.ceil(c.sampleRate * SHOT_LEN), c.sampleRate);
        const data = noise.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      }
      const src = c.createBufferSource();
      src.buffer = noise;
      const lp = c.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(4000, t);
      lp.frequency.exponentialRampToValueAtTime(600, t + SHOT_LEN);
      src.connect(lp).connect(envelope(c, t, SHOT_GAIN, SHOT_LEN));
      src.start(t);
      tone(c, t, 60, THUMP_LEN, SHOT_GAIN, "sine");
    },
    hit() {
      const c = audio();
      tone(c, c.currentTime, 900, 0.05, 0.12, "square");
    },
    kill() {
      const c = audio();
      const t = c.currentTime;
      tone(c, t, 700, 0.08, 0.15, "triangle");
      tone(c, t + 0.08, 440, 0.12, 0.15, "triangle");
    },
    close() {
      void ctx?.close();
      ctx = null;
    },
  };
}

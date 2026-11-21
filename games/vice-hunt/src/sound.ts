export type Effect = "shot" | "reload" | "empty" | "hit" | "kill";
export type SfxUrls = Partial<Record<Effect, string>>;
export type Sound = Record<Effect, () => void> & { close(): void };

const SHOT_LEN = 0.12;
const THUMP_LEN = 0.15;
// Noise and thump peak together, so each takes half of the shot's 0.35 peak.
const SHOT_GAIN = 0.35;
const SHOT_PART = SHOT_GAIN / 2;
// Recorded files play quietly, under the host's music.
const FILE_GAIN = 0.5;

const noop = () => {};
const silent: Sound = { shot: noop, reload: noop, empty: noop, hit: noop, kill: noop, close: noop };

// Effects play the recorded file given for them in `sfx` once it has loaded,
// and are synthesised with Web Audio until then (or when none is given, or it
// fails to load). Silent when muted or under automation, so test runs never
// make a sound: then nothing is fetched either.
export function createSound(muted: boolean, sfx: SfxUrls = {}): Sound {
  if (muted || typeof AudioContext === "undefined" || (typeof navigator !== "undefined" && navigator.webdriver)) {
    return silent;
  }
  let ctx: AudioContext | null = null;
  let noise: AudioBuffer | null = null;
  let closed = false;
  const files: Partial<Record<Effect, AudioBuffer>> = {};

  const audio = () => {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  };

  // The host starts the game from a click, so the context may start now.
  const entries = Object.entries(sfx).filter((e): e is [Effect, string] => !!e[1]);
  if (entries.length) {
    const c = audio();
    for (const [name, url] of entries) {
      fetch(url)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(`${r.status}`))))
        .then((data) => c.decodeAudioData(data))
        .then((buf) => {
          if (!closed) files[name] = buf;
        })
        .catch(() => {}); // keep the synthesised fallback
    }
  }

  const playFile = (name: Effect): boolean => {
    const buf = files[name];
    if (!buf) return false;
    const c = audio();
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain();
    g.gain.value = FILE_GAIN;
    src.connect(g).connect(c.destination);
    src.start();
    return true;
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

  const synth: Record<Effect, () => void> = {
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
      src.connect(lp).connect(envelope(c, t, SHOT_PART, SHOT_LEN));
      src.start(t);
      tone(c, t, 60, THUMP_LEN, SHOT_PART, "sine");
    },
    reload() {
      // A quick ratchet of clicks while the cylinder spins, then a latch.
      const c = audio();
      const t = c.currentTime;
      for (let i = 0; i < 6; i++) tone(c, t + i * 0.09, 1800, 0.02, 0.05, "square");
      tone(c, t + 0.85, 1200, 0.04, 0.1, "square");
    },
    empty() {
      const c = audio();
      tone(c, c.currentTime, 2400, 0.025, 0.08, "square");
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
  };

  const play = (name: Effect) => () => {
    if (closed) return;
    if (!playFile(name)) synth[name]();
  };

  return {
    shot: play("shot"),
    reload: play("reload"),
    empty: play("empty"),
    hit: play("hit"),
    kill: play("kill"),
    close() {
      closed = true;
      void ctx?.close();
      ctx = null;
    },
  };
}

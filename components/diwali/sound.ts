export type DiwaliSound = {
  unlock(): void;
  strike(): void;
  /** The fuse burning for `seconds`: a breathing hiss, a low rumble and crackles. */
  fuse(seconds: number): void;
  /** The fuse reaching the end: a soft low thump. */
  whoomp(): void;
  /** A short bright bell arpeggio (C6 E6 G6 C7), with the whoomp when the fuse ends. */
  chime(): void;
  whistle(pan: number): void;
  boom(size: number, pan: number, crackle: boolean): void;
  pop(): void;
  crunch(): void;
  close(): void;
};

type AudioCtor = typeof AudioContext;

/**
 * All sounds are synthesised with Web Audio: no files. Every method is a
 * no-op before unlock() or after close(), and a no-op if the browser's audio
 * throws: a sound can never stop the show.
 */
export function createDiwaliSound(): DiwaliSound {
  let ac: AudioContext | null = null;
  let master: GainNode | null = null;
  let noiseBuf: AudioBuffer | null = null;
  let closed = false;

  const ok = () => !closed && ac !== null && master !== null && noiseBuf !== null && ac.state !== "closed";

  function unlock() {
    if (closed) return;
    if (ac) {
      ac.resume().catch(() => {});
      return;
    }
    const Ctor: AudioCtor | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
    if (!Ctor) return;
    ac = new Ctor();
    master = ac.createGain();
    master.gain.value = 0.55;
    const comp = ac.createDynamicsCompressor();
    master.connect(comp);
    comp.connect(ac.destination);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 3, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }

  function noise(
    t: number,
    dur: number,
    filterType: BiquadFilterType,
    freq: number,
    q: number,
    peak: number,
    attack: number,
    pan: number,
    rate?: number,
  ): { f: BiquadFilterNode; g: GainNode } {
    const c = ac!;
    const src = c.createBufferSource();
    src.buffer = noiseBuf;
    src.playbackRate.value = rate ?? 0.8 + Math.random() * 0.4;
    const f = c.createBiquadFilter();
    f.type = filterType;
    f.frequency.value = freq;
    f.Q.value = q || 0.7;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f);
    f.connect(g);
    toMaster(g, pan);
    src.start(t, Math.random() * Math.max(0, 2.9 - dur));
    src.stop(t + dur + 0.05);
    return { f, g };
  }

  /** Connects `node` to the master through a stereo panner, or straight if the browser has none. */
  function toMaster(node: AudioNode, pan: number) {
    const c = ac!;
    if (typeof c.createStereoPanner !== "function") {
      node.connect(master!);
      return;
    }
    const p = c.createStereoPanner();
    p.pan.value = pan || 0;
    node.connect(p);
    p.connect(master!);
  }

  /** Runs a sound, swallowing anything the audio stack throws. */
  const safe =
    <A extends unknown[]>(play: (...args: A) => void) =>
    (...args: A) => {
      try {
        play(...args);
      } catch {
        // No sound this time; the show carries on.
      }
    };

  return {
    unlock: safe(unlock),
    strike: safe(() => {
      if (!ok()) return;
      const t = ac!.currentTime;
      noise(t, 0.12, "highpass", 2600, 1, 0.5, 0.004, 0.3, 1);
      noise(t + 0.04, 0.45, "bandpass", 1300, 0.8, 0.25, 0.02, 0.3, 1);
    }),
    // The sizzle: a bright hiss whose level breathes (a small random wobble
    // eight times a second) as its pitch sinks, a low rumble under it, and
    // about 28 random crackles a second.
    fuse: safe((dur: number) => {
      if (!ok()) return;
      const t = ac!.currentTime + 0.05;
      const h = noise(t, dur + 0.15, "bandpass", 4800, 1.2, 0.16, 0.08, 0.3, 1.1);
      h.f.frequency.setValueAtTime(5200, t);
      h.f.frequency.linearRampToValueAtTime(3600, t + dur);
      for (let k = 0; k < dur * 8; k++) {
        h.g.gain.setValueAtTime(0.12 + Math.random() * 0.08, t + k / 8);
      }
      h.g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.15);
      noise(t, dur + 0.1, "lowpass", 400, 0.7, 0.06, 0.1, 0.3);
      const n = Math.round(dur * 28);
      for (let i = 0; i < n; i++) {
        const ct = t + Math.random() * dur;
        noise(
          ct,
          0.012 + Math.random() * 0.02,
          "highpass",
          2500 + Math.random() * 4000,
          1,
          0.08 + Math.random() * 0.14,
          0.002,
          0.3,
        );
      }
    }),
    whoomp: safe(() => {
      if (!ok()) return;
      const c = ac!;
      const t = c.currentTime;
      noise(t, 0.5, "lowpass", 700, 0.7, 0.5, 0.01, 0);
      const o = c.createOscillator();
      o.frequency.setValueAtTime(110, t);
      o.frequency.exponentialRampToValueAtTime(45, t + 0.4);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.4, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      o.connect(g);
      g.connect(master!);
      o.start(t);
      o.stop(t + 0.6);
    }),
    chime: safe(() => {
      if (!ok()) return;
      const c = ac!;
      const t = c.currentTime;
      const notes = [1046.5, 1318.5, 1568, 2093]; // C6 E6 G6 C7
      notes.forEach((freq, i) => {
        const st = t + i * 0.09;
        // The note and a quieter inharmonic partial, as a bell has.
        [1, 2.76].forEach((m, j) => {
          const o = c.createOscillator();
          o.type = "sine";
          o.frequency.value = freq * m;
          const g = c.createGain();
          const peak = (j ? 0.04 : 0.16) * (1 - i * 0.12);
          g.gain.setValueAtTime(0.0001, st);
          g.gain.exponentialRampToValueAtTime(peak, st + 0.008);
          g.gain.exponentialRampToValueAtTime(0.0001, st + (j ? 0.5 : 1.4));
          o.connect(g);
          g.connect(master!);
          o.start(st);
          o.stop(st + 1.5);
        });
      });
      noise(t, 0.35, "highpass", 6000, 0.7, 0.08, 0.01, 0);
    }),
    whistle: safe((pan: number) => {
      if (!ok()) return;
      const c = ac!;
      const t = c.currentTime;
      const d = 0.9 + Math.random() * 0.5;
      const o = c.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(700 + Math.random() * 300, t);
      o.frequency.exponentialRampToValueAtTime(1800 + Math.random() * 900, t + d);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.05, t + 0.1);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g);
      toMaster(g, pan);
      o.start(t);
      o.stop(t + d + 0.05);
      noise(t, d, "highpass", 3000, 0.7, 0.04, 0.1, pan);
    }),
    pop: safe(() => {
      if (!ok()) return;
      const c = ac!;
      const t = c.currentTime;
      const o = c.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(520, t);
      o.frequency.exponentialRampToValueAtTime(1100, t + 0.12);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.25, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      o.connect(g);
      g.connect(master!);
      o.start(t);
      o.stop(t + 0.3);
    }),
    crunch: safe(() => {
      if (!ok()) return;
      const t = ac!.currentTime;
      for (let i = 0; i < 7; i++) {
        const ct = t + i * 0.022 + Math.random() * 0.015;
        noise(ct, 0.04 + Math.random() * 0.04, "bandpass", 1800 + Math.random() * 2500, 1.2, 0.35, 0.003, 0);
      }
      noise(t, 0.12, "lowpass", 500, 0.7, 0.3, 0.004, 0);
    }),
    boom: safe((size: number, pan: number, crackle: boolean) => {
      if (!ok()) return;
      const c = ac!;
      // smaller bursts read as further away: quieter, duller, a touch late
      const t = c.currentTime + (1 - size) * 0.25;
      noise(t, 0.6 + size * 2.2, "lowpass", 300 + size * 900, 0.7, 0.25 + size * 0.9, 0.008, pan);
      const o = c.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(90 + size * 30, t);
      o.frequency.exponentialRampToValueAtTime(35, t + 0.5 + size * 0.6);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.2 + size * 0.7, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6 + size * 0.8);
      o.connect(g);
      g.connect(master!);
      o.start(t);
      o.stop(t + 1.6);
      if (crackle) {
        const n = 20 + Math.round(size * 50);
        for (let i = 0; i < n; i++) {
          const ct = t + 0.35 + Math.random() * (0.6 + size * 1.2);
          noise(
            ct,
            0.03 + Math.random() * 0.03,
            "highpass",
            2500 + Math.random() * 3000,
            1,
            0.05 + size * 0.12,
            0.002,
            pan + (Math.random() - 0.5) * 0.4,
          );
        }
      }
    }),
    close: safe(() => {
      if (closed) return;
      closed = true;
      const c = ac;
      ac = null;
      master = null;
      noiseBuf = null;
      if (c && c.state !== "closed") c.close().catch(() => {});
    }),
  };
}

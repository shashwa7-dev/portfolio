export type DiwaliSound = {
  unlock(): void;
  strike(): void;
  fuse(seconds: number): void;
  whistle(pan: number): void;
  boom(size: number, pan: number, crackle: boolean): void;
  pop(): void;
  crunch(): void;
  close(): void;
};

type AudioCtor = typeof AudioContext;

/** All sounds are synthesised with Web Audio: no files. Every method is a no-op before unlock() or after close(). */
export function createDiwaliSound(): DiwaliSound {
  let ac: AudioContext | null = null;
  let master: GainNode | null = null;
  let noiseBuf: AudioBuffer | null = null;
  let closed = false;

  const ok = () => !closed && ac !== null && master !== null && noiseBuf !== null && ac.state !== "closed";

  function unlock() {
    if (closed) return;
    if (ac) {
      void ac.resume();
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
  ): BiquadFilterNode {
    const c = ac!;
    const src = c.createBufferSource();
    src.buffer = noiseBuf;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = c.createBiquadFilter();
    f.type = filterType;
    f.frequency.value = freq;
    f.Q.value = q || 0.7;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const p = c.createStereoPanner();
    p.pan.value = pan || 0;
    src.connect(f);
    f.connect(g);
    g.connect(p);
    p.connect(master!);
    src.start(t, Math.random() * Math.max(0, 2.9 - dur));
    src.stop(t + dur + 0.05);
    return f;
  }

  return {
    unlock,
    strike() {
      if (!ok()) return;
      const t = ac!.currentTime;
      noise(t, 0.12, "highpass", 2500, 1, 0.5, 0.005, 0.3);
      noise(t + 0.05, 0.5, "bandpass", 1200, 0.8, 0.25, 0.02, 0.3);
    },
    fuse(dur) {
      if (!ok()) return;
      const t = ac!.currentTime + 0.1;
      const f = noise(t, dur, "bandpass", 5000, 1.5, 0.18, 0.08, 0.3);
      f.frequency.setValueAtTime(5000, t);
      f.frequency.linearRampToValueAtTime(3000, t + dur);
    },
    whistle(pan) {
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
      const p = c.createStereoPanner();
      p.pan.value = pan;
      o.connect(g);
      g.connect(p);
      p.connect(master!);
      o.start(t);
      o.stop(t + d + 0.05);
      noise(t, d, "highpass", 3000, 0.7, 0.04, 0.1, pan);
    },
    pop() {
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
    },
    crunch() {
      if (!ok()) return;
      const t = ac!.currentTime;
      for (let i = 0; i < 7; i++) {
        const ct = t + i * 0.022 + Math.random() * 0.015;
        noise(ct, 0.04 + Math.random() * 0.04, "bandpass", 1800 + Math.random() * 2500, 1.2, 0.35, 0.003, 0);
      }
      noise(t, 0.12, "lowpass", 500, 0.7, 0.3, 0.004, 0);
    },
    boom(size, pan, crackle) {
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
    },
    close() {
      if (closed) return;
      closed = true;
      const c = ac;
      ac = null;
      master = null;
      noiseBuf = null;
      if (c && c.state !== "closed") void c.close();
    },
  };
}

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRadio, REFUSED_AFTER, type PlayerHandlers, type RadioPlayer } from "./radioEngine";

const IDS = Array.from({ length: 30 }, (_, i) => `id${i}`);

/** A fake player that records every call; the test fires its events. */
function fakePlayer() {
  const calls: string[] = [];
  const player: RadioPlayer = {
    play: () => calls.push("play"),
    pause: () => calls.push("pause"),
    setVolume: () => {},
    loadVideo: (id) => calls.push(`load:${id}`),
    cueVideo: (id) => calls.push(`cue:${id}`),
    videoData: () => null,
    mute: () => calls.push("mute"),
    unMute: () => calls.push("unMute"),
    destroy: () => calls.push("destroy"),
  };
  return { player, calls };
}

/** A radio over the fake, with the handlers it gave the "player". */
function setup() {
  const fake = fakePlayer();
  const opened: { handlers: PlayerHandlers; closed: boolean }[] = [];
  const radio = createRadio({
    ids: IDS,
    fadeMs: () => 100,
    silent: () => false,
    open(_first, handlers) {
      const entry = { handlers, closed: false };
      opened.push(entry);
      return { player: Promise.resolve(fake.player), close: () => (entry.closed = true) };
    },
  });
  const h = () => opened[opened.length - 1].handlers;
  return { radio, fake, opened, h };
}

/** Lets the player promise resolve. */
const settle = () => vi.advanceTimersByTimeAsync(0);

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("radio engine", () => {
  it("skips a track that errors, and stops after a whole lap (30) of errors", async () => {
    const { radio, fake, h } = setup();
    radio.start();
    await settle();
    h().onReady();
    for (let i = 0; i < 29; i++) h().onError(150);
    expect(radio.getState().index).toBe(29);
    expect(fake.calls.filter((c) => c.startsWith("load:"))).toHaveLength(29);
    expect(radio.getState().blocked).toBe(false);

    h().onError(150);
    expect(radio.getState().blocked).toBe(true);
    expect(radio.getState().index).toBe(29);
    // No further skipping once failed.
    h().onError(150);
    expect(fake.calls.filter((c) => c.startsWith("load:"))).toHaveLength(29);
  });

  it("does not arm the refusal clock for automatic changes (a track ending, a skip)", async () => {
    const { radio, fake, h } = setup();
    radio.start();
    await settle();
    h().onReady();
    h().onPlaying();
    h().onEnded();
    expect(fake.calls).toContain("load:id1");
    h().onError(150);
    expect(fake.calls).toContain("load:id2");
    await vi.advanceTimersByTimeAsync(REFUSED_AFTER + 100);
    expect(radio.getState().blocked).toBe(false);
  });

  it("does nothing when the track already playing is picked again", async () => {
    const { radio, fake, h } = setup();
    radio.start();
    await settle();
    h().onReady();
    h().onPlaying();
    const before = fake.calls.length;
    radio.select(0);
    expect(fake.calls.length).toBe(before);
    await vi.advanceTimersByTimeAsync(REFUSED_AFTER + 100);
    expect(radio.getState().blocked).toBe(false);
    expect(radio.getState().playing).toBe(true);
  });

  it("flags a refused play the visitor asked for", async () => {
    const { radio, h } = setup();
    radio.start();
    await settle();
    h().onReady();
    // No onPlaying: the browser refused.
    await vi.advanceTimersByTimeAsync(REFUSED_AFTER + 100);
    expect(radio.getState().blocked).toBe(true);
  });

  it("applies unmute on ready when not muted", async () => {
    const { radio, fake, h } = setup();
    radio.start();
    await settle();
    h().onReady();
    expect(fake.calls).toContain("unMute");
    expect(fake.calls).not.toContain("mute");
  });

  it("applies mute on ready when muted before the player was ready", async () => {
    const { radio, fake, h } = setup();
    radio.start();
    radio.toggleMute();
    await settle();
    h().onReady();
    expect(fake.calls).toContain("mute");
    expect(fake.calls).not.toContain("unMute");
  });

  it("keeps the mute through a full exit and re-entry", async () => {
    const { radio, fake, opened, h } = setup();
    radio.start();
    await settle();
    h().onReady();
    h().onPlaying();
    radio.toggleMute();
    radio.stop();
    await vi.advanceTimersByTimeAsync(500);
    expect(opened[0].closed).toBe(true);
    expect(fake.calls).toContain("destroy");

    radio.start();
    expect(opened).toHaveLength(2);
    expect(radio.getState().muted).toBe(true);
    expect(radio.getState().index).toBe(0);
    fake.calls.length = 0;
    await settle();
    h().onReady();
    expect(fake.calls).toContain("mute");
  });
});

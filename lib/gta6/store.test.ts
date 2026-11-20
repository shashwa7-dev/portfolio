import { describe, expect, it, vi } from "vitest";
import { createModStore, type ModRoot } from "./store";

function fakeRoot() {
  const attrs = new Map<string, string>();
  const root: ModRoot = {
    setAttribute: (n, v) => void attrs.set(n, v),
    removeAttribute: (n) => void attrs.delete(n),
  };
  return { root, attrs };
}

describe("createModStore", () => {
  it('set(true) sets data-mod="gta6" on the root and get() is true', () => {
    const { root, attrs } = fakeRoot();
    const store = createModStore(() => root);
    store.set(true);
    expect(attrs.get("data-mod")).toBe("gta6");
    expect(store.get()).toBe(true);
  });

  it("set(false) removes data-mod and get() is false", () => {
    const { root, attrs } = fakeRoot();
    const store = createModStore(() => root);
    store.set(true);
    store.set(false);
    expect(attrs.has("data-mod")).toBe(false);
    expect(store.get()).toBe(false);
  });

  it("listeners run once per change, never when the value is unchanged", () => {
    const { root } = fakeRoot();
    const store = createModStore(() => root);
    const listener = vi.fn();
    store.subscribe(listener);
    store.set(true);
    store.set(true);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("unsubscribe stops notifications", () => {
    const { root } = fakeRoot();
    const store = createModStore(() => root);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.set(true);
    expect(listener).not.toHaveBeenCalled();
  });

  it("a null root (server) still tracks the value", () => {
    const store = createModStore(() => null);
    store.set(true);
    expect(store.get()).toBe(true);
    store.set(false);
    expect(store.get()).toBe(false);
  });
});

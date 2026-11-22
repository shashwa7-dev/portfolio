export type ModRoot = {
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
};

export type ModStore = {
  get(): boolean;
  set(on: boolean): void;
  subscribe(listener: () => void): () => void;
};

/** Holds the GTA 6 mode on/off and mirrors it to `data-mod` on the root. */
export function createModStore(getRoot: () => ModRoot | null): ModStore {
  let on = false;
  const listeners = new Set<() => void>();

  return {
    get: () => on,
    set(next) {
      if (next === on) return;
      on = next;
      const root = getRoot();
      if (root) {
        if (on) root.setAttribute("data-mod", "gta6");
        else root.removeAttribute("data-mod");
      }
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export const gtaMode: ModStore = createModStore(() =>
  typeof document === "undefined" ? null : document.documentElement,
);

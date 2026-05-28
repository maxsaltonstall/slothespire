// Node v25 introduces a built-in globalThis.localStorage backed by
// node:internal/webstorage. When --localstorage-file is not supplied it
// exposes a broken stub (no .clear, no .setItem, etc.). Vitest's jsdom
// environment calls populateGlobal() which skips localStorage because the key
// already exists on globalThis. We fix this by extracting the real jsdom
// Storage instance from the dom object vitest attaches as global.jsdom and
// re-wiring the global accessor.
declare const jsdom: { window: Window & typeof globalThis } | undefined;

if (typeof jsdom !== "undefined" && jsdom.window) {
  const jsdomStorage = jsdom.window.localStorage;
  if (typeof jsdomStorage?.clear === "function") {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get: () => jsdomStorage,
    });
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      get: () => jsdom.window.sessionStorage,
    });
  }
}

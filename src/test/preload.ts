import { Window } from "happy-dom";

const window = new Window({ url: "http://localhost/" });
const document = window.document;

Object.defineProperty(globalThis, "window", { value: window, writable: true });
Object.defineProperty(globalThis, "document", { value: document, writable: true });
Object.defineProperty(globalThis, "navigator", {
  value: window.navigator,
  writable: true,
});
Object.defineProperty(globalThis, "HTMLElement", {
  value: window.HTMLElement,
  writable: true,
});
Object.defineProperty(globalThis, "HTMLDivElement", {
  value: window.HTMLDivElement,
  writable: true,
});
Object.defineProperty(globalThis, "DocumentFragment", {
  value: window.DocumentFragment,
  writable: true,
});
Object.defineProperty(globalThis, "Node", { value: window.Node, writable: true });
Object.defineProperty(globalThis, "MutationObserver", {
  value: window.MutationObserver,
  writable: true,
});
Object.defineProperty(globalThis, "getComputedStyle", {
  value: window.getComputedStyle.bind(window),
  writable: true,
});
Object.defineProperty(globalThis, "requestAnimationFrame", {
  value: (cb: FrameRequestCallback) => window.setTimeout(() => cb(Date.now()), 0),
  writable: true,
});
Object.defineProperty(globalThis, "cancelAnimationFrame", {
  value: (id: number) => {
    window.clearTimeout(id as unknown as ReturnType<typeof window.setTimeout>);
  },
  writable: true,
});

class MockIntersectionObserver {
  readonly callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  observe(target: Element) {
    this.callback(
      [
        {
          isIntersecting: true,
          target,
          intersectionRatio: 1,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          time: Date.now(),
        },
      ],
      this as unknown as IntersectionObserver,
    );
  }
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds = [];
}

Object.defineProperty(globalThis, "IntersectionObserver", {
  value: MockIntersectionObserver,
  writable: true,
});

Object.defineProperty(window, "matchMedia", {
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    },
  }),
  writable: true,
});

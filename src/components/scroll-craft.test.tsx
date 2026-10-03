import { afterEach, describe, expect, test } from "bun:test";
import { act, cleanup, render } from "@testing-library/react";
import { ScrollScrub } from "./ScrollScrub";
import { ScrollStack } from "./ScrollStack";
import { WritingSection } from "./WritingSection";

const items = [1, 2, 3].map((n) => ({ key: `k${n}`, node: <p>card {n}</p> }));

function setEnv(opts: { width: number; reduced?: boolean; coarse?: boolean }) {
  const w = window as unknown as Record<string, unknown>;
  w.innerWidth = opts.width;
  w.matchMedia = (q: string) => ({
    matches: q.includes("reduced-motion") ? !!opts.reduced : q.includes("pointer: coarse") ? !!opts.coarse : false,
    addEventListener() {},
    removeEventListener() {},
  });
  Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, value: 8 });
}

const original = {
  width: window.innerWidth,
  matchMedia: window.matchMedia,
  cores: Object.getOwnPropertyDescriptor(navigator, "hardwareConcurrency"),
};

afterEach(() => {
  cleanup();
  const w = window as unknown as Record<string, unknown>;
  w.innerWidth = original.width;
  w.matchMedia = original.matchMedia;
  if (original.cores) Object.defineProperty(navigator, "hardwareConcurrency", original.cores);
  else delete (navigator as unknown as Record<string, unknown>).hardwareConcurrency;
});

describe("scroll-craft gating", () => {
  test("narrow viewport keeps today's markup: plain list, no scrub, no sticky cards", () => {
    setEnv({ width: 390 });
    const { container } = render(
      <>
        <ScrollStack items={items} compactClassName="link-grid" />
        <ScrollScrub as="ul" className="link-grid"><li>a</li></ScrollScrub>
      </>,
    );
    expect(container.querySelector("ul.link-grid")?.children.length).toBe(3);
    expect(container.querySelector("[data-scroll-stack-card]")).toBeNull();
    expect(container.querySelector("[data-scrub]")).toBeNull();
  });

  test.each<[string, { width: number; reduced?: boolean; coarse?: boolean }]>([
    ["reduced motion", { width: 1600, reduced: true }],
    ["coarse pointer", { width: 1600, coarse: true }],
  ])("wide viewport with %s stays compact", (_n: string, env: { width: number; reduced?: boolean; coarse?: boolean }) => {
    setEnv(env);
    const { container } = render(<ScrollStack items={items} compactClassName="link-grid" />);
    expect(container.querySelector("ul.link-grid")).not.toBeNull();
    expect(container.querySelector("[data-scroll-stack-card]")).toBeNull();
  });

  test("wide, fine pointer, motion OK enables the stack and the scrub", async () => {
    setEnv({ width: 1600 });
    let view!: ReturnType<typeof render>;
    await act(async () => {
      view = render(
        <>
          <ScrollStack items={items} compactClassName="link-grid" />
          <ScrollScrub as="ol" className="timeline"><li>a</li></ScrollScrub>
        </>,
      );
    });
    const { container } = view;
    expect(container.querySelector('[data-variant="stack"]')).not.toBeNull();
    expect(container.querySelectorAll("[data-scroll-stack-card]").length).toBe(3);
    const ol = container.querySelector("ol.timeline") as HTMLElement;
    expect(ol.dataset.scrub).toBe("on");
    expect(ol.style.getPropertyValue("--rail")).not.toBe("");
  });

  test("Writing renders every link unchanged in the non-motion path", () => {
    setEnv({ width: 390 });
    const writing = [
      { id: "a", title: "Alpha", blurb: "first", href: "https://example.com/a" },
      { id: "b", title: "Beta", blurb: "second", href: "https://example.com/b" },
    ];
    const { container } = render(<WritingSection writing={writing} />);
    expect(container.querySelectorAll("ul.link-grid > li > a").length).toBe(2);
    expect(container.querySelector("[data-scrub]")).toBeNull();
  });
});

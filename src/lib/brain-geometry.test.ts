import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  loadBrainGeometry,
  parseBrainBin,
  readBrainBinHeader,
} from "./brain-geometry";

function buildTinyBrainBin(): ArrayBuffer {
  // 2 verts, 1 edge
  const buf = new ArrayBuffer(8 + 2 * 3 * 4 + 1 * 8);
  const view = new DataView(buf);
  view.setUint32(0, 2, true);
  view.setUint32(4, 1, true);
  // vert 0
  view.setFloat32(8, 0, true);
  view.setFloat32(12, 0, true);
  view.setFloat32(16, 0, true);
  // vert 1
  view.setFloat32(20, 1, true);
  view.setFloat32(24, 2, true);
  view.setFloat32(28, 3, true);
  // edge 0 -> 1
  view.setUint32(32, 0, true);
  view.setUint32(36, 1, true);
  return buf;
}

describe("brain-geometry", () => {
  test("reads header from real brain.bin", () => {
    const bytes = readFileSync(join(process.cwd(), "public/brain.bin"));
    const header = readBrainBinHeader(bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ));
    expect(header.vertCount).toBeGreaterThan(100);
    expect(header.edgeCount).toBeGreaterThan(100);
  });

  test("parses tiny brain buffer into line positions", () => {
    const geo = parseBrainBin(buildTinyBrainBin());
    const attr = geo.getAttribute("position");
    expect(attr.count).toBe(2);
    expect(attr.getX(0)).toBe(0);
    expect(attr.getX(1)).toBe(1);
    expect(attr.getY(1)).toBe(2);
    expect(attr.getZ(1)).toBe(3);
    geo.dispose();
  });

  test("rejects empty and truncated buffers", () => {
    const empty = new ArrayBuffer(8);
    expect(() => parseBrainBin(empty)).toThrow(/empty/i);
    expect(() => readBrainBinHeader(new ArrayBuffer(4))).toThrow(/header/i);
    const truncated = buildTinyBrainBin().slice(0, 20);
    expect(() => parseBrainBin(truncated)).toThrow(/truncated/i);
  });

  test("rejects out-of-range edges", () => {
    const buf = buildTinyBrainBin();
    const view = new DataView(buf);
    view.setUint32(32, 0, true);
    view.setUint32(36, 99, true);
    expect(() => parseBrainBin(buf)).toThrow(/out of range/i);
  });

  test("loadBrainGeometry uses fetchImpl and parses bytes", async () => {
    const bytes = buildTinyBrainBin();
    const fetchImpl: typeof fetch = async () =>
      new Response(bytes, { status: 200 });
    const geo = await loadBrainGeometry(fetchImpl);
    expect(geo.getAttribute("position").count).toBe(2);
    geo.dispose();
  });

  test("loadBrainGeometry throws on HTTP failure", async () => {
    const fetchImpl: typeof fetch = async () =>
      new Response(null, { status: 404 });
    await expect(loadBrainGeometry(fetchImpl)).rejects.toThrow(/404/);
  });
});

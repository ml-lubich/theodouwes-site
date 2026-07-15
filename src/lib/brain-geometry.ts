import * as THREE from "three";

export interface BrainBinHeader {
  readonly vertCount: number;
  readonly edgeCount: number;
}

/** Parse portfolio-format brain.bin bytes into a THREE line geometry. */
export function parseBrainBin(buf: ArrayBuffer): THREE.BufferGeometry {
  const view = new DataView(buf);
  const vertCount = view.getUint32(0, true);
  const edgeCount = view.getUint32(4, true);

  if (vertCount === 0 || edgeCount === 0) {
    throw new Error("brain.bin is empty");
  }

  const posOff = 8;
  const expectedBytes = posOff + vertCount * 3 * 4 + edgeCount * 8;
  if (buf.byteLength < expectedBytes) {
    throw new Error(
      `brain.bin truncated: need ${expectedBytes} bytes, got ${buf.byteLength}`,
    );
  }

  const positions = new Float32Array(buf, posOff, vertCount * 3);
  const edgeOff = posOff + vertCount * 3 * 4;
  const linePositions = new Float32Array(edgeCount * 2 * 3);

  for (let i = 0; i < edgeCount; i++) {
    const a = view.getUint32(edgeOff + i * 8, true);
    const b = view.getUint32(edgeOff + i * 8 + 4, true);
    if (a >= vertCount || b >= vertCount) {
      throw new Error(`brain.bin edge out of range at ${i}: ${a}->${b}`);
    }
    linePositions[i * 6] = positions[a * 3];
    linePositions[i * 6 + 1] = positions[a * 3 + 1];
    linePositions[i * 6 + 2] = positions[a * 3 + 2];
    linePositions[i * 6 + 3] = positions[b * 3];
    linePositions[i * 6 + 4] = positions[b * 3 + 1];
    linePositions[i * 6 + 5] = positions[b * 3 + 2];
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
  return geometry;
}

export function readBrainBinHeader(buf: ArrayBuffer): BrainBinHeader {
  if (buf.byteLength < 8) {
    throw new Error("brain.bin header missing");
  }
  const view = new DataView(buf);
  return {
    vertCount: view.getUint32(0, true),
    edgeCount: view.getUint32(4, true),
  };
}

export async function loadBrainGeometry(
  fetchImpl: typeof fetch = fetch,
): Promise<THREE.BufferGeometry> {
  const resp = await fetchImpl("/brain.bin");
  if (!resp.ok) {
    throw new Error(`Failed to load brain.bin: ${resp.status}`);
  }
  const buf = await resp.arrayBuffer();
  return parseBrainBin(buf);
}

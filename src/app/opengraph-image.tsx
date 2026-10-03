import { ImageResponse } from "next/og";

export const alt =
  "Theo Douwes — GTM & Sales Engineer, UC Berkeley Statistics";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** 1200x630 share card in the site's monochrome dark palette (globals.css). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#050505",
          color: "#f5f5f5",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 64,
            height: 64,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.18)",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.06em",
          }}
        >
          TD
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 600,
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            Theo Douwes
          </div>
          <div style={{ marginTop: 28, fontSize: 36, color: "#a1a1a1" }}>
            GTM & Sales Engineer · UC Berkeley Statistics
          </div>
          <div style={{ marginTop: 12, fontSize: 30, color: "#6b6b6b" }}>
            GTM systems · Multifamily underwriting · Probabilistic decisions
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#a1a1a1",
            fontFamily: "ui-monospace, monospace",
          }}
        >
          theodouwes.com
        </div>
      </div>
    ),
    { ...size },
  );
}

import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050505",
          color: "#f5f5f5",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "-0.06em",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          borderRadius: 6,
          border: "1px solid rgba(255,255,255,0.18)",
        }}
      >
        TD
      </div>
    ),
    { ...size },
  );
}

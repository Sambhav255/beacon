import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#f5f5f0",
          fontSize: 88,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ color: "#d4a574", fontSize: 96 }}>Beacon</div>
          <div style={{ marginTop: 16, fontSize: 30, color: "#a0a0a0" }}>Market Entry Agent for Modo Energy</div>
        </div>
      </div>
    ),
    size,
  );
}

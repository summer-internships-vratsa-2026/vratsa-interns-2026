import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Стажантска платформа ППМГ и ПТГ Враца 2026г";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a3d2b",
          padding: "64px",
          gap: "32px",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 20,
            background: "#0b5d3b",
            border: "2px solid #1a7a52",
          }}
        >
          <span
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: "#ff8c42",
              letterSpacing: "-1px",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            BP
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1.15,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Стажантска платформа
          </span>
          <span
            style={{
              fontSize: 36,
              fontWeight: 600,
              color: "#ff8c42",
              textAlign: "center",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            ППМГ и ПТГ Враца · 2026г
          </span>
        </div>

        {/* Subtitle */}
        <span
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.65)",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.5,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Враца софтуер и Лесто продукт
        </span>
      </div>
    ),
    { ...size },
  );
}

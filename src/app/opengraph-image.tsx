import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Alpina CRM — a shadcn/ui showcase by Alpina Tech";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "80px",
        backgroundColor: "#0c1230",
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        color: "white",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            width: "14px",
            height: "14px",
            borderRadius: "999px",
            backgroundColor: "#7c8cff",
            boxShadow: "0 0 24px #7c8cff",
          }}
        />
        <span
          style={{
            fontSize: "22px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          Alpina Tech
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            fontSize: "72px",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: "white",
          }}
        >
          Alpina CRM
        </div>
        <div
          style={{
            fontSize: "24px",
            color: "rgba(255,255,255,0.65)",
            letterSpacing: "-0.01em",
          }}
        >
          Sales intelligence demo by Alpina Tech
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: "18px",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          alpina-pulse.vercel.app
        </div>
        <div
          style={{
            fontSize: "18px",
            padding: "10px 18px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "rgba(255,255,255,0.85)",
          }}
        >
          shadcn · Next 16 · Vercel
        </div>
      </div>
    </div>,
    { ...size },
  );
}

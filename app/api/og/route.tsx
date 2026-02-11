import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
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
          backgroundColor: "#0a0a0a",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo checkmark */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 16,
            backgroundColor: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 512 512"
            fill="none"
          >
            <path
              d="M148 270 L224 346 L364 186"
              stroke="#0a0a0a"
              strokeWidth="56"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.03em",
            marginBottom: 16,
          }}
        >
          AgentTodo
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#a1a1aa",
            letterSpacing: "-0.01em",
          }}
        >
          One execution layer for autonomous agents
        </div>

        {/* Subline */}
        <div
          style={{
            fontSize: 20,
            color: "#52525b",
            marginTop: 12,
          }}
        >
          agenttodo.ai
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

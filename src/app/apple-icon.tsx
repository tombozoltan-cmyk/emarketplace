import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const revalidate = false;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#3F3F69",
        }}
      >
        <div
          style={{
            height: 820,
            width: 820,
            borderRadius: 220,
            backgroundColor: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              fontSize: 420,
              fontWeight: 900,
              letterSpacing: -20,
              color: "#E5AB31",
              lineHeight: 1,
            }}
          >
            EM
          </div>
        </div>
      </div>
    ),
    {
      width: 1024,
      height: 1024,
    }
  );
}

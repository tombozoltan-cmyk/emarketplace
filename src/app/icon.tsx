import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const revalidate = false;

export default function Icon() {
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
            height: 96,
            width: 96,
            borderRadius: 28,
            backgroundColor: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              fontSize: 54,
              fontWeight: 900,
              letterSpacing: -2,
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
      width: 128,
      height: 128,
    }
  );
}

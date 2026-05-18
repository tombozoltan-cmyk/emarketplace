import { ImageResponse } from "next/og"

export const runtime = "edge"
export const contentType = "image/png"
export const size = { width: 180, height: 180 }

const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/emarketplace-8aab1.firebasestorage.app/o/image%2FPlexi-tabla-86x53-E-marketplace_logo-2.png?alt=media"

export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#3F3F69",
          borderRadius: 40,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_URL}
          alt=""
          width={140}
          height={140}
          style={{
            objectFit: "contain",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}

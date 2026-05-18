import { ImageResponse } from "next/og"

export const runtime = "edge"
export const contentType = "image/png"
export const size = { width: 32, height: 32 }

const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/emarketplace-8aab1.firebasestorage.app/o/image%2FPlexi-tabla-86x53-E-marketplace_logo-2.png?alt=media"

export default async function Icon() {
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
          borderRadius: 6,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_URL}
          alt=""
          width={28}
          height={28}
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

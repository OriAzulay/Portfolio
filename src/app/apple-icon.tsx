import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon for iPhone / iPad. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #515559 0%, #3a3d41 100%)",
          color: "#ffbe98",
          fontSize: 92,
          fontWeight: 700,
          letterSpacing: -3,
        }}
      >
        OA
      </div>
    ),
    size
  );
}

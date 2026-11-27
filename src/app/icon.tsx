import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon: "OA" monogram in the site palette (Terra Cotta → Peach Fuzz on Blue Coal). */
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
          background: "#515559",
          borderRadius: 14,
          color: "#ffbe98",
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: -1,
        }}
      >
        OA
      </div>
    ),
    size
  );
}

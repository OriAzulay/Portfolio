import { ImageResponse } from "next/og";
import { getPortfolio } from "@/server/services/portfolio.service";

export const alt = "Portfolio preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Reflects the current name / title / headline from the dashboard.
export const dynamic = "force-dynamic";

/** Link preview image for LinkedIn, WhatsApp, X, etc. (PNG - widely supported). */
export default async function OpenGraphImage() {
  const { name, title, headline } = (await getPortfolio()).personalInfo;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 90px",
          background: "#f7e9de",
          backgroundImage: "linear-gradient(135deg, #f7e9de 0%, #f7e9de 55%, #f0bbb4 100%)",
          color: "#2e3134",
        }}
      >
        <div style={{ display: "flex", width: 120, height: 10, borderRadius: 6, background: "#ea7b5e", marginBottom: 40 }} />
        <div style={{ display: "flex", fontSize: 84, fontWeight: 700, letterSpacing: -2 }}>{name}</div>
        <div style={{ display: "flex", fontSize: 40, color: "#a9472f", marginTop: 12 }}>{title}</div>
        {headline && (
          <div style={{ display: "flex", fontSize: 32, color: "#515559", marginTop: 36, maxWidth: 950, lineHeight: 1.35 }}>
            {headline}
          </div>
        )}
      </div>
    ),
    size
  );
}

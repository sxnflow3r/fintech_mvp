import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Treasure – Cash Flow OS for European SMEs",
  description: "Connect your bank and accounting software. Get a 90-day forecast. Accept financing in one click.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#0a192c" }}>{children}</body>
    </html>
  );
}

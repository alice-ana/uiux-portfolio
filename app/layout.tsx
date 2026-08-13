import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alice Chen | UI/UX Portfolio",
  description: "Alice Chen 的 UI/UX 作品集，專注複雜系統、監測資料、B2B 後台與 AI 協作設計交付。",
  icons: { icon: "/assets/favicon.svg" },
  openGraph: {
    title: "Alice Chen | UI/UX Portfolio",
    description: "專注複雜系統、監測資料、B2B 後台與 AI 協作設計交付的 UI/UX 作品集。",
    images: ["/assets/og-cover.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>
        {children}
      </body>
    </html>
  );
}

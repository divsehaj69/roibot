import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ROIbot — AI Decision Advisor",
  description: "Get an honest verdict on whether AI is worth it for your workflow.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: "light" }}>
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}

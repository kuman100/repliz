import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Repliz - Kelola Semua Campaign Sosial Media",
  description: "Solusi cerdas untuk kreator, admin, dan pengelola campaign.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}

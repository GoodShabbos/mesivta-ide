import type { Metadata } from "next";
import "./globals.css";
import { TourHost } from "@/components/guide/TourHost";

export const metadata: Metadata = {
  title: "IDE",
  description: "Browser-based coding environment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=JetBrains+Mono:wght@400;700&display=swap"
        />
      </head>
      <body className="h-full overflow-hidden bg-background text-foreground">
        {children}
        <TourHost />
      </body>
    </html>
  );
}
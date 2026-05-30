import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "MindLens AI — Predictive Mental Wellness Companion",
  description: "A premium, minimalist AI companion that seamlessly estimates your wellness, energy, and stress dynamics to guide your journey to mental calm.",
  keywords: ["mental wellness", "predictive wellness", "AI companion", "mindfulness", "stress management"],
  authors: [{ name: "MindLens AI Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="min-h-full bg-background text-foreground transition-colors duration-300 font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

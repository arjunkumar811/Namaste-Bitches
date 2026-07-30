import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { WelcomeModal } from "@/components/auth/welcome-modal";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "NamasteBitches — Anonymous Location-Based Chat",
  description: "Chat with people around you. Stay completely anonymous. Real-time proximity radar frequencies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${jetbrainsMono.variable} font-sans antialiased bg-black text-zinc-100 selection:bg-emerald-500 selection:text-black min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <WelcomeModal />
          <div className="flex-1 flex flex-col">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}

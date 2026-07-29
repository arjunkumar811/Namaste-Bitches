import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { WelcomeModal } from "@/components/auth/welcome-modal";
import { Sidebar } from "@/components/layout/sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased h-screen w-screen flex flex-row overflow-hidden bg-background`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <WelcomeModal />
          <Sidebar />
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

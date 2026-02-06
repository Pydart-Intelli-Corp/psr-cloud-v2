import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { QueryProvider } from "@/contexts/QueryProvider";
import { DongleProvider } from "@/contexts/DongleContext";
import AuthChecker from "@/components/auth/AuthChecker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Poornasree Equipments Cloud - Dairy Equipment Management Platform",
  description: "Advanced dairy equipment management and cloud solutions for farmers, societies, BMCs, and dairy operators. Smart tracking, analytics, and comprehensive dairy operations platform.",
  keywords: "dairy equipment, milk analyzer, farm management, dairy cloud, Poornasree, Lactosure",
  authors: [{ name: "Poornasree Equipments" }],
  icons: {
    icon: [
      { url: '/flower.png' },
      { url: '/favicon.ico' },
    ],
    apple: '/flower.png',
  },
  openGraph: {
    title: "Poornasree Equipments Cloud",
    description: "Advanced dairy equipment management platform",
    type: "website",
    images: ["/fulllogo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider>
            <LanguageProvider>
              <DongleProvider>
                <AuthChecker>
                  {children}
                </AuthChecker>
              </DongleProvider>
            </LanguageProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

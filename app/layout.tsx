import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/custom/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import SyncUserProvider from "@/providers/SyncUserProvider";
import Script from "next/script";
import { UploadedFileProvider } from "@/context/UploadedFileContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReUp",
  description:
    "ReUp: Craft a professional resume in minutes and get instant AI feedback to stand out. Create, optimize, and land your dream job with confidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        layout: {
          logoImageUrl: "/logo.svg",
          socialButtonsVariant: "iconButton",
        },
        variables: { colorPrimary: "#f43f5e" },
      }}
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Script
            src="https://js.puter.com/v2/"
            strategy="afterInteractive" // Or "beforeInteractive" if critical
            id="puter-script" // Give it an ID for Next.js optimization
          />

          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SyncUserProvider>
              <UploadedFileProvider>{children}</UploadedFileProvider>
            </SyncUserProvider>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

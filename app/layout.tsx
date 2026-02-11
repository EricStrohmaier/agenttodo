import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { Suspense } from "react";
import { Inter, DM_Mono } from "next/font/google";
import { CookieConsent } from "@/components/shared/CookieConsent";
import { PostHogPageViewTracker } from "@/components/shared/Providers";

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const monoFont = DM_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    template: "%s | AgentBoard",
    default: "AgentBoard — Agent Task Management",
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme:dark)").matches);document.documentElement.classList.toggle("dark",d);document.cookie="theme="+(d?"dark":"light")+";path=/;max-age=31536000;SameSite=Lax"}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${bodyFont.variable} ${monoFont.variable} h-full font-body`}
      >
        {children}
        <Suspense fallback={null}>
          <Toaster richColors closeButton />
        </Suspense>
        <CookieConsent />
        <PostHogPageViewTracker />
      </body>
    </html>
  );
}

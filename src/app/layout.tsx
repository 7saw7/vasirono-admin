import type { Metadata } from "next";
import { Inter, Poppins, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { getBaseUrl, siteConfig } from "@/config/site";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-mono", weight: "400", display: "swap" });
const poppins = Poppins({ subsets: ["latin"], variable: "--font-display", weight: ["700", "800"], display: "swap" });
const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: { default: siteConfig.name, template: `%s | ${siteConfig.shortName}` },
  description: siteConfig.description,
  applicationName: siteConfig.applicationName,
  authors: [{ name: siteConfig.creator }],
  creator: siteConfig.creator,
  publisher: siteConfig.creator,
  keywords: [...siteConfig.keywords],
  alternates: { canonical: "/" },
  icons: { icon: [{ url: "/favicon.ico" }, { url: "/icon256.png", type: "image/png" }], apple: [{ url: "/icon256.png" }] },
  openGraph: { type: "website", locale: siteConfig.locale, url: baseUrl, title: siteConfig.name, description: siteConfig.description, siteName: siteConfig.shortName },
  twitter: { card: "summary_large_image", title: siteConfig.name, description: siteConfig.description },
  robots: { index: true, follow: true },
};

const themeScript = `
(function(){
  try {
    var saved = localStorage.getItem('vasirono-theme');
    var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  } catch (_) {}
})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${inter.variable} ${robotoMono.variable} ${poppins.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="min-h-screen bg-white font-sans text-slate-950 antialiased transition-colors dark:bg-[#080b12] dark:text-slate-100">
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

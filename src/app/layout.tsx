// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Roboto_Mono, Poppins } from "next/font/google";
import "./globals.css";
import Header from "src/components/Header";
import Footer from "src/components/Footer";
import Navbar from "src/components/Navbar"; // 👈 importa aquí

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const roboto_mono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: "400",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: "Codeva Studio",
  description: "Desarrollo de páginas web que impulsan tu negocio.",
  icons: {
    icon: "/icon256.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${roboto_mono.variable} ${poppins.variable}`}
    >
      <head>
        <link
          rel="preload"
          href="/assets/videos/inicio.mp4"
          as="video"
          type="video/mp4"
        />
        <link rel="icon" href="/icon256.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon256.png" />
      </head>
      <body className="bg-slate-950 text-slate-100 overflow-x-hidden relative">
        {/* 🔹 Navbar FIJO de toda la web */}
        <Navbar variant="dark" />

        {/* 🔹 El resto de la página ya debajo del navbar */}
        <Header /> {/* ya SIN navbar dentro */}
        {children}
        <Footer />
      </body>
    </html>
  );
}

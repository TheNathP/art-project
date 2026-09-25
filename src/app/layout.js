import { Geist, Geist_Mono } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { PRELOADER_ARTWORKS } from "@/app/lib/preloader-artworks";
import { getSiteUrl } from "@/app/lib/site-url";
import SmoothScroll from "@/components/SmoothScroll";
import { ArtworkPageTransitionProvider } from "@/components/transitions/ArtworkPageTransitionProvider";
import { PageTransitionProvider } from "@/components/transitions/PageTransitionProvider";
import Header from "../components/Header";
import SitePreloader from "../components/SitePreloader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "The Art Project",
  description:
    "Explore an interactive collection of masterpieces and create your own personal gallery.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SmoothScroll>
          <PageTransitionProvider>
            <ArtworkPageTransitionProvider>
              <SitePreloader artworks={PRELOADER_ARTWORKS} />
              <Header />
              {children}
            </ArtworkPageTransitionProvider>
          </PageTransitionProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}

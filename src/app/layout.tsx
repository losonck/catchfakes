import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, APP_PAGE_URL, orgSchema, websiteSchema, renderJsonLd } from "@/lib/seo";
import { AppStoreButton } from "@/components/AppStoreButton";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Real or fake. Know in minutes.`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Real or fake. Know in minutes.`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Real or fake. Know in minutes.`,
    description: SITE_DESCRIPTION,
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
  },
  category: "horology",
  keywords: [
    "watch authentication", "fake watch", "spot a fake watch", "real or fake watch",
    "fake Rolex", "fake Submariner", "fake Daytona", "fake Speedmaster",
    "fake Royal Oak", "fake Nautilus", "watch identification",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="alternate" type="application/rss+xml" title={SITE_NAME} href="/rss.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: renderJsonLd(orgSchema(), websiteSchema()) }}
        />
      </head>
      <body className="font-sans bg-bg text-text antialiased min-h-screen flex flex-col relative">
        <div className="ambient" />
        <Header />
        <main className="flex-1 relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-rule backdrop-blur-xl bg-bg/70">
      <div className="max-w-content mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <a href="/" className="font-serif text-2xl tracking-tight text-text">
          Catch <em className="italic text-accent">Fakes</em>
        </a>
        <nav className="hidden sm:flex gap-8 text-sm text-text-soft">
          <a href="/" className="hover:text-text transition-colors">Guides</a>
          <a href={APP_PAGE_URL} className="hover:text-text transition-colors">App</a>
          <a href="/about" className="hover:text-text transition-colors">Method</a>
        </nav>
        <AppStoreButton variant="pill" desktopToLanding={true} />
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-rule bg-bg-2 mt-20 relative z-10">
      <div className="max-w-content mx-auto px-4 sm:px-6 py-12 grid gap-8 sm:grid-cols-[2fr_1fr_1fr]">
        <div>
          <h4 className="font-serif text-2xl mb-2">Catch <em className="italic text-accent">Fakes</em></h4>
          <p className="text-text-soft text-sm max-w-xs">
            Reference-grade watch authentication. Built for buyers, sellers, and collectors who can&apos;t afford to get it wrong.
          </p>
        </div>
        <div>
          <h5 className="font-mono text-xs tracking-[0.16em] uppercase text-text-soft mb-3">Guides</h5>
          <a href="/" className="block text-sm text-text mb-1 hover:text-accent">All references</a>
          <a href="/" className="block text-sm text-text mb-1 hover:text-accent">By brand</a>
        </div>
        <div>
          <h5 className="font-mono text-xs tracking-[0.16em] uppercase text-text-soft mb-3">Product</h5>
          <a href={APP_PAGE_URL} className="block text-sm text-text mb-1 hover:text-accent">Mobile app</a>
          <a href="/about" className="block text-sm text-text mb-1 hover:text-accent">Method</a>
        </div>
      </div>
      <div className="border-t border-rule mt-8 pt-6 pb-8 text-center text-xs font-mono text-text-soft tracking-wider">
        © 2026 · catchfakes.com — independent watch authentication
      </div>
    </footer>
  );
}

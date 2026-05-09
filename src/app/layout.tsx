import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = process.env.SITE_URL ?? "https://catchfakes.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Catch Fakes — authenticate watches by reference", template: "%s | Catch Fakes" },
  description: "Reference-by-reference authentication guides for Rolex, Omega, AP, Patek, Tudor and more. Spot counterfeits with detail-level checks written by authenticators, sharpened by AI.",
  openGraph: { type: "website", siteName: "Catch Fakes" },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper text-ink font-sans antialiased min-h-screen flex flex-col">
        <header className="border-b border-ink/10">
          <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
            <a href="/" className="font-serif text-xl tracking-tight">
              Catch <span className="text-accent">Fakes</span>
            </a>
            <nav className="text-sm">
              <a href="/" className="hover:text-accent">All guides</a>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-ink/10 mt-20">
          <div className="max-w-3xl mx-auto px-6 py-8 text-sm text-muted">
            Independent authentication guides. Not affiliated with any brand.
          </div>
        </footer>
      </body>
    </html>
  );
}

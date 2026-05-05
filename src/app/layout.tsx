import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = process.env.SITE_URL ?? "https://fakewatch.guide";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Fake Watch Guide — spot counterfeits, expert by reference", template: "%s | Fake Watch Guide" },
  description: "Reference-by-reference authentication guides for Rolex, Omega, AP, Patek, Tudor and more. Written by watch authenticators, sharpened by AI.",
  openGraph: { type: "website", siteName: "Fake Watch Guide" },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper text-ink font-sans antialiased min-h-screen flex flex-col">
        <header className="border-b border-ink/10">
          <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
            <a href="/" className="font-serif text-xl tracking-tight">
              Fake Watch <span className="text-accent">Guide</span>
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

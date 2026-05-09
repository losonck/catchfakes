"use client";
import { useEffect, useState } from "react";
import { APP_STORE_URL_ANDROID, APP_STORE_URL_IOS, APP_PAGE_URL } from "@/lib/seo";

type Platform = "ios" | "android" | "desktop";

function detect(): Platform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

interface Props {
  variant?: "primary" | "ghost" | "pill";
  className?: string;
  /** Override the visible label. Default adapts to platform. */
  label?: string;
  /** If true (default), desktop sends user to /app where they can see both badges.
   *  If false, desktop links directly to Android store. */
  desktopToLanding?: boolean;
}

const STYLES = {
  primary:
    "inline-flex bg-accent-gradient text-ink font-semibold px-6 py-3.5 rounded-full shadow-glow hover:shadow-glow-strong hover:-translate-y-0.5 transition-all",
  pill:
    "inline-flex bg-accent-gradient text-ink font-semibold text-sm px-4 py-2 rounded-full hover:scale-105 transition-transform",
  ghost:
    "inline-flex border border-rule text-text font-semibold px-5 py-3 rounded-full hover:border-accent/40 hover:bg-bg-2 transition-colors",
};

export function AppStoreButton({
  variant = "primary",
  className = "",
  label,
  desktopToLanding = true,
}: Props) {
  // SSR-safe default: render with href=/app and a generic label so JS-disabled / pre-hydration
  // visitors get a working button. Hydration replaces with platform-specific URL/label.
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPlatform(detect());
    setHydrated(true);
  }, []);

  let href = APP_PAGE_URL;
  let display = label ?? "Get the App";
  let external = false;

  if (hydrated) {
    if (platform === "android" && APP_STORE_URL_ANDROID) {
      href = APP_STORE_URL_ANDROID;
      display = label ?? "Get on Google Play";
      external = true;
    } else if (platform === "ios") {
      if (APP_STORE_URL_IOS) {
        href = APP_STORE_URL_IOS;
        display = label ?? "Get on the App Store";
        external = true;
      } else {
        href = APP_PAGE_URL;
        display = label ?? "iOS coming soon";
      }
    } else {
      // desktop
      href = desktopToLanding ? APP_PAGE_URL : APP_STORE_URL_ANDROID;
      display = label ?? (desktopToLanding ? "See the app" : "Get on Google Play");
      external = !desktopToLanding;
    }
  }

  const cls = `${STYLES[variant]} ${className}`.trim();
  const linkProps = external ? { target: "_blank", rel: "noopener" } : {};

  return (
    <a href={href} className={cls} {...linkProps} suppressHydrationWarning>
      {display}
    </a>
  );
}

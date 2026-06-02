"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Github, ExternalLink, DollarSign, FileText } from "lucide-react";
import { directory } from "@/directory.config";
import Logo from "@/public/logo.svg";
import { useEffect, useState } from "react";

export const Footer = () => {
  const t = useTranslations("common");
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const badgeSrc = mounted && resolvedTheme === "dark"
    ? "/badge/powered-dark.svg"
    : "/badge/powered-light.svg";

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-20">
      <div className="max-w-[1400px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-8">
          {/* First Column - Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src={Logo}
                alt="Logo"
                width={120}
                height={50}
                className="w-auto h-8"
              />
            </Link>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                © {new Date().getFullYear()} {directory.name}. All rights reserved.
              </p>
              <p>
                Open source project by{" "}
                <a
                  href="https://github.com/hicyoucom/hicyou"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline transition-colors hover:text-foreground inline-flex items-center gap-1"
                >
                  HiCyou
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>

            <Link
              href="https://hicyou.com/open-source"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4"
            >
              <Image
                src={badgeSrc}
                alt="Powered by HiCyou"
                width={150}
                height={40}
                className="w-auto h-10 transition-opacity hover:opacity-80"
              />
            </Link>
          </div>

          {/* Second Column - Discover */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t("discover")}</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/c"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("categories")}
                </Link>
              </li>
              <li>
                <Link
                  href="/submit"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("submitProject")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Third Column - Resources */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t("resources")}</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/open-source"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  {t("openSource")}
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  {t("pricing")}
                </Link>
              </li>
              <li>
                <Link
                  href="/backlink-database"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  {t("backlinkDatabase")}
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/makoolabs/hicyou"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  {t("githubRepo")}
                </a>
              </li>
            </ul>
          </div>

          {/* Fourth Column - Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t("legal")}</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/legal/terms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("termsOfService")}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/badges"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("attributionBadges")}
                </Link>
              </li>
              <li>
                <Link
                  href="/friendly-links"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("friendlyLinks")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};


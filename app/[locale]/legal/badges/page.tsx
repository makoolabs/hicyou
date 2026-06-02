"use client";

import { Section, Container } from "@/components/craft";
import { TopNav } from "@/components/top-nav";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, Code } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const SITE_URL = "https://mossgame.com";

export default function AttributionBadges() {
  const t = useTranslations("badges");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const badges = [
    {
      id: "powered-light",
      name: `${t("poweredBy")} - Light`,
      image: "/badge/mossgame-powered-light.svg",
      html: `<a href="${SITE_URL}" target="_blank" rel="noopener"><img src="${SITE_URL}/badge/mossgame-powered-light.svg" alt="${t("poweredBy")}" /></a>`,
      markdown: `[![${t("poweredBy")}](${SITE_URL}/badge/mossgame-powered-light.svg)](${SITE_URL})`,
      theme: "light",
    },
    {
      id: "powered-dark",
      name: `${t("poweredBy")} - Dark`,
      image: "/badge/mossgame-powered-dark.svg",
      html: `<a href="${SITE_URL}" target="_blank" rel="noopener"><img src="${SITE_URL}/badge/mossgame-powered-dark.svg" alt="${t("poweredBy")}" /></a>`,
      markdown: `[![${t("poweredBy")}](${SITE_URL}/badge/mossgame-powered-dark.svg)](${SITE_URL})`,
      theme: "dark",
    },
    {
      id: "featured-light",
      name: `${t("featuredOn")} - Light`,
      image: "/badge/mossgame-featured-light.svg",
      html: `<a href="${SITE_URL}" target="_blank" rel="noopener"><img src="${SITE_URL}/badge/mossgame-featured-light.svg" alt="${t("featuredOn")}" /></a>`,
      markdown: `[![${t("featuredOn")}](${SITE_URL}/badge/mossgame-featured-light.svg)](${SITE_URL})`,
      theme: "light",
    },
    {
      id: "featured-dark",
      name: `${t("featuredOn")} - Dark`,
      image: "/badge/mossgame-featured-dark.svg",
      html: `<a href="${SITE_URL}" target="_blank" rel="noopener"><img src="${SITE_URL}/badge/mossgame-featured-dark.svg" alt="${t("featuredOn")}" /></a>`,
      markdown: `[![${t("featuredOn")}](${SITE_URL}/badge/mossgame-featured-dark.svg)](${SITE_URL})`,
      theme: "dark",
    },
  ];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(t("copied"));
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <Section>
        <Container>
          <div className="mx-auto max-w-6xl space-y-8 py-12">
            <div className="space-y-4 text-center">
              <Badge className="mb-4">{t("badge")}</Badge>
              <h1 className="text-4xl font-bold">{t("title")}</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {t("description")}
              </p>
            </div>

            {/* Requirements */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  {t("requirements")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold">{t("forOpenSource")}</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>{t("fosReq")}</li>
                    <li>{t("fosVisible")}</li>
                    <li>{t("fosLink")}</li>
                    <li>{t("fosNoModify")}</li>
                    <li>{t("fosCommercial")}</li>
                  </ul>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <h3 className="font-semibold">{t("forSubmitted")}</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>
                      {t("fsOptional")}{" "}
                      <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">{t("dofollow")}</Badge>
                    </li>
                    <li>{t("fsPriority")}</li>
                    <li>{t("fsAutoUpgrade")}</li>
                    <li>{t("fsReferral")}</li>
                  </ul>
                </div>

                <div className="pt-4 border-t text-sm text-muted-foreground">
                  <p>{t("upstreamNote")}</p>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("benefitDofollow")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{t("benefitDofollowDesc")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("benefitPromotion")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{t("benefitPromotionDesc")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("benefitSupport")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{t("benefitSupportDesc")}</p>
                </CardContent>
              </Card>
            </div>

            {/* Badge Selection */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{t("chooseBadge")}</h2>
                <p className="text-muted-foreground">{t("chooseBadgeDesc")}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {badges.map((badge) => (
                  <Card key={badge.id} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-lg">{badge.name}</CardTitle>
                      <CardDescription>
                        {badge.theme === "dark" ? t("bestForDark") : t("bestForLight")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Badge Preview */}
                      <div className={`p-8 rounded-lg flex items-center justify-center ${badge.theme === "dark" ? "bg-gray-900" : "bg-gray-50"
                        }`}>
                        <img
                          src={badge.image}
                          alt={badge.name}
                          className="h-12"
                        />
                      </div>

                      {/* HTML Code */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">HTML</label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(badge.html, `${badge.id}-html`)}
                          >
                            {copiedId === `${badge.id}-html` ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <code className="block p-3 bg-muted rounded text-xs overflow-x-auto">
                          {badge.html}
                        </code>
                      </div>

                      {/* Markdown Code */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Markdown</label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(badge.markdown, `${badge.id}-md`)}
                          >
                            {copiedId === `${badge.id}-md` ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <code className="block p-3 bg-muted rounded text-xs overflow-x-auto">
                          {badge.markdown}
                        </code>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Implementation Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  {t("implementation")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold">{t("forWebsiteOwners")}</h3>
                  <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                    <li>{t("impl1")}</li>
                    <li>{t("impl2")}</li>
                    <li>{t("impl3")}</li>
                    <li>{t("impl4")}</li>
                    <li>{t("impl5")}</li>
                  </ol>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <h3 className="font-semibold">{t("forOSDevs")}</h3>
                  <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                    <li>{t("implOs1")}</li>
                    <li>{t("implOs2")}</li>
                    <li>{t("implOs3")}</li>
                    <li>{t("implOs4")}</li>
                    <li>{t("implOs5")}</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle>{t("faq")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">{t("faqRequired")}</h3>
                  <p className="text-muted-foreground">{t("faqRequiredAnswer")}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">{t("faqCustomize")}</h3>
                  <p className="text-muted-foreground">{t("faqCustomizeAnswer")}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">{t("faqVerify")}</h3>
                  <p className="text-muted-foreground">{t("faqVerifyAnswer")}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">{t("faqRemove")}</h3>
                  <p className="text-muted-foreground">{t("faqRemoveAnswer")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>
    </div>
  );
}


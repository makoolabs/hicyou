import { Section, Container } from "@/components/craft";
import { TopNav } from "@/components/top-nav";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing | MossGame",
  description: "100% free forever. Submit and get dofollow backlinks.",
};

export default async function PricingPage() {
  const t = await getTranslations("pricing");
  const th = await getTranslations("home");
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <Section>
        <Container>
          <div className="mx-auto max-w-6xl space-y-16 py-12">
            <div className="text-center space-y-6">
              <Badge className="mb-4">{t("title")}</Badge>
              <h1 className="text-5xl font-bold tracking-tight">{t("subtitle")}</h1>
              <p className="text-2xl text-muted-foreground max-w-3xl mx-auto">{t("free")}</p>
            </div>
            <div className="flex justify-center">
              <Card className="w-full max-w-md border-primary">
                <CardHeader className="text-center">
                  <Badge className="mb-2">{t("mostPopular")}</Badge>
                  <CardTitle className="text-2xl">{t("freeSubmission")}</CardTitle>
                  <p className="text-muted-foreground">{t("freeSubmissionDesc")}</p>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-5xl font-bold">{t("price")}</p>
                  <p className="text-muted-foreground">{t("foreverFree")}</p>
                  <ul className="mt-6 space-y-3 text-left">
                    {["freeListing","dofollowBacklinks","featuredPlacement","instantApproval","trafficAnalytics","categoryPlacement"].map(k => (
                      <li key={k} className="flex items-start gap-2"><Check className="h-5 w-5 text-green-500 mt-0.5" /><span><strong>{t(k)}</strong><br /><span className="text-sm text-muted-foreground">{t(k+"Desc")}</span></span></li>
                    ))}
                  </ul>
                  <Button asChild size="lg" className="mt-6 w-full"><Link href="/submit">{t("submitCTA")}</Link></Button>
                  <p className="text-sm text-muted-foreground mt-2">{t("noCatch")}</p>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-center">{t("faqTitle")}</h2>
              {[1,2,3].map(i => (
                <Card key={i}><CardHeader><CardTitle className="text-lg">{t("faqQ"+i)}</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{t("faqA"+i)}</p></CardContent></Card>
              ))}
            </div>
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold">{t("readyTitle")}</h2>
              <p className="text-lg text-muted-foreground">{t("readyDesc")}</p>
              <div className="flex gap-4 justify-center">
                <Button asChild size="lg"><Link href="/submit">{t("submitFree")}</Link></Button>
                <Button asChild variant="outline" size="lg"><Link href="/about">{t("learnMore")}</Link></Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}

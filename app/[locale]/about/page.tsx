import { Section, Container } from "@/components/craft";
import { TopNav } from "@/components/top-nav";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Zap, Heart, Users, Search, MessageSquare } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | MossGame",
  description: "Free open-source game development tools directory — discover the best tools across every stage of game creation, from engines and art to audio and publishing.",
};

export default async function AboutPage() {
  const t = await getTranslations("about");
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <Section>
        <Container>
          <div className="mx-auto max-w-5xl space-y-16 py-12">
            <div className="text-center space-y-6">
              <Badge className="mb-4">{t("title")}</Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t("subtitle")}</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{t("intro")}</p>
            </div>
            <div className="prose prose-lg dark:prose-invert mx-auto text-center max-w-3xl">
              <p>{t("mission")}</p>
              <p>{t("mission2")}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold mb-2">{t("forUsers")}</h2>
                  <p className="text-muted-foreground">{t("forUsersDesc")}</p>
                </div>
                <div className="grid gap-4">
                  <Card><CardHeader className="pb-2"><div className="flex items-center gap-2"><Search className="h-5 w-5 text-primary" /><CardTitle className="text-lg">{t("discoverGems")}</CardTitle></div></CardHeader><CardContent><p className="text-sm text-muted-foreground">{t("discoverGemsDesc")}</p></CardContent></Card>
                  <Card><CardHeader className="pb-2"><div className="flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /><CardTitle className="text-lg">{t("saveTime")}</CardTitle></div></CardHeader><CardContent><p className="text-sm text-muted-foreground">{t("saveTimeDesc")}</p></CardContent></Card>
                  <Card><CardHeader className="pb-2"><div className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /><CardTitle className="text-lg">{t("realReviews")}</CardTitle></div></CardHeader><CardContent><p className="text-sm text-muted-foreground">{t("realReviewsDesc")}</p></CardContent></Card>
                </div>
              </div>
              <div className="space-y-6">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold mb-2">{t("forDevelopers")}</h2>
                  <p className="text-muted-foreground">{t("forDevelopersDesc")}</p>
                </div>
                <div className="grid gap-4">
                  <Card><CardHeader className="pb-2"><div className="flex items-center gap-2"><Globe className="h-5 w-5 text-primary" /><CardTitle className="text-lg">{t("freePromotion")}</CardTitle></div></CardHeader><CardContent><p className="text-sm text-muted-foreground">{t("freePromotionDesc")}</p></CardContent></Card>
                  <Card><CardHeader className="pb-2"><div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><CardTitle className="text-lg">{t("gainExposure")}</CardTitle></div></CardHeader><CardContent><p className="text-sm text-muted-foreground">{t("gainExposureDesc")}</p></CardContent></Card>
                  <Card><CardHeader className="pb-2"><div className="flex items-center gap-2"><Heart className="h-5 w-5 text-primary" /><CardTitle className="text-lg">{t("communityFeedback")}</CardTitle></div></CardHeader><CardContent><p className="text-sm text-muted-foreground">{t("communityFeedbackDesc")}</p></CardContent></Card>
                </div>
              </div>
            </div>
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold">{t("joinCommunity")}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("joinCommunityDesc")}</p>
              <div className="flex gap-4 justify-center">
                <Button asChild size="lg"><Link href="/submit">{t("submitProduct")}</Link></Button>
                <Button asChild variant="outline" size="lg"><Link href="/c">{t("exploreTools")}</Link></Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}

import { getTranslations } from "next-intl/server";
import { Section, Container } from "@/components/craft";
import { TopNav } from "@/components/top-nav";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Code2, Palette, Globe, Database, Sparkles, Shield, ExternalLink } from "lucide-react";
import Link from "next/link";

const techStack = [
  { icon: Code2, title: "Next.js 14", desc: "React framework with App Router" },
  { icon: Database, title: "MySQL + Drizzle ORM", desc: "Type-safe database queries" },
  { icon: Palette, title: "Tailwind CSS + shadcn/ui", desc: "Modern responsive UI" },
  { icon: Globe, title: "next-intl", desc: "Full i18n (en/zh/ja/ko)" },
  { icon: Sparkles, title: "DeepSeek AI", desc: "AI-powered content generation" },
  { icon: Shield, title: "Open Source", desc: "MIT-derivative license, free to use" },
];

export default async function OpenSourcePage() {
  const t = await getTranslations("openSource");

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <Section>
        <Container>
          <div className="mx-auto max-w-5xl space-y-12 py-12">
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Github className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-bold">{t("title")}</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{t("description")}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {techStack.map((item) => (
                <Card key={item.title}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <item.icon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("whatTitle")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>{t("whatDesc1")}</p>
                  <p>{t("whatDesc2")}</p>
                  <p>{t("whatDesc3")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("licenseTitle")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>{t("licenseDesc1")}</p>
                  <p>{t("licenseDesc2")}</p>
                  <p>{t("licenseDesc3")}</p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">{t("contribute")}</h2>
              <div className="flex gap-4 justify-center">
                <Button asChild size="lg">
                  <a href="https://github.com/makoolabs/hicyou" target="_blank" rel="noopener noreferrer" className="gap-2">
                    <Github className="h-5 w-5" />
                    {t("viewOnGitHub")}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/submit">{t("submitTool")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
      <Footer />
    </div>
  );
}

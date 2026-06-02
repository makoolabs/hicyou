import { getTranslations } from "next-intl/server";
import { Section, Container } from "@/components/craft";
import { TopNav } from "@/components/top-nav";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, HeartHandshake } from "lucide-react";
import { getAllFriendlyLinks } from "@/lib/data";

export default async function FriendlyLinksPage() {
  const t = await getTranslations("friendlyLinks");
  const links = await getAllFriendlyLinks();

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <Section>
        <Container>
          <div className="mx-auto max-w-6xl space-y-8 py-12">
            {/* Hero */}
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center gap-2 text-primary">
                <HeartHandshake className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-bold">{t("title")}</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {t("description")}
              </p>
            </div>

            {/* Links Grid */}
            {links.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <HeartHandshake className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">{t("empty")}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {links.map((link) => (
                  <Card key={link.id} className="hover:border-primary/30 transition-colors">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors inline-flex items-center gap-1"
                        >
                          {link.title}
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                        </a>
                      </CardTitle>
                    </CardHeader>
                    {link.description && (
                      <CardContent>
                        <CardDescription>{link.description}</CardDescription>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {/* Exchange note */}
            <div className="text-center pt-8 border-t">
              <p className="text-muted-foreground text-sm">
                {t("exchangeNote")}
              </p>
            </div>
          </div>
        </Container>
      </Section>
      <Footer />
    </div>
  );
}

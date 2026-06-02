import { getTranslations } from "next-intl/server";
import { Section, Container } from "@/components/craft";
import { TopNav } from "@/components/top-nav";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAllBacklinkResources } from "@/lib/data";

export default async function BacklinkDatabasePage() {
  const t = await getTranslations("backlinkDatabase");
  const resources = await getAllBacklinkResources();

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <Section>
        <Container>
          <div className="mx-auto max-w-6xl space-y-8 py-12">
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Database className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-bold">{t("title")}</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{t("description")}</p>
            </div>

            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">DR</TableHead>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead className="w-[100px]">{t("type")}</TableHead>
                    <TableHead className="w-[100px]">{t("category")}</TableHead>
                    <TableHead className="w-[80px]">{t("cost")}</TableHead>
                    <TableHead className="w-[120px]">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Badge variant={r.drScore >= 80 ? "default" : r.drScore >= 60 ? "secondary" : "outline"}>
                          {r.drScore}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {r.description ? (
                          <div>
                            <a href={r.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary inline-flex items-center gap-1">
                              {r.name}<ExternalLink className="h-3 w-3" />
                            </a>
                            <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
                          </div>
                        ) : (
                          <a href={r.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary inline-flex items-center gap-1">
                            {r.name}<ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={r.linkType === "dofollow" ? "border-green-500 text-green-600" : "border-orange-500 text-orange-600"}>
                          {r.linkType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.category}</TableCell>
                      <TableCell className="text-sm">{r.cost}</TableCell>
                      <TableCell>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                        >
                          {t("visit")}<ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* FAQ */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">{t("faqWhatTitle")}</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{t("faqWhatDesc")}</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">{t("faqDrTitle")}</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{t("faqDrDesc")}</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">{t("faqDofollowTitle")}</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{t("faqDofollowDesc")}</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">{t("faqPriorityTitle")}</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{t("faqPriorityDesc")}</p></CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </Section>
      <Footer />
    </div>
  );
}

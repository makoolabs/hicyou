import React from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCollectionBySlug } from "@/lib/data";
import { TopNav } from "@/components/top-nav";
import { Container } from "@/components/craft";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

type Props = { params: { slug: string } };

export default async function CollectionDetailPage({ params }: Props) {
  const t = await getTranslations("collections");
  const { collection, items } = await getCollectionBySlug(params.slug);

  if (!collection) notFound();

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <Container>
        <div className="py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">{collection.title}</h1>
            {collection.description && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {collection.description}
              </p>
            )}
            <div className="mt-4 text-sm text-muted-foreground">
              {items.length} {t("toolsCount", { count: items.length })}
            </div>
          </div>

          {/* Items */}
          {items.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              {t("emptyItems")}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-3">
              {items.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="p-4 flex items-center justify-between hover:border-primary/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-0.5 truncate">
                          {item.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {item.url}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <Badge variant="outline" className="gap-1">
                        <ExternalLink className="h-3 w-3" />
                        {t("visit")}
                      </Badge>
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

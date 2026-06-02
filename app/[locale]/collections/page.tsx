import React from "react";
import { getTranslations } from "next-intl/server";
import { getAllCollections } from "@/lib/data";
import { TopNav } from "@/components/top-nav";
import { Container } from "@/components/craft";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays } from "lucide-react";

export default async function CollectionsPage() {
  const t = await getTranslations("collections");
  const tc = await getTranslations("common");
  const collections = await getAllCollections();

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <Container>
        <div className="py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border bg-background/50 backdrop-blur-sm text-xs font-medium text-muted-foreground">
              📦 {tc("siteName")}
            </div>
            <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("description")}
            </p>
          </div>

          {/* Collections Grid */}
          {collections.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              {t("empty")}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((col) => (
                <Link
                  key={col.id}
                  href={`/collections/${col.slug}`}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg hover:border-primary/50">
                    {/* Cover Image */}
                    <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                      {col.coverImage ? (
                        <Image
                          src={col.coverImage}
                          alt={col.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                          <span className="text-4xl font-bold text-primary/20">
                            📦
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Content */}
                    <div className="p-4">
                      <h2 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                        {col.title}
                      </h2>
                      {col.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {col.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        <span>
                          {new Date(col.createdAt).toLocaleDateString("zh-CN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

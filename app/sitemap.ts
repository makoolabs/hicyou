import { MetadataRoute } from "next";
import { getAllBookmarks, getAllCategories } from "@/lib/data";
import { directory } from "@/directory.config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = directory.baseUrl;
  const locales = ["en", "zh", "ja", "ko"];

  const [bookmarks, categories] = await Promise.all([
    getAllBookmarks(),
    getAllCategories(),
  ]);

  const staticPaths = [
    "",
    "/c",
    "/about",
    "/pricing",
    "/submit",
    "/collections",
    "/friendly-links",
    "/backlink-database",
    "/open-source",
    "/legal",
    "/legal/terms",
    "/legal/privacy",
    "/legal/badges",
  ];

  const entries: MetadataRoute.Sitemap = [];

  // Generate locale-prefixed URLs for static pages
  for (const locale of locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1 : path === "/c" ? 0.9 : 0.7,
      });
    }

    // Category pages
    for (const cat of categories) {
      entries.push({
        url: `${baseUrl}/${locale}/c/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      });
    }

    // Bookmark pages
    for (const bm of bookmarks) {
      entries.push({
        url: `${baseUrl}/${locale}/${bm.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      });
    }
  }

  return entries;
}

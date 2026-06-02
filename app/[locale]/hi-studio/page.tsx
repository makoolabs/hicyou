import React from "react";
import { getTranslations } from "next-intl/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { getAllCategories, getAllBookmarks, getAllCollections, getAllFriendlyLinks, getAllBacklinkResources } from "@/lib/data";
import { CategoryManager } from "@/components/admin/category-manager";
import { BookmarkManager } from "@/components/admin/bookmark-manager";
import { CollectionManager } from "@/components/admin/collection-manager";
import { FriendlyLinkManager } from "@/components/admin/friendly-link-manager";
import { BacklinkResourceManager } from "@/components/admin/backlink-resource-manager";
import { DiscoveryTrigger } from "@/components/admin/discovery-trigger";
import { Section, Container } from "@/components/craft";
import { Bookmark, FolderKanban, Settings2, Send, Layers, Sparkles, HeartHandshake, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function AdminPage() {
  const isDev = process.env.NODE_ENV === 'development';
  let user: { email?: string } | null = null;

  // Dev mode: read dev session cookie
  if (isDev) {
    const devEmail = cookies().get('dev_user_email')?.value;
    if (devEmail) {
      user = { email: devEmail };
    }
  }

  // Production: use real Supabase auth
  if (!user) {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
  if (!user || !user.email || !adminEmails.includes(user.email)) {
    redirect("/");
  }

  const categories = await getAllCategories();
  const bookmarks = await getAllBookmarks();
  const collections = await getAllCollections();
  const friendlyLinks = await getAllFriendlyLinks();
  const backlinkResources = await getAllBacklinkResources();
  const t = await getTranslations("admin");

  return (
    <Section>
      <Container>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-8">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight">{t("dashboard")}</h1>
              <p className="text-lg text-muted-foreground">{t("manageDesc")}</p>
            </div>
            <div className="flex items-center gap-4">
              <Card className="flex items-center gap-3 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Bookmark className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">
                    {bookmarks.length}
                  </p>
                  <p className="text-sm text-muted-foreground">{t("bookmarks")}</p>
                </div>
              </Card>
              <Card className="flex items-center gap-3 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <FolderKanban className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">
                    {categories.length}
                  </p>
                  <p className="text-sm text-muted-foreground">{t("categories")}</p>
                </div>
              </Card>
              <Card className="flex items-center gap-3 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">
                    {collections.length}
                  </p>
                  <p className="text-sm text-muted-foreground">{t("collections")}</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="bookmarks" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="grid w-[1000px] grid-cols-5">
                <TabsTrigger value="bookmarks" className="gap-2">
                  <Bookmark className="h-4 w-4" />
                  {t("bookmarks")}
                </TabsTrigger>
                <TabsTrigger value="categories" className="gap-2">
                  <FolderKanban className="h-4 w-4" />
                  {t("categories")}
                </TabsTrigger>
                <TabsTrigger value="collections" className="gap-2">
                  <Layers className="h-4 w-4" />
                  {t("collections")}
                </TabsTrigger>
                <TabsTrigger value="friendly-links" className="gap-2">
                  <HeartHandshake className="h-4 w-4" />
                  {t("friendlyLinks") || "Friendly Links"}
                </TabsTrigger>
                <TabsTrigger value="backlink-db" className="gap-2">
                  <Database className="h-4 w-4" />
                  {t("backlinkResources") || "Backlink DB"}
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <DiscoveryTrigger />
                <Link href="/hi-studio/submissions">
                  <Button variant="outline" className="gap-2">
                    <Send className="h-4 w-4" />
                    {t("submissions")}
                  </Button>
                </Link>
                <Card className="flex items-center gap-2 p-2">
                  <Settings2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{t("adminControls")}</span>
                </Card>
                <form action="/auth/signout" method="post">
                  <Button type="submit" variant="outline" className="rounded-xl text-muted-foreground">{t("signOut")}</Button>
                </form>
              </div>
            </div>

            <TabsContent value="bookmarks" className="space-y-4">
              <div className="rounded-xl border bg-card">
                <div className="border-b bg-muted/50 p-4">
                  <h2 className="text-lg font-semibold">{t("bookmarkManagement")}</h2>
                  <p className="text-sm text-muted-foreground">{t("bookmarkDesc")}</p>
                </div>
                <div className="p-6">
                  <BookmarkManager
                    bookmarks={bookmarks}
                    categories={categories}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
              <div className="rounded-xl border bg-card">
                <div className="border-b bg-muted/50 p-4">
                  <h2 className="text-lg font-semibold">{t("categoryManagement")}</h2>
                  <p className="text-sm text-muted-foreground">{t("categoryDesc")}</p>
                </div>
                <div className="p-6">
                  <CategoryManager categories={categories} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="collections" className="space-y-4">
              <div className="rounded-xl border bg-card">
                <div className="border-b bg-muted/50 p-4">
                  <h2 className="text-lg font-semibold">{t("collectionManagement") || "Collection Management"}</h2>
                  <p className="text-sm text-muted-foreground">{t("collectionDesc") || "Create and manage curated tool collections"}</p>
                </div>
                <div className="p-6">
                  <CollectionManager collections={collections} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="friendly-links" className="space-y-4">
              <div className="rounded-xl border bg-card">
                <div className="border-b bg-muted/50 p-4">
                  <h2 className="text-lg font-semibold">{t("friendlyLinksManagement") || "Friendly Links Management"}</h2>
                  <p className="text-sm text-muted-foreground">{t("friendlyLinksDesc") || "Manage friendly links displayed on the Friends page"}</p>
                </div>
                <div className="p-6">
                  <FriendlyLinkManager links={friendlyLinks} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="backlink-db" className="space-y-4">
              <div className="rounded-xl border bg-card">
                <div className="border-b bg-muted/50 p-4">
                  <h2 className="text-lg font-semibold">{t("backlinkResourcesManagement") || "Backlink Resources Management"}</h2>
                  <p className="text-sm text-muted-foreground">{t("backlinkResourcesDesc") || "Manage SEO backlink resources"}</p>
                </div>
                <div className="p-6">
                  <BacklinkResourceManager resources={backlinkResources} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Container>
    </Section>
  );
}


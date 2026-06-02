import { db } from "@/db/client";
import { bookmarks, categories, collections, collectionItems, friendlyLinks, backlinkResources } from "@/db/schema";
import { eq, asc, desc, inArray, or } from "drizzle-orm";

export type Bookmark = typeof bookmarks.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Collection = typeof collections.$inferSelect;
export type CollectionItem = typeof collectionItems.$inferSelect;
export type FriendlyLink = typeof friendlyLinks.$inferSelect;

// Tree node with children
export type CategoryTreeNode = Category & { children: CategoryTreeNode[] };

/** Build a category tree from a flat list */
export function buildCategoryTree(allCats: Category[]): CategoryTreeNode[] {
  const map = new Map<number, CategoryTreeNode>();
  const roots: CategoryTreeNode[] = [];

  for (const cat of allCats) {
    map.set(cat.id, { ...cat, children: [] });
  }
  for (const cat of allCats) {
    const node = map.get(cat.id)!;
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

/** Get all descendant category IDs (including the parent itself) */
export function getChildCategoryIds(parentId: number, allCats: Category[]): number[] {
  const ids: number[] = [parentId];
  const children = allCats.filter(c => c.parentId === parentId);
  for (const child of children) {
    ids.push(...getChildCategoryIds(child.id, allCats));
  }
  return ids;
}

export async function getAllBookmarks(): Promise<(Bookmark & { category: Category | null })[]> {
  const results = await db
    .select()
    .from(bookmarks)
    .leftJoin(categories, eq(bookmarks.categoryId, categories.id));
  
  return results.map(row => ({
    ...row.bookmarks,
    category: row.categories,
  }));
}

/** Get all categories sorted by sortOrder, then id */
export async function getAllCategories(): Promise<Category[]> {
  return await db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.id));
}

/** Get category tree (flat list + tree structure) */
export async function getCategoryTree(): Promise<{ flat: Category[]; tree: CategoryTreeNode[] }> {
  const flat = await getAllCategories();
  const tree = buildCategoryTree(flat);
  return { flat, tree };
}

/** Get bookmarks belonging to a category AND all its descendants */
export async function getBookmarksByCategorySlug(
  slug: string
): Promise<{ category: Category | null; bookmarks: (Bookmark & { category: Category | null })[] }> {
  const allCats = await getAllCategories();
  const category = allCats.find(c => c.slug === slug) || null;
  if (!category) return { category: null, bookmarks: [] };

  const childIds = getChildCategoryIds(category.id, allCats);
  const allBookmarks = await getAllBookmarks();
  const filtered = allBookmarks.filter(b => b.categoryId && childIds.includes(b.categoryId));
  return { category, bookmarks: filtered };
}

export async function getBookmarkById(id: number): Promise<(Bookmark & { category: Category | null }) | null> {
  const results = await db
    .select()
    .from(bookmarks)
    .leftJoin(categories, eq(bookmarks.categoryId, categories.id))
    .where(eq(bookmarks.id, id))
    .limit(1);
  
  if (results.length === 0) {
    return null;
  }

  return {
    ...results[0].bookmarks,
    category: results[0].categories,
  };
}

export async function getBookmarkBySlug(slug: string): Promise<(Bookmark & { category: Category | null }) | null> {
  const results = await db
    .select()
    .from(bookmarks)
    .leftJoin(categories, eq(bookmarks.categoryId, categories.id))
    .where(eq(bookmarks.slug, slug))
    .limit(1);
  
  if (results.length === 0) {
    return null;
  }

  return {
    ...results[0].bookmarks,
    category: results[0].categories,
  };
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const results = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  
  if (results.length === 0) {
    return null;
  }

  return results[0];
}

export async function getCategoryById(id: number): Promise<Category | null> {
  const results = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);
  
  if (results.length === 0) {
    return null;
  }

  return results[0];
}

// Get featured bookmarks (isFavorite = true)
export async function getFeaturedBookmarks(limit: number = 4): Promise<(Bookmark & { category: Category | null })[]> {
  const results = await db
    .select()
    .from(bookmarks)
    .leftJoin(categories, eq(bookmarks.categoryId, categories.id))
    .where(eq(bookmarks.isFavorite, true))
    .limit(limit);
  
  return results.map(row => ({
    ...row.bookmarks,
    category: row.categories,
  }));
}

// Get recommended bookmarks (isRecommended = true)
export async function getRecommendedBookmarks(limit: number = 8): Promise<(Bookmark & { category: Category | null })[]> {
  const results = await db
    .select()
    .from(bookmarks)
    .leftJoin(categories, eq(bookmarks.categoryId, categories.id))
    .where(eq(bookmarks.isRecommended, true))
    .orderBy(desc(bookmarks.updatedAt))
    .limit(limit);
  
  return results.map(row => ({
    ...row.bookmarks,
    category: row.categories,
  }));
}

// Get latest bookmarks ordered by creation date
export async function getLatestBookmarks(limit: number = 30): Promise<(Bookmark & { category: Category | null })[]> {
  const results = await db
    .select()
    .from(bookmarks)
    .leftJoin(categories, eq(bookmarks.categoryId, categories.id))
    .orderBy(desc(bookmarks.createdAt))
    .limit(limit);
  
  return results.map(row => ({
    ...row.bookmarks,
    category: row.categories,
  }));
}

// ========== Collections ==========

export async function getAllCollections(): Promise<Collection[]> {
  return await db.select().from(collections).orderBy(desc(collections.createdAt));
}

export async function getCollectionBySlug(slug: string): Promise<{ collection: Collection | null; items: CollectionItem[] }> {
  const results = await db.select().from(collections).where(eq(collections.slug, slug)).limit(1);
  if (results.length === 0) return { collection: null, items: [] };
  const items = await db.select().from(collectionItems)
    .where(eq(collectionItems.collectionId, results[0].id))
    .orderBy(asc(collectionItems.sortOrder));
  return { collection: results[0], items };
}

// ========== Friendly Links ==========

export async function getAllFriendlyLinks(): Promise<FriendlyLink[]> {
  return db.select().from(friendlyLinks).orderBy(asc(friendlyLinks.sortOrder), asc(friendlyLinks.id));
}

export type BacklinkResource = typeof backlinkResources.$inferSelect;

export async function getAllBacklinkResources(): Promise<BacklinkResource[]> {
  return db.select().from(backlinkResources).orderBy(desc(backlinkResources.drScore), asc(backlinkResources.sortOrder));
}

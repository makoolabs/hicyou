"use server";

import { db } from "@/db/client";
import { bookmarks, categories, collections, collectionItems, friendlyLinks, backlinkResources } from "@/db/schema";
import { generateSlug } from "@/lib/utils";
import { getProductContext } from "@/lib/tavily";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type ActionState = {
  success?: boolean;
  error?: string;
  message?: string;
  data?: any;
  progress?: {
    current: number;
    total: number;
    currentUrl?: string;
    lastAdded?: string;
  };
};

type BookmarkData = {
  title: string;
  description: string;
  url: string;
  overview: string;
  whyStartups?: string | null;
  alternatives?: string | null;
  pricingType?: string;
  search_results: string;
  favicon: string;
  ogImage: string;
  slug: string;
  categoryId: number | null;
  isFavorite: boolean;
  isRecommended: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  keyFeatures?: any;
  useCases?: any;
  faqs?: any;
};

type GeneratedContent = {
  title: string;
  description: string;
  url: string;
  overview: string;
  search_results: string;
  favicon: string;
  ogImage: string;
  slug: string;
  keyFeatures?: string[];
  useCases?: string[];
  faqs?: { question: string; answer: string }[];
  error?: string;
};

// Category Actions
export async function createCategory(
  prevState: ActionState | null,
  formData: {
    name: string;
    description: string;
    slug: string;
    color: string;
    icon: string;
    parentId?: number | null;
    defaultExpanded?: boolean;
  },
): Promise<ActionState> {
  try {
    const name = formData.name;
    const description = formData.description;
    const slug = formData.slug;
    const color = formData.color;
    const icon = formData.icon;
    const parentId = formData.parentId || null;
    const defaultExpanded = formData.defaultExpanded || false;

    // Don't manually set id - let database auto-increment
    await db.insert(categories).values({
      name,
      description,
      slug,
      color,
      icon,
      parentId,
      defaultExpanded,
    });

    revalidatePath("/hi-studio");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Error creating category:", err);
    return { error: "Failed to create category" };
  }
}

export async function updateCategory(
  prevState: ActionState | null,
  formData: {
    id: string;
    name: string;
    description: string;
    slug: string;
    color: string;
    icon: string;
    parentId?: number | null;
    defaultExpanded?: boolean;
  },
): Promise<ActionState> {
  try {
    if (!formData) {
      return { error: "No form data provided" };
    }

    const id = formData.id;
    if (!id) {
      return { error: "No category ID provided" };
    }

    // Convert id to number for database
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) {
      return { error: "Invalid category ID" };
    }

    const name = formData.name;
    const description = formData.description;
    const slug = formData.slug;
    const color = formData.color;
    const icon = formData.icon;
    const parentId = formData.parentId ?? null;
    const defaultExpanded = formData.defaultExpanded ?? false;

    await db
      .update(categories)
      .set({
        name,
        description,
        slug,
        color,
        icon,
        parentId,
        defaultExpanded,
      })
      .where(eq(categories.id, categoryId));

    revalidatePath("/hi-studio");
    revalidatePath("/");

    return { success: true };
  } catch (err) {
    console.error("Error updating category:", err);
    return { error: "Failed to update category" };
  }
}

export async function deleteCategory(
  prevState: ActionState | null,
  formData: {
    id: string;
  },
): Promise<ActionState> {
  try {
    if (!formData) {
      return { error: "No form data provided" };
    }

    const id = formData.id;
    if (!id) {
      return { error: "No category ID provided" };
    }

    // Convert id to number for database
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) {
      return { error: "Invalid category ID" };
    }

    await db.delete(categories).where(eq(categories.id, categoryId));

    revalidatePath("/hi-studio");
    revalidatePath("/");

    return { success: true };
  } catch (err) {
    console.error("Error deleting category:", err);
    return { error: "Failed to delete category" };
  }
}

export async function updateCategoriesOrder(
  prevState: ActionState | null,
  formData: {
    categories: Array<{ id: number; sortOrder: number }>;
  },
): Promise<ActionState> {
  try {
    if (!formData || !formData.categories) {
      return { error: "No categories data provided" };
    }

    // Batch update category sort order
    for (const category of formData.categories) {
      await db
        .update(categories)
        .set({ sortOrder: category.sortOrder })
        .where(eq(categories.id, category.id));
    }

    revalidatePath("/hi-studio");
    revalidatePath("/");
    revalidatePath("/c");

    return { success: true, message: "Categories order updated successfully" };
  } catch (err) {
    console.error("Error updating categories order:", err);
    return { error: "Failed to update categories order" };
  }
}

// Bookmark Actions
export async function createBookmark(
  prevState: ActionState | null,
  formData: {
    title: string;
    description: string;
    url: string;
    slug: string;
    overview: string;
    whyStartups: string;
    alternatives: string;
    pricingType: string;
    favicon: string;
    ogImage: string;
    search_results: string;
    categoryId: string;
    isFavorite: string;
    isRecommended: string;
    isArchived: string;
    isDofollow: string;
    keyFeatures?: string;
    useCases?: string;
    faqs?: string;
  },
): Promise<ActionState> {
  try {
    const title = formData.title;
    const description = formData.description;
    const url = formData.url;
    let slug = formData.slug;
    const overview = formData.overview;
    const whyStartups = formData.whyStartups || null;
    const alternatives = formData.alternatives || null;
    const pricingType = formData.pricingType || "Paid";
    const favicon = formData.favicon;
    const ogImage = formData.ogImage;
    const search_results = formData.search_results;
    const categoryId = formData.categoryId;
    const isFavorite = formData.isFavorite === "true";
    const isRecommended = formData.isRecommended === "true";
    const isArchived = formData.isArchived === "true";
    const isDofollow = formData.isDofollow === "true";
    const keyFeatures = formData.keyFeatures ? JSON.parse(formData.keyFeatures as string) : [];
    const useCases = formData.useCases ? JSON.parse(formData.useCases as string) : [];
    const faqs = formData.faqs ? JSON.parse(formData.faqs as string) : [];

    // Generate slug if not provided
    if (!slug) {
      slug = generateSlug(title);
    }

    await db.insert(bookmarks).values({
      title,
      slug,
      url,
      description,
      overview,
      whyStartups,
      alternatives,
      pricingType,
      categoryId: categoryId === "none" ? null : parseInt(categoryId, 10),
      search_results: search_results || null,
      isFavorite,
      isRecommended,
      isArchived,
      isDofollow,
      favicon,
      ogImage,
      keyFeatures,
      useCases,
      faqs,
    });

    revalidatePath("/hi-studio");
    revalidatePath("/");

    return { success: true };
  } catch (err) {
    console.error("Error creating bookmark:", err);
    return { error: "Failed to create bookmark" };
  }
}

export async function updateBookmark(
  prevState: ActionState | null,
  formData: {
    id: string;
    title: string;
    description: string;
    url: string;
    slug: string;
    overview: string;
    whyStartups: string;
    alternatives: string;
    pricingType: string;
    favicon: string;
    ogImage: string;
    search_results: string;
    categoryId: string;
    isFavorite: string;
    isRecommended: string;
    isArchived: string;
    isDofollow: string;
    keyFeatures?: string;
    useCases?: string;
    faqs?: string;
  },
): Promise<ActionState> {
  try {
    if (!formData) {
      return { error: "No form data provided" };
    }

    const id = formData.id;
    if (!id) {
      return { error: "No bookmark ID provided" };
    }

    const title = formData.title;
    const description = formData.description;
    const url = formData.url;
    let slug = formData.slug;
    const overview = formData.overview;
    const whyStartups = formData.whyStartups || null;
    const alternatives = formData.alternatives || null;
    const pricingType = formData.pricingType || "Paid";
    const favicon = formData.favicon;
    const ogImage = formData.ogImage;
    const search_results = formData.search_results;
    const categoryId = formData.categoryId;
    const isFavorite = formData.isFavorite === "true";
    const isRecommended = formData.isRecommended === "true";
    const isArchived = formData.isArchived === "true";
    const isDofollow = formData.isDofollow === "true";
    const keyFeatures = formData.keyFeatures ? JSON.parse(formData.keyFeatures as string) : undefined;
    const useCases = formData.useCases ? JSON.parse(formData.useCases as string) : undefined;
    const faqs = formData.faqs ? JSON.parse(formData.faqs as string) : undefined;

    // Generate slug if not provided
    if (!slug) {
      slug = generateSlug(title);
    }

    await db
      .update(bookmarks)
      .set({
        title,
        slug,
        url,
        description,
        overview,
        whyStartups,
        alternatives,
        pricingType,
        categoryId: categoryId === "none" ? null : parseInt(categoryId, 10),
        search_results: search_results || null,
        favicon,
        ogImage,
        isFavorite,
        isRecommended,
        isArchived,
        isDofollow,
        ...(keyFeatures !== undefined && { keyFeatures }),
        ...(useCases !== undefined && { useCases }),
        ...(faqs !== undefined && { faqs }),
      })
      .where(eq(bookmarks.id, Number(id)));

    revalidatePath("/hi-studio");
    revalidatePath("/");

    return { success: true };
  } catch (err) {
    console.error("Error updating bookmark:", err);
    return { error: "Failed to update bookmark" };
  }
}

export async function deleteBookmark(
  prevState: ActionState | null,
  formData: {
    id: string;
    url: string;
  },
): Promise<ActionState> {
  try {
    if (!formData) {
      return { error: "No form data provided" };
    }

    const id = formData.id;
    if (!id) {
      return { error: "No bookmark ID provided" };
    }

    const url = formData.url;

    await db.delete(bookmarks).where(eq(bookmarks.id, Number(id)));

    revalidatePath("/hi-studio");
    revalidatePath("/");
    revalidatePath(`/${encodeURIComponent(url)}`);

    return { success: true };
  } catch (err) {
    console.error("Error deleting bookmark:", err);
    return { error: "Failed to delete bookmark" };
  }
}

// Helper function to handle errors
type ErrorResponse = {
  message: string;
  status: number;
};

export async function handleError(
  error: Error | ErrorResponse,
): Promise<{ message: string }> {
  if (error instanceof Error) {
    return { message: error.message };
  } else {
    return { message: error.message };
  }
}

export async function bulkUploadBookmarks(
  prevState: ActionState | null,
  formData: {
    urls: string;
  },
): Promise<ActionState> {
  try {
    const urls = formData.urls;
    if (!urls) {
      return { error: "No URLs provided" };
    }

    const urlList = urls.split("\n").filter((url) => url.trim());
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < urlList.length; i++) {
      const url = urlList[i].trim();
      if (!url) continue;

      try {
        const content = await generateContent(url);
        if (content.error) {
          errorCount++;
          continue;
        }

        // Create bookmark data with proper types
        const bookmarkData: BookmarkData = {
          title: content.title,
          description: content.description,
          url: content.url,
          overview: content.overview,
          search_results: content.search_results,
          favicon: content.favicon,
          ogImage: content.ogImage,
          slug: content.slug,
          categoryId: null,
          isFavorite: false,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.insert(bookmarks).values(bookmarkData);

        successCount++;
        revalidatePath("/hi-studio");
        revalidatePath("/[slug]");

        // Return progress update
        return {
          success: true,
          progress: {
            current: i + 1,
            total: urlList.length,
            lastAdded: content.title,
          },
        };
      } catch (error) {
        errorCount++;
        console.error(`Error processing URL ${url}:`, error);
      }
    }

    return {
      success: true,
      message: `Successfully imported ${successCount} bookmarks. ${errorCount > 0 ? `Failed to import ${errorCount} URLs.` : ""}`,
      progress: {
        current: urlList.length,
        total: urlList.length,
      },
    };
  } catch (error) {
    console.error("Error in bulk upload:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to process bulk upload",
    };
  }
}

// URL Scraping Action
export async function scrapeUrl(
  prevState: ActionState | null,
  formData: {
    url: string;
  },
): Promise<ActionState> {
  try {
    const url = formData.url;
    if (!url) return { error: "URL is required" };

    // Get metadata from our API
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "";

    const metadataResponse = await fetch(
      `${baseUrl}/api/metadata?url=${encodeURIComponent(url)}`,
      {
        method: "GET",
      },
    );

    if (!metadataResponse.ok) {
      throw new Error("Failed to fetch metadata");
    }

    const metadata = await metadataResponse.json();

    // Get page content using Jina Reader API (free, no key required)
    let searchResults: any = null;
    try {
      const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
      const jinaResponse = await fetch(jinaUrl, {
        headers: { "Accept": "text/markdown" },
        signal: AbortSignal.timeout(15000),
      });
      if (jinaResponse.ok) {
        searchResults = { content: await jinaResponse.text() };
      }
    } catch (e) {
      console.warn("Jina Reader failed, continuing without:", e);
    }

    return {
      success: true,
      data: {
        title: metadata.title || "",
        description: metadata.description || "",
        favicon: metadata.favicon || "",
        ogImage: metadata.ogImage || "",
        url: metadata.url || url,
        search_results: JSON.stringify(searchResults),
      },
    };
  } catch (error) {
    console.error("Error scraping URL:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to scrape URL",
    };
  }
}

export async function generateContent(url: string, locale?: string): Promise<GeneratedContent> {
  try {
    if (!url) {
      throw new Error("URL is required");
    }

    // Get the base URL for the API
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL // Add support for custom domain
        ? process.env.NEXT_PUBLIC_SITE_URL
        : process.env.NODE_ENV === "development"
          ? "http://localhost:3000"
          : ""; // Empty string will make the fetch relative to current origin

    // Use relative URL if baseUrl is empty (will use current origin)
    const metadataUrl = baseUrl
      ? `${baseUrl}/api/metadata?url=${encodeURIComponent(url)}`
      : `/api/metadata?url=${encodeURIComponent(url)}`;

    // Step 1: Fetch metadata (title, favicon, ogImage, description)
    console.log("Fetching metadata for:", url);
    const metadataResponse = await fetch(metadataUrl, {
      method: "GET",
    });

    if (!metadataResponse.ok) {
      const errorData = await metadataResponse.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch metadata");
    }

    const metadata = await metadataResponse.json();
    console.log("Metadata fetched:", {
      title: metadata.title,
      hasDescription: !!metadata.description,
      hasFavicon: !!metadata.favicon,
      hasOgImage: !!metadata.ogImage,
    });

    // Step 2: Get page content using Jina Reader (free, no key required)
    let searchResults: any = null;
    let searchResultsStr = "";

    try {
      const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
      const jinaResponse = await fetch(jinaUrl, {
        headers: { "Accept": "text/markdown" },
        signal: AbortSignal.timeout(15000),
      });
      if (jinaResponse.ok) {
        searchResults = { content: await jinaResponse.text() };
        searchResultsStr = JSON.stringify(searchResults);
        console.log("Jina Reader content obtained");

        // Step 2.5: Tavily AI Search for real-time web context (anti-hallucination)
        try {
          const tavilyContext = await getProductContext(metadata.title, url);
          if (tavilyContext) {
            // Merge Tavily context with Jina content
            searchResultsStr = JSON.stringify({
              ...searchResults,
              tavily: tavilyContext,
            });
            console.log(`Tavily context added: ${tavilyContext.length} chars`);
          }
        } catch (tavilyError) {
          console.warn("Tavily search failed, continuing without it:", tavilyError);
        }
      }
    } catch (jinaError) {
      console.warn("Jina Reader failed, continuing without it:", jinaError);
    }

    // Step 3: Generate tagline and description using AI
    console.log("Generating AI content...");
    const generateUrl = baseUrl ? `${baseUrl}/api/generate` : `/api/generate`;

    const generateResponse = await fetch(generateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url,
        title: metadata.title,
        metaDescription: metadata.description,
        searchResults: searchResultsStr,
        locale: locale || "en",
      }),
    });

    let tagline = "";
    let description = "";
    let keyFeatures: string[] = [];
    let useCases: string[] = [];
    let faqs: { question: string; answer: string }[] = [];

    if (generateResponse.ok) {
      const generatedData = await generateResponse.json();
      console.log("AI content generated:", {
        hasTagline: !!generatedData.tagline,
        hasDescription: !!generatedData.description,
      });

      tagline = generatedData.tagline || metadata.description || "";
      description = generatedData.description || metadata.description || "";
      keyFeatures = generatedData.keyFeatures || [];
      useCases = generatedData.useCases || [];
      faqs = generatedData.faqs || [];
    } else {
      console.warn("AI generation failed, using metadata description");
      tagline = metadata.description?.substring(0, 120) || "";
      description = metadata.description || "";
    }

    // Generate a slug from the title
    const slug = generateSlug(metadata.title || "");

    return {
      title: metadata.title || "",
      description: tagline, // Tagline goes to description field (for list view)
      url: metadata.url || url,
      overview: description, // Full description goes to overview field (for detail page)
      search_results: searchResultsStr,
      favicon: metadata.favicon || "", // Logo from favicon
      ogImage: metadata.ogImage || "", // Cover from OG image
      slug: slug,
      keyFeatures,
      useCases,
      faqs,
    };
  } catch (error) {
    console.error("Error generating content:", error);
    return {
      title: "",
      description: "",
      url: url,
      overview: "",
      search_results: "",
      favicon: "",
      ogImage: "",
      slug: "",
      error:
        error instanceof Error ? error.message : "Failed to generate content",
    };
  }
}

/**
 * Import bookmarks from JSON data
 */
export async function importBookmarksFromJSON(
  prevState: ActionState | null,
  formData: {
    jsonData: string;
    categoryId: string;
  },
): Promise<ActionState> {
  try {
    const { jsonData, categoryId: categoryIdStr } = formData;

    if (!jsonData) {
      return { error: "No JSON data provided" };
    }

    if (!categoryIdStr || categoryIdStr === "none") {
      return { error: "Please select a category" };
    }

    // Convert categoryId to number
    const categoryId = parseInt(categoryIdStr, 10);
    if (isNaN(categoryId)) {
      return { error: "Invalid category ID" };
    }

    // Parse JSON
    let bookmarksArray: any[];
    try {
      bookmarksArray = JSON.parse(jsonData);
    } catch (parseError) {
      return { error: "Invalid JSON format. Please check your JSON syntax." };
    }

    if (!Array.isArray(bookmarksArray)) {
      return { error: "JSON must be an array of bookmark objects" };
    }

    if (bookmarksArray.length === 0) {
      return { error: "No bookmarks found in JSON" };
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < bookmarksArray.length; i++) {
      const item = bookmarksArray[i];

      try {
        // Validate required fields
        if (!item.url || !item.title) {
          errors.push(`Item ${i + 1}: Missing required fields (url, title)`);
          errorCount++;
          continue;
        }

        // Generate slug from title
        const slug = generateSlug(item.title);

        // Prepare bookmark data
        // Supported fields: url, title, tagline, description, logo_url, cover_url, whyStartups/why_startups, alternatives, pricingType/pricing_type
        // Map JSON fields to database fields:
        // - tagline -> description (for list view, short intro)
        // - description -> overview (for detail page, full description)
        // - logo_url -> favicon (logo image)
        // - cover_url -> ogImage (cover image)
        // - whyStartups/why_startups -> whyStartups (optional)
        // - alternatives -> alternatives (optional)
        // - pricingType/pricing_type -> pricingType (default: Paid)
        const bookmarkData: BookmarkData = {
          title: item.title,
          description: item.tagline || "", // Tagline for list view
          url: item.url,
          overview: item.description || "", // Description for detail page
          whyStartups: item.whyStartups || item.why_startups || null, // Support both camelCase and snake_case
          alternatives: item.alternatives || null, // Optional
          pricingType: item.pricingType || item.pricing_type || "Paid", // Support both camelCase and snake_case, default: Paid
          search_results: "",
          favicon: item.logo_url || "", // Only use logo_url
          ogImage: item.cover_url || "", // Only use cover_url
          slug: slug,
          categoryId: categoryId,
          isFavorite: false,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Insert into database
        await db.insert(bookmarks).values(bookmarkData);

        successCount++;
      } catch (error) {
        errorCount++;
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        errors.push(`Item ${i + 1} (${item.title || "Untitled"}): ${errorMsg}`);
        console.error(`Error importing bookmark ${i + 1}:`, error);
      }
    }

    // Revalidate paths
    revalidatePath("/hi-studio");
    revalidatePath("/");

    // Return results
    if (successCount === 0) {
      return {
        error: `Failed to import all bookmarks. Errors: ${errors.join("; ")}`,
      };
    } else if (errorCount > 0) {
      return {
        success: true,
        message: `Imported ${successCount} bookmarks. ${errorCount} failed. Errors: ${errors.slice(0, 3).join("; ")}${errors.length > 3 ? "..." : ""}`,
      };
    } else {
      return {
        success: true,
        message: `Successfully imported ${successCount} bookmarks!`,
      };
    }
  } catch (error) {
    console.error("Error in importBookmarksFromJSON:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to import bookmarks",
    };
  }
}

// ========== Collection Actions ==========

export async function createCollection(
  prevState: ActionState | null,
  formData: { title: string; description: string; slug: string; coverImage?: string },
): Promise<ActionState> {
  try {
    await db.insert(collections).values({
      title: formData.title,
      description: formData.description,
      slug: formData.slug || generateSlug(formData.title),
      coverImage: formData.coverImage || null,
    });
    revalidatePath("/hi-studio");
    revalidatePath("/collections");
    return { success: true };
  } catch (err) {
    console.error("Error creating collection:", err);
    return { error: "Failed to create collection" };
  }
}

export async function updateCollection(
  prevState: ActionState | null,
  formData: { id: string; title: string; description: string; slug: string; coverImage?: string },
): Promise<ActionState> {
  try {
    const id = parseInt(formData.id, 10);
    await db.update(collections).set({
      title: formData.title,
      description: formData.description,
      slug: formData.slug,
      coverImage: formData.coverImage || null,
    }).where(eq(collections.id, id));
    revalidatePath("/hi-studio");
    revalidatePath("/collections");
    return { success: true };
  } catch (err) {
    console.error("Error updating collection:", err);
    return { error: "Failed to update collection" };
  }
}

export async function deleteCollection(
  prevState: ActionState | null,
  formData: { id: string },
): Promise<ActionState> {
  try {
    const id = parseInt(formData.id, 10);
    await db.delete(collectionItems).where(eq(collectionItems.collectionId, id));
    await db.delete(collections).where(eq(collections.id, id));
    revalidatePath("/hi-studio");
    revalidatePath("/collections");
    return { success: true };
  } catch (err) {
    console.error("Error deleting collection:", err);
    return { error: "Failed to delete collection" };
  }
}

export async function addCollectionItem(
  prevState: ActionState | null,
  formData: { collectionId: string; title: string; url: string; description?: string },
): Promise<ActionState> {
  try {
    const collectionId = parseInt(formData.collectionId, 10);
    const maxOrder = await db.select().from(collectionItems)
      .where(eq(collectionItems.collectionId, collectionId))
      .orderBy(asc(collectionItems.sortOrder));
    const nextOrder = maxOrder.length > 0 ? (maxOrder[maxOrder.length - 1].sortOrder || 0) + 1 : 0;
    await db.insert(collectionItems).values({
      collectionId,
      title: formData.title,
      url: formData.url,
      description: formData.description || null,
      sortOrder: nextOrder,
    });
    revalidatePath("/hi-studio");
    revalidatePath("/collections");
    return { success: true };
  } catch (err) {
    console.error("Error adding collection item:", err);
    return { error: "Failed to add collection item" };
  }
}

export async function updateCollectionItem(
  prevState: ActionState | null,
  formData: { id: string; title: string; url: string; description?: string },
): Promise<ActionState> {
  try {
    const id = parseInt(formData.id, 10);
    await db.update(collectionItems).set({
      title: formData.title,
      url: formData.url,
      description: formData.description || null,
    }).where(eq(collectionItems.id, id));
    revalidatePath("/hi-studio");
    revalidatePath("/collections");
    return { success: true };
  } catch (err) {
    console.error("Error updating collection item:", err);
    return { error: "Failed to update collection item" };
  }
}

export async function deleteCollectionItem(
  prevState: ActionState | null,
  formData: { id: string },
): Promise<ActionState> {
  try {
    const id = parseInt(formData.id, 10);
    await db.delete(collectionItems).where(eq(collectionItems.id, id));
    revalidatePath("/hi-studio");
    revalidatePath("/collections");
    return { success: true };
  } catch (err) {
    console.error("Error deleting collection item:", err);
    return { error: "Failed to delete collection item" };
  }
}

// ========== Friendly Links ==========

export async function createFriendlyLink(
  prevState: ActionState | null,
  formData: { title: string; url: string; description: string; sortOrder: string },
): Promise<ActionState> {
  try {
    await db.insert(friendlyLinks).values({
      title: formData.title,
      url: formData.url,
      description: formData.description || null,
      sortOrder: parseInt(formData.sortOrder, 10) || 0,
    });
    revalidatePath("/hi-studio");
    revalidatePath("/friendly-links");
    return { success: true };
  } catch (err) {
    console.error("Error creating friendly link:", err);
    return { error: "Failed to create friendly link" };
  }
}

export async function updateFriendlyLink(
  prevState: ActionState | null,
  formData: { id: string; title: string; url: string; description: string; sortOrder: string },
): Promise<ActionState> {
  try {
    const id = parseInt(formData.id, 10);
    await db.update(friendlyLinks).set({
      title: formData.title,
      url: formData.url,
      description: formData.description || null,
      sortOrder: parseInt(formData.sortOrder, 10) || 0,
      updatedAt: new Date(),
    }).where(eq(friendlyLinks.id, id));
    revalidatePath("/hi-studio");
    revalidatePath("/friendly-links");
    return { success: true };
  } catch (err) {
    console.error("Error updating friendly link:", err);
    return { error: "Failed to update friendly link" };
  }
}

export async function deleteFriendlyLink(
  prevState: ActionState | null,
  formData: { id: string },
): Promise<ActionState> {
  try {
    const id = parseInt(formData.id, 10);
    await db.delete(friendlyLinks).where(eq(friendlyLinks.id, id));
    revalidatePath("/hi-studio");
    revalidatePath("/friendly-links");
    return { success: true };
  } catch (err) {
    console.error("Error deleting friendly link:", err);
    return { error: "Failed to delete friendly link" };
  }
}

// ========== Backlink Resources ==========

export async function createBacklinkResource(
  prevState: ActionState | null,
  formData: { name: string; url: string; drScore: string; linkType: string; category: string; cost: string; description: string; sortOrder: string },
): Promise<ActionState> {
  try {
    await db.insert(backlinkResources).values({
      name: formData.name,
      url: formData.url,
      drScore: parseInt(formData.drScore, 10) || 0,
      linkType: formData.linkType || "dofollow",
      category: formData.category || "General",
      cost: formData.cost || "Free",
      description: formData.description || null,
      sortOrder: parseInt(formData.sortOrder, 10) || 0,
    });
    revalidatePath("/hi-studio");
    revalidatePath("/backlink-database");
    return { success: true };
  } catch (err) {
    console.error("Error creating backlink resource:", err);
    return { error: "Failed to create backlink resource" };
  }
}

export async function updateBacklinkResource(
  prevState: ActionState | null,
  formData: { id: string; name: string; url: string; drScore: string; linkType: string; category: string; cost: string; description: string; sortOrder: string },
): Promise<ActionState> {
  try {
    const id = parseInt(formData.id, 10);
    await db.update(backlinkResources).set({
      name: formData.name,
      url: formData.url,
      drScore: parseInt(formData.drScore, 10) || 0,
      linkType: formData.linkType || "dofollow",
      category: formData.category || "General",
      cost: formData.cost || "Free",
      description: formData.description || null,
      sortOrder: parseInt(formData.sortOrder, 10) || 0,
      updatedAt: new Date(),
    }).where(eq(backlinkResources.id, id));
    revalidatePath("/hi-studio");
    revalidatePath("/backlink-database");
    return { success: true };
  } catch (err) {
    console.error("Error updating backlink resource:", err);
    return { error: "Failed to update backlink resource" };
  }
}

export async function deleteBacklinkResource(
  prevState: ActionState | null,
  formData: { id: string },
): Promise<ActionState> {
  try {
    const id = parseInt(formData.id, 10);
    await db.delete(backlinkResources).where(eq(backlinkResources.id, id));
    revalidatePath("/hi-studio");
    revalidatePath("/backlink-database");
    return { success: true };
  } catch (err) {
    console.error("Error deleting backlink resource:", err);
    return { error: "Failed to delete backlink resource" };
  }
}

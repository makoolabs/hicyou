/**
 * Cron endpoint: Auto-discover new tools → quick save → AI enrich in background
 * 
 * GET /api/cron/discover?secret=YOUR_CRON_SECRET
 * GET /api/cron/discover?secret=xxx&enrich=true  (run AI enrichment on un-enriched tools)
 */

import { NextRequest, NextResponse } from "next/server";
import { discoverAll, getCategoryKeywords, classifyTool } from "@/lib/discovery";
import { db } from "@/db/client";
import { bookmarks, categories as catTable } from "@/db/schema";
import { eq, isNull, or } from "drizzle-orm";
import { generateSlug } from "@/lib/utils";

const CRON_SECRET = process.env.CRON_SECRET || "mossgame-cron-2026";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mode = request.nextUrl.searchParams.get("enrich") === "true" ? "enrich" : "discover";

  if (mode === "enrich") {
    return handleEnrich();
  }
  return handleDiscover();
}

/** Step 1: Quick discovery — save basic metadata only (fast, ~5s) */
async function handleDiscover() {
  const results = { added: 0, skipped: 0, errors: [] as string[] };

  try {
    console.log("🔍 Starting discovery...");
    const discovered = await discoverAll(20);
    console.log(`Found ${discovered.length} potential tools`);

    // Check existing URLs
    const allBookmarks = await db.select({ url: bookmarks.url }).from(bookmarks);
    const existingUrls = new Set(
      allBookmarks.map((b) => b.url.replace(/\/$/, "").toLowerCase())
    );

    const newTools = discovered.filter(
      (t) => !existingUrls.has(t.url.replace(/\/$/, "").toLowerCase())
    );
    results.skipped = discovered.length - newTools.length;
    console.log(`${newTools.length} new tools to add`);

    // Quick save — metadata only, auto-classify category
    const catKeywords = await getCategoryKeywords();
    for (const tool of newTools) {
      try {
        const slug = generateSlug(tool.title);
        // Auto-classify: use suggestedCategory from discovery, or run classifyTool
        const catName = tool.suggestedCategory || classifyTool(tool, catKeywords);
        const cat = catName ? catKeywords.find(c => c.name === catName) : null;

        await db.insert(bookmarks).values({
          url: tool.url,
          title: tool.title,
          slug,
          description: tool.description?.substring(0, 200) || "",
          source: tool.source,
          sourceId: tool.sourceId,
          pricingType: "Free",
          overview: tool.description || "",
          categoryId: cat?.id || null,
        });
        results.added++;
        console.log(`  ✅ ${tool.title} → ${catName || "uncategorized"}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown";
        if (!msg.includes("Duplicate")) {
          results.errors.push(`${tool.title}: ${msg}`);
        }
      }
    }

    console.log(`✅ Discovery done: ${results.added} added, ${results.skipped} skipped`);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Discovery failed:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

/** Step 2: AI enrichment — run Tavily+DeepSeek on tools without overview */
async function handleEnrich() {
  const results = { enriched: 0, errors: [] as string[] };

  try {
    // Find bookmarks without AI-generated content (no keyFeatures)
    const unenriched = await db
      .select({ id: bookmarks.id, title: bookmarks.title, url: bookmarks.url })
      .from(bookmarks)
      .where(
        or(
          isNull(bookmarks.keyFeatures),
          eq(bookmarks.keyFeatures, [] as any)
        )
      )
      .limit(10);

    console.log(`🤖 Enriching ${unenriched.length} tools with AI...`);
    results.enriched = unenriched.length;

    // Enrich one at a time (3s apart to respect rate limits)
    for (const bookmark of unenriched) {
      try {
        const { generateContent } = await import("@/lib/actions");
        const content = await generateContent(bookmark.url, "zh");

        if (content.description || content.keyFeatures?.length) {
          await db.update(bookmarks)
            .set({
              overview: content.description || bookmark.title,
              description: content.description?.substring(0, 200) || "",
              keyFeatures: content.keyFeatures || [],
              useCases: content.useCases || [],
              faqs: content.faqs || [],
            })
            .where(eq(bookmarks.id, bookmark.id));
          console.log(`  ✅ ${bookmark.title}`);
        }
        await new Promise((r) => setTimeout(r, 3000));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown";
        results.errors.push(`${bookmark.title}: ${msg}`);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Enrich failed:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

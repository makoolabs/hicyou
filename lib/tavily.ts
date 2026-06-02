/**
 * Tavily AI Search API Client
 * 
 * Tavily is a search engine built for AI agents and LLMs,
 * returning clean, structured, relevant context instead of noisy HTML.
 * 
 * Free tier: 1000 requests/month
 * Docs: https://docs.tavily.com/
 */

const TAVILY_API_KEY = process.env.TAVILY_API_KEY || "";
const TAVILY_BASE_URL = "https://api.tavily.com";

export function isTavilyConfigured(): boolean {
  return !!TAVILY_API_KEY;
}

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

/**
 * Search the web for context about a product/tool.
 * Returns cleaned, AI-friendly text snippets.
 */
export async function tavilySearch(
  query: string,
  options: {
    maxResults?: number;
    searchDepth?: "basic" | "advanced";
    includeDomains?: string[];
  } = {}
): Promise<TavilySearchResult[]> {
  if (!isTavilyConfigured()) {
    console.warn("Tavily API key not configured, skipping search");
    return [];
  }

  const { maxResults = 5, searchDepth = "advanced", includeDomains } = options;

  try {
    const body: Record<string, unknown> = {
      api_key: TAVILY_API_KEY,
      query,
      max_results: maxResults,
      search_depth: searchDepth,
    };
    if (includeDomains?.length) {
      body.include_domains = includeDomains;
    }

    const response = await fetch(`${TAVILY_BASE_URL}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error("Tavily search error:", response.status, await response.text());
      return [];
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Tavily search failed:", error);
    return [];
  }
}

/**
 * Search for a product and format results as context string for AI prompts.
 * Runs 2 parallel searches: product name + product name "review"
 */
export async function getProductContext(
  productName: string,
  productUrl?: string
): Promise<string> {
  if (!isTavilyConfigured()) return "";

  const [generalResults, reviewResults] = await Promise.all([
    tavilySearch(`${productName} tool SaaS features`, { maxResults: 3 }),
    tavilySearch(`${productName} review what is`, { maxResults: 2 }),
  ]);

  // Merge and deduplicate by URL
  const seenUrls = new Set<string>();
  const allResults: TavilySearchResult[] = [];
  for (const r of [...generalResults, ...reviewResults]) {
    if (!seenUrls.has(r.url) && r.url !== productUrl) {
      seenUrls.add(r.url);
      allResults.push(r);
    }
  }

  if (allResults.length === 0) return "";

  // Format as context block for AI prompt
  const contextParts = allResults.map(
    (r, i) =>
      `[Source ${i + 1}] ${r.title}\nURL: ${r.url}\n${r.content}\n`
  );

  return `--- Tavily Search Context ---\n${contextParts.join("\n")}--- End Search Context ---`;
}

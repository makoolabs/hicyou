/**
 * AI Configuration for Content Generation
 * Supports OpenAI-compatible APIs (OpenAI, DeepSeek, Kimi, etc.)
 */

import OpenAI from "openai";

// Get AI configuration from environment variables
const AI_API_KEY = process.env.AI_API_KEY || "";
const AI_BASE_URL = process.env.AI_BASE_URL || "https://api.openai.com/v1";
const AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";

/**
 * Check if AI is configured
 */
export function isAIConfigured(): boolean {
  return !!AI_API_KEY;
}

/**
 * Create OpenAI client with custom configuration
 * Works with any OpenAI-compatible API
 */
export function getAIClient(): OpenAI {
  if (!AI_API_KEY) {
    throw new Error("AI_API_KEY is not configured");
  }

  return new OpenAI({
    apiKey: AI_API_KEY,
    baseURL: AI_BASE_URL,
  });
}

/**
 * Get the configured model name
 */
export function getAIModel(): string {
  return AI_MODEL;
}

/**
 * Generate content using AI
 */
export async function generateAIContent(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const client = getAIClient();
  const model = getAIModel();

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }

  messages.push({ role: "user", content: prompt });

  try {
    const response = await client.chat.completions.create({
      model,
      messages,
      temperature: 0.8,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("AI generation error:", error);
    throw error;
  }
}

/**
 * Generate tagline and description for a website
 */


export async function generateWebsiteContent(params: {
  url: string;
  title: string;
  metaDescription?: string;
  searchResults?: string;
  locale?: string;
}): Promise<{
  tagline: string;
  description: string;
  keyFeatures: string[];
  useCases: string[];
  faqs: { question: string; answer: string }[];
}> {
  const { url, title, metaDescription, searchResults, locale = "en" } = params;

  const langMap: Record<string, string> = {
    en: "English",
    zh: "Chinese (Simplified)",
    ja: "Japanese",
    ko: "Korean",
  };
  const langName = langMap[locale] || "English";

  const systemPrompt = `You are a professional SaaS product analyst. Your job is to write accurate, engaging directory listings for tools and websites.

CRITICAL RULES:
1. All output MUST be in ${langName}.
2. You may receive "Tavily Search Context" — these are real-time web search results about this product. Treat them as your primary source of truth.
3. Synthesize information from the search context. Do NOT invent features or details not supported by the context.
4. If Jina Reader content (raw page markdown) is provided, use it for technical details and factual accuracy.
5. If no search context is available, rely on the Jina Reader content and meta description.
6. Write like a human analyst who has researched this product — engaging, confident, but accurate.
7. High temperature is used deliberately — be creative in wording while staying factually grounded in the provided context.`;

  const userPrompt = `Analyze this product and generate a directory listing.

Website: ${title}
URL: ${url}
${metaDescription ? `Meta Description: ${metaDescription}` : ""}
${searchResults ? `Research Data: ${searchResults}` : ""}
${!searchResults ? "(Note: No research data available. Use the URL and meta description only. Keep it brief.)" : ""}

Generate the following fields in JSON:
1. "tagline": A catchy one-sentence tagline (max 120 chars).
2. "description": A 65-80 word overview. If research data has "Tavily Search Context", synthesize the most relevant findings. If only raw page content is available, summarize the key value proposition.
3. "keyFeatures": An array of 6 key features (short strings, each 3-8 words).
4. "useCases": An array of 3-6 specific use cases (who uses this, and for what).
5. "faqs": An array of 4-6 FAQs with "question" and "answer" fields.

Format your response as valid JSON (no markdown fences):
{
  "tagline": "...",
  "description": "...",
  "keyFeatures": ["...", ...],
  "useCases": ["...", ...],
  "faqs": [{"question": "...", "answer": "..."}, ...]
}`;

  try {
    // Use unified client and model
    const client = getAIClient();
    const model = getAIModel();

    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 4000, // Higher temperature for creative output, grounded by Tavily context
    });

    const content = response.choices[0]?.message?.content || "";
    console.log("AI Response:", content); // Debug log

    // Try to parse JSON response
    // Remove markdown code blocks and any text before/after the JSON object
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : content;

    const result = JSON.parse(jsonString);

    return {
      tagline: result.tagline || "",
      description: result.description || "",
      keyFeatures: result.keyFeatures || [],
      useCases: result.useCases || [],
      faqs: result.faqs || [],
    };
  } catch (error) {
    console.error("Failed to generate website content:", error);

    // Fallback
    return {
      tagline: metaDescription?.substring(0, 120) || "A great website",
      description: metaDescription || "No description available.",
      keyFeatures: [],
      useCases: [],
      faqs: [],
    };
  }
}



/**
 * Auto Discovery — find new tools from public sources, scoped to existing categories
 * 
 * Sources: GitHub Trending repos (free, no API key) + HN "Show HN" (Algolia)
 * Pipeline: Per-Category Search → Dedupe → AI Classify → Save
 */

import { db } from "@/db/client";
import { categories } from "@/db/schema";

const HN_ALGOLIA_API = "https://hn.algolia.com/api/v1";
const GH_SEARCH_API = "https://api.github.com/search/repositories";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const ITCH_API = "https://itch.io/api/1";

// Common headers for GitHub API
function ghHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "MossGame-Discovery/1.0",
  };
  if (GITHUB_TOKEN) h["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
  return h;
}

// ========== Category Keywords (Game Dev focused) ==========

export async function getCategoryKeywords(): Promise<{ id: number; name: string; slug: string; keywords: string[] }[]> {
  const cats = await db.select().from(categories);
  const map: Record<string, string[]> = {
    "开发全流程": ["game development", "gamedev tool", "游戏开发"],
    "立项与市场分析": ["game market research", "steam stats", "竞品分析", "game analytics"],
    "策划与数值设计": ["game design tool", "game balance", "level design", "数值设计"],
    "原型与 MVP 验证": ["game prototype", "game jam tool", "rapid prototyping"],
    "项目管理协作": ["game production", "task tracking", "version control game", "project management gamedev"],
    "美术设计制作": ["game art tool", "pixel art", "3D modeling", "spine animation", "blender plugin", "game animation"],
    "音乐音效制作": ["game audio tool", "FMOD", "Wwise", "sound design game", "SFX"],
    "本地化与全球化": ["game localization", "translation tool game", "i18n gamedev"],
    "程序开发工具": ["game engine", "game framework", "unity plugin", "unreal plugin", "godot tool", "game SDK"],
    "插件与扩展": ["unity asset", "unreal plugin", "godot addon", "game extension"],
    "测试调试优化": ["game testing", "debug tool game", "profiler gamedev", "QA automation"],
    "法律与合规工具": ["game compliance", "COPPA", "age rating", "game copyright"],
    "发行与渠道": ["game publishing", "steam publisher", "game distribution platform"],
    "运营与数据分析": ["game analytics", "player analytics", "live ops", "game backend", "game data"],
    "游戏营销与推广": ["game marketing", "ASO tool", "game trailer", "UA gamedev"],
    "AI 工具集": ["AI game tool", "AI gamedev", "artificial intelligence game"],
    "编码助手": ["AI coding", "code generation gamedev", "AI code review"],
    "美术生成": ["AI art generation", "stable diffusion game", "AI sprite", "AI 3D model", "AI texture"],
    "音频制作": ["AI music generation", "AI sound effect", "AI voice game", "text to speech gamedev"],
    "剧情策划": ["AI storytelling", "AI dialogue", "AI narrative game", "AI quest design"],
    "agents智能体": ["AI agent", "game NPC AI", "autonomous agent", "LLM game"],
    "一站式平台": ["AI game platform", "AI game builder", "AI powered game engine"],
    "基础设施": ["AI inference", "GPU cloud game", "model deployment", "AI API"],
    "游戏素材库": ["game assets", "free game resources", "游戏素材"],
    "源码与模板": ["game template", "game source code", "unity template", "godot project", "unreal starter"],
    "美术素材": ["2D sprites", "3D models free", "game textures", "pixel art pack", "game UI kit"],
    "音乐音效": ["royalty free music", "game SFX", "free sound effects", "game soundtrack", "BGM pack"],
    "字体图标": ["pixel font", "game font", "bitmap font", "game icon pack"],
    "插件资源": ["shader pack", "game plugin free", "unity asset free", "game script"],
    "平台专区": ["game platform", "mobile game dev", "web game platform"],
    "微信小游戏": ["wechat minigame", "微信小游戏", "wechat game tool"],
    "抖音小游戏": ["douyin minigame", "tiktok game", "抖音小游戏"],
    "H5/Web 小游戏": ["HTML5 game", "web game engine", "phaser", "pixi.js", "three.js game", "browser game"],
    "开发者中心": ["game dev resource", "gamedev community", "游戏开发教程"],
    "官方文档": ["game engine docs", "API reference game", "game SDK documentation"],
    "教程与课程": ["game dev tutorial", "unity course", "unreal tutorial", "godot tutorial"],
    "开发者社区": ["game dev forum", "gamedev discord", "indie game community"],
    "实用工具箱": ["sprite sheet packer", "texture atlas tool", "map editor", "tile editor"],
    "即玩小游戏": ["playable online game", "browser game free", "HTML5 game online", "mini game web"],
  };
  return cats.map(c => ({ id: c.id, name: c.name, slug: c.slug, keywords: map[c.name] || [c.name] }));
}

// ========== Category-based Discovery ==========

export async function discoverByCategory(catName: string, catKeywords: string[], limit = 2): Promise<DiscoveredTool[]> {
  const results: DiscoveredTool[] = [];
  const kw = catKeywords.slice(0, 2);

  for (const k of kw) {
    try {
      const q = `${k} stars:>5`;
      const url = `${GH_SEARCH_API}?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=${limit}`;
      const res = await fetch(url, { headers: ghHeaders(), signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const data = await res.json();
      for (const repo of data.items || []) {
        if (repo.archived || repo.fork) continue;
        results.push({
          title: repo.full_name, url: repo.html_url,
          description: repo.description?.substring(0, 200) || "",
          source: "github", sourceId: repo.id.toString(),
          discoveredAt: new Date(repo.pushed_at),
          suggestedCategory: catName,
          metadata: { stars: repo.stargazers_count, language: repo.language, topics: repo.topics },
        });
      }
    } catch { /* skip failed keyword */ }
  }
  return results;
}

// ========== AI Classify ==========

export function classifyTool(
  tool: { title: string; description: string },
  catList: { id: number; name: string; keywords: string[] }[]
): string | null {
  const text = `${tool.title} ${tool.description}`.toLowerCase();
  const scores = catList.map(cat => {
    let s = 0;
    for (const kw of cat.keywords) {
      if (text.includes(kw.toLowerCase())) s += 1;
      if (/[\u4e00-\u9fff]/.test(kw) && text.includes(kw)) s += 2; // Chinese bonus
    }
    return { name: cat.name, id: cat.id, score: s };
  });
  const best = scores.sort((a, b) => b.score - a.score)[0];
  return best.score > 0 ? best.name : null;
}

// ========== Main Discovery ==========

export async function discoverAll(limit = 30): Promise<DiscoveredTool[]> {
  const catKeywords = await getCategoryKeywords();
  const all: DiscoveredTool[] = [];
  const perCat = 2; // 2 per category now with token (higher rate limit)

  // 1. Category-based GitHub search
  const subCats = catKeywords.filter(c => catsHasParent(c));
  const batches = subCats.map(cat => discoverByCategory(cat.name, cat.keywords, perCat));
  const batchResults = await Promise.all(batches);

  // 2. HN Show HN (game-related)
  const hnTools = await discoverHackerNews(5);

  // 3. itch.io game assets
  const itchTools = await discoverItch(5);

  const seen = new Set<string>();
  for (const tools of [...batchResults, [hnTools], [itchTools]]) {
    for (const tool of tools.flat()) {
      const n = tool.url.replace(/\/$/, "").toLowerCase();
      if (seen.has(n)) continue;
      seen.add(n);
      if (!tool.suggestedCategory) {
        tool.suggestedCategory = classifyTool(tool, catKeywords) || undefined;
      }
      all.push(tool);
    }
  }

  all.sort((a, b) => b.discoveredAt.getTime() - a.discoveredAt.getTime());
  console.log(`Discovery: ${all.length} tools from GH(${batchResults.flat().length}) + HN(${hnTools.length}) + itch(${itchTools.length})`);
  return all.slice(0, limit);
}

function catsHasParent(c: { id: number; name: string }): boolean {
  // Quick check: subcategories typically have parentId; here we check IDs: 1-6 are top-level
  const topIds = [1, 2, 3, 4, 5, 6];
  return !topIds.includes(c.id);
}

// HackerNews discovery (kept as supplement)
export async function discoverHackerNews(limit = 10): Promise<DiscoveredTool[]> {
  try {
    const d = new Date(); d.setDate(d.getDate() - 3);
    const ts = Math.floor(d.getTime() / 1000);
    const url = `${HN_ALGOLIA_API}/search?query=${encodeURIComponent('"Show HN" game OR gamedev OR engine OR AI')}&tags=story&numericFilters=created_at_i>${ts}&hitsPerPage=${limit}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const data = await res.json();
    const tools: DiscoveredTool[] = [];
    for (const hit of data.hits || []) {
      const title = (hit.title || "").replace(/^Show HN:\s*/i, "").trim();
      if (title.length < 5) continue;
      tools.push({
        title, url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        description: hit.story_text?.substring(0, 200) || "",
        source: "hackernews", sourceId: hit.objectID,
        discoveredAt: new Date(hit.created_at),
        metadata: { points: hit.points, numComments: hit.num_comments },
      });
    }
    return tools;
  } catch { return []; }
}

// ========== Types ==========

export interface DiscoveredTool {
  title: string;
  url: string;
  description: string;
  source: "github" | "hackernews" | "manual" | "other";
  sourceId: string;
  discoveredAt: Date;
  suggestedCategory?: string;
  metadata?: Record<string, unknown>;
}

// ========== itch.io Discovery (game dev platform) ==========

export async function discoverItch(limit = 10): Promise<DiscoveredTool[]> {
  const results: DiscoveredTool[] = [];
  const tags = ["game-assets", "game-tools", "game-templates"];
  try {
    for (const tag of tags) {
      const url = `https://itch.io/search?q=${tag}&source=game`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) continue;
      const html = await res.text();

      // Extract game cards from itch.io search page
      const cardRegex = /<a[^>]*href="(https:\/\/[^"]+itch\.io[^"]+)"[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/a>/gi;
      let match;
      let count = 0;
      while ((match = cardRegex.exec(html)) !== null && count < limit) {
        const url = match[1];
        const title = match[2]?.trim();
        if (title && !url.includes("/embed") && !url.includes("/devlog")) {
          results.push({
            title: `${title} (itch.io)`,
            url,
            description: `Game dev asset/tool on itch.io`,
            source: "other",
            sourceId: url,
            discoveredAt: new Date(),
            suggestedCategory: "游戏素材库",
          });
          count++;
        }
      }
      if (results.length >= limit) break;
    }
  } catch { /* itch.io parsing can fail */ }
  return results.slice(0, limit);
}

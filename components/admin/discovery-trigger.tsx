"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";

export function DiscoveryTrigger() {
  const t = useTranslations("admin");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"discover" | "enrich">("discover");

  const handleDiscover = async () => {
    setLoading(true);
    try {
      const endpoint = mode === "enrich"
        ? "/api/cron/discover?secret=mossgame-cron-2026&enrich=true"
        : "/api/cron/discover?secret=mossgame-cron-2026";

      const res = await fetch(endpoint);
      const data = await res.json();
      if (res.ok) {
        if (mode === "discover") {
          toast.success(`发现完成！新增 ${data.added} 个，跳过 ${data.skipped} 个。点击「AI 补全」生成详细内容`);
        } else {
          toast.success(`AI 补全完成！已处理 ${data.enriched} 个工具`);
        }
      } else {
        toast.error(data.error || "请求失败");
      }
    } catch {
      toast.error("请求失败，请检查网络");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => { setMode("discover"); handleDiscover(); }}
        disabled={loading}
      >
        <Sparkles className={`h-4 w-4 ${loading && mode === "discover" ? "animate-spin" : ""}`} />
        {loading && mode === "discover" ? t("discovering") : t("discover")}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => { setMode("enrich"); handleDiscover(); }}
        disabled={loading}
        title="AI 补全内容"
      >
        <Zap className={`h-4 w-4 ${loading && mode === "enrich" ? "animate-spin" : ""}`} />
      </Button>
    </div>
  );
}

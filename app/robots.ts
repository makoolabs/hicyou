import { MetadataRoute } from "next";
import { directory } from "@/directory.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/hi-studio/", "/account/", "/api/"],
    },
    sitemap: `${directory.baseUrl}/sitemap.xml`,
  };
}

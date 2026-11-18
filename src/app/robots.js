import { headers } from "next/headers";

const OFFICIAL_DOMAINS = ["zachipka.if.ua", "www.zachipka.if.ua"];
const SITE_URL = "https://zachipka.if.ua";

export default async function robots() {
  const headersList = await headers();
  const host = headersList.get("host")?.split(":")[0] || "";

  // For testing / staging deployments without the production domain: block all search engine indexing
  const isProductionDomain = OFFICIAL_DOMAINS.includes(host);

  if (!isProductionDomain) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: "/",
        },
      ],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

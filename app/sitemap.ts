import type { MetadataRoute } from "next";
import { categories } from "@/config/site";
import { getAllProductSlugs } from "@/lib/db/products";
import { siteConfig } from "@/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const productSlugs = await getAllProductSlugs();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base,             lastModified: new Date(), changeFrequency: "daily",   priority: 1 },
    { url: `${base}/shop`,   lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${base}/about`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url:              `${base}/category/${cat.slug}`,
    lastModified:     new Date(),
    changeFrequency:  "weekly" as const,
    priority:         0.8,
  }));

  const productPages: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url:              `${base}/product/${slug}`,
    lastModified:     new Date(),
    changeFrequency:  "weekly" as const,
    priority:         0.7,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}

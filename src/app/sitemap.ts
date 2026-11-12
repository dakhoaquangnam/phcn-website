import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/revita";
import { SITE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");
  const routes = ["", "/dich-vu", "/bac-si", "/dat-lich", "/bai-viet", "/tra-cuu"].map(
    (p) => ({ url: `${base}${p || "/"}`, lastModified: new Date() }),
  );
  const posts = await getPosts(100).catch(() => []);
  const postRoutes = posts.map((p) => ({
    url: `${base}/bai-viet/${p.slug}`,
    lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(),
  }));
  return [...routes, ...postRoutes];
}

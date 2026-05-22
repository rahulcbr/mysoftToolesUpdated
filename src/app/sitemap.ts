import { MetadataRoute } from "next";
import { TOOLS } from "@/utils/toolsRegistry";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://mysofttools.com";

  // Base routes
  const baseRoutes = [
    "",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/dmca",
    "/blog",
    "/blog/client-side-utility-privacy",
    "/image-tools",
    "/pdf-tools",
    "/text-tools",
    "/calculators",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Tool routes from toolsRegistry
  const toolRoutes = TOOLS.map((tool) => ({
    url: `${baseUrl}${tool.path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: tool.isPopular ? 0.9 : 0.7,
  }));

  return [...baseRoutes, ...toolRoutes];
}

import { getCachedPastEvents } from "@/lib/cachedData";

const SITE_URL = ("https://zachipka.if.ua").replace(/\/$/, "");

export default async function sitemap() {
  const now = new Date();

  const staticRoutes = [
    {
      url: `${SITE_URL}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/climbing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/training`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/events`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/find-us`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contacts`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  let eventRoutes = [];
  try {
    const pastEvents = await getCachedPastEvents();
    const activePastEvents = pastEvents.filter((event) => event.isFeatured && event.coverImage && event.slug);

    eventRoutes = activePastEvents.map((event) => ({
      url: `${SITE_URL}/events/${event.slug}`,
      lastModified: event.updatedAt || event.eventDate || now,
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Помилка генерації sitemap для подій:", error);
  }

  return [...staticRoutes, ...eventRoutes];
}

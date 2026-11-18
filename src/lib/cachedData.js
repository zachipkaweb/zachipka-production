import { unstable_cache } from "next/cache";
import { getTeam } from "./team.js";
import { getTrainingPrices } from "./prices.js";
import { getEvents, getPastEventBySlug } from "./events.js";

export const getCachedTeam = unstable_cache(
  async () => getTeam(),
  ["public-team-list"],
  { tags: ["team"], revalidate: 300 }
);

export const getCachedTrainingPrices = unstable_cache(
  async () => getTrainingPrices({ includeInactive: false }),
  ["public-training-prices"],
  { tags: ["prices"], revalidate: 300 }
);

export const getCachedUpcomingEvents = unstable_cache(
  async () => getEvents("upcoming"),
  ["public-upcoming-events"],
  { tags: ["events"], revalidate: 300 }
);

export const getCachedPastEvents = unstable_cache(
  async () => getEvents("past"),
  ["public-past-events"],
  { tags: ["events"], revalidate: 300 }
);

export function getCachedPastEventBySlug(slug) {
  return unstable_cache(
    async () => getPastEventBySlug(slug),
    [`public-past-event-${slug}`],
    { tags: ["events"], revalidate: 300 }
  )();
}

// ============================================================================
// Events Data Layer
// Direct Prisma database operations for Past and Upcoming Events.
// ============================================================================

import { prisma } from './prisma';

/**
 * Fetches events by type ('upcoming' | 'past') ordered by eventDate.
 * For upcoming events, automatically treats events that occurred before today (Kyiv time) as inactive.
 */
export async function getEvents(type) {
    try {

         const models = {
            past: prisma.pastEvents,
            upcoming: prisma.uncomingEvents,
        };

        const model = models[type];

         if (!model) {
            throw new Error('Невідомий тип події');
        }

        const items = await model.findMany({
            orderBy: { eventDate: type === "past" ? "desc" : "asc" }
        });

        if (type === 'upcoming') {
            const todayKyivStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Kyiv' }).format(new Date());
            const startOfToday = new Date(`${todayKyivStr}T00:00:00.000Z`);

            return items.map((item) =>
                item.isActive && new Date(item.eventDate) <= startOfToday
                    ? { ...item, isActive: false }
                    : item
            );
        }
        
        return items;
    } catch (error) {
        console.error('Помилка отримання подій з бази даних:', error);
        return [];
    }
}

/** Batch-creates new events in the corresponding table */
export async function addEvents(type, eventItems) {
    try {

         const models = {
            past: prisma.pastEvents,
            upcoming: prisma.uncomingEvents,
        };

        const model = models[type];

         if (!model) {
            throw new Error('Невідомий тип події');
        }

        const dataToInsert = Array.isArray(eventItems) ? eventItems : [eventItems];

        const Event = await model.createMany({
            data: dataToInsert,
            skipDuplicates: true, 
        });
        
        return Event;
    } catch (error) {
        console.error('Помилка додавання подій до бази даних:', error);
        return { count: 0 };
    }
}

/** Executes atomic updates for multiple events using a Prisma transaction */
export async function updateEvents(type, updates) {
    try {
        
        if (type === 'past') {
            return prisma.$transaction(
            updates.map((item) =>
            prisma.pastEvents.update({
                where: { id: item.id },
                data: {
                ...(item.title !== undefined && { title: item.title }),
                ...(item.slug !== undefined && { slug: item.slug }),
                ...(item.eventDate !== undefined && { eventDate: item.eventDate }),
                ...(item.endDate !== undefined && { endDate: item.endDate }),
                ...(item.coverImage !== undefined && { coverImage: item.coverImage }),
                ...(item.shortDescription !== undefined && { shortDescription: item.shortDescription }),
                ...(item.content !== undefined && { content: item.content }),
                ...(item.gallery !== undefined && { gallery: item.gallery }),
                ...(item.isFeatured !== undefined && { isFeatured: item.isFeatured }),
                },
            })
            )
        );
        } else if (type === 'upcoming') {
            return prisma.$transaction(
            updates.map((item) =>
            prisma.uncomingEvents.update({
                where: { id: item.id },
                data: {
                ...(item.title !== undefined && { title: item.title }),
                ...(item.eventDate !== undefined && { eventDate: item.eventDate }),
                ...(item.endDate !== undefined && { endDate: item.endDate }),
                ...(item.shortDescription !== undefined && { shortDescription: item.shortDescription }),
                ...(item.isInCrm !== undefined && { isInCrm: item.isInCrm }),
                ...(item.crmUrl !== undefined && { crmUrl: item.crmUrl }),
                ...(item.isActive !== undefined && { isActive: item.isActive }),
                ...(item.coverImage !== undefined && { coverImage: item.coverImage }),
                },
            })
            )
        );
        } else {
            throw new Error('Невідомий тип події');
        }
    } catch (error) {
        console.error('Помилка оновлення події з бази даних:', error);
        return false;
    }
}

/** Deletes an event by ID from the specified event table */
export async function deleteEvents(type, id) {
    try {

         const models = {
            past: prisma.pastEvents,
            upcoming: prisma.uncomingEvents,
        };

        const model = models[type];

         if (!model) {
            throw new Error('Невідомий тип події');
        }

        await model.delete({
            where: {
                id: id
            }
        });
        
        return true;
    } catch (error) {
        console.error('Помилка видалення події з бази даних:', error);
        return false;
    }
}

/** Retrieves a single past event by its unique slug */
export async function getPastEventBySlug(slug) {
  try {
    return await prisma.pastEvents.findUnique({
      where: { slug },
    });
  } catch (error) {
    console.error('Помилка отримання події за slug:', error);
    return null;
  }
}
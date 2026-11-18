'use server';

import { verifySession } from '@/lib/auth';
import { updateEvents, deleteEvents, addEvents } from '@/lib/events';
import { slugify } from '@/lib/slugify';
import { revalidatePath, revalidateTag } from 'next/cache';

// ============================================================================
// Events Server Actions
// Handles CRUD operations and validation for Upcoming and Past Events.
// ============================================================================

/**
 * Updates upcoming or past events from FormData.
 * Validates dates, cover image requirements for featured/published past events,
 * and generates URL-friendly slugs. Revalidates both static and dynamic routes.
 */
export async function updateEventsAction(type, formData) {
  const { isAuth } = await verifySession();
  if (!isAuth) {
    return { error: 'Неавторизований доступ. Будь ласка, увійдіть знову.' };
  }

  if (type !== 'upcoming' && type !== 'past') {
    return { error: 'Невідомий тип подій.' };
  }

  try {
    const itemsMap = {};

    // Parse dynamic field keys (e.g. title_<id>, eventDate_<id>) from FormData
    for (const [key, value] of formData.entries()) {
      const match = key.match(
        /^(title|eventDate|endDate|shortDescription|crmUrl|isInCrm|isActive|slug|coverImage|content|gallery|isFeatured)_(.+)$/
      );
      if (!match) continue;

      const [, fieldType, id] = match;

      if (!itemsMap[id]) {
        itemsMap[id] =
          type === 'upcoming'
            ? { id, isInCrm: false, isActive: false }
            : { id, isFeatured: false };
      }

      const strValue = typeof value === 'string' ? value.trim() : '';

      if (fieldType === 'title') {
        if (!strValue) {
          return { error: `Назва для події "${id}" не може бути порожньою.` };
        }
        itemsMap[id].title = strValue;
      } else if (fieldType === 'eventDate') {
        const parsedDate = new Date(strValue);
        if (!strValue || Number.isNaN(parsedDate.getTime())) {
          return { error: `Некоректна дата для події "${id}".` };
        }
        itemsMap[id].eventDate = parsedDate;
      } else if (fieldType === 'endDate') {
        if (!strValue) {
          itemsMap[id].endDate = null;
        } else {
          const parsedEndDate = new Date(strValue);
          if (Number.isNaN(parsedEndDate.getTime())) {
            return { error: `Некоректна кінцева дата для події "${id}".` };
          }
          itemsMap[id].endDate = parsedEndDate;
        }
      } else if (fieldType === 'shortDescription') {
        itemsMap[id].shortDescription = strValue;
      } else if (fieldType === 'crmUrl') {
        itemsMap[id].crmUrl = strValue;
        itemsMap[id].isInCrm = Boolean(strValue);
      } else if (fieldType === 'isActive') {
        itemsMap[id].isActive = true;
      } else if (fieldType === 'slug') {
        itemsMap[id].slug = strValue;
      } else if (fieldType === 'coverImage') {
        itemsMap[id].coverImage = strValue;
      } else if (fieldType === 'content') {
        itemsMap[id].content = strValue;
      } else if (fieldType === 'gallery') {
        itemsMap[id].gallery = strValue
          .split(/[\n,]+/)
          .map((url) => url.trim())
          .filter(Boolean);
      } else if (fieldType === 'isFeatured') {
        itemsMap[id].isFeatured = true;
      }
    }

    // Post-processing and validation for specific event types
    for (const id in itemsMap) {
      if (type === 'upcoming') {
        itemsMap[id].isInCrm = Boolean(itemsMap[id].crmUrl && itemsMap[id].crmUrl.trim());
      }
      if (type === 'past') {
        if (itemsMap[id].isFeatured && !itemsMap[id].coverImage) {
          return {
            error: `Неможливо зробити подію «${itemsMap[id].title || id}» активною без обкладинки (головного фото).`,
          };
        }
        // Auto-generate slug with event date suffix if missing
        if (!itemsMap[id].slug && itemsMap[id].title) {
          const baseSlug = slugify(itemsMap[id].title);
          const datePart =
            itemsMap[id].eventDate instanceof Date && !Number.isNaN(itemsMap[id].eventDate.getTime())
              ? itemsMap[id].eventDate.toISOString().split('T')[0]
              : '';
          itemsMap[id].slug = datePart ? `${baseSlug}-${datePart}` : baseSlug;
        }
        if (!itemsMap[id].slug) {
          itemsMap[id].slug = `event-${Date.now()}`;
        }
      }
    }

    const updates = Object.values(itemsMap).filter((item) => item.title !== undefined);
    if (updates.length === 0) {
      return { error: 'Дані для оновлення не знайдено.' };
    }

    const updated = await updateEvents(type, updates);
    if (!updated) {
      return { error: 'Не вдалося оновити події в базі даних.' };
    }

    // Invalidate cached event pages and dynamic event slug routes
    revalidateTag('events', { expire: 0 });
    revalidatePath('/events');
    revalidatePath('/events/[slug]', 'page');
    revalidatePath('/admin/events');

    return { success: true };
  } catch (error) {
    console.error('Помилка збереження подій:', error);
    return { error: 'Не вдалося зберегти зміни. Спробуйте пізніше.' };
  }
}

/**
 * Deletes an event by type ('upcoming' | 'past') and ID.
 */
export async function deleteEventAction(type, id) {
  const {isAuth} = await verifySession()

  if (!isAuth) {
    return { error: 'Неавторизований доступ. Будь ласка, увійдіть знову.' };
  }

  if (type !== 'upcoming' && type !== 'past') {
    return { error: 'Невідомий тип подій.' };
  }

  if (!id) {
    return { error: 'ID події не вказано.' };
  }

  try {
    const deleted = await deleteEvents(type, id)
    if (!deleted) {
      return { error: 'Не вдалося видалити подію з бази даних.' };
    }

    revalidateTag('events', { expire: 0 });
    revalidatePath('/events');
    revalidatePath('/events/[slug]', 'page');
    revalidatePath('/admin/events')

    return { success: true };
  } catch (error) {
    console.error('Помилка видалення події:', error);
    return { error: 'Не вдалося видалити подію. Спробуйте пізніше.' };
  }
}

/**
 * Creates a new blank upcoming or past event with generated defaults.
 */
export async function addEventAction(type) {
  const {isAuth} = await verifySession()

  if (!isAuth) {
    return { error: 'Неавторизований доступ. Будь ласка, увійдіть знову.' };
  }

  if (type !== 'upcoming' && type !== 'past') {
    return { error: 'Невідомий тип подій.' };
  }

  try {
    let result;
    if (type === 'upcoming') {
        result = await addEvents('upcoming', [
        {
          id: crypto.randomUUID(),
          title: 'Нова подія',
          shortDescription: '',
          eventDate: new Date(),
          endDate: null,
          crmUrl: '',
          isInCrm: false,
          isActive: false,
          coverImage: '',
        }
      ]);
    } else {
      const now = new Date();
      const datePart = now.toISOString().split('T')[0];
      result = await addEvents('past', [
        {
          id: crypto.randomUUID(),
          title: 'Нова минула подія',
          slug: `${slugify('Нова минула подія')}-${datePart}-${Date.now().toString().slice(-4)}`,
          eventDate: now,
          endDate: null,
          coverImage: '',
          shortDescription: '',
          content: '',
          gallery: [],
          isFeatured: false,
        }
      ]);
    } 

    if (!result || result.count === 0) {
      return { error: 'Не вдалося додати подію в базу даних.' };
    }

    revalidateTag('events', { expire: 0 });
    revalidatePath('/events');
    revalidatePath('/events/[slug]', 'page');
    revalidatePath('/admin/events')

    return { success: true };
  } catch (error) {
    console.error('Помилка створення події:', error);
    return { error: 'Не вдалося створити подію. Спробуйте пізніше.' };
  }
}
'use server';

import { verifySession } from '@/lib/auth';
import { prisma } from '@/lib/prisma.js';
import { updateTrainingPrices, addTrainingPrice, deleteTrainingPrice } from '@/lib/prices.js';
import { revalidatePath, revalidateTag } from 'next/cache';

// ============================================================================
// Training Prices Server Actions
// Manages CRUD operations for Packages, Sections, and Subscriptions.
// ============================================================================

/**
 * Updates training prices from submitted form data.
 * Parses dynamic input keys (e.g. price_*, title_*, isActive_*),
 * validates input constraints (non-empty strings, numeric prices, image requirement for active sections),
 * and persists changes to the database.
 */
export async function updateTrainingPricesAction(formData) {
  const { isAuth } = await verifySession();
  if (!isAuth) {
    return { error: 'Неавторизований доступ. Будь ласка, увійдіть знову.' };
  }

  try {
    const itemsMap = {};
    const hasIsActiveKeys = Array.from(formData.keys()).some((k) => k.startsWith('isActive_'));

    // Parse dynamic FormData keys into structured items by ID
    for (const [key, value] of formData.entries()) {
      const match = key.match(/^(price|title|desc|period|color|image|crmUrl|orderIndex|isActive)_(.+)$/);
      if (!match) continue;

      const [, fieldType, id] = match;

      if (!itemsMap[id]) {
        itemsMap[id] = { id };
        if (hasIsActiveKeys) {
          itemsMap[id].isActive = false;
        }
      }

      const strValue = typeof value === 'string' ? value.trim() : '';

      // Field-specific validation and assignment
      if (fieldType === 'price') {
        if (!/^\d+$/.test(strValue)) {
          return { error: `Некоректна ціна для пункту "${id}"` };
        }

        const numericPrice = parseInt(strValue, 10);
        if (numericPrice > 2147483647) {
          return { error: `Некоректна ціна для пункту "${id}"` };
        }
        itemsMap[id].price = numericPrice;
      } else if (fieldType === 'title') {
        if (!strValue) {
          return { error: `Назва для пункту "${id}" не може бути порожньою.` };
        }
        itemsMap[id].title = strValue;
      } else if (fieldType === 'desc') {
        itemsMap[id].description = strValue || null;
      } else if (fieldType === 'period') {
        if (!strValue) {
          return { error: `Період для пункту "${id}" не може бути порожнім.` };
        }
        itemsMap[id].period = strValue;
      } else if (fieldType === 'color') {
        itemsMap[id].color = strValue || null;
      } else if (fieldType === 'image') {
        itemsMap[id].image = strValue || null;
      } else if (fieldType === 'crmUrl') {
        itemsMap[id].crmUrl = strValue || null;
      } else if (fieldType === 'orderIndex') {
        const orderNum = parseInt(strValue, 10);
        if (!isNaN(orderNum)) {
          itemsMap[id].orderIndex = orderNum;
        }
      } else if (fieldType === 'isActive') {
        itemsMap[id].isActive = true;
      }
    }

    const updates = Object.values(itemsMap).filter((item) => item.price !== undefined);
    if (updates.length === 0) {
      return { error: 'Дані для оновлення не знайдено.' };
    }

    // Validation: Climbing sections cannot be published (active) without a cover photo
    for (const item of updates) {
      if (item.isActive && 'image' in item && !item.image) {
        return {
          error: `Неможливо зробити секцію «${item.title || item.id}» активною без фото.`,
        };
      }
    }

    const activeWithoutImageField = updates.filter((item) => item.isActive && !('image' in item));
    if (activeWithoutImageField.length > 0) {
      const dbSections = await prisma.trainingPrice.findMany({
        where: {
          id: { in: activeWithoutImageField.map((i) => i.id) },
          category: 'section',
        },
        select: { id: true, title: true, image: true },
      });
      for (const sec of dbSections) {
        if (!sec.image) {
          return {
            error: `Неможливо зробити секцію «${sec.title || sec.id}» активною без фото.`,
          };
        }
      }
    }

    // Save batch updates and invalidate cached routes
    await updateTrainingPrices(updates);
    revalidateTag('prices', { expire: 0 });
    revalidatePath('/training');
    revalidatePath('/admin/training');
    return { success: true };
  } catch (error) {
    console.error('Помилка збереження:', error);
    return { error: error?.message || 'Не вдалося зберегти зміни. Спробуйте пізніше.' };
  }
}

/**
 * Creates a new training price item with initial defaults.
 * Supports categories: 'package', 'section', 'subscription'.
 */
export async function addTrainingPriceAction(categoryOrFormData) {
  const { isAuth } = await verifySession();
  if (!isAuth) {
    return { error: 'Неавторизований доступ. Будь ласка, увійдіть знову.' };
  }

  try {
    let category = null;
    if (typeof categoryOrFormData === 'string') {
      category = categoryOrFormData.trim();
    } else if (categoryOrFormData instanceof FormData) {
      category = categoryOrFormData.get('category')?.toString().trim();
    }

    if (!category || !['package', 'section', 'subscription'].includes(category)) {
      return { error: 'Некоректна категорія.' };
    }

    if (category === 'package') {
      const packageCount = await prisma.trainingPrice.count({
        where: { category: 'package' },
      });
      if (packageCount >= 6) {
        return { error: 'Максимальна кількість популярних пакетів — 6.' };
      }
    }

    const lastItem = await prisma.trainingPrice.findFirst({
      where: { category },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });
    const nextOrder = (lastItem?.orderIndex ?? 0) + 1;
    const timestamp = Date.now();

    let newItem;
    if (category === 'package') {
      newItem = {
        id: `pkg_${timestamp}`,
        category: 'package',
        title: 'Новий пакет',
        description: 'Опис пакета...',
        price: 0,
        period: '/МІС',
        isActive: false,
        orderIndex: nextOrder,
      };
    } else if (category === 'section') {
      newItem = {
        id: `sec_${timestamp}`,
        category: 'section',
        title: 'Нова секція',
        description: 'Опис нової секції...',
        price: 0,
        period: 'ГРН/МІС',
        color: '#ff991b',
        image: null,
        isActive: false,
        orderIndex: nextOrder,
      };
    } else {
      newItem = {
        id: `sub_${timestamp}`,
        category: 'subscription',
        title: 'НОВИЙ АБОНЕМЕНТ',
        description: null,
        price: 0,
        period: 'ГРН',
        isActive: false, 
        orderIndex: nextOrder,
      };
    }

    await addTrainingPrice(newItem);
    revalidateTag('prices', { expire: 0 });
    revalidatePath('/training');
    revalidatePath('/admin/training');
    return { success: true, item: newItem };
  } catch (error) {
    console.error('Помилка додавання ціни:', error);
    return { error: 'Не вдалося додати запис. Спробуйте пізніше.' };
  }
}

/**
 * Deletes a training price item by its ID.
 * Ensures business logic safety (e.g. at least 1 package must remain).
 */
export async function deleteTrainingPriceAction(id) {
  const { isAuth } = await verifySession();
  if (!isAuth) {
    return { error: 'Неавторизований доступ. Будь ласка, увійдіть знову.' };
  }

  try {
    const existing = await prisma.trainingPrice.findUnique({
      where: { id },
    });

    if (!existing) {
      return { error: 'Запис не знайдено.' };
    }

    if (existing.category === 'package') {
      const packageCount = await prisma.trainingPrice.count({
        where: { category: 'package' },
      });
      if (packageCount <= 1) {
        return { error: 'Повинен залишатися щонайменше 1 популярний пакет.' };
      }
    }

    const deleted = await deleteTrainingPrice(id);
    if (!deleted) {
      return { error: 'Не вдалося видалити запис з бази даних.' };
    }

    revalidateTag('prices', { expire: 0 });
    revalidatePath('/training');
    revalidatePath('/admin/training');
    return { success: true };
  } catch (error) {
    console.error('Помилка видалення ціни:', error);
    return { error: 'Не вдалося видалити запис. Спробуйте пізніше.' };
  }
}

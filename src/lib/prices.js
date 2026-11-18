// ============================================================================
// Training Prices Data Layer
// Direct Prisma operations for packages, sections, and subscriptions.
// ============================================================================

import { prisma } from './prisma.js';

/**
 * Fetches all training prices, grouping them into packages, sections, and subscriptions.
 * Excludes inactive items by default unless { includeInactive: true } is supplied.
 */
export async function getTrainingPrices(options = {}) {
  const { includeInactive = false } = options;
  try {
    const where = includeInactive ? {} : { isActive: true };
    const items = await prisma.trainingPrice.findMany({
      where,
      orderBy: { orderIndex: 'asc' },
    });

    return {
      packages: items.filter((i) => i.category === 'package'),
      sections: items.filter((i) => i.category === 'section'),
      subscriptions: items.filter((i) => i.category === 'subscription'),
      all: items,
    };
  } catch (error) {
    console.error('Помилка отримання цін з бази даних:', error);
    return { packages: [], sections: [], subscriptions: [], all: [] };
  }
}

/** Updates training price records inside an atomic Prisma transaction */
export async function updateTrainingPrices(updates) {
  const items = Array.isArray(updates) ? updates : [updates];
  if (items.length === 0) return [];

  return prisma.$transaction(
    items.map((item) =>
      prisma.trainingPrice.update({
        where: { id: item.id },
        data: {
          ...(item.title !== undefined && { title: item.title }),
          ...(item.description !== undefined && { description: item.description }),
          ...(item.price !== undefined && { price: item.price }),
          ...(item.period !== undefined && { period: item.period }),
          ...(item.color !== undefined && { color: item.color }),
          ...(item.image !== undefined && { image: item.image }),
          ...(item.crmUrl !== undefined && { crmUrl: item.crmUrl }),
          ...(item.isActive !== undefined && { isActive: item.isActive }),
          ...(item.orderIndex !== undefined && { orderIndex: item.orderIndex }),
        },
      })
    )
  );
}

/** Inserts new training price items into the database */
export async function addTrainingPrice(priceItems) {
  try {
    const dataToInsert = Array.isArray(priceItems) ? priceItems : [priceItems];
    if (dataToInsert.length === 0) return { count: 0 };

    return await prisma.trainingPrice.createMany({
      data: dataToInsert,
      skipDuplicates: true,
    });
  } catch (error) {
    console.error('Помилка додавання ціни до бази даних:', error);
    return { count: 0 };
  }
}

/** Deletes a training price item by ID */
export async function deleteTrainingPrice(id) {
  if (!id) return false;
  try {
    await prisma.trainingPrice.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error('Помилка видалення ціни з бази даних:', error);
    return false;
  }
}

export const addTrainingPrices = addTrainingPrice;
export const deleteTrainingPrices = deleteTrainingPrice;

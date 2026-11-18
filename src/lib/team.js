// ============================================================================
// Team Members Data Layer
// Direct Prisma operations for coach roster retrieval, creation, updates, and deletion.
// ============================================================================

import { prisma } from './prisma.js';

/** Fetches team members ordered by display orderIndex and creation date */
export async function getTeam() {
  try {
    return await prisma.team.findMany({
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
    });
  } catch (error) {
    console.error('Помилка отримання команди:', error);
    return [];
  }
}

/** Inserts new team member records into the database */
export async function addTeam(teamMembers) {
  try {
    const dataToInsert = Array.isArray(teamMembers) ? teamMembers : [teamMembers];
    if (dataToInsert.length === 0) return { count: 0 };

    return await prisma.team.createMany({
      data: dataToInsert,
      skipDuplicates: true,
    });
  } catch (error) {
    console.error('Помилка додавання учасника команди до бази даних:', error);
    return { count: 0 };
  }
}

/** Updates existing team members in an atomic Prisma transaction */
export async function updateTeam(updates) {
  try {
    const items = Array.isArray(updates) ? updates : [updates];
    if (items.length === 0) return [];

    return await prisma.$transaction(
      items.map((item) =>
        prisma.team.update({
          where: { id: item.id },
          data: {
            ...(item.name !== undefined && { name: item.name }),
            ...(item.position !== undefined && { position: item.position }),
            ...(item.firstImage !== undefined && { firstImage: item.firstImage }),
            ...(item.lastImage !== undefined && { lastImage: item.lastImage }),
            ...(item.orderIndex !== undefined && { orderIndex: item.orderIndex }),
          },
        })
      )
    );
  } catch (error) {
    console.error('Помилка оновлення команди:', error);
    return false;
  }
}

/** Deletes a team member by ID */
export async function deleteTeam(id) {
  if (!id) return false;
  try {
    await prisma.team.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error('Помилка видалення учасника команди:', error);
    return false;
  }
}
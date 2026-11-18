'use server'

import { verifySession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { addTeam, updateTeam, deleteTeam } from '@/lib/team'
import { revalidatePath, revalidateTag } from "next/cache"

// ============================================================================
// Team Members Server Actions
// Manages roster updates, reordering, dual photo validation, and deletions.
// ============================================================================

/**
 * Updates existing team members from dynamic form data (name, position, images, order).
 */
export async function updateTeamAction(formData) {
    const {isAuth} = await verifySession();
    if (!isAuth) {
        return { error: 'Неавторизований доступ. Будь ласка, увійдіть знову.' };
    }    
    try {
        const itemsMap = {}

        for (const[key, value] of formData.entries()) {
            const match = key.match(
                /^(name|position|firstImage|lastImage|orderIndex)_(.+)$/
            );
            if (!match) continue;

            const [, fieldType, id] = match;

            const strValue = typeof value === 'string' ? value.trim() : '';
            if (!itemsMap[id]) itemsMap[id] = { id };
            if (fieldType==='name') {
                if (!strValue) {
                    return { error: `Ім'я не може бути порожнім.` };
                }
                itemsMap[id].name = strValue;
            } else if (fieldType==='position') {
                if (!strValue) {
                    return { error: `Посада не може бути порожньою.` };
                }
                itemsMap[id].position = strValue;
            }
            else if (fieldType==='firstImage') {
                if (!strValue) {
                    return { error: `Головне фото не може бути порожнім.` };
                }
                itemsMap[id].firstImage = strValue;
            }
            else if (fieldType==='lastImage') {
                if (!strValue) {
                    return { error: `Друге фото не може бути порожнім.` };
                }
                itemsMap[id].lastImage = strValue;
            }
            else if (fieldType==='orderIndex') {
                const parsedIndex = parseInt(strValue, 10);
                if (!Number.isNaN(parsedIndex)) {
                    itemsMap[id].orderIndex = parsedIndex;
                }
            }
        }

            const updates = Object.values(itemsMap).filter((item)=> item.name != undefined)
            if (updates.length === 0) {
                return { error: 'Дані для оновлення не знайдено.' };
            }
            const updated = await updateTeam(updates);
            if (!updated) {
                return { error: 'Не вдалося оновити команду в базі даних.' };
            }

        revalidateTag('team', { expire: 0 })
        revalidatePath('/')
        revalidatePath('/admin/team')

        return  { success: true };
    } catch (error) {
    console.error('Помилка збереження команди:', error);
    return { error: 'Не вдалося зберегти зміни. Спробуйте пізніше.' };
  }
}

/**
 * Deletes a team member by ID and revalidates cached pages.
 */
export async function deleteTeamAction(id) {
    const {isAuth} = await verifySession()

  if (!isAuth) {
    return { error: 'Неавторизований доступ. Будь ласка, увійдіть знову.' };
  }
  try {
      const deleted = await deleteTeam(id)
      if (!deleted) {
        return { error: 'Не вдалося видалити учасника команди.' };
      }
  
      revalidateTag('team', { expire: 0 });
      revalidatePath('/');
      revalidatePath('/admin/team')
  
      return { success: true };
    } catch (error) {
      console.error('Помилка видалення учасника команди:', error);
      return { error: 'Не вдалося видалити учасника команди. Спробуйте пізніше.' };
    }
}

/**
 * Adds a new team member with required primary and hover images.
 */
export async function addTeamAction(formData) {
  const { isAuth } = await verifySession();
  if (!isAuth) {
    return { error: 'Неавторизований доступ. Будь ласка, увійдіть знову.' };
  }

  const name = formData.get('name')?.toString().trim();
  const position = formData.get('position')?.toString().trim();
  const firstImage = formData.get('firstImage')?.toString().trim();
  const lastImage = formData.get('lastImage')?.toString().trim();
  const rawOrderIndex = formData.get('orderIndex')?.toString().trim();

  if (!name) return { error: "Вкажіть ім'я учасника." };
  if (!position) return { error: "Вкажіть посаду." };
  if (!firstImage) return { error: "Додайте головне фото." };
  if (!lastImage) return { error: "Додайте друге фото (hover)." };

  try {
    let orderIndex = rawOrderIndex !== undefined && rawOrderIndex !== '' ? parseInt(rawOrderIndex, 10) : NaN;
    if (Number.isNaN(orderIndex)) {
      const lastMember = await prisma.team.findFirst({
        orderBy: { orderIndex: 'desc' },
        select: { orderIndex: true },
      });
      orderIndex = (lastMember?.orderIndex ?? 0) + 1;
    }

    const result = await addTeam({
      id: crypto.randomUUID(),
      name,
      position,
      firstImage,
      lastImage,
      orderIndex,
    });

    if (!result || result.count === 0) {
      return { error: 'Не вдалося зберегти в базі даних.' };
    }

    revalidateTag('team', { expire: 0 });
    revalidatePath('/');
    revalidatePath('/admin/team');

    return { success: true };
  } catch (error) {
    console.error('Помилка додавання учасника:', error);
    return { error: 'Не вдалося додати учасника. Спробуйте пізніше.' };
  }
}
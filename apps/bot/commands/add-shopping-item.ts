import { eq } from 'drizzle-orm';
import { db } from '../db/db';
import { residents, shoppingItems } from '../db/schema';
import { sendMessageText } from '../lib/api';
import { capitalizeFirst } from '../lib/utils';

export async function addShoppingItem(phoneNumber: string, itemText: string) {
   const [resident] = await db.select().from(residents).where(eq(residents.phoneNumber, phoneNumber));

   if (!resident || !resident.homeId) {
      return await sendMessageText(phoneNumber, 'Primero debes registrar una vivienda.');
   }

   await db.insert(shoppingItems).values({
      item: capitalizeFirst(itemText),
      addedById: resident.id,
      homeId: resident.homeId,
   });

   const currentList = await db
      .select({
         item: shoppingItems.item,
         addedBy: residents.name,
      })
      .from(shoppingItems)
      .leftJoin(residents, eq(residents.id, shoppingItems.addedById))
      .where(eq(shoppingItems.homeId, resident.homeId));

   const message =
      `✅ Se ha añadido "${itemText}" a la lista de la compra.\n\n` +
      'Lista actual:\n' +
      currentList.map(entry => `- ${entry.item} (${entry.addedBy})`).join('\n');

   return await sendMessageText(phoneNumber, message);
}

import { and, eq, like } from 'drizzle-orm';
import { db } from '../db/db';
import { residents, shoppingItems } from '../db/schema';
import { sendMessageText } from '../lib/api';
import { capitalizeFirst } from '../lib/utils';

export async function removeShoppingItem(phoneNumber: string, itemText: string) {
   const [resident] = await db.select().from(residents).where(eq(residents.phoneNumber, phoneNumber));

   if (!resident || !resident.homeId) {
      return await sendMessageText(phoneNumber, 'Primero debes registrar una vivienda.');
   }

   const [removedItem] = await db
      .delete(shoppingItems)
      .where(and(eq(shoppingItems.homeId, resident.homeId), like(shoppingItems.item, capitalizeFirst(itemText))))
      .returning();

   if (!removedItem) {
      return await sendMessageText(phoneNumber, `No se ha encontrado "${itemText}" en la lista de la compra.`);
   }

   const currentList = await db
      .select({
         item: shoppingItems.item,
         addedBy: residents.name,
      })
      .from(shoppingItems)
      .leftJoin(residents, eq(residents.id, shoppingItems.addedById))
      .where(eq(shoppingItems.homeId, resident.homeId));

   const message =
      currentList.length === 0
         ? `✅ Se ha quitado "${itemText}" de la lista.\n\nLa lista de la compra está vacía.`
         : `✅ Se ha quitado "${itemText}" de la lista.\n\nLista actual:\n${currentList
              .map(entry => `- ${entry.item} (${entry.addedBy})`)
              .join('\n')}`;

   return await sendMessageText(phoneNumber, message);
}

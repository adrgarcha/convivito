import { eq } from 'drizzle-orm';
import { db } from '../db/db';
import { residents, shoppingItems } from '../db/schema';
import { sendMessageText } from '../lib/api';

export async function listShoppingItems(phoneNumber: string) {
   const [resident] = await db.select().from(residents).where(eq(residents.phoneNumber, phoneNumber));

   if (!resident || !resident.homeId) {
      return await sendMessageText(phoneNumber, 'Primero debes registrar una vivienda.');
   }

   const items = await db
      .select({
         item: shoppingItems.item,
         addedBy: residents.name,
      })
      .from(shoppingItems)
      .leftJoin(residents, eq(residents.id, shoppingItems.addedById))
      .where(eq(shoppingItems.homeId, resident.homeId));

   if (items.length === 0) {
      return await sendMessageText(phoneNumber, 'La lista de la compra está vacía 🙌. Añade un artículo con "Añadir [artículo]".');
   }

   const message = '🛒 Lista de la compra:\n\n' + items.map(entry => `- ${entry.item} (${entry.addedBy})`).join('\n');

   return await sendMessageText(phoneNumber, message);
}

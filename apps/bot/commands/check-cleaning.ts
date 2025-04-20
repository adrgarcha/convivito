import { eq } from 'drizzle-orm';
import { db } from '../db/db';
import { cleaningAreas, residents } from '../db/schema';
import { sendMessageText } from '../lib/api';

export async function checkCleaning(phoneNumber: string) {
   const [resident] = await db.select().from(residents).where(eq(residents.phoneNumber, phoneNumber));

   if (!resident || !resident.homeId) {
      return await sendMessageText(phoneNumber, 'Primero debes registrar una vivienda.');
   }

   const assignments = await db
      .select({
         areaName: cleaningAreas.name,
         residentName: residents.name,
      })
      .from(cleaningAreas)
      .leftJoin(residents, eq(residents.id, cleaningAreas.residentId))
      .where(eq(cleaningAreas.homeId, resident.homeId));

   if (assignments.length === 0) {
      return await sendMessageText(phoneNumber, 'No hay asignaciones de limpieza para esta semana.');
   }

   const message =
      'Asignaciones de limpieza para esta semana:\n\n' +
      assignments.map(assignment => `${assignment.areaName}: ${assignment.residentName}`).join('\n');

   return await sendMessageText(phoneNumber, message);
}

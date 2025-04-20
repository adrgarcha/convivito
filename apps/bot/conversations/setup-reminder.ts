import { eq } from 'drizzle-orm';
import { db } from '../db/db';
import { homes, reminders, residents } from '../db/schema';
import { sendMessageText } from '../lib/api';
import { DAYS } from '../lib/constants';
import { endConversation, getConversation, nextStep, startConversation, updateConversationData } from '../lib/conversation-manager';
import type { SetupReminderConversationData } from '../lib/types';
import { capitalizeFirst } from '../lib/utils';

export async function setupReminder(phoneNumber: string) {
   const [resident] = await db.selectDistinct().from(residents).where(eq(residents.phoneNumber, phoneNumber));

   if (!resident || !resident.homeId) {
      return await sendMessageText(phoneNumber, 'Primero necesitas registrar una vivienda. Escribe "registrar vivienda" para comenzar.');
   }

   const [residentHome] = await db.selectDistinct().from(homes).where(eq(homes.id, resident.homeId));

   if (residentHome.reminderId) {
      return await sendMessageText(phoneNumber, 'Ya tienes los recordatorios configurados.');
   }

   await startConversation(phoneNumber, 'SETUP_REMINDER');
   await updateConversationData(phoneNumber, {
      rentStartDay: 0,
      rentEndDay: 0,
      cleaningStartDay: 0,
      cleaningEndDay: 0,
   } as SetupReminderConversationData);

   await sendMessageText(
      phoneNumber,
      'Vamos a configurar los recordatorios. ¿A partir de qué día del mes (1-31) quieres que te recuerde el pago del alquiler?'
   );
}

export async function handleReminderSetup(phoneNumber: string, message: string) {
   const conversation = await getConversation(phoneNumber);
   if (!conversation) return;

   const data = conversation.data as SetupReminderConversationData;

   switch (conversation.step) {
      case 0: // Rent start day
         const rentStartDay = parseInt(message);
         if (isNaN(rentStartDay) || rentStartDay < 1 || rentStartDay > 31) {
            return await sendMessageText(phoneNumber, 'Por favor, introduce un número válido entre 1 y 31.');
         }

         if (rentStartDay >= 28) {
            await sendMessageText(phoneNumber, 'Nota: En meses con menos días, el recordatorio se enviará el último día del mes.');
         }

         await updateConversationData(phoneNumber, { rentStartDay });
         await nextStep(phoneNumber);
         return await sendMessageText(phoneNumber, '¿Hasta qué día del mes tienes para pagar el alquiler?');

      case 1: // Rent end day
         const rentEndDay = parseInt(message);
         if (isNaN(rentEndDay) || rentEndDay < 1 || rentEndDay > 31 || rentEndDay < data.rentStartDay) {
            return await sendMessageText(phoneNumber, `Por favor, introduce un número válido entre ${data.rentStartDay} y 31.`);
         }

         if (rentEndDay >= 28) {
            await sendMessageText(phoneNumber, 'Nota: En meses con menos días, la fecha límite será el último día del mes.');
         }

         await updateConversationData(phoneNumber, { ...data, rentEndDay });
         await nextStep(phoneNumber);
         return await sendMessageText(
            phoneNumber,
            `¿Qué día de la semana empieza la limpieza?\n${DAYS.map((day, i) => `${i + 1}. ${capitalizeFirst(day)}`).join('\n')}\n(Escribe el número)`
         );

      case 2: // Cleaning start day
         const cleaningStartDay = parseInt(message) - 1;
         if (isNaN(cleaningStartDay) || cleaningStartDay < 0 || cleaningStartDay > 6) {
            return await sendMessageText(phoneNumber, 'Por favor, introduce un número válido entre 1 y 7.');
         }
         await updateConversationData(phoneNumber, { ...data, cleaningStartDay });
         await nextStep(phoneNumber);
         return await sendMessageText(
            phoneNumber,
            `¿Qué día termina la limpieza?\n${DAYS.map((day, i) => `${i + 1}. ${capitalizeFirst(day)}`).join('\n')}\n(Escribe el número)`
         );

      case 3: // Cleaning end day
         const cleaningEndDay = parseInt(message) - 1;
         if (isNaN(cleaningEndDay) || cleaningEndDay < 0 || cleaningEndDay > 6) {
            return await sendMessageText(phoneNumber, 'Por favor, introduce un número válido entre 1 y 7.');
         }

         const resident = await db.selectDistinct().from(residents).where(eq(residents.phoneNumber, phoneNumber));
         const residentHomeId = resident[0].homeId;

         if (!residentHomeId) {
            await endConversation(phoneNumber);
            return await sendMessageText(phoneNumber, 'Primero necesitas registrar una vivienda. Escribe "registrar vivienda" para comenzar.');
         }

         const [{ id: reminderId }] = await db
            .insert(reminders)
            .values({
               rentStartDay: data.rentStartDay,
               rentEndDay: data.rentEndDay,
               cleaningStartDay: data.cleaningStartDay,
               cleaningEndDay: cleaningEndDay,
               homeId: residentHomeId,
            })
            .returning({ id: reminders.id });

         await db.update(homes).set({ reminderId }).where(eq(homes.id, residentHomeId));

         const finalMessage =
            '¡Recordatorios configurados!\n' +
            `Recordatorio de alquiler: del día ${data.rentStartDay} al ${data.rentEndDay}\n` +
            `Recordatorio de limpieza: de ${DAYS[data.cleaningStartDay]} a ${DAYS[cleaningEndDay]}`;

         await endConversation(phoneNumber);
         return await sendMessageText(phoneNumber, finalMessage);

      default:
         await endConversation(phoneNumber);
         return await sendMessageText(phoneNumber, 'Ha ocurrido un error en la configuración.');
   }
}

import { eq } from 'drizzle-orm';
import cron from 'node-cron';
import { db } from '../db/db';
import { homes, reminders, residents } from '../db/schema';
import { sendMessageText } from '../lib/api';
import { NODE_ENV } from '../lib/constants';

const cronExpression = NODE_ENV === 'production' ? '0 12 * * *' : '*/1 * * * *';

async function sendRentReminder() {
   const today = new Date().getDate();

   const homesWithReminders = await db
      .select()
      .from(homes)
      .innerJoin(reminders, eq(homes.reminderId, reminders.id))
      .where(eq(reminders.rentStartDay, today));

   for (const { homes: home, reminders: reminder } of homesWithReminders) {
      const homeResidents = await db.select().from(residents).where(eq(residents.homeId, home.id));

      for (const resident of homeResidents) {
         if (!resident.phoneNumber) continue;

         await sendMessageText(
            resident.phoneNumber,
            `¡Hola! Te recuerdo que hoy comienza el período de pago del alquiler, tienes hasta el día ${reminder.rentEndDay}. El total a pagar es de ${home.rent}€. ¡Gracias!`
         );
      }
   }
}

export default function startRentReminderCron() {
   cron.schedule(cronExpression, sendRentReminder);
}

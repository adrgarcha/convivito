import { eq } from 'drizzle-orm';
import cron from 'node-cron';
import { db } from '../db/db';
import { homes, reminders, residents } from '../db/schema';
import { sendMessageText } from '../lib/api';
import { DAYS, NODE_ENV } from '../lib/constants';
import { getDayOfWeek } from '../lib/utils';

const cronExpression = NODE_ENV === 'production' ? '0 12 * * *' : '*/1 * * * *';

async function sendCleaningReminder() {
   const dayOfWeek = getDayOfWeek();

   const homesWithReminders = await db
      .select()
      .from(homes)
      .innerJoin(reminders, eq(homes.reminderId, reminders.id))
      .where(eq(reminders.cleaningStartDay, dayOfWeek));

   for (const { homes: home, reminders: reminder } of homesWithReminders) {
      if (!reminder.cleaningEndDay) continue;

      const homeResidents = await db.select().from(residents).where(eq(residents.homeId, home.id));

      for (const resident of homeResidents) {
         if (!resident.phoneNumber) continue;

         const endDayName = DAYS[reminder.cleaningEndDay];
         await sendMessageText(
            resident.phoneNumber,
            `¡Hola! Te recuerdo que hoy comienza el período de limpieza. Tienes hasta el ${endDayName} para completar la limpieza de tu zona asignada. ¡Gracias!`
         );
      }
   }
}

export default function startCleaningReminderCron() {
   cron.schedule(cronExpression, sendCleaningReminder);
}

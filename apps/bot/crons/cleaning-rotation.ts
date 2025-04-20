import { eq } from 'drizzle-orm';
import cron from 'node-cron';
import { db } from '../db/db';
import { cleaningAreas, homes, reminders } from '../db/schema';
import { NODE_ENV } from '../lib/constants';
import { getDayOfWeek } from '../lib/utils';

const cronExpression = NODE_ENV === 'production' ? '0 0 * * *' : '*/1 * * * *';

async function rotateCleaningAssignments() {
   const yesterday = (getDayOfWeek() - 1 + 7) % 7;

   const homesWithEndedCleaning = await db
      .select()
      .from(homes)
      .innerJoin(reminders, eq(homes.reminderId, reminders.id))
      .where(eq(reminders.cleaningEndDay, yesterday));

   for (const { homes: home } of homesWithEndedCleaning) {
      const areas = await db.select().from(cleaningAreas).where(eq(cleaningAreas.homeId, home.id)).orderBy(cleaningAreas.id);

      if (areas.length <= 1) continue;

      const lastResident = areas[areas.length - 1].residentId;

      for (let i = areas.length - 1; i > 0; i--) {
         await db
            .update(cleaningAreas)
            .set({ residentId: areas[i - 1].residentId })
            .where(eq(cleaningAreas.id, areas[i].id));
      }

      await db.update(cleaningAreas).set({ residentId: lastResident }).where(eq(cleaningAreas.id, areas[0].id));
   }
}

export default function startCleaningRotationCron() {
   cron.schedule(cronExpression, rotateCleaningAssignments);
}

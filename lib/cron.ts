import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

export const initializeCrons = async () => {
   const cronFiles = await readdir(join(__dirname, '../crons'));
   const tsFiles = cronFiles.filter(file => file.endsWith('.ts'));

   for (const file of tsFiles) {
      try {
         const cronModule = await import(`../crons/${file}`);
         if (cronModule.default) cronModule.default();
      } catch (error) {
         console.error(`Error al cargar el cron job ${file}:`, error);
      }
   }
};

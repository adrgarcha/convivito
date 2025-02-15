import { eq } from 'drizzle-orm';
import { db } from '../db/db';
import { cleaningAreas, cleaningAssignments, residents } from '../db/schema';
import { sendMessageText } from '../lib/api';
import { endConversation, getConversation, startConversation, updateConversationData } from '../lib/conversation-manager';
import type { SetupCleaningConversationData } from '../lib/types';
import { capitalizeFirst } from '../lib/utils';

export async function setupCleaning(phoneNumber: string) {
   const [resident] = await db.select().from(residents).where(eq(residents.phoneNumber, phoneNumber));

   if (!resident || !resident.homeId) {
      return await sendMessageText(phoneNumber, 'Primero debes registrar una vivienda.');
   }

   const existingAssignment = await db
      .select()
      .from(cleaningAssignments)
      .innerJoin(cleaningAreas, eq(cleaningAreas.id, cleaningAssignments.areaId))
      .where(eq(cleaningAssignments.residentId, resident.id))
      .limit(1);

   if (existingAssignment.length > 0) {
      return await sendMessageText(phoneNumber, 'Ya tienes asignaciones de limpieza configuradas.');
   }

   const homeResidents = await db.select().from(residents).where(eq(residents.homeId, resident.homeId));
   const residentsInstructions = homeResidents.map((resident, index) => `${index + 1}. ${resident.name}`).join('\n');

   await startConversation(phoneNumber, 'SETUP_CLEANING');
   await updateConversationData(phoneNumber, { homeId: resident.homeId });
   await sendMessageText(
      phoneNumber,
      `Residentes disponibles:\n${residentsInstructions}\n\nPor favor, define las áreas de limpieza y asigna un residente a cada una usando el formato:\n[área]: [número de residente]\n\nEjemplo:\nCocina: 1\nBaño: 2\nSalón: 1`
   );
}

export async function handleCleaningSetup(phoneNumber: string, message: string) {
   const conversation = await getConversation(phoneNumber);
   if (!conversation) return;

   const data = conversation.data as SetupCleaningConversationData;

   const homeResidents = await db.select().from(residents).where(eq(residents.homeId, data.homeId));

   const assignments = message
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.includes(':'))
      .map(line => {
         const [area, residentNum] = line.split(':').map(part => part.trim());
         const residentIndex = parseInt(residentNum) - 1;

         if (isNaN(residentIndex) || residentIndex < 0 || residentIndex >= homeResidents.length) {
            throw new Error(`Número de residente inválido: ${residentNum}`);
         }

         return {
            areaName: capitalizeFirst(area),
            residentId: homeResidents[residentIndex].id,
         };
      });

   if (assignments.length === 0) {
      return await sendMessageText(
         phoneNumber,
         'Por favor, especifica al menos un área con su residente asignado en el formato correcto.\nEjemplo:\nCocina: 1'
      );
   }

   try {
      for (const assignment of assignments) {
         const [area] = await db
            .insert(cleaningAreas)
            .values({
               name: assignment.areaName,
               homeId: data.homeId,
            })
            .returning({ id: cleaningAreas.id });

         await db.insert(cleaningAssignments).values({
            residentId: assignment.residentId,
            areaId: area.id,
            weekNumber: 0,
         });
      }

      const assignmentsSummary = assignments
         .map(assignment => {
            const resident = homeResidents.find(r => r.id === assignment.residentId);
            return `${assignment.areaName}: ${resident?.name}`;
         })
         .join('\n');

      await endConversation(phoneNumber);
      return await sendMessageText(
         phoneNumber,
         `¡Configuración completada!\n\nAsignaciones iniciales:\n${assignmentsSummary}\n\nLas áreas rotarán automáticamente cada semana.`
      );
   } catch (error) {
      await endConversation(phoneNumber);
      return await sendMessageText(phoneNumber, 'Ha ocurrido un error en la configuración. Por favor, verifica el formato e inténtalo de nuevo.');
   }
}

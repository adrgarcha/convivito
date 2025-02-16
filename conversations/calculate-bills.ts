import { eq } from 'drizzle-orm';
import { db } from '../db/db';
import { residents } from '../db/schema';
import { sendMessageText } from '../lib/api';
import { endConversation, getConversation, nextStep, startConversation, updateConversationData } from '../lib/conversation-manager';
import type { CalculateBillsConversationData } from '../lib/types';

export async function calculateBills(phoneNumber: string) {
   const [resident] = await db.select().from(residents).where(eq(residents.phoneNumber, phoneNumber));

   if (!resident || !resident.homeId) {
      return await sendMessageText(phoneNumber, 'Primero debes registrar una vivienda.');
   }

   await startConversation(phoneNumber, 'CALCULATE_BILLS');
   await updateConversationData(phoneNumber, {
      homeId: resident.homeId,
      lightBill: 0,
      waterBill: 0,
      extraBills: [],
   });

   return await sendMessageText(
      phoneNumber,
      'Por favor, envía las facturas de luz y agua en el siguiente formato:\nLuz: [cantidad]\nAgua: [cantidad]\n\nEjemplo:\nLuz: 50.40\nAgua: 30.20'
   );
}

export async function handleBillCalculation(phoneNumber: string, message: string) {
   const conversation = await getConversation(phoneNumber);
   if (!conversation) return;

   const data = conversation.data as CalculateBillsConversationData;

   switch (conversation.step) {
      case 0: // Light and water bills
         const bills = message
            .split('\n')
            .map(line => line.trim())
            .reduce(
               (acc, line) => {
                  const [type, amount] = line.split(':').map(part => part.trim());
                  const value = parseFloat(amount);
                  if (type.toLowerCase() === 'luz') acc.light = value;
                  if (type.toLowerCase() === 'agua') acc.water = value;
                  return acc;
               },
               { light: 0, water: 0 }
            );

         if (isNaN(bills.light) || isNaN(bills.water)) {
            return await sendMessageText(phoneNumber, 'Por favor, usa el formato correcto:\nLuz: [cantidad]\nAgua: [cantidad]');
         }

         await updateConversationData(phoneNumber, {
            ...data,
            lightBill: bills.light,
            waterBill: bills.water,
         });
         await nextStep(phoneNumber);

         return await sendMessageText(
            phoneNumber,
            '¿Hay facturas adicionales este mes? Responde "No" si no hay más facturas.\n\nSi hay más facturas, envíalas en el formato:\n[concepto]: [cantidad]\n\nEjemplo:\nInternet: 35.90\nGas: 25.50'
         );
      case 1: // Extra bills
         if (message.toLowerCase() === 'no') {
            return await calculateAndSendBills(phoneNumber, data);
         }

         const extraBills = message
            .split('\n')
            .map(line => line.trim())
            .map(line => {
               const [name, amount] = line.split(':').map(part => part.trim());
               return { name, amount: parseFloat(amount) };
            })
            .filter(bill => !isNaN(bill.amount));

         if (extraBills.length === 0) {
            return await sendMessageText(phoneNumber, 'Por favor, usa el formato correcto o responde "No" si no hay facturas adicionales.');
         }

         data.extraBills = extraBills;
         return await calculateAndSendBills(phoneNumber, data);
      default:
         await endConversation(phoneNumber);
         return await sendMessageText(phoneNumber, 'Ha ocurrido un error en la conversación. Vuelve a iniciar el proceso.');
   }
}

async function calculateAndSendBills(phoneNumber: string, data: CalculateBillsConversationData) {
   const homeResidents = await db.select().from(residents).where(eq(residents.homeId, data.homeId));
   const totalAmount = data.lightBill + data.waterBill + data.extraBills.reduce((sum, bill) => sum + bill.amount, 0);
   const amountPerResident = totalAmount / homeResidents.length;

   const billsBreakdown = [
      'Resumen de facturas:',
      `Luz: ${data.lightBill.toFixed(2)}€`,
      `Agua: ${data.waterBill.toFixed(2)}€`,
      ...data.extraBills.map(bill => `${bill.name}: ${bill.amount.toFixed(2)}€`),
      '',
      `Total: ${totalAmount.toFixed(2)}€`,
      `Cantidad por persona: ${amountPerResident.toFixed(2)}€`,
   ].join('\n');

   await endConversation(phoneNumber);

   for (const resident of homeResidents) {
      if (!resident.phoneNumber) continue;

      await sendMessageText(resident.phoneNumber, billsBreakdown);
   }
}

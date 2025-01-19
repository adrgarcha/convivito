import { db } from '../db/db';
import { homes, residents as residentsTable } from '../db/schema';
import { sendMessageText } from '../lib/api';
import { endConversation, getConversation, nextStep, previousStep, startConversation, updateConversationData } from '../lib/conversation-manager';
import type { RegisterHomeConversationData } from '../lib/types';

export async function registerHome(phoneNumber: string) {
   await startConversation(phoneNumber, 'REGISTER_HOME');
   await updateConversationData(phoneNumber, {
      home: {},
      residents: [],
      residentsNumber: 0,
   } as RegisterHomeConversationData);
   await sendMessageText(phoneNumber, 'Comencemos el proceso de registro. Por favor, escribe la dirección de tu vivienda.');
}

export async function handleHomeRegistration(phoneNumber: string, message: string) {
   const conversation = await getConversation(phoneNumber);
   if (!conversation) return;

   const data = conversation.data as RegisterHomeConversationData;

   switch (conversation.step) {
      case 0: // Address
         await updateConversationData(phoneNumber, {
            home: { address: message },
         });
         await nextStep(phoneNumber);
         return await sendMessageText(phoneNumber, '¿Cuál es el monto del alquiler? (Indica solo el número)');

      case 1: // Rent
         const rent = parseInt(message);
         if (isNaN(rent)) {
            return await sendMessageText(phoneNumber, 'Por favor, introduce un número válido.');
         }
         await updateConversationData(phoneNumber, {
            home: { ...data.home, rent },
         });
         await nextStep(phoneNumber);
         return await sendMessageText(phoneNumber, '¿Cuántas personas vivirán en total? (Indica un número)');

      case 2: // Residents number
         const residentsNumber = parseInt(message);
         if (isNaN(residentsNumber) || residentsNumber < 1) {
            return await sendMessageText(phoneNumber, 'Por favor, introduce un número válido mayor que 0.');
         }
         await updateConversationData(phoneNumber, { residentsNumber });
         await nextStep(phoneNumber);
         return await sendMessageText(
            phoneNumber,
            `Registraremos ${residentsNumber} residentes.\nEmpecemos con el primer residente.\n¿Cuál es su nombre?`
         );

      case 3: // Resident name
         await updateConversationData(phoneNumber, {
            residents: [...data.residents, { name: message }],
         });
         await nextStep(phoneNumber);
         return await sendMessageText(phoneNumber, '¿Cuál es su número de teléfono? (Indica el número sin espacios, con prefijo y sin "+")');

      case 4: // Resident phone
         const currentResidents = [...data.residents];
         const currentResident = currentResidents[currentResidents.length - 1];
         currentResident.phoneNumber = message;

         await updateConversationData(phoneNumber, { residents: currentResidents });

         if (currentResidents.length < data.residentsNumber) {
            await previousStep(phoneNumber);
            await sendMessageText(
               phoneNumber,
               `Residente ${currentResidents.length} registrado.\nRegistremos al siguiente residente.\n¿Cuál es su nombre?`
            );
         } else {
            const { home } = data;
            const newHome = await db.insert(homes).values(home).returning({ id: homes.id });
            const homeId = newHome[0].id;

            for (const resident of currentResidents) {
               await db.insert(residentsTable).values({ ...resident, homeId });
            }

            const finalMessage =
               `¡Registro completado!\n` +
               `Dirección: ${home.address}\n` +
               `Alquiler: ${home.rent}€\n` +
               `Residentes:\n${currentResidents.map(r => `- ${r.name}: ${r.phoneNumber}`).join('\n')}`;

            await endConversation(phoneNumber);
            return await sendMessageText(phoneNumber, finalMessage);
         }
         break;

      default:
         await endConversation(phoneNumber);
         return await sendMessageText(phoneNumber, 'Ha ocurrido un error en el registro.');
   }
}

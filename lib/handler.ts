import { addShoppingItem } from '../commands/add-shopping-item';
import { checkCleaning } from '../commands/check-cleaning';
import { listShoppingItems } from '../commands/list-shopping-items';
import { calculateBills, handleBillCalculation } from '../conversations/calculate-bills';
import { handleHomeRegistration, registerHome } from '../conversations/register-home';
import { handleCleaningSetup, setupCleaning } from '../conversations/setup-cleaning';
import { handleReminderSetup, setupReminder } from '../conversations/setup-reminder';
import { sendMessageText } from './api';
import { getConversation } from './conversation-manager';
import { capitalizeFirst } from './utils';

const AVAILABLE_COMMANDS = {
   hola: '👋 Saluda a Convivito.',
   'registrar vivienda': '🏠 Inicia el proceso de registro de una vivienda.',
   'establecer recordatorios': '⏰ Configura los recordatorios.',
   'configurar limpieza': '🧹 Configura las áreas de limpieza.',
   'ver limpieza': '🧹 Muestra la rotación de limpieza de esta semana.',
   'calcular facturas': '💰 Calcula y divide las facturas del mes.',
   añadir: '🛒 Añade un artículo a la lista de la compra (ej: "Añadir papel higiénico")',
   'ver lista de la compra': '🛒 Muestra la lista de la compra actual.',
   ayuda: '❓ Muestra este mensaje de ayuda.',
} as const;

function generateHelpMessage(): string {
   return (
      'Las opciones disponibles son:\n' +
      Object.entries(AVAILABLE_COMMANDS)
         .map(([command, description]) => `- ${capitalizeFirst(command)} - ${description}`)
         .join('\n')
   );
}

export async function handleMessage(phoneNumber: string, messageText: string) {
   const lowerText = messageText.toLowerCase();
   const activeConversation = await getConversation(phoneNumber);

   if (activeConversation) {
      switch (activeConversation.type) {
         case 'REGISTER_HOME':
            return await handleHomeRegistration(phoneNumber, messageText);
         case 'SETUP_REMINDER':
            return await handleReminderSetup(phoneNumber, messageText);
         case 'SETUP_CLEANING':
            return await handleCleaningSetup(phoneNumber, messageText);
         case 'CALCULATE_BILLS':
            return await handleBillCalculation(phoneNumber, messageText);
         default:
            return await sendMessageText(phoneNumber, 'Error en la conversación');
      }
   }

   if (lowerText.startsWith('añadir ')) {
      const item = messageText.slice(7).trim();
      if (!item) {
         return await sendMessageText(phoneNumber, 'Debes especificar qué artículo quieres añadir.');
      }
      return await addShoppingItem(phoneNumber, item);
   }

   switch (lowerText) {
      case 'hola':
         return await sendMessageText(phoneNumber, '¡Hola 👋! Para ver las opciones disponibles, escribe "ayuda".');
      case 'registrar vivienda':
         return await registerHome(phoneNumber);
      case 'establecer recordatorios':
         return await setupReminder(phoneNumber);
      case 'configurar limpieza':
         return await setupCleaning(phoneNumber);
      case 'ver limpieza':
         return await checkCleaning(phoneNumber);
      case 'calcular facturas':
         return await calculateBills(phoneNumber);
      case 'ver lista de la compra':
         return await listShoppingItems(phoneNumber);
      case 'ayuda':
         return await sendMessageText(phoneNumber, generateHelpMessage());
      default:
         return await sendMessageText(phoneNumber, 'Lo siento, no entiendo ese mensaje. Escribe "ayuda" para ver las opciones disponibles.');
   }
}

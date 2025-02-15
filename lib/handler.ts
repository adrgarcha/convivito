import { handleHomeRegistration, registerHome } from '../conversations/register-home';
import { handleCleaningSetup, setupCleaning } from '../conversations/setup-cleaning';
import { handleReminderSetup, setupReminder } from '../conversations/setup-reminder';
import { sendMessageText } from './api';
import { getConversation } from './conversation-manager';
import { capitalizeFirst } from './utils';

const AVAILABLE_COMMANDS = {
   hola: '👋 Saluda al bot.',
   'registrar vivienda': '🏠 Inicia el proceso de registro de una vivienda.',
   'establecer recordatorios': '⏰ Configura los recordatorios.',
   'configurar limpieza': '🧹 Configura las áreas de limpieza.',
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
         default:
            return await sendMessageText(phoneNumber, 'Error en la conversación');
      }
   }

   switch (lowerText) {
      case 'hola':
         return await sendMessageText(phoneNumber, '¡Hola! ¿En qué puedo ayudarte?');
      case 'registrar vivienda':
         return await registerHome(phoneNumber);
      case 'establecer recordatorios':
         return await setupReminder(phoneNumber);
      case 'configurar limpieza':
         return await setupCleaning(phoneNumber);
      case 'ayuda':
         return await sendMessageText(phoneNumber, generateHelpMessage());
      default:
         return await sendMessageText(phoneNumber, 'Lo siento, no entiendo ese mensaje. Escribe "ayuda" para ver las opciones disponibles.');
   }
}

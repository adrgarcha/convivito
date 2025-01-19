import { handleHomeRegistration, registerHome } from '../conversations/register-home';
import { sendMessageText } from './api';
import { getConversation } from './conversation-manager';

export async function handleMessage(phoneNumber: string, messageText: string) {
   const lowerText = messageText.toLowerCase();
   const activeConversation = await getConversation(phoneNumber);

   if (activeConversation) {
      switch (activeConversation.type) {
         case 'REGISTER_HOME':
            return await handleHomeRegistration(phoneNumber, messageText);
         default:
            return await sendMessageText(phoneNumber, 'Error en la conversación');
      }
   }

   switch (lowerText) {
      case 'hola':
         return await sendMessageText(phoneNumber, '¡Hola! ¿En qué puedo ayudarte?');
      case 'registrar vivienda':
         return await registerHome(phoneNumber);
      case 'ayuda':
         return await sendMessageText(phoneNumber, 'Las opciones disponibles son:\n- Hola\n- Registrar vivienda');
      default:
         return await sendMessageText(phoneNumber, 'Lo siento, no entiendo ese mensaje. Escribe "ayuda" para ver las opciones disponibles.');
   }
}

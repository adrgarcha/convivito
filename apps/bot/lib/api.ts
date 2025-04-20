import { ACCESS_TOKEN, BOT_ID } from './constants';

const API = 'https://graph.facebook.com/v21.0';
const headers = {
   'Content-Type': 'application/json',
   Authorization: `Bearer ${ACCESS_TOKEN}`,
};

export const sendMessageText = async (recipient: string, message: string) => {
   try {
      const response = await fetch(`${API}/${BOT_ID}/messages`, {
         method: 'POST',
         headers,
         body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: recipient,
            type: 'text',
            text: {
               body: message,
            },
         }),
      });

      if (response.ok) {
         console.log('¡Mensaje enviado satisfactoriamente!');
      } else {
         console.error(`Error enviando el mensaje: ${response.statusText}`);
      }
   } catch (error) {
      throw new Error(`Error enviando el mensaje: ${error}`);
   }
};

export const readMessage = async (messageId: string) => {
   try {
      const response = await fetch(`${API}/${BOT_ID}/messages`, {
         method: 'POST',
         headers,
         body: JSON.stringify({
            messaging_product: 'whatsapp',
            status: 'read',
            message_id: messageId,
         }),
      });

      if (response.ok) {
         console.log('¡Mensaje leído satisfactoriamente!');
      } else {
         console.error(`Error leyendo el mensaje: ${response.statusText}`);
      }
   } catch (error) {
      throw new Error(`Error leyendo el mensaje: ${error}`);
   }
};

export const reactMessage = async (messageId: string, recipient: string, emoji: string) => {
   try {
      const response = await fetch(`${API}/${BOT_ID}/messages`, {
         method: 'POST',
         headers,
         body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipient,
            type: 'reaction',
            reaction: {
               message_id: messageId,
               emoji,
            },
         }),
      });

      if (response.ok) {
         console.log('¡Mensaje reaccionado satisfactoriamente!');
      } else {
         console.error(`Error reaccionando al mensaje: ${response.statusText}`);
      }
   } catch (error) {
      throw new Error(`Error reaccionando al mensaje: ${error}`);
   }
};

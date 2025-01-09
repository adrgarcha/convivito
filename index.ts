import { ACCESS_TOKEN, API, BOT_ID, TEST_RECIPIENT } from './lib/constants';

const sendMessageText = async (message: string) => {
   try {
      const response = await fetch(`${API}/${BOT_ID}/messages`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ACCESS_TOKEN}`,
         },
         body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: TEST_RECIPIENT,
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

sendMessageText('¡Hola desde Convivito!');

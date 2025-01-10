import Elysia from 'elysia';
import util from 'util';
import { readMessage, sendMessageText } from './lib/api';
import { WEBHOOK_VERIFY_TOKEN } from './lib/constants';
import type { WebhookBody } from './lib/types';

const app = new Elysia()
   .get('/', () => '¡Hola desde el servidor de Convivito!')
   .get('/webhook', ({ query }) => {
      const mode = query['hub.mode'];
      const token = query['hub.verify_token'];
      const challenge = query['hub.challenge'];

      if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
         console.log('¡El webhook se ha verficado correctamente!');
         return new Response(challenge, { status: 200 });
      } else {
         return new Response('Token de verificación incorrecto', { status: 403 });
      }
   })
   .post('/webhook', async ({ body }: { body: WebhookBody }) => {
      console.log('¡Petición POST recibida!');
      console.log(util.inspect(body, false, null, true));

      const message = body.entry[0].changes[0].value.messages[0];
      const phoneNumber = message.from;
      const messageBody = message.text.body;

      await sendMessageText(phoneNumber, `Respondiendo al mensaje: ${messageBody}`);
      await readMessage(message.id);

      return new Response('¡Petición POST recibida!', { status: 200 });
   })
   .listen(3000);

console.log(`El servidor de Convivito está ejecutándose en ${app.server?.hostname}:${app.server?.port}`);

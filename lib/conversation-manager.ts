import { client } from './redis';
import type { ConversationState, ConversationType } from './types';

const CONVERSATION_PREFIX = 'conv:';
const CONVERSATION_TTL = 60 * 30; // 30 minutes

export async function startConversation(phoneNumber: string, type: ConversationType): Promise<void> {
   const conversation: ConversationState = {
      type,
      step: 0,
      data: {},
   };

   await client.setEx(`${CONVERSATION_PREFIX}${phoneNumber}`, CONVERSATION_TTL, JSON.stringify(conversation));
}

export async function getConversation(phoneNumber: string): Promise<ConversationState | undefined> {
   const data = await client.get(`${CONVERSATION_PREFIX}${phoneNumber}`);
   if (!data) return undefined;

   return JSON.parse(data) as ConversationState;
}

export async function updateConversationData<T extends ConversationState['data']>(phoneNumber: string, data: Partial<T>): Promise<void> {
   const conversation = await getConversation(phoneNumber);
   if (conversation) {
      conversation.data = { ...conversation.data, ...data } as T;
      await client.setEx(`${CONVERSATION_PREFIX}${phoneNumber}`, CONVERSATION_TTL, JSON.stringify(conversation));
   }
}

export async function previousStep(phoneNumber: string): Promise<void> {
   const conversation = await getConversation(phoneNumber);
   if (conversation) {
      conversation.step -= 1;
      await client.setEx(`${CONVERSATION_PREFIX}${phoneNumber}`, CONVERSATION_TTL, JSON.stringify(conversation));
   }
}

export async function nextStep(phoneNumber: string): Promise<void> {
   const conversation = await getConversation(phoneNumber);
   if (conversation) {
      conversation.step += 1;
      await client.setEx(`${CONVERSATION_PREFIX}${phoneNumber}`, CONVERSATION_TTL, JSON.stringify(conversation));
   }
}

export async function endConversation(phoneNumber: string): Promise<void> {
   await client.del(`${CONVERSATION_PREFIX}${phoneNumber}`);
}

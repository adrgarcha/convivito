import type { InsertHome, InsertResident } from '../db/schema';

export type WebhookBody = {
   object: 'whatsapp_business_account';
   entry: WebhookEntry[];
};

type WebhookEntry = {
   id: string;
   changes: WebhookChange[];
};

type WebhookChange = {
   value: {
      messaging_product: 'whatsapp';
      metadata: {
         display_phone_number: string;
         phone_number_id: string;
      };
      contacts: Contact[];
      messages: Message[];
   };
   field: 'messages';
};

type Contact = {
   profile: {
      name: string;
   };
   wa_id: string;
};

type Message = {
   from: string;
   id: string;
   timestamp: string;
   text: {
      body: string;
   };
   type: 'text';
};

export type ConversationType = 'REGISTER_HOME' | 'SETUP_REMINDER' | 'NONE';

export type RegisterHomeConversationData = {
   home: Partial<InsertHome>;
   residents: Partial<InsertResident>[];
   residentsNumber: number;
};

export type SetupReminderConversationData = {
   rentStartDay: number;
   rentEndDay: number;
   cleaningStartDay: number;
   cleaningEndDay: number;
};

export interface ConversationState {
   type: ConversationType;
   step: number;
   data: {
      REGISTER_HOME: RegisterHomeConversationData;
      SETUP_REMINDER: SetupReminderConversationData;
      NONE: Record<string, never>;
   }[ConversationType];
}

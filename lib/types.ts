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

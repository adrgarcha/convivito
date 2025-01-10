import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const homes = sqliteTable('homes', {
   id: integer().primaryKey({ autoIncrement: true }),
   address: text(),
   rent: integer(),
   reminderId: integer('reminder_id'),
});

export const homesRelations = relations(homes, ({ one, many }) => ({
   residents: many(residents),
   reminder: one(reminders, {
      fields: [homes.reminderId],
      references: [reminders.id],
   }),
}));

export const residents = sqliteTable('residents', {
   id: integer().primaryKey({ autoIncrement: true }),
   name: text(),
   phoneNumber: text('phone_number'),
   homeId: integer('home_id'),
});

export const residentsRelations = relations(residents, ({ one, many }) => ({
   home: one(homes, {
      fields: [residents.homeId],
      references: [homes.id],
   }),
}));

export const reminders = sqliteTable('reminders', {
   id: integer().primaryKey({ autoIncrement: true }),
   rentDate: integer('rent_date', { mode: 'timestamp' }),
   cleaningDate: integer('cleaning_date', { mode: 'timestamp' }),
   homeId: integer('home_id'),
});

export const remindersRelations = relations(reminders, ({ one, many }) => ({
   home: one(homes, {
      fields: [reminders.homeId],
      references: [homes.id],
   }),
}));

import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const homes = sqliteTable('homes', {
   id: integer().primaryKey({ autoIncrement: true }),
   address: text().unique(),
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
   phoneNumber: text('phone_number').unique(),
   homeId: integer('home_id'),
});

export const residentsRelations = relations(residents, ({ one }) => ({
   home: one(homes, {
      fields: [residents.homeId],
      references: [homes.id],
   }),
}));

export const reminders = sqliteTable('reminders', {
   id: integer().primaryKey({ autoIncrement: true }),
   rentStartDay: integer('rent_start_day'),
   rentEndDay: integer('rent_end_day'),
   cleaningStartDay: integer('cleaning_start_day'),
   cleaningEndDay: integer('cleaning_end_day'),
   homeId: integer('home_id'),
});

export const remindersRelations = relations(reminders, ({ one }) => ({
   home: one(homes, {
      fields: [reminders.homeId],
      references: [homes.id],
   }),
}));

export const cleaningAreas = sqliteTable('cleaning_areas', {
   id: integer().primaryKey({ autoIncrement: true }),
   name: text(),
   residentId: integer('resident_id'),
   homeId: integer('home_id'),
});

export const cleaningAreasRelations = relations(cleaningAreas, ({ one }) => ({
   home: one(homes, {
      fields: [cleaningAreas.homeId],
      references: [homes.id],
   }),
   resident: one(residents, {
      fields: [cleaningAreas.residentId],
      references: [residents.id],
   }),
}));

export type SelectHome = typeof homes.$inferSelect;
export type InsertHome = typeof homes.$inferInsert;

export type SelectResident = typeof residents.$inferSelect;
export type InsertResident = typeof residents.$inferInsert;

export type SelectReminder = typeof reminders.$inferSelect;
export type InsertReminder = typeof reminders.$inferInsert;

export type SelectCleaningArea = typeof cleaningAreas.$inferSelect;
export type InsertCleaningArea = typeof cleaningAreas.$inferInsert;

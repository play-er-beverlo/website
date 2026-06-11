import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

export const bookings = sqliteTable("bookings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  calId: integer("calId").notNull(),
  calEventTypeId: integer("calEventTypeId"),
  calStatus: text("calStatus").notNull(),
  calData: text("calData").notNull(),
  stripeClientSecret: text("stripeClientSecret"),
  stripeData: text("stripeData"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  paid: integer({ mode: "boolean" }),
});

export const summerCupRegistrations = sqliteTable(
  "summer_cup_registrations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playDayId: text("playDayId").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    communication: text("communication").notNull(),
    qrCodeBase64: text("qrCodeBase64").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    uniqueIndex("summer_cup_registrations_playDayId_email_unique").on(
      table.playDayId,
      table.email
    ),
  ]
);

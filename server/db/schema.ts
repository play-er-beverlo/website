import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

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

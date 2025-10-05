import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const bookings = sqliteTable("bookings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  calId: integer("calId").notNull(),
  calData: text("calData").notNull(),
  calStatus: text("calStatus").notNull(),
  stripeClientSecret: text("stripeClientSecret"),
  stripeData: text("stripeData"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  paid: integer({ mode: "boolean" }),
});

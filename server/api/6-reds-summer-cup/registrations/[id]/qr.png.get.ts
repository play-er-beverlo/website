import { summerCupRegistrations } from "hub:db:schema";
import { db } from "hub:db";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: "Invalid id" });
  }

  const row = await db
    .select({ qr: summerCupRegistrations.qrCodeBase64 })
    .from(summerCupRegistrations)
    .where(eq(summerCupRegistrations.id, id))
    .get();

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }

  setResponseHeader(event, "content-type", "image/png");
  setResponseHeader(event, "cache-control", "public, max-age=31536000, immutable");

  return Buffer.from(row.qr, "base64");
});

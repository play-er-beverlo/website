import { getSlots } from "~~/server/utils/cal";
import { gameLocationEventTypeIdMapping } from "#shared/data/booking";
import * as v from "valibot";

const querySchema = v.object({
  game: v.string(),
  date: v.pipe(v.string(), v.isoDate()),
  location: v.pipe(
    v.string(),
    v.transform((x) => +x)
  ),
  duration: v.string(),
});

export default defineEventHandler(async (event) => {
  // TODO: Make more generic?
  const query = await getValidatedQuery(event, (query) => v.safeParse(querySchema, query));

  if (!query.success) {
    setResponseStatus(event, 400);

    return {
      success: false,
      validationErrors: query.issues,
    };
  }

  let eventTypeId = gameLocationEventTypeIdMapping[query.output.game]?.[query.output.location];

  if (!eventTypeId) {
    setResponseStatus(event, 400);

    return {
      success: false,
      error: "Event type id is invalid.",
    };
  }

  const slotsData = await getSlots({
    eventTypeId,
    date: query.output.date,
    duration: +query.output.duration,
  });

  return ((slotsData as any)["data"][query.output.date] ?? []).map((x: any) => x.start);
});

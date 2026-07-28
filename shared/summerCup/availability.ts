/** Shape of GET /api/6-reds-summer-cup/availability. Shared by the endpoint and the UI. */
export interface AvailabilityDay {
  id: string;
  label: string;
  shortLabel: string;
  tournament: number;
  registered: number;
  capacity: number;
  remaining: number;
  full: boolean;
  past: boolean;
  /**
   * Everyone registered for this day, alphabetically. Empty when nobody signed up,
   * and also empty for past days regardless of registrations — the endpoint strips
   * names once a day is past, since those rows are never expanded in the UI.
   */
  players: string[];
}

export interface AvailabilityResponse {
  playDays: AvailabilityDay[];
}

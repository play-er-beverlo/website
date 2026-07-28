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
  /** Everyone registered for this day, alphabetically. Empty when nobody signed up. */
  players: string[];
}

export interface AvailabilityResponse {
  playDays: AvailabilityDay[];
}

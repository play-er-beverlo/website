export const games = ["snooker", "darts", "pool", "golfbiljart"];

export const gameLocations: { [game: string]: number[] } = {
  darts: [6],
  golfbiljart: [1],
  pool: [1, 2],
  snooker: [1, 2, 3],
};

export const gameLocationDisplayNames: { [game: string]: string } = {
  darts: "darts",
  golfbiljart: "golfbiljart",
  pool: "pooltafel",
  snooker: "snookertafel",
};

export const gameLocationEventTypeIdMapping: { [game: string]: { [location: number]: number } } = {
  // Steff
  // snooker: {
  //   1: 3632050, // https://app.cal.com/event-types/3632050?tabName=setup
  //   2: 3632004, // https://app.cal.com/event-types/3632004?tabName=setup
  // },
  // Play-ER
  darts: {
    6: 3688172, // https://app.cal.com/event-types/3688172?tabName=setup
  },
  golfbiljart: {
    1: 3687777, // https://app.cal.com/event-types/3687777?tabName=setup
  },
  pool: {
    1: 3687591, // https://app.cal.com/event-types/3687591?tabName=setup
    2: 3687610, // https://app.cal.com/event-types/3687610?tabName=setup
  },
  snooker: {
    1: 3684407, // https://app.cal.com/event-types/3684407?tabName=setup
    2: 3684561, // https://app.cal.com/event-types/3684561?tabName=setup
    3: 3687555, // https://app.cal.com/event-types/3687555?tabName=setup
  },
};

export const gameLocationPostfix: { [game: string]: { [location: number]: string } } = {
  darts: {
    6: " (met AI)",
  },
};

export const durations = [60, 90, 120, 150, 180, 240];

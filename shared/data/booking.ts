export const games = ["snooker", "darts", "pool", "golfbiljart"];

export const gameLocations: { [game: string]: number[] } = {
  darts: [1, 2, 3, 4, 5, 6, 7, 8],
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
  // darts: {
  //   1: 3566435, // https://app.cal.com/event-types/3566435?tabName=setup
  //   2: 3566452, // https://app.cal.com/event-types/3566452?tabName=setup
  //   3: 3566456, // https://app.cal.com/event-types/3566456?tabName=setup
  //   4: 3566480, // https://app.cal.com/event-types/3566480?tabName=setup
  //   5: 3566497, // https://app.cal.com/event-types/3566497?tabName=setup
  //   6: 3566503, // https://app.cal.com/event-types/3566503?tabName=setup
  //   7: 3566507, // https://app.cal.com/event-types/3566507?tabName=setup
  //   8: 3566509, // https://app.cal.com/event-types/3566509?tabName=setup
  // },
  // golfbiljart: {
  //   1: 3566685, // https://app.cal.com/event-types/3566685?tabName=setup
  // },
  // pool: {
  //   1: 3566664, // https://app.cal.com/event-types/3566664?tabName=setup
  //   2: 3566672, // https://app.cal.com/event-types/3566672?tabName=setup
  // },
  snooker: {
    1: 3684407, // https://app.cal.com/event-types/3684407?tabName=setup
    //   2: 3566271, // https://app.cal.com/event-types/3566271?tabName=setup
    //   3: 3566279, // https://app.cal.com/event-types/3566279?tabName=setup
  },
};

export const durations = [60, 90, 120, 150, 180, 240];

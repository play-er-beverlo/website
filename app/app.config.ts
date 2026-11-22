export default defineAppConfig({
  // Homepage "EVENTS" section and its nav link. Off while no upcoming event is planned.
  showEvents: false,
  ui: {
    colors: {
      primary: "blue",
      neutral: "grey",
    },
    button: {
      slots: {
        base: "button justify-center",
      },
    },
  },
});

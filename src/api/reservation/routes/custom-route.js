module.exports = {
  routes: [
    {
      method: "GET",
      path: "/reservations/yearly-stats",
      handler: "reservation.getYearlyStats",
      config: {
        policies: [],
        auth: false,
      },
    },

    {
      method: "GET",
      path: "/reservations/compare-daily-revenue",
      handler: "reservation.compareDailyRevenue",
      config: {
        policies: [],
        auth: false,
      },
    },

    {
      method: "GET",
      path: "/reservations/daily-revenue",
      handler: "reservation.getDailyRevenue",
      config: {
        policies: [],
        auth: false,
      },
    },

    {
      method: "GET",
      path: "/reservations/search",
      handler: "reservation.searchReservations",
      config: {
        auth: false,
      },
    },
  ],
};

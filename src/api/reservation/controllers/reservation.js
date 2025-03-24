"use strict";

/**
 * reservation controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::reservation.reservation",
  ({ strapi }) => ({
    async getYearlyStats(ctx) {
      try {
        const { year } = ctx.query;

        if (!year || typeof year !== "string") {
          return ctx.badRequest("Vui lòng cung cấp năm hợp lệ");
        }

        const yearInt = parseInt(year);
        const currentDate = new Date(); // Ngày hiện tại: 2025-03-19
        const currentYear = currentDate.getFullYear(); // 2025
        const currentMonth = currentDate.getMonth() + 1; // 3 (tháng 3)

        // Xác định số tháng cần thống kê
        const monthsToShow = yearInt === currentYear ? currentMonth : 12;

        // Tính ngày cuối của tháng cuối cùng cần thống kê
        const lastDateOfMonth = new Date(
          yearInt,
          monthsToShow,
          0,
          23,
          59,
          59,
          999
        ); // Ngày cuối tháng

        // Truy vấn nhóm theo tháng và tính tổng amount
        const monthlyData = await strapi.db
          .connection("reservations")
          .select(strapi.db.connection.raw("EXTRACT(MONTH FROM date) as month"))
          .count("id as roomCount")
          .sum("amount as total")
          .whereBetween("date", [
            new Date(yearInt, 0, 1, 0, 0, 0, 0), // Ngày đầu năm, 00:00:00
            lastDateOfMonth, // Ngày cuối của tháng cuối cùng
          ])
          .groupByRaw("EXTRACT(MONTH FROM date)")
          .orderBy("month");

        // Khởi tạo mảng kết quả cho các tháng cần hiển thị
        const monthlyStats = Array.from(
          { length: monthsToShow },
          (_, index) => ({
            month: index + 1,
            total: 0,
            roomCount: 0,
          })
        );

        // Gán giá trị từ kết quả truy vấn
        monthlyData.forEach((item) => {
          const monthIndex = parseInt(item.month) - 1; // EXTRACT trả về 1-12, chuyển về 0-11
          if (monthIndex < monthsToShow) {
            monthlyStats[monthIndex].total = parseInt(item.total);
            monthlyStats[monthIndex].roomCount = parseInt(item.roomCount);
          }
        });

        // Trả về kết quả
        ctx.body = monthlyStats;
      } catch (error) {
        ctx.badRequest(`Có lỗi xảy ra: ${error.message}`);
      }
    },

    async compareDailyRevenue(ctx) {
      try {
        // Lấy thời gian hiện tại theo GMT+7
        const now = new Date().toLocaleString("en-US", {
          timeZone: "Asia/Ho_Chi_Minh",
        });

        const today = new Date(now);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        // Lấy thời gian bắt đầu và kết thúc theo GMT+7
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));
        const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
        const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

        console.log("Start of Today:", startOfToday.toISOString());
        console.log("End of Today:", endOfToday.toISOString());
        console.log("Start of Yesterday:", startOfYesterday.toISOString());
        console.log("End of Yesterday:", endOfYesterday.toISOString());

        // Truy vấn tổng doanh thu hôm nay
        const todayData = await strapi.db
          .connection("reservations")
          .sum("amount as total")
          .whereBetween("date", [
            startOfToday.toISOString(),
            endOfToday.toISOString(),
          ])
          .first();

        // Truy vấn tổng doanh thu hôm qua
        const yesterdayData = await strapi.db
          .connection("reservations")
          .sum("amount as total")
          .whereBetween("date", [
            startOfYesterday.toISOString(),
            endOfYesterday.toISOString(),
          ])
          .first();

        console.log("Today Data:", todayData);
        console.log("Yesterday Data:", yesterdayData);

        // Lấy giá trị tổng (hoặc 0 nếu không có dữ liệu)
        const todayTotal = parseInt(todayData?.total) || 0;
        const yesterdayTotal = parseInt(yesterdayData?.total) || 0;

        // Tính phần trăm thay đổi
        let percentageChange;
        if (yesterdayTotal === 0) {
          percentageChange = todayTotal === 0 ? 0 : 100;
        } else {
          percentageChange =
            ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;
          percentageChange = parseFloat(percentageChange.toFixed(2));
        }

        // Trả về kết quả
        ctx.body = {
          yesterdayTotal,
          todayTotal,
          percentageChange,
        };
      } catch (error) {
        ctx.badRequest(`Có lỗi xảy ra: ${error.message}`);
      }
    },

    async getDailyRevenue(ctx) {
      try {
        const { startDate, endDate } = ctx.query;

        // Kiểm tra kiểu của startDate và endDate
        if (
          (startDate && typeof startDate !== "string") ||
          (endDate && typeof endDate !== "string")
        ) {
          return ctx.badRequest("startDate và endDate phải là kiểu string");
        }

        // Xác định ngày hiện tại và ngày đầu tháng
        const today = new Date(); // 2025-03-19
        const defaultStartDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        ); // 2025-03-01
        const defaultEndDate = today;

        // Nếu không cung cấp startDate hoặc endDate, dùng mặc định
        const start = startDate
          ? new Date(String(startDate))
          : defaultStartDate;
        const end = endDate ? new Date(String(endDate)) : defaultEndDate;

        // Kiểm tra tính hợp lệ của ngày
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return ctx.badRequest("Ngày không hợp lệ");
        }

        if (start > end) {
          return ctx.badRequest("startDate phải nhỏ hơn hoặc bằng endDate");
        }

        // Đặt thời gian theo UTC
        const startOfPeriod = new Date(
          Date.UTC(
            start.getFullYear(),
            start.getMonth(),
            start.getDate(),
            0,
            0,
            0,
            0
          )
        );
        const endOfPeriod = new Date(
          Date.UTC(
            end.getFullYear(),
            end.getMonth(),
            end.getDate(),
            23,
            59,
            59,
            999
          )
        );

        // Truy vấn dữ liệu: nhóm theo ngày, tính tổng amount và đếm số lượng reservation (roomCount)
        const dailyData = await strapi.db
          .connection("reservations")
          .select(
            strapi.db.connection.raw("TO_CHAR(date, 'YYYY-MM-DD') as date")
          )
          .sum("amount as total")
          .count("id as roomCount") // Đếm số lượng reservation (giả định mỗi reservation là 1 phòng)
          .whereBetween("date", [startOfPeriod, endOfPeriod])
          .groupByRaw("TO_CHAR(date, 'YYYY-MM-DD')")
          .orderBy("date");

        // Sử dụng object để lưu trữ dữ liệu theo ngày
        const statsByDate = {};
        dailyData.forEach((item) => {
          statsByDate[item.date] = {
            total: parseInt(item.total),
            roomCount: parseInt(item.roomCount),
          };
        });

        // Tạo danh sách tất cả các ngày trong khoảng thời gian
        const dailyStats = [];
        let currentDate = new Date(startOfPeriod);
        while (currentDate <= endOfPeriod) {
          const dateStr = currentDate.toISOString().split("T")[0]; // Định dạng YYYY-MM-DD
          dailyStats.push({
            date: dateStr,
            total: statsByDate[dateStr]?.total || 0,
            roomCount: statsByDate[dateStr]?.roomCount || 0,
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Trả về kết quả
        ctx.body = dailyStats;
      } catch (error) {
        ctx.badRequest(`Có lỗi xảy ra: ${error.message}`);
      }
    },

    async searchReservations(ctx) {
      // Kiểm tra ctx và ctx.query tồn tại
      if (!ctx || !ctx.query) {
        throw new Error("Invalid context object");
      }

      const { search } = ctx.query;

      // Kiểm tra search có phải là chuỗi hợp lệ
      if (typeof search !== "string" || search.trim() === "") {
        return ctx.badRequest("Thiếu hoặc tham số tìm kiếm không hợp lệ");
      }

      try {
        const searchTrimmed = search.trim();
        const searchNum = Number.parseInt(searchTrimmed, 10);

        const reservations = await strapi.entityService.findMany(
          "api::reservation.reservation",
          {
            filters: {
              $or: [
                { id: Number.isNaN(searchNum) ? 0 : searchNum }, // Tìm theo ID
                {
                  booking: {
                    guest_name: { $containsi: searchTrimmed },
                  },
                }, // Tìm theo tên khách
                {
                  booking: {
                    cccd: { $containsi: searchTrimmed },
                  },
                }, // Tìm theo CCCD
              ],
            },
            populate: { booking: true }, // Đảm bảo lấy dữ liệu booking
          }
        );

        return reservations || []; // Trả về mảng rỗng nếu không có kết quả
      } catch (error) {
        console.error("Error in searchReservations:", error);
        return ctx.badRequest("Đã xảy ra lỗi khi tìm kiếm đặt phòng");
      }
    },
  })
);

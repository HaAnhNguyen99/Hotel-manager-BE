"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::contact.contact", ({ strapi }) => ({
  async create(ctx) {
    const { name, sdt, message } = ctx.request.body.data;

    try {
      // Gửi email
      await strapi.plugins["email"].services.email.send({
        from: "Phương Trang Hotel <hjhj199975@gmail.com>",
        to: "hjhj199975@gmail.com",
        subject: `Liên hệ từ ${name} - (${sdt})`,
        html: `
  <div style="background-color: #F0E6D2; padding: 50px 20px; font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.7; color: #2D2D2D;">
  <div style="max-width: 700px; background: #FFFFFF; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.12);">
    <!-- Header -->
    <div style="background: linear-gradient(90deg, #8B6F47, #C9B68B); padding: 40px; text-align: center;">
      <img src="https://res.cloudinary.com/dgvmkzaoe/image/upload/v1743345738/logo_v2_dark_bba092341c.jpg" alt="Phương Trang Hotel Logo" style="max-width: 100px; margin-bottom: 10px; border-radius: 20%; overflow: hidden;">
      <h1 style="color: #FFFFFF; margin: 0; font-size: 30px; font-weight: 700;">Phương Trang Hotel</h1>
      <p style="color: #F0E6D2; margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Thông tin liên hệ từ khách hàng</p>
    </div>

    <!-- Body -->
    <div style="padding: 40px;">
      <h2 style="color: #8B6F47; font-size: 24px; margin: 0 0 25px; font-weight: 600;">Thông tin liên hệ</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 16px;">
        <tr>
          <td style="padding: 12px 0; font-weight: 600; color: #2D2D2D; width: 150px;">Họ và tên:</td>
          <td style="padding: 12px 0; color: #4B4B4B;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; font-weight: 600; color: #2D2D2D;">Số điện thoại:</td>
          <td style="padding: 12px 0; color: #4B4B4B;">${sdt}</td>
        </tr>
      </table>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;" />

      <div style="margin-bottom: 20px;">
        <h3 style="color: #8B6F47; font-size: 20px; margin: 0 0 15px; font-weight: 600;">Nội dung liên hệ:</h3>
        <div style="background: #F9F5ED; padding: 20px; border-radius: 8px; border: 1px solid #E5E7EB; white-space: pre-line; font-size: 15px; color: #4B4B4B;">
          ${message}
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #8B6F47; padding: 25px; text-align: center; color: #FFFFFF; font-size: 14px;">
      <p style="margin: 0; font-weight: 500;">Email được gửi tự động từ hệ thống <strong>Phương Trang Hotel</strong>.</p>
      <p style="margin: 10px 0 0; opacity: 0.9;">
        Liên hệ với chúng tôi qua 
        <a href="mailto:khachsanphuongtrang@gmail.com" style="color: #F0E6D2; text-decoration: none; font-weight: 600;">support@phuongtranghotel.com</a> 
        hoặc 
        <a href="tel:0979108705" style="color: #F0E6D2; text-decoration: none; font-weight: 600;">0979108705</a>
      </p>
      <p style="margin: 10px 0 0; font-size: 12px; opacity: 0.7;">
        © 2025 Phương Trang Hotel. All rights reserved.
      </p>
    </div>
  </div>
</div>
`,
      });
      // Lưu vào database
      const response = await super.create(ctx);
      return ctx.send({ success: true });
    } catch (err) {
      console.error("Lỗi gửi email:", err);
      return ctx.internalServerError("Đã xảy ra lỗi khi gửi email.");
    }
  },
}));

module.exports = [
  "strapi::logger",
  "strapi::errors",
  "strapi::security",
  "strapi::cors",
  "strapi::poweredBy",
  "strapi::query",
  {
    name: "strapi::body",
    config: {
      formLimit: "10mb", // Giới hạn form data (default: 2mb)
      jsonLimit: "10mb", // Giới hạn JSON payload
      bufferLimit: "10mb", // Giới hạn buffer
      formidable: {
        maxFileSize: 10 * 1024 * 1024, // Giới hạn file 10MB
      },
    },
  },
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];

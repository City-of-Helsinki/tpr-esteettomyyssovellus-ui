module.exports = {
  // BASE_PATH is defined in .env.development for local development, and .env.production for test and production servers
  // assetPrefix is not currently needed
  basePath: process.env.BASE_PATH || "",
  i18n: {
    locales: ["fi", "sv", "en"],
    defaultLocale: "fi",
    localeDetection: false,
  },
  trailingSlash: true,
};

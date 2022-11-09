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
  // NOTE: the following rewrites section is only needed to use dev mode in the test or production server
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/:path*",
  //       destination: "http://localhost:8000/api/:path*/",
  //     },
  //   ];
  // },
};

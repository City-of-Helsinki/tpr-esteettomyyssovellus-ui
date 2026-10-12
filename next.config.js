module.exports = {
  // Set BASE_PATH in the build environment. Next.js embeds this value in the build,
  // so test and production need separate builds when their paths differ.
  basePath: process.env.BASE_PATH || "",
  transpilePackages: ["mui-styles"],
  eslint: {
    // ESLint 9 is run explicitly before the build; Next 13 uses removed ESLint 8 options.
    // ignoreDuringBuilds: true,
  },
  i18n: {
    locales: ["fi", "sv", "en"],
    defaultLocale: "fi",
    localeDetection: false,
  },
  swcMinify: true,
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

import { NextRouter } from "next/router";
import absoluteUrl from "next-absolute-url";

export const getOrigin = (router: NextRouter): string => {
  const { origin } = absoluteUrl();

  return `${origin}${router.basePath}`;
};

export default getOrigin;

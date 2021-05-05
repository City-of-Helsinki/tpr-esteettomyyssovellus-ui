// this files code from marketing project: if not used / edited -> delete

import { NextRouter } from "next/router";
import absoluteUrl from "next-absolute-url";

export const getOrigin = (router: NextRouter): string => {
  const { origin } = absoluteUrl();
  // console.log("origin", origin);
  // console.log("basePath", router.basePath);

  return `${origin}${router.basePath}`;
};

export default getOrigin;

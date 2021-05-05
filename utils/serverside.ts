// NOTE: These functions should only be used during server-side rendering
// this files code from marketing project: if not used / edited -> delete

import { IncomingMessage } from "http";
import { Redirect } from "next";

export const getOriginServerSide = (): string => {
  // The server-side calls should use the local backend directly
  // Note: the client-side calls use the full path, which is handled by getOrigin in request.ts
  return "http://localhost:8008";
};

export const redirectToLogin = (resolvedUrl: string): { redirect: Redirect } => {
  // The server-side needs to redirect the client-side, so don't use getOriginServerSide here
  // The base path is needed to make sure the login page redirects work correctly in the server environment
  return {
    redirect: {
      destination: `${process.env.BASE_PATH}/helauth/login/?next=${process.env.BASE_PATH}${resolvedUrl}`,
      permanent: false,
    },
  };
};

// export const checkUser = async (req: IncomingMessage): Promise<User | undefined> => {
//   // Check the current user
//   // TODO: define how a moderator user is identified
//   const userResponse = await fetch(`${getOriginServerSide()}/api/user/?format=json`, { headers: { cookie: req.headers.cookie as string } });

//   if (!userResponse.ok) {
//     // Invalid user
//     return undefined;
//   }

//   // Check the user response
//   const user = await userResponse.json();

//   if (!user.email || user.email.length === 0) {
//     // Invalid user
//     return undefined;
//   }

//   // Valid user
//   return { authenticated: true, ...user };
// };

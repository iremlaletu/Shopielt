import { createClient, OAuthStrategy, Tokens } from "@wix/sdk";
import { env } from "./env";
import { NextRequest, NextResponse } from "next/server";
import { WIX_SESSION_COOKIE } from "./lib/constants";

const wixClient = createClient({
  auth: OAuthStrategy({ clientId: env.NEXT_PUBLIC_WIX_CLIENT_ID }),
});

export async function middleware(request: NextRequest) {
  // check if the session cookie is already set in browser
  const cookies = request.cookies;
  const sessionCookie = cookies.get(WIX_SESSION_COOKIE);

  let sessionTokens = sessionCookie
    ? (JSON.parse(sessionCookie.value) as Tokens)
    : await wixClient.auth.generateVisitorTokens();

  if (sessionTokens.accessToken.expiresAt < Math.floor(Date.now() / 1000)) {
    try {
      sessionTokens = await wixClient.auth.renewToken(
        sessionTokens.refreshToken,
      );
    } catch (error) {
      sessionTokens = await wixClient.auth.generateVisitorTokens();
    }
  }
  request.cookies.set(WIX_SESSION_COOKIE, JSON.stringify(sessionTokens));

  const res = NextResponse.next({ request });
  
  res.cookies.set(WIX_SESSION_COOKIE, JSON.stringify(sessionTokens), {
    maxAge: 60 * 60 * 24 * 14,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

// where this midw executed what . Below code is negative matching
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

// after 14 days, refreshtokens will be expired, then they will lose their products in their carts too
// if they didnt login within 14 days again they need to login again
// these tokens(session and refresh) stored in a cookie, in order for them to work, pass them to wixclient.base 
// If the access token has expired but the refresh token is valid, generateVisitorTokens() returns the existing refresh token and a newly generated access token.
// If the refresh token is not valid, generateVisitorTokens() returns a new refresh token and a new access token.
import { WIX_OAUTH_DATA_COOKIE, WIX_SESSION_COOKIE } from "@/lib/constants";
import { getWixServerClient } from "@/lib/wix-client.server";
import { OauthData } from "@wix/sdk";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code"); // authorization code
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");
  const error_description = req.nextUrl.searchParams.get("error_description");

  if (error) {
    return new Response(error_description, { status: 400 });
  }

  // get the oAuthData from the cookie
  const oAuthData: OauthData = JSON.parse(
    (await cookies()).get(WIX_OAUTH_DATA_COOKIE)?.value || "{}",
  );

  if (!code || !state || !oAuthData) {
    return new Response("Invalid request", { status: 400 });
  }

  const wixClient = getWixServerClient();

  // used to verify that this request is valid 
  // wixclient send a promise await first
  const memberTokens = await (await wixClient).auth.getMemberTokens(
    code,
    state,
    oAuthData,
  );

  (await cookies()).delete(WIX_OAUTH_DATA_COOKIE);
  (await cookies()).set(WIX_SESSION_COOKIE, JSON.stringify(memberTokens), {
    maxAge: 60 * 60 * 24 * 14, // after 14 days, cookie expired the user need to login again
    secure: process.env.NODE_ENV === "production",
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: oAuthData.originalUri || "/",
    },
  });

}

// wix send us some data in the search params
// should be the same path as the wix dasboard settings

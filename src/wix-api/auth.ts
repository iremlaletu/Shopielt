import { env } from "@/env";
import { WixClient } from "@/lib/wix-client.base";
import { OauthData } from "@wix/sdk";

export async function generateOAuthData(
  wixClient: WixClient,
  originPath?: string, // redirect back to page after auth, optional
) {
  return wixClient.auth.generateOAuthData(
    env.NEXT_PUBLIC_BASE_URL + "/api/auth/callback/wix",
    env.NEXT_PUBLIC_BASE_URL + "/" + (originPath || ""),
  );
}

export async function getLoginUrl(wixClient: WixClient, oAuthData: OauthData) {
  const { authUrl } = await wixClient.auth.getAuthUrl(oAuthData, {
    responseMode: "query"
  });

  return authUrl;
}

{/* 
why 2 functions? because we store the oAuthData in a cookie, cuase works differently in server/client
and dont have to tie this either server or client.
responseMode: "query" means that the OAuth server (Wix) will send the authorization response — like code and state — as URL query parameters
"query" is just the way to handle the OAuth redirect flow.
It’s used because it’s easy to handle on both server and client — the callback API route can just read req.query.code.
*/}

export async function getLogoutUrl(wixClient: WixClient) {
  const { logoutUrl } = await wixClient.auth.logout(env.NEXT_PUBLIC_BASE_URL);

  return logoutUrl;
}
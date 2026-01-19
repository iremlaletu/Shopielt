import { ApiKeyStrategy, createClient, Tokens } from "@wix/sdk";
import { WIX_SESSION_COOKIE } from "./constants";
import { cookies } from "next/headers";
import { getWixClient } from "./wix-client.base";
import { cache } from "react";
import { files } from "@wix/media";
import { env } from "@/env";

export const getWixServerClient = cache(async () => {
  let tokens: Tokens | undefined;

  try {
    const cookieStore = await cookies(); // after next.js 15 you have to await first
    tokens = JSON.parse(cookieStore.get(WIX_SESSION_COOKIE)?.value || "{}");
  } catch (error) {
    // if the token not exist middleware will create visitor tokens
  }
  return getWixClient(tokens);
})

export const getWixAdminClient = cache(() => {
  const wixClient = createClient({
    modules:{
      files
    },
    auth: ApiKeyStrategy({
      apiKey: env.WIX_API_KEY,
      siteId: env.NEXT_PUBLIC_WIX_SITE_ID
    })
  })
  return wixClient
})

// we will use this when we need the wixclient in server components or server actions or backend route handling
// cache makes getWixServerClient() idempotent and efficient during a single request, preventing redundant cookie reads and client construction

//admin client can only be used in backend code
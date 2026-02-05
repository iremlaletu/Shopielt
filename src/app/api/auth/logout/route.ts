import { getLogoutUrl } from "@/wix-api/auth";
import { getWixServerClient } from "@/lib/wix-client.server";
import { cookies } from "next/headers";
import { WIX_SESSION_COOKIE } from "@/lib/constants";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const wixClient = await getWixServerClient();
    const logoutUrl = await getLogoutUrl(wixClient);

    (await cookies()).delete(WIX_SESSION_COOKIE);

    return NextResponse.json({ logoutUrl });
  } catch (error) {
    console.error("Logout error:", error);
    
    // fallback: just delete the cookie and return home
    (await cookies()).delete(WIX_SESSION_COOKIE);
    
    return NextResponse.json({ 
      logoutUrl: "/",
      error: "Token refresh failed, but session cleared" 
    });
  }
}

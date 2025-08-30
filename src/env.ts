import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_BASE_URL: z.url(),
    NEXT_PUBLIC_WIX_CLIENT_ID: z.string().min(1),
    
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_WIX_CLIENT_ID: process.env.NEXT_PUBLIC_WIX_CLIENT_ID,
    
  },
});
// Env validation (T3+Zod v4):
// fail-fast, typed `env.*`, no secret leaks.
// Only whitelisted NEXT_PUBLIC_* are exposed.
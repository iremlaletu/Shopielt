import { getWixAdminClient } from "@/lib/wix-client.server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const fileName = req.nextUrl.searchParams.get("fileName");
  const mimeType = req.nextUrl.searchParams.get("mimeType");

  if (!fileName || !mimeType) {
    return new Response("Missing required query parameters", {
      status: 400,
    });
  }

  const { uploadUrl } = await getWixAdminClient().files.generateFileUploadUrl(
    mimeType,
    {
      fileName,
      filePath: "product-reviews-media",
      private: false,
    },
  );

  return Response.json({ uploadUrl });
}

// generate the upload url in order to do that put this code into a route. cause it happens dynamically
// when we click the button, we make http request to this endpoint which give us the upload url in which allows user to upload the file directly to wix storage
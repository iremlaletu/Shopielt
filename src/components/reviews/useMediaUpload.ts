import { useState } from "react";
import { toast } from "sonner";
import ky from "ky";

export interface MediaAttachment {
  id: string;
  file: File;
  url?: string;
  state: "uploading" | "uploaded" | "failed";
}

export default function useMediaUpload() {
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  async function startUpload(file: File) {
    const id = crypto.randomUUID();
    // keep the existing attach
    setAttachments((prev) => [
      ...prev,
      {
        id,
        file,
        state: "uploading",
      },
    ]);

    try {
      // uploadurl is object that returned by our route handler
      const { uploadUrl } = await ky
        .get("/api/review-media-upload-url", {
          searchParams: {
            fileName: file.name,
            mimeType: file.type,
          },
        })
        .json<{ uploadUrl: string }>();

      // upload the image with ky request
      const {
        file: { url },
      } = await ky
        .put(uploadUrl, {
          timeout: false,
          body: file,
          headers: {
            "Content-Type": "application/octet-stream",
          },
          searchParams: {
            filename: file.name,
          },
        })
        .json<{ file: { url: string } }>();

      // update the state cause upload has finished
      setAttachments((prev) =>
        prev.map((attachment) =>
          attachment.id === id
            ? { ...attachment, state: "uploaded", url }
            : attachment,
        ),
      );
    } catch (error) {
      console.error(error);
      setAttachments((prev) =>
        prev.map((attachment) =>
          attachment.id === id
            ? { ...attachment, state: "failed" }
            : attachment,
        ),
      );
      toast("Failed to upload attachment");
    }
  }

  // remove media when X button clicked
  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id));
  }

  function clearAttachments() {
    setAttachments([]);
  }

  return { attachments, startUpload, removeAttachment, clearAttachments };
}

// ky is a wrapper around fetch that implements some helpers
// this url can only be generated via Admin client, so we have to do this in a route handler

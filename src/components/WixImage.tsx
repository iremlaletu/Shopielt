import { media as wixMedia } from "@wix/sdk";
import { ImgHTMLAttributes } from "react";

type WixImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt"
> & {
  mediaIdentifier: string | undefined;
  placeholder?: string;
  alt?: string | null | undefined;
};

export default function WixImage({
  mediaIdentifier,
  placeholder = "/placeholder.png",
  alt,
  ...props
}: WixImageProps) {
  const imageUrl = mediaIdentifier
    ? wixMedia.getImageUrl(mediaIdentifier).url
    : placeholder;

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={imageUrl} alt={alt || ""} {...props} />;
}
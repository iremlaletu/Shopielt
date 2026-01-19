"use client";

import LoadingButton from "@/components/LoadingButton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { wixBrowserClient } from "@/lib/wix-client.browser";
import { getProductReviews } from "@/wix-api/reviews";
import { useInfiniteQuery } from "@tanstack/react-query";
import { reviews } from "@wix/reviews";
import { products } from "@wix/stores";
import { CornerDownRight, StarIcon } from "lucide-react";
import Image from "next/image";
import logo from "@/assets/shopieltlogo.png";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import WixImage from "@/components/WixImage";
import {media as wixMedia} from "@wix/sdk"

interface ProductReviewsProps {
  product: products.Product;
}

export default function ProductReviews({ product }: ProductReviewsProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["product-reviews", product._id],
      queryFn: async ({ pageParam }) => {
        if (!product._id) {
          throw Error("Product ID is required to fetch reviews");
        }
        const pageSize = 2;

        return getProductReviews(wixBrowserClient, {
          productId: product._id,
          limit: pageSize,
          cursor: pageParam,
        });
      },
      // modify to only include approved reviews
      select: (data) => ({
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: page.items.filter(
            (item) =>
              item.moderation?.moderationStatus ===
              reviews.ModerationModerationStatus.APPROVED,
          ),
        })),
      }),
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) => {
        return lastPage.cursors.next;
      },
    });
  const reviewItems = data?.pages.flatMap((page) => page.items) || [];

  return (
    <section className="space-y-8">
      {status === "pending" && <ProductReviewsLoadingSkeleton />}
      {status === "error" && (
        <p className="text-destructive">Error loading reviews.</p>
      )}
      {status === "success" && !reviewItems.length && !hasNextPage && (
        <p>No reviews yet.</p>
      )}
      <div className="divide-y-5">
        {reviewItems.map((review) => (
          <ReviewItem key={review._id} review={review} />
        ))}
      </div>
      {hasNextPage && (
        <LoadingButton
          loading={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          Load more reviews
        </LoadingButton>
      )}
    </section>
  );
}

interface ReviewItemProps {
  review: reviews.Review;
}

function ReviewItem({
  review: { author, reviewDate, content, reply },
}: ReviewItemProps) {
  return (
    <div className="py-5 first:pt-0 last:pb-0">
      <div className="flex gap-5">
        {/* left: Avatar */}
        <Avatar className="size-14 shrink-0">
          <AvatarFallback>
            {author?.authorName
              ?.split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase() || "MBR"}
          </AvatarFallback>
        </Avatar>

        {/* Right: Review content */}
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon
                key={i}
                className={cn(
                  "text-primary size-5",
                  i < (content?.rating || 0) && "fill-primary",
                )}
              />
            ))}
            <p className="text-muted-foreground text-sm">
              {author?.authorName || "Anonymous"}
              {reviewDate && (
                <> · {new Date(reviewDate).toLocaleDateString()}</>
              )}
            </p>
          </div>

          {content?.title && <h3 className="font-bold">{content.title}</h3>}

          {content?.body && (
            <div className="max-w-4xl whitespace-pre-line">{content.body}</div>
          )}
          
          {!!content?.media?.length && (
            <div className="flex flex-wrap gap-2">
              {content.media.map( (media) => (
                <MediaAttachment key={media.image || media.video} media={media} />
              ) )}
            </div>
          )}
        </div>
      </div>

      {reply?.message && (
        <div className="ms-20 mt-2.5 space-y-1 border-t pt-2.5">
          <div className="flex h-10 items-center gap-2">
            <CornerDownRight className="size-5" />
            <Image
              src={logo}
              alt="Shopieltlogo"
              width={56}
              height={28}
              className="h-auto w-auto shrink-0"
            />

            <span className="font-bold">Shopielt Team</span>
          </div>
          <div className="whitespace-pre-line">{reply.message}</div>
        </div>
      )}
    </div>
  );
}

export function ProductReviewsLoadingSkeleton() {
  return (
    <div className="space-y-10">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="size-14 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" /> {/* stars + title */}
            <Skeleton className="h-4 w-32" /> {/* author + date */}
            <Skeleton className="h-16 max-w-4xl" /> {/* body */}
          </div>
        </div>
      ))}
    </div>
  );
}

interface MediaAttachmentProps {
  media: reviews.Media;
}

function MediaAttachment({ media }: MediaAttachmentProps) {
  if (media.image) {
    return (
      <WixImage
        mediaIdentifier={media.image}
        alt="Review media"
        className="max-h-40 max-w-40 object-contain"
      />
    );
  }
  if(media.video) {
    return <video controls className="max-h-40 max-w-40">
      <source src={wixMedia.getVideoUrl(media.video).url} type="video/mp4" />
    </video>
  }
  return <span className="text-destructive">Unsupported media type </span>
}

// make product._id part of the cache key so each product has its own cache entry
// otherwise a product woluld overwrite another product's reviews in the cache

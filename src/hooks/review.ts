import { wixBrowserClient } from "@/lib/wix-client.browser";
import {
  createProductReview,
  CreateProductReviewValues,
} from "@/wix-api/reviews";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateProductReview() {
  return useMutation({
    mutationFn: (values: CreateProductReviewValues) =>
      createProductReview(wixBrowserClient, values),
    onError: (error) => {
      console.error("Error creating product review:", error);
      toast("Failed to create review. Please try again");
    },
  });
}

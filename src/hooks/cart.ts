import { wixBrowserClient } from "@/lib/wix-client.browser";
import getCart, {
  addToCart,
  AddToCartParams,
  removeCartItem,
  updateCartItemQuantity,
  UpdateCartItemQuantityValues,
} from "@/wix-api/cart";
import {
  MutationKey,
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { currentCart } from "@wix/ecom";
import { toast } from "sonner";

const queryKey: QueryKey = ["cart"];

export function useCart(initialData: currentCart.Cart | null) {
  return useQuery({
    queryKey,
    queryFn: () => getCart(wixBrowserClient),
    initialData,
  });
}
// React Query: useQuery caches results in memory (per QueryClient).
// - queryKey uniquely identifies the cache entry. Use the SAME key to read/refresh/invalidate.
// - queryFn is responsible for fetching the data.
// - getCart expects a WixClient; in client components pass wixBrowserClient.
//
// Behavior notes:
// - Multiple components with the same queryKey share the cached result (no extra network).
// - By default staleTime = 0, so data is "stale" immediately; it may refetch on mount/focus.
// - Cache is in-memory only; it is lost on full reload unless you add a persister.
// - After cart mutations, call queryClient.invalidateQueries({ queryKey: ['cart'] }) to refresh.

export function useAddItemToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: AddToCartParams) =>
      addToCart(wixBrowserClient, values),
    onSuccess(data) {
      toast("Item added to cart");
      queryClient.cancelQueries({ queryKey }); // cancel the running query before you updated cache
      queryClient.setQueryData(queryKey, data.cart); // put return value into the cache
    },
    onError(error) {
      console.error(error);
      toast("Failed to add item to cart. Please try again.");
    },
  });
}

// useQueryClient from Tanstack, provider make available in children
// useMutation is used whever update data on server. used this default loading and error state,

export function useUpdateCartItemQuantity() {
  const queryClient = useQueryClient();

  const mutationKey: MutationKey = ["useUpdateCartItemQuantity"]
  
  return useMutation({
    mutationKey,
    mutationFn: (values: UpdateCartItemQuantityValues) =>
      updateCartItemQuantity(wixBrowserClient, values),

    // 1) Optimistic update
    onMutate: async ({ productId, newQuantity }) => {
      // Stop any ongoing refetch so it doesn’t overwrite our optimistic data.
      await queryClient.cancelQueries({ queryKey });

      // Take a snapshot of the current cart for rollback on error.
      const previousState =
        queryClient.getQueryData<currentCart.Cart>(queryKey);
      
      // Write the optimistic value into the cache immediately.
      queryClient.setQueryData<currentCart.Cart>(queryKey, (oldData) => ({
        
        ...oldData,
        lineItems: oldData?.lineItems?.map((lineItem) =>
          lineItem._id === productId
            ? { ...lineItem, quantity: newQuantity }
            : lineItem,
        ),
      }));

      return { previousState };
    },

    // 2) Rollback on error
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast("Something went wrong. Please try again.");
    },

    // 3) Final sync (runs after success OR error)
    onSettled() {
      // Only refetch once when the last in-flight mutation for this key completes.
      if (queryClient.isMutating({ mutationKey }) === 1) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}

// trigger the mutation and the change the quantity doesnt automatically handle optimistic update we still have to wait for the response from the server
// If users spam “+”/“–” quickly, you may have several in-flight mutations. The check
// queryClient.isMutating({ mutationKey }) === 1 means “this was the last one finishing” → invalidate once, avoid multiple redundant refetches.

// Doc - https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates

// remove items hook

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => removeCartItem(wixBrowserClient, productId),
    onMutate: async (productId) => {

      await queryClient.cancelQueries({ queryKey });

      const previousState =
        queryClient.getQueryData<currentCart.Cart>(queryKey);

      queryClient.setQueryData<currentCart.Cart>(queryKey, (oldData) => ({
        ...oldData,
        lineItems: oldData?.lineItems?.filter(
          lineItem => lineItem._id !== productId
        )
      }))
      return {previousState}
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast("Something went wrong. Please try again.");
    },
    onSettled() {
     queryClient.invalidateQueries({ queryKey });
    }
  })
}
import { wixBrowserClient } from "@/lib/wix-client.browser";
import {
  deleteMyMemberAddresses,
  getLoggedInMember,
  updateMemberInfo,
  UpdateMemberInfoValues,
} from "@/wix-api/members";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { members } from "@wix/members";
import { toast } from "sonner";

export const memberQueryKey: QueryKey = ["member"];

export function useMember(initialData: members.Member | null) {
  return useQuery({
    queryKey: memberQueryKey,
    queryFn: () => getLoggedInMember(wixBrowserClient),
    initialData,
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: UpdateMemberInfoValues) =>
      updateMemberInfo(wixBrowserClient, variables),
    onSuccess(data) {
      const updatedMember =
        (data as any)?.member ?? (data as members.Member | null);
      if (updatedMember) {
        queryClient.setQueryData<members.Member | null>(
          memberQueryKey,
          updatedMember,
        );
      } else {
        queryClient.invalidateQueries({ queryKey: memberQueryKey });
      }
      toast("Profile updated");
    },
    onError(error) {
      console.error(error);
      toast("Failed to update profile. Please try again.");
    },
  });
}

export function useDeleteMemberAddresses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteMyMemberAddresses(wixBrowserClient),
    onSuccess() {
      toast("Address deleted");
      queryClient.setQueryData<members.Member | null>(
        memberQueryKey,
        (prev) =>
          prev
            ? {
                ...prev,
                contact: {
                  ...prev.contact,
                  addresses: [],
                },
              }
            : prev,
      );
    },
    onError(error) {
      console.error(error);
      toast("Failed to delete address. Please try again.");
    },
  });
}

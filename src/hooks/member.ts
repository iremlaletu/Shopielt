import { wixBrowserClient } from "@/lib/wix-client.browser";
import { deleteMyMemberAddresses, updateMemberInfo, UpdateMemberInfoValues } from "@/wix-api/members";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useUpdateMember() {
  const router = useRouter();

  return useMutation({
    mutationFn: (variables: UpdateMemberInfoValues) =>
      updateMemberInfo(wixBrowserClient, variables),
    onSuccess() {
      toast("Profile updated");
      setTimeout(() => {
        router.refresh();
      }, 1200);
    },
    onError(error) {
      console.error(error);
      toast("Failed to update profile. Please try again.");
    },
  });
}

export function useDeleteMemberAddresses() {
  const router = useRouter();

  return useMutation({
    mutationFn: () => deleteMyMemberAddresses(wixBrowserClient),
    onSuccess() {
      toast("Address deleted");
      setTimeout(() => {
        router.refresh();
      }, 1200);
    },
    onError(error) {
      console.error(error);
      toast("Failed to delete address. Please try again.");
    },
  });
}

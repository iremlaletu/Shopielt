import { WixClient } from "@/lib/wix-client.base";
import { members } from "@wix/members";

export async function getLoggedInMember(
  wixClient: WixClient,
): Promise<members.Member | null> {
  if (!wixClient.auth.loggedIn()) return null;

  const memberData = await wixClient.members.getCurrentMember({
    fieldsets: [members.Set.FULL],
  });

  return memberData.member || null;
}

export interface UpdateMemberInfoValues {
  firstName: string;
  lastName: string;
  addressLine?: string;
  addressLine2?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

export async function updateMemberInfo(
  wixClient: WixClient,
  {
    firstName,
    lastName,
    addressLine,
    addressLine2,
    city,
    country,
    postalCode,
  }: UpdateMemberInfoValues,
) {
  const loggedInMember = await getLoggedInMember(wixClient);

  if (!loggedInMember?._id) {
    throw Error("No member ID found");
  }

  const hasAddressFields =
    !!addressLine || !!addressLine2 || !!city || !!country || !!postalCode;

  const contactPayload: any = {
    firstName,
    lastName,
  };

  // ✅ sadece adres alanlarından biri doluysa addresses gönder
  // (boşsa addresses'e hiç dokunma → mevcut adres korunur)
  if (hasAddressFields) {
    contactPayload.addresses = [
      {
        addressLine,
        addressLine2,
        city,
        country,
        postalCode,
      },
    ];
  }

  return wixClient.members.updateMember(loggedInMember._id, {
    contact: contactPayload,
  });
}

export async function deleteMyMemberAddresses(wixClient: WixClient) {
  const loggedInMember = await getLoggedInMember(wixClient);
  if (!loggedInMember?._id) throw Error("No member ID found");

  return wixClient.members.deleteMemberAddresses(loggedInMember._id);
}

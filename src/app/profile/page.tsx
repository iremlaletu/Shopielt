import { getLoggedInMember } from "@/wix-api/members";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWixServerClient } from "@/lib/wix-client.server";
import MemberInfoForm from "./MemberInfoForm";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your profile page",
};

export default async function Page() {
  const member = await getLoggedInMember(await getWixServerClient());

  if (!member) notFound();

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-5 py-8">
      <MemberInfoForm member={member} />
    </main>
  );
}

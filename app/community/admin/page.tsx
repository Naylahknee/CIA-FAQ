import { env } from "cloudflare:workers";
import { redirect } from "next/navigation";
import { MemberManagement } from "../../admin/member-management";
import { getCommunityUser } from "../../community-auth";

export const dynamic = "force-dynamic";

export default async function CommunityAdminPage() {
  const user = await getCommunityUser();
  if (!user || !user.emailVerified) redirect("/community");

  const configuredAdmin = String(env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const isAdmin = user.role === "admin" || (configuredAdmin && user.email.toLowerCase() === configuredAdmin);
  if (!isAdmin) redirect("/community");

  return (
    <main className="c-wrap c-community-admin-page">
      <MemberManagement />
    </main>
  );
}

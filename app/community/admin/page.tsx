import { env } from "cloudflare:workers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MemberManagement } from "../../admin/member-management";
import { getCommunityUser } from "../../community-auth";

export const dynamic = "force-dynamic";

export default async function CommunityAdminPage() {
  const user = await getCommunityUser();
  // Not signed in at all: the gate on /community is the right place to land.
  if (!user) redirect("/community");

  const configuredAdmin = String(env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const isAdmin = user.role === "admin" || (configuredAdmin && user.email.toLowerCase() === configuredAdmin);
  if (!isAdmin) redirect("/community");

  // An admin whose address is unverified used to be redirected straight back to
  // the feed, so pressing "Members & roles" looked like a dead button. Nothing
  // told them why. Verification needs RESEND_API_KEY, AUTH_EMAIL_FROM and an
  // https APP_ORIGIN to be configured; until they are, no address can ever be
  // verified, so say that plainly rather than bouncing the page.
  if (!user.emailVerified) {
    return (
      <main className="c-wrap c-community-admin-page">
        <div className="c-card">
          <h1>Verify your email to manage members</h1>
          <p className="c-muted">
            Member and role controls change who can read and moderate this community, so they stay
            locked until the address on your account is confirmed.
          </p>
          <p className="c-muted">
            Open your account page to send yourself a verification link. If no email arrives, the
            site&rsquo;s transactional email is not configured yet &mdash; verification cannot be
            completed until it is.
          </p>
          <Link className="c-btn" href="/account" style={{ marginTop: 12 }}>Go to account settings</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="c-wrap c-community-admin-page">
      <MemberManagement />
    </main>
  );
}

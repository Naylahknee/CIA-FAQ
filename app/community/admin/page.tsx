import { env } from "cloudflare:workers";
import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { wallSubmissions } from "../../../db/schema";
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
  // told them why. Verification needs the Cloudflare EMAIL binding and
  // AUTH_EMAIL_FROM; until the domain is onboarded no address can ever be
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

  const submissions = await getDb().select().from(wallSubmissions).orderBy(desc(wallSubmissions.createdAt)).limit(100);
  const pendingCount = submissions.filter((item) => item.status === "pending").length;

  return (
    <main className="c-wrap c-community-admin-page">
      <section className="c-member-admin" aria-labelledby="wall-review-title">
        <div className="c-member-admin-head">
          <div>
            <p className="c-auth-eyebrow">Celebration Wall moderation</p>
            <h1 id="wall-review-title">Review milestone photos</h1>
            <p>Photos stay private until an admin approves them. Approved photos appear on the Celebration Wall automatically.</p>
          </div>
          <strong className="c-member-count">{pendingCount} pending</strong>
        </div>
        <div className="c-wall-review-grid">
          {submissions.length ? submissions.map((item) => (
            <article className="c-wall-review-card" key={item.id}>
              <img src={`/api/media/${item.id}`} alt="" />
              <div className="c-wall-review-body">
                <small>{item.status}</small>
                <h2>{item.title}</h2>
                <p>{item.caption}</p>
                <p className="c-muted"><strong>Shared by:</strong> {item.studentName || "Proud Parent"}<br/><strong>Consent:</strong> {item.consentName}</p>
                <form action="/api/admin/submissions" method="post" className="c-wall-review-actions">
                  <input type="hidden" name="type" value="submission"/>
                  <input type="hidden" name="id" value={item.id}/>
                  <input type="hidden" name="returnTo" value="/community/admin"/>
                  {item.status !== "approved" && <button className="c-btn" name="action" value="approved">Approve</button>}
                  {item.status !== "rejected" && <button className="c-btn c-btn-ghost" name="action" value="rejected">{item.status === "approved" ? "Remove from wall" : "Reject"}</button>}
                </form>
              </div>
            </article>
          )) : <div className="c-empty"><h2>No Celebration Wall submissions yet</h2><p>New milestone photos will appear here for review.</p></div>}
        </div>
      </section>
      <MemberManagement />
    </main>
  );
}

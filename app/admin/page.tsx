import { desc } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../db";
import { corrections, wallSubmissions } from "../../db/schema";
import { requireChatGPTUser } from "../chatgpt-auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  const isOwner = user.email.toLowerCase() === String(env.ADMIN_EMAIL ?? "").toLowerCase();
  if (!isOwner) return <main className="admin-page"><a href="/">← Back to guide</a><section className="admin-header"><h1>Owner access only</h1><p>This moderation dashboard is restricted to the site owner.</p></section></main>;
  const [submissions, reports] = await Promise.all([
    getDb().select().from(wallSubmissions).orderBy(desc(wallSubmissions.createdAt)).limit(100),
    getDb().select().from(corrections).orderBy(desc(corrections.createdAt)).limit(100),
  ]);
  return <main className="admin-page"><a href="/">← Back to guide</a><section className="admin-header"><p className="eyebrow">Owner dashboard</p><h1>Review community submissions</h1><p>Nothing reaches the walls until you approve it here.</p></section>
    <section className="admin-section"><h2>Photos and resources</h2><div className="review-grid">{submissions.length ? submissions.map(item => <article className="review-card" key={item.id}>
      <img src={`/api/media/${item.id}`} alt="Submitted preview" /><div><small>{item.kind} · {item.status}</small><h3>{item.title}</h3><p>{item.caption}</p><p><strong>Displayed name:</strong> {item.studentName || "None"}<br/><strong>Submitted by:</strong> {item.submitterEmail}<br/><strong>Consent:</strong> {item.consentName}</p><form action="/api/admin/submissions" method="post"><input type="hidden" name="type" value="submission"/><input type="hidden" name="id" value={item.id}/>{item.status !== "approved" && <button name="action" value="approved">Approve</button>}{item.status !== "rejected" && <button className="reject" name="action" value="rejected">{item.status === "approved" ? "Remove from wall" : "Reject"}</button>}</form></div>
    </article>) : <p>No submissions yet.</p>}</div></section>
    <section className="admin-section"><h2>Corrections</h2><div className="correction-list">{reports.length ? reports.map(item => <article key={item.id}><small>{item.status}</small><h3>{item.topic}</h3><p>{item.message}</p>{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer">Open source ↗</a>}{item.status === "open" && <form action="/api/admin/submissions" method="post"><input type="hidden" name="type" value="correction"/><input type="hidden" name="id" value={item.id}/><button name="action" value="resolved">Mark resolved</button></form>}</article>) : <p>No correction reports yet.</p>}</div></section>
  </main>;
}

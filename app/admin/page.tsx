import { desc } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../db";
import { corrections, faqSuggestions, wallSubmissions } from "../../db/schema";
import { getCommunityUser } from "../community-auth";
import { forbidden, redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCommunityUser();
  if (!user || !user.emailVerified) redirect("/community");
  const isOwner = user.role === "moderator" || user.email.toLowerCase() === String(env.ADMIN_EMAIL ?? "").toLowerCase();
  if (!isOwner) forbidden();
  const [submissions, reports, suggestions] = await Promise.all([
    getDb().select().from(wallSubmissions).orderBy(desc(wallSubmissions.createdAt)).limit(100),
    getDb().select().from(corrections).orderBy(desc(corrections.createdAt)).limit(100),
    getDb().select().from(faqSuggestions).orderBy(desc(faqSuggestions.createdAt)).limit(100),
  ]);
  return <main className="admin-page"><Link href="/">← Back to guide</Link><section className="admin-header"><p className="eyebrow">Owner dashboard</p><h1>Review community submissions</h1><p>Nothing reaches the walls until you approve it here.</p></section>
    <section className="admin-section"><h2>Photos and resources</h2><div className="review-grid">{submissions.length ? submissions.map(item => <article className="review-card" key={item.id}>
      <img src={`/api/media/${item.id}`} alt="Submitted preview" /><div><small>{item.kind} · {item.status}</small><h3>{item.title}</h3><p>{item.caption}</p><p><strong>Displayed name:</strong> {item.studentName || "None"}<br/><strong>Submitted by:</strong> {item.submitterEmail}<br/><strong>Consent:</strong> {item.consentName}</p><form action="/api/admin/submissions" method="post"><input type="hidden" name="type" value="submission"/><input type="hidden" name="id" value={item.id}/>{item.status !== "approved" && <button name="action" value="approved">Approve</button>}{item.status !== "rejected" && <button className="reject" name="action" value="rejected">{item.status === "approved" ? "Remove from wall" : "Reject"}</button>}</form></div>
    </article>) : <p>No submissions yet.</p>}</div></section>
    <section className="admin-section" id="faq-suggestions"><h2>GroupMe FAQ suggestions</h2><p>The bot removes sender details and queues likely questions here. Review every answer and source before publishing.</p><div className="faq-review-list">{suggestions.length ? suggestions.map(item => <article className="faq-review-card" key={item.id}>
      <small>{item.status}{item.matchedFaqId ? ` · Similar to ${item.matchedFaqId}` : ""}</small>
      {item.sourceText && <p className="source-message"><strong>De-identified GroupMe text:</strong> {item.sourceText}</p>}
      <form action="/api/admin/faq-suggestions" method="post">
        <input type="hidden" name="id" value={item.id}/>
        <label>FAQ question<input name="question" defaultValue={item.question} maxLength={300} required/></label>
        <label>Answer<textarea name="answer" defaultValue={item.answer} maxLength={3000} rows={5} placeholder="Write and verify the answer before publishing."/></label>
        <label>Category<select name="category" defaultValue={item.category}><option value="money">Money</option><option value="arrival">Arrival and dates</option><option value="classes">Classes and supplies</option><option value="living">Campus life</option><option value="health">Health and safety</option></select></label>
        <label>Official source URL, if available<input name="sourceUrl" type="url" defaultValue={item.sourceUrl ?? ""} placeholder="https://www.ciachef.edu/..."/></label>
        <div className="faq-review-actions"><button name="action" value="save">Save draft</button>{item.status !== "approved" && <button name="action" value="approve">Approve</button>}{item.status !== "published" && <button name="action" value="publish">Publish to FAQ</button>}{item.status === "published" && <button name="action" value="unpublish">Remove from FAQ</button>}{item.status !== "rejected" && <button className="reject" name="action" value="reject">Reject</button>}</div>
      </form>
    </article>) : <p>No GroupMe FAQ suggestions yet.</p>}</div></section>
    <section className="admin-section"><h2>Corrections</h2><div className="correction-list">{reports.length ? reports.map(item => <article key={item.id}><small>{item.status}</small><h3>{item.topic}</h3><p>{item.message}</p>{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer">Open source ↗</a>}{item.status === "open" && <form action="/api/admin/submissions" method="post"><input type="hidden" name="type" value="correction"/><input type="hidden" name="id" value={item.id}/><button name="action" value="resolved">Mark resolved</button></form>}</article>) : <p>No correction reports yet.</p>}</div></section>
  </main>;
}

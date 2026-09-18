import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarCheck, Check, History, Instagram, LockKeyhole, ShieldCheck, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { listCalendarDrafts, reviewCalendarDraft } from "@/lib/calendar.functions";
import { listHeldCommunityPosts, reviewCommunityPost } from "@/lib/community-access.functions";
import { listInstagramImportRuns, runInstagramImport } from "@/lib/instagram.functions";
import { addInstagramHighlight, listAllInstagramHighlights, removeInstagramHighlight, setInstagramHighlightActive } from "@/lib/instagram-highlights.functions";

type Suggestion = { id: string; question: string; answer: string | null; category: string | null; status: string; created_at: string };
type Draft = Awaited<ReturnType<typeof listCalendarDrafts>>[number];
type Run = Awaited<ReturnType<typeof listInstagramImportRuns>>[number];
type Membership = { id: string; user_id: string; status: string; created_at: string };
type Report = { id: string; post_id: string; reason: string; status: string; created_at: string };
type HeldPost = Awaited<ReturnType<typeof listHeldCommunityPosts>>[number];
type Highlight = Awaited<ReturnType<typeof listAllInstagramHighlights>>[number];

export const Route = createFileRoute("/moderation")({ head: () => ({ meta: [{ title: "Community Moderation — CIA Hyde Park Family Guide" }, { name: "description", content: "Private moderator review for members, community reports, FAQ suggestions, and calendar imports." }, { property: "og:title", content: "Community Moderation — CIA Hyde Park Family Guide" }, { property: "og:description", content: "Private review workspace for the CIA family community." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }), component: ModerationPage });

function ModerationPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [notice, setNotice] = useState("");
  const [held, setHeld] = useState<HeldPost[]>([]);
  const fetchHeld = useServerFn(listHeldCommunityPosts);
  const decideHeld = useServerFn(reviewCommunityPost);
  const fetchDrafts = useServerFn(listCalendarDrafts);
  const reviewDraft = useServerFn(reviewCalendarDraft);
  const fetchRuns = useServerFn(listInstagramImportRuns);
  const importNow = useServerFn(runInstagramImport);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const fetchHighlights = useServerFn(listAllInstagramHighlights);
  const saveHighlight = useServerFn(addInstagramHighlight);
  const toggleHighlight = useServerFn(setInstagramHighlightActive);
  const dropHighlight = useServerFn(removeInstagramHighlight);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setAllowed(false); return; }
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const moderator = roles?.some((row) => row.role === "moderator") ?? false;
    setAllowed(moderator);
    if (!moderator) return;
    const [faqResult, membershipResult, reportResult, calendarRows, history] = await Promise.all([
      supabase.from("faq_suggestions").select("*").order("created_at", { ascending: false }),
      supabase.from("community_memberships").select("id,user_id,status,created_at").order("created_at", { ascending: false }),
      supabase.from("community_reports").select("id,post_id,reason,status,created_at").order("created_at", { ascending: false }),
      fetchDrafts(), fetchRuns(),
    ]);
    setHeld(await fetchHeld().catch(() => []));
    setHighlights(await fetchHighlights().catch(() => []));
    setSuggestions(faqResult.data ?? []); setMemberships(membershipResult.data ?? []); setReports(reportResult.data ?? []); setDrafts(calendarRows); setRuns(history);
  }
  useEffect(() => { load().catch(() => setAllowed(false)); }, []);
  async function reviewSuggestion(id: string, status: "approved" | "published" | "rejected" | "duplicate") { await supabase.from("faq_suggestions").update({ status, reviewed_at: new Date().toISOString() }).eq("id", id); await load(); }
  async function reviewMembership(item: Membership, status: "approved" | "muted" | "banned") { const { data: { user } } = await supabase.auth.getUser(); if (!user) return; await supabase.from("community_memberships").update({ status, reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", item.id); await supabase.from("profiles").update({ member_status: status === "approved" ? "active" : status }).eq("id", item.user_id); await load(); }
  async function resolveReport(item: Report, status: "reviewed" | "dismissed") { await supabase.from("community_reports").update({ status }).eq("id", item.id); await load(); }
  async function handleDraft(event: React.FormEvent<HTMLFormElement>, draft: Draft, status: "published" | "rejected" | "duplicate") { event.preventDefault(); const form = new FormData(event.currentTarget); await reviewDraft({ data: { id: draft.id, status, title: String(form.get("title")), description: String(form.get("description") || "") || null, eventAt: new Date(String(form.get("eventAt"))).toISOString(), location: String(form.get("location") || "") || null, experienceType: String(form.get("experienceType")) as "in_person" | "virtual" | "hybrid", imageAlt: String(form.get("imageAlt") || "") || null } }); await load(); }
  async function reviewHeld(postId: string, decision: "published" | "removed") { await decideHeld({ data: { postId, decision } }); await load(); }
  async function addHighlight(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form);
    try { await saveHighlight({ data: { postUrl: String(data.get("postUrl") ?? ""), caption: String(data.get("caption") ?? "") || null, postedAt: null } }); form.reset(); setNotice("Post added to the home page carousel."); await load(); }
    catch (error) { setNotice(error instanceof Error ? error.message : "That link could not be added."); }
  }
  async function setHighlightActive(id: string, isActive: boolean) { await toggleHighlight({ data: { id, isActive } }); await load(); }
  async function deleteHighlight(id: string) { if (!window.confirm("Remove this post from the home page?")) return; await dropHighlight({ data: { id } }); await load(); }
  async function checkInstagram() { try { const result = await importNow(); setNotice(result.message); await load(); } catch { setNotice("Instagram could not be checked. Review the latest import status below."); } }

  return <AppShell><main className="page-wrap page-main"><header className="page-heading"><p className="eyebrow">Moderator workspace</p><h1>Community review</h1><p>Member access, reports, calendar imports, and FAQ suggestions are reviewed here. Community questions never publish automatically.</p></header>
    {allowed === null ? <div className="state-panel"><span className="loading-ring"/><h2>Checking permission…</h2></div> : !allowed ? <div className="state-panel"><LockKeyhole/><h2>Moderator access required</h2><Button asChild><Link to="/community">Back to community</Link></Button></div> : <>
      <section className="moderation-section"><div className="section-heading"><div><p className="eyebrow">Access</p><h2><Users/> Membership requests</h2></div></div><div className="review-list">{memberships.filter((item) => item.status === "pending").map((item) => <article className="review-item" key={item.id}><small>Requested {new Date(item.created_at).toLocaleDateString()}</small><h2>Member {item.user_id.slice(0, 8)}</h2><div><Button onClick={() => reviewMembership(item, "approved")}><Check/>Approve</Button><Button variant="outline" onClick={() => reviewMembership(item, "banned")}><X/>Decline</Button></div></article>)}{!memberships.some((item) => item.status === "pending") && <p>No pending membership requests.</p>}</div></section>
      <section className="moderation-section"><div className="section-heading"><div><p className="eyebrow">Imported events</p><h2><CalendarCheck/> Calendar review</h2></div><Button onClick={checkInstagram}><Instagram/>Check for events</Button></div>{notice && <p className="auth-notice">{notice}</p>}<div className="review-list">{drafts.filter((draft) => draft.status === "pending").map((draft) => <form className="review-item review-form" key={draft.id} onSubmit={(event) => handleDraft(event, draft, "published")}><small>Pending · confidence {draft.parser_confidence ? `${Math.round(draft.parser_confidence * 100)}%` : "not scored"}</small><label>Title<input name="title" defaultValue={draft.title} required/></label><label>Description<textarea name="description" defaultValue={draft.description ?? ""}/></label><div className="review-fields"><label>Date and time<input type="datetime-local" name="eventAt" defaultValue={draft.event_at.slice(0, 16)} required/></label><label>Experience<select name="experienceType" defaultValue={draft.experience_type}><option value="in_person">In-person</option><option value="virtual">Virtual</option><option value="hybrid">Hybrid</option></select></label></div><label>Location<input name="location" defaultValue={draft.location ?? ""}/></label><label>Image description<input name="imageAlt" defaultValue={draft.image_alt ?? ""}/></label>{draft.image_url && <img className="review-event-image" src={draft.image_url} alt={draft.image_alt ?? "Imported event preview"}/>}<p>{draft.import_notes}</p><div><Button type="submit"><Check/>Publish</Button><Button type="button" variant="outline" onClick={(event) => handleDraft({ preventDefault: () => undefined, currentTarget: event.currentTarget.closest("form") } as unknown as React.FormEvent<HTMLFormElement>, draft, "duplicate")}>Duplicate</Button><Button type="button" variant="outline" onClick={(event) => handleDraft({ preventDefault: () => undefined, currentTarget: event.currentTarget.closest("form") } as unknown as React.FormEvent<HTMLFormElement>, draft, "rejected")}><X/>Reject</Button></div></form>)}{!drafts.some((draft) => draft.status === "pending") && <p>No imported events are waiting.</p>}</div><div className="import-history"><h3><History/> Import history</h3>{runs.length ? runs.map((run) => <p key={run.id}><strong>{run.status}</strong> · {new Date(run.started_at).toLocaleString()} · {run.imported_count} imported{run.error_message ? ` · ${run.error_message}` : ""}</p>) : <p>No imports have run. Official Instagram authorization is still required for live retrieval.</p>}</div></section>
      <section className="moderation-section"><div className="section-heading"><div><p className="eyebrow">Home page</p><h2><Instagram/> Campus Instagram carousel</h2></div></div><form className="highlight-form" onSubmit={addHighlight}><label>Instagram post link<input name="postUrl" required placeholder="https://www.instagram.com/p/..."/></label><label>Short caption (optional)<input name="caption" maxLength={280} placeholder="Family Weekend line-up"/></label><Button type="submit"><Check/>Add to home page</Button></form><div className="review-list">{highlights.length ? highlights.map((item) => <article className="review-item" key={item.id}><small>{item.is_active ? "Showing on home page" : "Hidden"} · added {new Date(item.created_at).toLocaleDateString()}</small><h2>{item.caption ?? "Instagram post"}</h2><p><a href={item.post_url} target="_blank" rel="noreferrer">{item.post_url}</a></p><div><Button variant="outline" onClick={() => setHighlightActive(item.id, !item.is_active)}>{item.is_active ? "Hide" : "Show"}</Button><Button variant="ghost" onClick={() => deleteHighlight(item.id)}><X/>Remove</Button></div></article>) : <p>No campus posts added yet. Paste an Instagram post link above and it appears on the home page.</p>}</div></section>
      <section className="moderation-section"><div className="section-heading"><div><p className="eyebrow">Spam filter</p><h2><ShieldCheck/> Posts held for review</h2></div></div><div className="review-list">{held.length ? held.map((item) => <article className="review-item" key={item.id}><small>Held {new Date(item.created_at).toLocaleString()}{item.topic ? ` · ${item.topic}` : ""}</small><h2>{item.title ?? "Community post"}</h2><p>{item.body}</p><div><Button onClick={() => reviewHeld(item.id, "published")}><Check/>Publish</Button><Button variant="outline" onClick={() => reviewHeld(item.id, "removed")}><X/>Remove</Button></div></article>) : <p>No posts are waiting on the spam filter.</p>}</div></section>
      <section className="moderation-section"><div className="section-heading"><div><p className="eyebrow">Safety</p><h2><ShieldCheck/> Reported posts</h2></div></div><div className="review-list">{reports.filter((item) => item.status === "pending").map((item) => <article className="review-item" key={item.id}><small>Reported {new Date(item.created_at).toLocaleDateString()}</small><h2>{item.reason}</h2><div><Button onClick={() => resolveReport(item, "reviewed")}><Check/>Reviewed</Button><Button variant="outline" onClick={() => resolveReport(item, "dismissed")}>Dismiss</Button></div></article>)}{!reports.some((item) => item.status === "pending") && <p>No open reports.</p>}</div></section>
      <section className="moderation-section"><div className="section-heading"><div><p className="eyebrow">Public help center</p><h2>FAQ suggestions</h2></div></div><div className="review-list">{suggestions.length ? suggestions.map((item) => <article className="review-item" key={item.id}><small>{item.category ?? "Uncategorized"} · {item.status}</small><h2>{item.question}</h2>{item.answer && <p>{item.answer}</p>}<div>{item.status === "pending" && <><Button onClick={() => reviewSuggestion(item.id,"approved")}><Check/>Approve draft</Button><Button variant="outline" onClick={() => reviewSuggestion(item.id,"duplicate")}>Duplicate</Button><Button variant="outline" onClick={() => reviewSuggestion(item.id,"rejected")}><X/>Reject</Button></>}{item.status === "approved" && <Button onClick={() => reviewSuggestion(item.id,"published")}><Check/>Publish</Button>}</div></article>) : <p>No FAQ suggestions.</p>}</div></section>
    </>}
  </main></AppShell>;
}
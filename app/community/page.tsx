"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { BookOpen, CalendarDays, Camera, Flag, Image as ImageIcon, Megaphone, MessageCircle, Plus, Smile, Trash2, Users } from "lucide-react";
import { fullDates, academicEventDate } from "../guide-sections";
import { useCommunity, initials, relativeTime, GENERAL_TOPIC, REACTIONS, type Post } from "./_components/community-data";

const EMOJIS = ["😀","😂","🥰","👏","🙌","🎉","❤️","💛","👩🏽‍🍳","👨🏽‍🍳","🍽️","🧁","📚","💪","🙏","✨"];
const GIFS = [
  ["Celebration", "https://media.giphy.com/media/g9582DNuQppxC/giphy.gif"],
  ["You did it", "https://media.giphy.com/media/3oz8xAFtqoOUUrsh7W/giphy.gif"],
  ["Proud", "https://media.giphy.com/media/l4pTdcifPZLpDjL1e/giphy.gif"],
  ["Applause", "https://media.giphy.com/media/Swx36wwSsU49HAnIhC/giphy.gif"],
] as const;
const CUTOFF = new Date(2026, 8, 18);
const FILTERS = ["Recent", "Trending", "Topics you follow"] as const;

function engagement(post: Post) { return post.reactions.reduce((sum, r) => sum + r.count, 0) + post.comments.length; }

export default function CommunityFeed() {
  const { user, posts, topics, feedState, follows, notice, setNotice, busy, setBusy, loadFeed, act, toggleFollow } = useCommunity();
  const [open, setOpen] = useState(false);
  const [composer, setComposer] = useState("");
  const [gifUrl, setGifUrl] = useState("");
  const [topicId, setTopicId] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [mediaName, setMediaName] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [gifOpen, setGifOpen] = useState(false);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Recent");
  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const mediaRef = useRef<HTMLInputElement>(null);

  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = { [GENERAL_TOPIC]: 0 };
    for (const t of topics) counts[t.name] = 0;
    for (const p of posts) { const k = p.topicName || GENERAL_TOPIC; counts[k] = (counts[k] ?? 0) + 1; }
    return counts;
  }, [posts, topics]);

  const visible = useMemo(() => {
    let list = posts;
    if (topicFilter) list = list.filter((p) => (topicFilter === GENERAL_TOPIC ? !p.topicName : p.topicName === topicFilter));
    if (filter === "Topics you follow" && follows.length) list = list.filter((p) => follows.includes(p.topicName || GENERAL_TOPIC));
    if (filter === "Trending") list = list.slice().sort((a, b) => engagement(b) - engagement(a));
    return list;
  }, [posts, topicFilter, filter, follows]);

  const upcoming = useMemo(() => fullDates
    .map((e) => ({ date: academicEventDate(e), title: e.title }))
    .filter((e) => e.date >= CUTOFF)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3), []);

  async function createPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice("");
    const data = new FormData(event.currentTarget);
    data.set("body", composer); data.set("gifUrl", gifUrl); data.set("topicId", topicId);
    if (anonymous) data.set("anonymous", "on");
    try {
      const response = await fetch("/api/community/posts", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) setNotice(result.error);
      else {
        setComposer(""); setGifUrl(""); setTopicId(""); setAnonymous(false); setMediaName(""); setOpen(false);
        if (mediaRef.current) mediaRef.current.value = "";
        await loadFeed();
      }
    } catch { setNotice("That post could not be sent."); }
    setBusy(false);
  }

  async function comment(event: FormEvent<HTMLFormElement>, postId: string) {
    event.preventDefault();
    const form = event.currentTarget;
    const value = String(new FormData(form).get("comment") ?? "");
    if (!value.trim()) return;
    setBusy(true);
    await act(`/api/community/posts/${postId}/comments`, { body: value });
    form.reset(); setBusy(false);
  }

  return (
    <div className="c-wrap">
      <div className="c-columns">
        {/* left rail */}
        <aside className="c-rail">
          <div className="c-card">
            <h2>Discover</h2>
            <ul className="c-list">
              <li><Link href="/community/topics"><Users size={18} />Topics<span className="c-count">{topics.length}</span></Link></li>
              <li><Link href="/community/profile"><MessageCircle size={18} />Your posts</Link></li>
              <li><a href="/faq" target="_blank" rel="noreferrer"><BookOpen size={18} />Guide &amp; FAQ</a></li>
              <li><a href="/calendar" target="_blank" rel="noreferrer"><CalendarDays size={18} />Calendar</a></li>
            </ul>
          </div>
          <div className="c-card">
            <h2>Topics</h2>
            <ul className="c-list">
              <li><button type="button" className={topicFilter === null ? "is-active" : ""} onClick={() => setTopicFilter(null)}>All posts<span className="c-count">{posts.length}</span></button></li>
              {Object.entries(topicCounts).map(([name, count]) => (
                <li key={name}>
                  <button type="button" className={topicFilter === name ? "is-active" : ""} onClick={() => setTopicFilter(name)}>
                    {name}<span className="c-count">{count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* center */}
        <section className="c-center">
          {!open ? (
            <div className="c-composer-bar">
              <span className="c-avatar" aria-hidden="true">{initials(user?.displayName ?? "M")}</span>
              <button type="button" className="c-composer-open" onClick={() => setOpen(true)}>Add a post…</button>
              <button type="button" className="c-round-add" aria-label="Write a post" onClick={() => setOpen(true)}><Plus size={20} /></button>
            </div>
          ) : (
            <form className="c-composer" onSubmit={createPost}>
              <textarea value={composer} onChange={(e) => setComposer(e.target.value)} placeholder="Share something with other families…" maxLength={4000} required aria-label="Your post" />
              {gifUrl && <img className="c-post-media" src={gifUrl} alt="" style={{ maxHeight: 200, width: "auto" }} />}
              {emojiOpen && <div className="c-picker">{EMOJIS.map((e) => <button key={e} type="button" onClick={() => setComposer((c) => c + e)}>{e}</button>)}</div>}
              {gifOpen && <div className="c-picker">{GIFS.map(([label, url]) => <button key={url} type="button" title={label} onClick={() => { setGifUrl(url); setGifOpen(false); }}><img src={url} alt={label} style={{ width: 70, height: 50, objectFit: "cover", borderRadius: 8 }} /></button>)}</div>}
              <div className="c-composer-tools">
                <button type="button" className="c-icon-btn" aria-label="Add an emoji" onClick={() => { setEmojiOpen(!emojiOpen); setGifOpen(false); }}><Smile size={18} /></button>
                <button type="button" className="c-icon-btn" aria-label="Add a GIF" onClick={() => { setGifOpen(!gifOpen); setEmojiOpen(false); }}><ImageIcon size={18} /></button>
                <button type="button" className="c-icon-btn" aria-label="Attach a photo" onClick={() => mediaRef.current?.click()}><Camera size={18} /></button>
                <input ref={mediaRef} type="file" name="media" accept="image/*" hidden onChange={(e) => setMediaName(e.target.files?.[0]?.name ?? "")} />
                {mediaName && <span className="c-muted">{mediaName}</span>}
                <select value={topicId} onChange={(e) => setTopicId(e.target.value)} aria-label="Topic">
                  <option value="">{GENERAL_TOPIC}</option>
                  {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <label className="c-check"><input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />Post anonymously</label>
                <button type="button" className="c-btn c-btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
                <button className="c-btn" disabled={busy}>{busy ? "Posting…" : "Post"}</button>
              </div>
              {anonymous && <p className="c-anon-note">Your name is hidden from other families. Moderators can still see who posted, and photo metadata is stripped on upload.</p>}
            </form>
          )}

          {notice && <p className="c-notice" role="status" aria-live="polite">{notice}</p>}

          <div className="c-pill-row">
            {FILTERS.map((f) => (
              <button key={f} type="button" className="c-pill" aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>

          <div className="c-announce">
            <Megaphone size={20} aria-hidden="true" />
            <div>
              <strong>Confirm anything time-sensitive with the school.</strong>
              <p className="c-muted" style={{ margin: "2px 0 0" }}>Families share experience here; the Guide cites the official source for every answer.</p>
            </div>
          </div>

          {feedState === "loading" && <p className="c-muted">Loading posts…</p>}
          {feedState === "error" && <p className="c-notice">The feed could not be loaded. Refresh to try again.</p>}
          {feedState === "ready" && visible.length === 0 && (
            <div className="c-empty">
              <span className="c-empty-icon"><MessageCircle size={26} /></span>
              <h2>Nothing here yet</h2>
              <p>{topicFilter || filter === "Topics you follow" ? "No posts match this filter yet." : "Be the first to post — ask the question you would ask another parent."}</p>
            </div>
          )}

          {visible.map((post) => (
            <article className="c-post" key={post.id}>
              <div className="c-post-head">
                <span className="c-avatar" aria-hidden="true">{post.isAnonymous ? "?" : initials(post.displayName)}</span>
                <div className="c-post-who">
                  <span className="c-post-name">
                    {post.isAnonymous ? "Anonymous family" : post.displayName}
                    {post.role !== "member" && <span className="c-role">{post.role === "admin" ? "Admin" : "Moderator"}</span>}
                  </span>
                  <span className="c-post-meta">{relativeTime(post.createdAt)}{post.topicName ? ` · ${post.topicName}` : ""}</span>
                </div>
              </div>

              <p className="c-post-body">{post.body}</p>
              {post.imageUrl && <img className="c-post-media" src={post.imageUrl} alt="" />}
              {post.gifUrl && <img className="c-post-media" src={post.gifUrl} alt="" />}

              <hr className="c-post-divider" />
              <div className="c-post-actions">
                {REACTIONS.map(([key, emoji]) => {
                  const count = post.reactions.find((r) => r.reaction === key)?.count ?? 0;
                  if (!count && post.myReaction !== key) return null;
                  return (
                    <button key={key} type="button" className={`c-react${post.myReaction === key ? " is-mine" : ""}`} aria-label={`React ${key}`} onClick={() => act(`/api/community/posts/${post.id}/reactions`, { reaction: key })}>
                      <span aria-hidden="true">{emoji}</span>{count || ""}
                    </button>
                  );
                })}
                <details style={{ position: "relative" }}>
                  <summary className="c-react c-react-add" style={{ listStyle: "none" }} aria-label="Add a reaction">+</summary>
                  <div className="c-picker" style={{ position: "absolute", zIndex: 5, background: "var(--c-card)" }}>
                    {REACTIONS.map(([key, emoji]) => (
                      <button key={key} type="button" title={key} onClick={() => act(`/api/community/posts/${post.id}/reactions`, { reaction: key })}>{emoji}</button>
                    ))}
                  </div>
                </details>
                <div className="c-right">
                  <button type="button" className="c-react" onClick={() => setOpenComments((c) => ({ ...c, [post.id]: !c[post.id] }))}>
                    <MessageCircle size={15} aria-hidden="true" />{post.comments.length}
                  </button>
                  <button type="button" className="c-react" aria-label="Report this post" onClick={() => { const reason = prompt("What is wrong with this post?"); if (reason) act(`/api/community/posts/${post.id}/report`, { reason }); }}>
                    <Flag size={15} aria-hidden="true" />
                  </button>
                  {post.canDelete && (
                    <button type="button" className="c-react" aria-label="Delete this post" onClick={() => { if (confirm("Delete this post?")) act(`/api/community/posts/${post.id}`, undefined, "DELETE"); }}>
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>

              {openComments[post.id] && (
                <div className="c-comments">
                  {post.comments.map((c) => (
                    <p className="c-comment" key={c.id}><strong>{c.displayName}</strong> · <span className="c-muted">{relativeTime(c.createdAt)}</span><br />{c.body}</p>
                  ))}
                  <form className="c-comment-form" onSubmit={(e) => comment(e, post.id)}>
                    <input name="comment" placeholder="Write a reply…" maxLength={2000} aria-label="Your reply" />
                    <button className="c-btn" disabled={busy}>Reply</button>
                  </form>
                </div>
              )}
            </article>
          ))}
        </section>

        {/* right rail */}
        <aside className="c-rail">
          <div className="c-card c-card-green">
            <h2>Community care</h2>
            <ul style={{ margin: "0 0 0 18px", padding: 0, display: "grid", gap: 8, fontSize: ".92rem" }}>
              <li>Share experience, not advice you are not qualified to give.</li>
              <li>No student names, room numbers, or schedules.</li>
              <li>Confirm time-sensitive details with the school.</li>
              <li>For emergencies, call 911 or Campus Safety.</li>
            </ul>
          </div>
          <div className="c-card">
            <h2>Need an official answer?</h2>
            <p className="c-muted">Every answer in the Guide cites the CIA source it came from.</p>
            <a className="c-btn c-btn-ghost" href="/faq" target="_blank" rel="noreferrer" style={{ marginTop: 12 }}><BookOpen size={16} />Open the Guide</a>
          </div>
          <div className="c-card">
            <h2>Upcoming dates</h2>
            <ul className="c-list">
              {upcoming.map((e) => (
                <li key={e.title}><a href="/calendar" target="_blank" rel="noreferrer"><CalendarDays size={16} /><span>{e.title}<br /><span className="c-muted">{e.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span></span></a></li>
              ))}
            </ul>
          </div>
          {follows.length > 0 && (
            <div className="c-card">
              <h2>Topics you follow</h2>
              <div className="c-chips">{follows.map((f) => <button key={f} type="button" className="c-chip" onClick={() => toggleFollow(f)}>{f} ×</button>)}</div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

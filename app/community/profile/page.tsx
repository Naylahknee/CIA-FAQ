"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MessageCircle, Settings2, ShieldCheck } from "lucide-react";
import { useCommunity, initials, relativeTime } from "../_components/community-data";

export default function CommunityProfile() {
  const { user, posts, follows, toggleFollow } = useCommunity();
  const [saved, setSaved] = useState(false);

  /** Everything here is derived from posts the member actually made. Bio,
   *  location and "Parent of N" are not columns on communityUsers, so they are
   *  left out rather than filled with placeholder text. */
  const mine = useMemo(() => posts.filter((p) => p.userId && p.userId === user?.id), [posts, user]);
  const replyCount = useMemo(
    () => posts.reduce((sum, p) => sum + p.comments.filter((c) => c.userId === user?.id).length, 0),
    [posts, user],
  );
  const topicsUsed = useMemo(() => new Set(mine.map((p) => p.topicName).filter(Boolean)).size, [mine]);
  const roleLabel = user?.role === "admin" ? "Admin" : user?.role === "moderator" ? "Moderator" : "Member";

  if (!user) return null;

  return (
    <div className="c-wrap">
      <section className="c-banner">
        <span className="c-avatar" aria-hidden="true">{user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : initials(user.displayName)}</span>
        <div>
          <h1>{user.displayName}</h1>
          <p>{roleLabel} · {user.email}</p>
        </div>
        <div className="c-banner-actions">
          <Link className="c-btn c-btn-orange" href="/account?from=community">Edit profile</Link>
        </div>
      </section>

      <div className="c-columns" style={{ marginTop: 20 }}>
        <section className="c-center">
          <div className="c-card">
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h2 style={{ margin: 0 }}>Your posts</h2>
              <button type="button" className="c-pill" aria-pressed={saved} style={{ marginLeft: "auto" }} onClick={() => setSaved(!saved)}>
                {saved ? "Showing saved" : "Saved"}
              </button>
            </div>
            <hr className="c-post-divider" />
            {saved ? (
              <p className="c-muted">Saving posts is not built yet — it needs somewhere to record what you have saved.</p>
            ) : mine.length === 0 ? (
              <p className="c-muted">You have not posted yet. <Link href="/community">Start a conversation</Link>.</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {mine.map((post) => (
                  <article key={post.id} style={{ padding: 14, border: "1px solid var(--c-card-border)", borderRadius: 14 }}>
                    <p className="c-post-meta">{relativeTime(post.createdAt)}{post.topicName ? ` · ${post.topicName}` : ""}{post.isAnonymous ? " · posted anonymously" : ""}</p>
                    <p style={{ margin: "6px 0 0" }}>{post.body}</p>
                    <p className="c-muted" style={{ margin: "8px 0 0", display: "flex", alignItems: "center", gap: 6 }}>
                      <MessageCircle size={14} aria-hidden="true" />{post.comments.length} · {post.reactions.reduce((s, r) => s + r.count, 0)} reactions
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="c-rail">
          <div className="c-stats">
            <div><strong>{mine.length}</strong><span>Posts</span></div>
            <div><strong>{replyCount}</strong><span>Replies</span></div>
            <div><strong>{topicsUsed}</strong><span>Topics</span></div>
          </div>

          <div className="c-card">
            <h2>Topics you follow</h2>
            {follows.length === 0
              ? <p className="c-muted">You are not following any topics yet.</p>
              : <div className="c-chips">{follows.map((f) => <button key={f} type="button" className="c-chip" onClick={() => toggleFollow(f)}>{f} ×</button>)}</div>}
            <Link className="c-btn c-btn-ghost" href="/community/topics" style={{ marginTop: 12 }}><Settings2 size={16} aria-hidden="true" />Manage topics</Link>
          </div>

          {user.role === "admin" && (
            <div className="c-card c-profile-admin-tools">
              <h2>Admin tools</h2>
              <p className="c-muted">View every member and assign Member, Moderator, or Admin roles.</p>
              <Link className="c-btn" href="/community/admin" style={{ marginTop: 12 }}><ShieldCheck size={16} aria-hidden="true" />Members &amp; roles</Link>
            </div>
          )}

          <div className="c-card" style={{ background: "var(--c-green-tint)", borderColor: "var(--c-green-tint-border)" }}>
            <h2>Notification settings</h2>
            <p className="c-muted">Email and alert preferences arrive with Alerts.</p>
            <Link className="c-btn c-btn-ghost" href="/account?from=community" style={{ marginTop: 12 }}>Account &amp; privacy</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

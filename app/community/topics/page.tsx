"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Hash, Plus } from "lucide-react";
import { useCommunity, relativeTime, GENERAL_TOPIC } from "../_components/community-data";

export default function CommunityTopics() {
  const { posts, topics, follows, toggleFollow, notice, setNotice, loadFeed } = useCommunity();
  const [busy, setBusy] = useState(false);

  /** Counts and last activity are derived from posts. Topic descriptions are not
   *  in the schema, so no description line is shown rather than inventing one. */
  const rows = useMemo(() => {
    const names = [GENERAL_TOPIC, ...topics.map((t) => t.name)];
    return names.map((name) => {
      const mine = posts.filter((p) => (name === GENERAL_TOPIC ? !p.topicName : p.topicName === name));
      const families = new Set(mine.map((p) => p.userId ?? `anon-${p.id}`)).size;
      const latest = mine.reduce((max, p) => Math.max(max, p.createdAt), 0);
      return { name, postCount: mine.length, families, latest };
    }).sort((a, b) => b.postCount - a.postCount);
  }, [posts, topics]);

  async function suggestTopic() {
    const name = prompt("Name the topic (2–50 characters)");
    if (!name) return;
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/community/topics", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }) });
      const data = await response.json();
      if (!response.ok) setNotice(data.error ?? "That topic could not be created.");
      else await loadFeed();
    } catch { setNotice("That topic could not be created."); }
    setBusy(false);
  }

  return (
    <div className="c-wrap">
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <h1>Topics</h1>
          <p className="c-muted" style={{ margin: "4px 0 0" }}>Follow the ones you care about and the Feed can filter to just those.</p>
        </div>
        <button type="button" className="c-btn" style={{ marginLeft: "auto" }} onClick={suggestTopic} disabled={busy}>
          <Plus size={18} aria-hidden="true" />Suggest a topic
        </button>
      </div>

      {notice && <p className="c-notice" role="status" aria-live="polite" style={{ marginBottom: 16 }}>{notice}</p>}

      <div className="c-grid">
        {rows.map((row) => {
          const following = follows.includes(row.name);
          return (
            <article className="c-topic-card" key={row.name}>
              <span className="c-topic-tile"><Hash size={20} aria-hidden="true" /></span>
              <h2>{row.name}</h2>
              <div className="c-topic-stats">
                <span>{row.postCount} {row.postCount === 1 ? "post" : "posts"}</span>
                <span>{row.families} {row.families === 1 ? "family" : "families"}</span>
              </div>
              <div className="c-topic-foot">
                <button type="button" className="c-pill" aria-pressed={following} onClick={() => toggleFollow(row.name)}>
                  {following ? "Following" : "Follow"}
                </button>
                <span className="c-muted">{row.latest ? `Active ${relativeTime(row.latest)}` : "No posts yet"}</span>
              </div>
            </article>
          );
        })}
      </div>

      <p className="c-muted" style={{ marginTop: 22 }}>
        Following is saved in this browser for now. <Link href="/community">Back to the feed</Link>.
      </p>
    </div>
  );
}

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type User = { id: string; email: string; displayName: string; role: string; emailVerified: boolean; verificationRequired: boolean };
export type Comment = { id: string; body: string; createdAt: number; userId: string; displayName: string };
export type Topic = { id: string; name: string };
export type Post = {
  id: string; body: string; gifUrl?: string | null; imageUrl?: string | null; mediaType?: string | null;
  createdAt: number; userId: string | null; displayName: string; role?: string | null; isAnonymous: boolean;
  topicName?: string | null; canDelete: boolean; comments: Comment[];
  reactions: { reaction: string; count: number }[]; myReaction?: string | null;
};

export const GENERAL_TOPIC = "General discussion";
export const REACTIONS = [["like", "👍"], ["love", "❤️"], ["celebrate", "🎉"], ["support", "🤗"]] as const;

/** Followed topics have no table yet, so this is per-browser until one exists. */
const FOLLOW_KEY = "cia-community-follows";
function readFollows(): string[] {
  try { return JSON.parse(window.localStorage.getItem(FOLLOW_KEY) ?? "[]"); } catch { return []; }
}

type Ctx = {
  user: User | null; checking: boolean; notice: string; busy: boolean;
  posts: Post[]; topics: Topic[]; feedState: "loading" | "ready" | "error";
  follows: string[];
  setUser: (user: User | null) => void;
  setNotice: (value: string) => void;
  setBusy: (value: boolean) => void;
  loadFeed: () => Promise<void>;
  signOut: () => Promise<void>;
  toggleFollow: (name: string) => void;
  act: (path: string, body?: object, method?: string) => Promise<void>;
};

const CommunityContext = createContext<Ctx | null>(null);

export function useCommunity() {
  const value = useContext(CommunityContext);
  if (!value) throw new Error("useCommunity must be used inside CommunityProvider");
  return value;
}

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [feedState, setFeedState] = useState<"loading" | "ready" | "error">("loading");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [follows, setFollows] = useState<string[]>([]);

  const loadFeed = useCallback(async () => {
    setFeedState("loading");
    try {
      const [postResponse, topicResponse] = await Promise.all([fetch("/api/community/posts"), fetch("/api/community/topics")]);
      if (!postResponse.ok) { setFeedState("error"); return; }
      setPosts((await postResponse.json()).posts);
      if (topicResponse.ok) setTopics((await topicResponse.json()).topics);
      setFeedState("ready");
    } catch { setFeedState("error"); }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setFollows(readFollows()), 0);
    fetch("/api/community/auth/me")
      .then((r) => r.json())
      .then((data) => { setUser(data.user); setChecking(false); if (data.user) loadFeed(); })
      .catch(() => setChecking(false));
    return () => window.clearTimeout(id);
  }, [loadFeed]);

  const signOut = useCallback(async () => {
    try { await fetch("/api/community/auth/signout", { method: "POST" }); } catch { /* offline */ }
    setUser(null); setPosts([]);
  }, []);

  const toggleFollow = useCallback((name: string) => {
    setFollows((current) => {
      const next = current.includes(name) ? current.filter((x) => x !== name) : [...current, name];
      try { window.localStorage.setItem(FOLLOW_KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
      return next;
    });
  }, []);

  const act = useCallback(async (path: string, body?: object, method = "POST") => {
    try {
      const response = await fetch(path, {
        method,
        headers: body ? { "content-type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!response.ok) { const data = await response.json().catch(() => ({})); setNotice(data.error ?? "That action could not be completed."); }
      else await loadFeed();
    } catch { setNotice("That action could not be completed."); }
  }, [loadFeed]);

  const value = useMemo<Ctx>(() => ({
    user, checking, notice, busy, posts, topics, feedState, follows,
    setUser, setNotice, setBusy, loadFeed, signOut, toggleFollow, act,
  }), [user, checking, notice, busy, posts, topics, feedState, follows, loadFeed, signOut, toggleFollow, act]);

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "M";
}

export function relativeTime(value: number) {
  const delta = Math.max(1, Math.floor((Date.now() - value) / 1000));
  if (delta < 60) return "just now";
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

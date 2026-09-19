"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Bell, Book, Camera, CircleAlert, Image as ImageIcon, LogOut, Menu, MessageCircle, MoreHorizontal, Plus, Search, Send, Smile, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { fullDates, academicEventDate } from "../guide-sections";
import "./community.css";

type User = { id: string; email: string; displayName: string; role: string; emailVerified: boolean; verificationRequired: boolean };
type Comment = { id: string; body: string; createdAt: number; userId: string; displayName: string };
type Topic = { id: string; name: string };
type Post = { id: string; body: string; gifUrl?: string | null; imageUrl?: string | null; mediaType?: string | null; createdAt: number; userId: string | null; displayName: string; role?: string | null; isAnonymous: boolean; topicName?: string | null; canDelete: boolean; comments: Comment[]; reactions: { reaction: string; count: number }[]; myReaction?: string | null };
type GoogleApi = { accounts: { id: { initialize(input: { client_id: string; callback: (response: { credential?: string }) => void; auto_select: boolean; cancel_on_tap_outside: boolean }): void; renderButton(node: HTMLElement, options: Record<string, string | number>): void } } };
declare global { interface Window { google?: GoogleApi } }

const EMOJIS = ["😀","😂","🥰","👏","🙌","🎉","❤️","💛","👩🏽‍🍳","👨🏽‍🍳","🍽️","🧁","📚","💪","🙏","✨"];
const GIFS = [
  ["Celebration", "https://media.giphy.com/media/g9582DNuQppxC/giphy.gif"],
  ["You did it", "https://media.giphy.com/media/3oz8xAFtqoOUUrsh7W/giphy.gif"],
  ["Proud", "https://media.giphy.com/media/l4pTdcifPZLpDjL1e/giphy.gif"],
  ["Applause", "https://media.giphy.com/media/Swx36wwSsU49HAnIhC/giphy.gif"],
  ["Happy dance", "https://media.giphy.com/media/kyLYXonQYYfwYDIeZl/giphy.gif"],
  ["Sending love", "https://media.giphy.com/media/26FLdmIp6wJr91JAI/giphy.gif"],
] as const;
const REACTIONS = [["like","👍","Like"],["love","❤️","Love"],["celebrate","🎉","Celebrate"],["support","🤗","Support"]] as const;
const AVATAR_PALETTE = [
  { bg: "var(--primary)", fg: "var(--primary-foreground)" },
  { bg: "var(--destructive)", fg: "var(--destructive-foreground)" },
  { bg: "var(--accent)", fg: "var(--accent-foreground)" },
  { bg: "var(--chart-2)", fg: "var(--primary-foreground)" },
  { bg: "#7A5CA8", fg: "#FDF4E6" },
] as const;
const GENERAL_TOPIC = "General discussion";
const CALENDAR_CUTOFF = new Date(2026, 8, 18);

function initials(name: string) { return name.split(/\s+/).slice(0,2).map(part => part[0]).join("").toUpperCase(); }
function relativeTime(value: number) { const delta = Math.max(1, Math.floor((Date.now() - value) / 1000)); if (delta < 60) return "just now"; if (delta < 3600) return `${Math.floor(delta/60)}m`; if (delta < 86400) return `${Math.floor(delta/3600)}h`; return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" }); }
function dayLabel(value: number) {
  const d = new Date(value); const now = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(d)) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}
function avatarColor(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}
function engagement(post: Post) { return post.reactions.reduce((sum, r) => sum + r.count, 0) + post.comments.length; }

export default function CommunityPage() {
  const [user, setUser] = useState<User | null>(null); const [checking, setChecking] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]); const [feedState, setFeedState] = useState<"loading"|"ready"|"error">("loading");
  const [topics, setTopics] = useState<Topic[]>([]); const [topicId, setTopicId] = useState(""); const [anonymous, setAnonymous] = useState(false);
  const [authMode, setAuthMode] = useState<"signin"|"signup">("signin"); const [notice, setNotice] = useState(""); const [busy, setBusy] = useState(false);
  const [composer, setComposer] = useState(""); const [emojiOpen, setEmojiOpen] = useState(false); const [gifOpen, setGifOpen] = useState(false); const [gifUrl, setGifUrl] = useState(""); const [mediaName, setMediaName] = useState("");
  const mediaRef = useRef<HTMLInputElement>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [googleClientId, setGoogleClientId] = useState("");

  const [railOpen, setRailOpen] = useState(true);
  const [view, setView] = useState<"chat" | "feed">("chat");
  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});

  async function loadFeed() { setFeedState("loading"); const [response, topicResponse] = await Promise.all([fetch("/api/community/posts"), fetch("/api/community/topics")]); if (!response.ok) { setFeedState("error"); return; } const data = await response.json(); setPosts(data.posts); if (topicResponse.ok) setTopics((await topicResponse.json()).topics); setFeedState("ready"); }
  useEffect(() => { fetch("/api/community/auth/me").then(r => r.json()).then(data => { setUser(data.user); setChecking(false); if (data.user) loadFeed(); }).catch(() => setChecking(false)); }, []);
  useEffect(() => {
    if (checking || user) return;
    let cancelled = false;
    fetch("/api/community/auth/providers").then(r => r.json()).then(data => {
      const clientId = String(data.google?.clientId ?? "");
      if (!clientId || cancelled) return;
      setGoogleClientId(clientId);
      const render = () => {
        if (cancelled || !window.google || !googleButtonRef.current) return;
        window.google.accounts.id.initialize({ client_id: clientId, auto_select: false, cancel_on_tap_outside: true, callback: async response => {
          if (!response.credential) return;
          setBusy(true); setNotice("");
          try {
            const result = await fetch("/api/community/auth/google", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ credential: response.credential }) });
            const body = await result.json();
            if (!result.ok) throw new Error(body.error || "Google sign-in could not be completed.");
            const me = await fetch("/api/community/auth/me").then(r => r.json());
            setUser(me.user); if (me.user) await loadFeed();
          } catch { setNotice("Google sign-in could not be completed. Please try again."); }
          finally { setBusy(false); }
        }});
        googleButtonRef.current.replaceChildren();
        window.google.accounts.id.renderButton(googleButtonRef.current, { type: "standard", theme: "outline", size: "large", shape: "rectangular", text: authMode === "signup" ? "signup_with" : "signin_with", width: 400 });
      };
      if (window.google) render();
      else {
        const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity="true"]');
        if (existing) existing.addEventListener("load", render, { once: true });
        else { const script = document.createElement("script"); script.src = "https://accounts.google.com/gsi/client"; script.async = true; script.dataset.googleIdentity = "true"; script.addEventListener("load", render, { once: true }); document.head.append(script); }
      }
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [authMode, checking, user]);

  async function auth(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setNotice(""); try { const form = new FormData(event.currentTarget); const response = await fetch(`/api/community/auth/${authMode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) }); const data = await response.json(); if (!response.ok) setNotice(data.error); else { const me = await fetch("/api/community/auth/me").then(r=>r.json()); setUser(me.user); if (me.user && (!me.user.verificationRequired || me.user.emailVerified)) await loadFeed(); } } catch { setNotice("The account service could not be reached. Please try again."); } finally { setBusy(false); } }
  async function signout() { await fetch("/api/community/auth/signout", { method: "POST" }); setUser(null); setPosts([]); }
  async function createPost(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setNotice(""); const data = new FormData(event.currentTarget); data.set("body", composer); data.set("gifUrl", gifUrl); data.set("topicId", topicId); if (anonymous) data.set("anonymous", "on"); const response = await fetch("/api/community/posts", { method: "POST", body: data }); const result = await response.json(); if (!response.ok) setNotice(result.error); else { setComposer(""); setGifUrl(""); setTopicId(""); setAnonymous(false); setMediaName(""); if (mediaRef.current) mediaRef.current.value=""; await loadFeed(); } setBusy(false); }
  async function addTopic() { const name = prompt("Name the topic (2–50 characters)"); if (!name) return; const response = await fetch("/api/community/topics", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({name}) }); const data = await response.json(); if (!response.ok) setNotice(data.error ?? "Topic could not be created."); else { setTopics(current => current.some(item => item.id === data.topic.id) ? current : [...current, data.topic].sort((a,b)=>a.name.localeCompare(b.name))); setTopicId(data.topic.id); } }
  async function act(path: string, body?: object, method="POST") { const response = await fetch(path, { method, headers: body ? { "content-type":"application/json" } : undefined, body: body ? JSON.stringify(body) : undefined }); if (!response.ok) { const data=await response.json(); setNotice(data.error ?? "That action could not be completed."); } else await loadFeed(); }
  async function comment(event: FormEvent<HTMLFormElement>, postId: string) { event.preventDefault(); const form=event.currentTarget; const input=new FormData(form).get("comment"); if (!String(input).trim()) return; setBusy(true); await act(`/api/community/posts/${postId}/comments`, { body: input }); form.reset(); setBusy(false); }
  function jumpToTopic(name: string | null) { setView("feed"); setTopicFilter(name); }
  function toggleComments(postId: string) { setOpenComments(current => ({ ...current, [postId]: !current[postId] })); }

  const filteredPosts = useMemo(() => topicFilter === null ? posts : posts.filter(p => topicFilter === GENERAL_TOPIC ? !p.topicName : p.topicName === topicFilter), [posts, topicFilter]);
  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = { [GENERAL_TOPIC]: 0 };
    for (const t of topics) counts[t.name] = 0;
    for (const p of posts) counts[p.topicName || GENERAL_TOPIC] = (counts[p.topicName || GENERAL_TOPIC] || 0) + 1;
    return counts;
  }, [posts, topics]);
  const chatDays = useMemo(() => {
    const ascending = filteredPosts.slice().reverse();
    const groups: { label: string; items: Post[] }[] = [];
    for (const post of ascending) {
      const label = dayLabel(post.createdAt);
      const last = groups[groups.length - 1];
      if (last && last.label === label) last.items.push(post); else groups.push({ label, items: [post] });
    }
    return groups;
  }, [filteredPosts]);
  const popularPosts = useMemo(() => posts.filter(p => engagement(p) > 0).slice().sort((a, b) => engagement(b) - engagement(a)).slice(0, 2), [posts]);
  const upcomingDates = useMemo(() => fullDates
    .map(e => ({ date: academicEventDate(e), title: e.title }))
    .filter(e => e.date >= CALENDAR_CUTOFF)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3), []);

  if (checking) return <main className="community-shell"><p className="community-loading">Opening the community…</p></main>;
  if (!user) return (
    <main className="community-shell auth-shell">
      <section className="auth-visual" aria-label="Scenes from the CIA Hyde Park campus">
        <Link className="community-brand auth-brand" href="/" aria-label="Open the Guide and FAQ">
          <span className="brand-icon"><img src="/favicon.svg" alt="" /></span>
        </Link>
        <div className="auth-collage">
          <img className="auth-collage-image" src="/community-login-collage.webp" alt="Accepted Student Day moments at the CIA Hyde Park campus." />
        </div>
        <p className="auth-visual-copy">Connect with families who understand the CIA journey.</p>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <p className="community-eyebrow">Private member community</p>
          <h1>CIA Family Community</h1>
          {googleClientId&&<><div className="google-auth" ref={googleButtonRef} aria-label="Google account sign in"/><div className="auth-divider"><span>or use email</span></div></>}
          <form onSubmit={auth}>
            {authMode==="signup"&&<label>Display name<input name="displayName" required minLength={2} maxLength={60} autoComplete="name" /></label>}
            <label>Email address<input name="email" required type="email" autoComplete="email" /></label>
            <label>Password<input name="password" required type="password" minLength={12} maxLength={128} pattern={authMode==="signup"?"(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{12,128}":undefined} title={authMode==="signup"?"Use 12–128 characters with an uppercase letter, lowercase letter, number, and symbol.":undefined} autoComplete={authMode==="signup"?"new-password":"current-password"} /></label>
            {authMode==="signup"&&<small>Use 12–128 characters with an uppercase letter, lowercase letter, number, and symbol. Your display name will appear beside posts and comments.</small>}
            {authMode==="signin"&&<label>Authenticator or recovery code <small>(only if enabled)</small><input name="code" autoComplete="one-time-code" maxLength={32}/></label>}
            <button className="primary-action" disabled={busy}>{busy?"Please wait…":authMode==="signin"?"Sign in":"Create account"}</button>
          </form>
          {notice&&<p className="community-notice" role="alert">{notice}</p>}
          {authMode==="signin"&&<Link className="auth-help-link" href="/account">Forgot password?</Link>}
          <div className="auth-divider simple" aria-hidden="true"><span /></div>
          <button className="secondary-action" type="button" onClick={()=>setAuthMode(authMode==="signin"?"signup":"signin")}>
            {authMode==="signin"?"Create new account":"Already have an account? Sign in"}
          </button>
          <p className="auth-privacy">We store only the account and community information needed to run this service. Passwords are secured as salted hashes, never readable text.</p>
          <p className="auth-access-note">FAQs are free to read. Sign up only when you want to post or connect with other families.</p>
          <p className="auth-no-facebook">No Facebook account required.</p>
          <Link className="back-link" href="/">Back to the Guide &amp; FAQ</Link>
        </div>
      </section>
    </main>
  );

  if (user.verificationRequired && !user.emailVerified) return <main className="form-page"><section className="form-card"><h1>Verify your email to join the conversation</h1><p><Link href="/account">Open account settings to send a verification email</Link></p><Link href="/">Read the FAQs without joining</Link><Link href="/account">Account settings</Link><button onClick={signout}>Sign out</button></section></main>;

  const renderPostActions = (post: Post) => (
    <details><summary aria-label="Post options"><MoreHorizontal/></summary><div className="post-menu">{post.userId===user.id?<button onClick={()=>confirm("Remove this post?")&&act(`/api/community/posts/${post.id}`,undefined,"DELETE")}><Trash2 size={16}/>Delete post</button>:<button onClick={()=>{const reason=prompt("What should the moderator review?");if(reason)act(`/api/community/posts/${post.id}/report`,{reason})}}><CircleAlert size={16}/>Report post</button>}</div></details>
  );

  const composerAndControls = (
    <>
      <form className="composer" onSubmit={createPost}><div className="composer-top"><span className="avatar small">{initials(user.displayName)}</span><textarea value={composer} onChange={e=>setComposer(e.target.value)} maxLength={3000} rows={2} aria-label="Write a post" placeholder={`Share something with the village, ${user.displayName.split(" ")[0]}…`}/></div>{gifUrl&&<div className="selected-gif"><img src={gifUrl} alt="Selected GIF"/><button type="button" onClick={()=>setGifUrl("")}>Remove</button></div>}{mediaName&&<p className="selected-file"><Camera size={16}/>{mediaName}</p>}<div className="composer-tools"><div><label className="tool-button"><ImageIcon size={16}/>Photo<input ref={mediaRef} name="media" type="file" accept="image/jpeg,image/png,image/webp,image/gif" aria-describedby="media-privacy-note" onChange={e=>setMediaName(e.target.files?.[0]?.name??"")}/></label><button type="button" className="tool-button" onClick={()=>{setGifOpen(!gifOpen);setEmojiOpen(false)}}><span className="gif-mark">GIF</span></button><button type="button" className="tool-button" onClick={()=>{setEmojiOpen(!emojiOpen);setGifOpen(false)}}><Smile size={16}/>Emoji</button><select className="topic-select" value={topicId} onChange={e=>setTopicId(e.target.value)}><option value="">{GENERAL_TOPIC}</option>{topics.map(topic=><option key={topic.id} value={topic.id}>{topic.name}</option>)}</select><label className="anonymous-toggle"><input type="checkbox" checked={anonymous} onChange={e=>setAnonymous(e.target.checked)}/>Anonymous</label></div><div style={{flex:1}}/><button className="post-button" disabled={busy}>{busy?"Posting…":"Post"}</button></div>{emojiOpen&&<div className="picker emoji-picker" aria-label="Choose an emoji">{EMOJIS.map(emoji=><button type="button" key={emoji} onClick={()=>{setComposer(v=>v+emoji);setEmojiOpen(false)}}>{emoji}</button>)}</div>}{gifOpen&&<div className="picker gif-picker">{GIFS.map(([label,url])=><button type="button" key={url} onClick={()=>{setGifUrl(url);setGifOpen(false)}}><img src={url} alt={label}/><span>{label}</span></button>)}</div>}<p id="media-privacy-note" className="media-privacy-note">Anonymous posts hide your name from members; moderators can still see the author to handle safety reports. Location and identifying metadata is removed from uploads automatically.</p></form>

      <div className="community-view-row">
        <div className="community-view-toggle">
          <button type="button" className={view==="chat"?"active":""} onClick={()=>setView("chat")}><MessageCircle size={16}/>Chat</button>
          <button type="button" className={view==="feed"?"active":""} onClick={()=>setView("feed")}><ImageIcon size={16}/>Announcements</button>
        </div>
        <div className="community-view-meta">
          <span>{filteredPosts.length} {filteredPosts.length===1?"post":"posts"}</span>
          <span className="dot">|</span>
          <span>{topicFilter ?? "All topics"}</span>
          {topicFilter && <button type="button" className="clear-filter" onClick={()=>setTopicFilter(null)}>Clear</button>}
        </div>
      </div>
    </>
  );

  const feedCard = (post: Post) => {
    const commentsOpen = !!openComments[post.id];
    return <article className="post-card" key={post.id}>
      <header><span className="avatar small">{initials(post.displayName)}</span><div><div className="post-author-row"><strong>{post.displayName}</strong>{post.role==="moderator" && <span className="role-badge">Moderator</span>}</div><time dateTime={new Date(post.createdAt).toISOString()}>{relativeTime(post.createdAt)}{post.topicName?` · ${post.topicName}`:""}</time></div>{renderPostActions(post)}</header>
      {post.body&&<p className="post-copy">{post.body}</p>}
      {post.imageUrl&&<img className="post-media" src={post.imageUrl} alt="Photo shared with this post"/>}
      {post.gifUrl&&<img className="post-media gif" src={post.gifUrl} alt="GIF shared with this post"/>}
      <div className="reaction-summary">{post.reactions.length?post.reactions.map(r=>`${REACTIONS.find(x=>x[0]===r.reaction)?.[1]} ${r.count}`).join("  "):"Be the first to react"}<button type="button" className="comment-toggle" onClick={()=>toggleComments(post.id)}>{post.comments.length} {post.comments.length===1?"comment":"comments"}</button></div>
      <div className="reaction-row">{REACTIONS.map(([value,emoji,label])=><button className={post.myReaction===value?"active":""} key={value} onClick={()=>act(`/api/community/posts/${post.id}/reactions`,{reaction:value})}><span>{emoji}</span>{label}</button>)}</div>
      {commentsOpen && <>{post.comments.length>0&&<div className="comments">{post.comments.map(comment=><div className="comment" key={comment.id}><span className="avatar tiny">{initials(comment.displayName)}</span><div><strong>{comment.displayName}</strong><p>{comment.body}</p><time>{relativeTime(comment.createdAt)}</time></div></div>)}</div>}<form className="comment-form" onSubmit={e=>comment(e,post.id)}><span className="avatar tiny">{initials(user.displayName)}</span><input name="comment" maxLength={800} placeholder="Write a comment…" aria-label={`Comment on ${post.displayName}'s post`}/><button disabled={busy} aria-label="Post comment"><Send size={18}/></button></form></>}
    </article>;
  };

  const chatBubble = (post: Post) => {
    const own = post.userId === user.id;
    const colors = post.isAnonymous ? { bg: "var(--muted-foreground)", fg: "var(--background)" } : avatarColor(post.userId || post.displayName);
    const commentsOpen = !!openComments[post.id];
    return <div className={`chat-row${own?" own":""}`} key={post.id}>
      <div className="chat-avatar" style={{ background: colors.bg, color: colors.fg }}>{post.isAnonymous ? "?" : initials(post.displayName)}</div>
      <div className="chat-stack">
        <div className="chat-bubble">
          {!own && <div className="chat-bubble-name" style={{ color: colors.bg }}>{post.displayName}{post.role==="moderator" && <span className="role-badge">Moderator</span>}</div>}
          {post.body && <p>{post.body}</p>}
          {post.imageUrl&&<img className="chat-media" src={post.imageUrl} alt="Photo shared with this message"/>}
          {post.gifUrl&&<img className="chat-media" src={post.gifUrl} alt="GIF shared with this message"/>}
          <div className="chat-bubble-meta">{relativeTime(post.createdAt)}{post.topicName?` · ${post.topicName}`:""}</div>
        </div>
        <div className="chat-react-row">
          {REACTIONS.map(([value,emoji,label])=><button type="button" key={value} className={post.myReaction===value?"active":""} title={label} onClick={()=>act(`/api/community/posts/${post.id}/reactions`,{reaction:value})}>{emoji}{post.reactions.find(r=>r.reaction===value)?.count ? ` ${post.reactions.find(r=>r.reaction===value)?.count}` : ""}</button>)}
          <button type="button" className="chat-comment-toggle" onClick={()=>toggleComments(post.id)}>{post.comments.length ? `${post.comments.length} ${post.comments.length===1?"reply":"replies"}` : "Reply"}</button>
          {post.userId===user.id ? <button type="button" className="chat-delete" aria-label="Delete message" onClick={()=>confirm("Remove this message?")&&act(`/api/community/posts/${post.id}`,undefined,"DELETE")}><Trash2 size={13}/></button>
            : <button type="button" className="chat-delete" aria-label="Report message" onClick={()=>{const reason=prompt("What should the moderator review?");if(reason)act(`/api/community/posts/${post.id}/report`,{reason})}}><CircleAlert size={13}/></button>}
        </div>
        {commentsOpen && <div className="chat-replies">
          {post.comments.map(comment=><div className="comment" key={comment.id}><span className="avatar tiny">{initials(comment.displayName)}</span><div><strong>{comment.displayName}</strong><p>{comment.body}</p><time>{relativeTime(comment.createdAt)}</time></div></div>)}
          <form className="comment-form" onSubmit={e=>comment(e,post.id)}><span className="avatar tiny">{initials(user.displayName)}</span><input name="comment" maxLength={800} placeholder="Reply…" aria-label={`Reply to ${post.displayName}`}/><button disabled={busy} aria-label="Send reply"><Send size={16}/></button></form>
        </div>}
      </div>
    </div>;
  };

  return <main className="community-shell community-app">
    <header className="community-header">
      <div className="community-header-inner">
        <div className="community-header-left">
          <button type="button" aria-label="Toggle sidebar" className="icon-btn" onClick={()=>setRailOpen(!railOpen)}><Menu size={18}/></button>
          <Link className="community-brand" href="/" aria-label="Open the Guide and FAQ"><span className="brand-icon"><img src="/favicon.svg" alt="" /></span></Link>
        </div>
        <nav><Link href="/">Guide &amp; FAQ</Link><Link className="active" href="/community">Community</Link></nav>
        <div style={{flex:1}}/>
        <div className="community-header-right">
          <button type="button" aria-label="Search" className="icon-btn round"><Search size={16}/></button>
          <button type="button" aria-label="Notifications" className="icon-btn round"><Bell size={16}/></button>
          <div className="member-menu"><span className="avatar small">{initials(user.displayName)}</span><span>{user.displayName}</span></div>
          <Link href="/account">Account settings</Link>
          <button onClick={signout} aria-label="Sign out" className="icon-btn"><LogOut size={16}/></button>
        </div>
      </div>
    </header>

    <div className="community-body">
      <aside className={`community-rail${railOpen?"":" collapsed"}`}>
        <div className="rail-inner">
          <div className="member-card"><span className="avatar">{initials(user.displayName)}</span><strong>{user.displayName}</strong><small>Community member</small></div>

          <nav className="left-sidebar-nav">
            <button type="button" className={view==="chat"&&!topicFilter?"active":""} onClick={()=>{setView("chat");setTopicFilter(null);}}><MessageCircle size={18}/>Community feed</button>
            <Link href="/#walls-title"><ImageIcon size={18}/>Resource &amp; memory walls</Link>
            <Link href="/"><Book size={18}/>Guide &amp; FAQ</Link>
          </nav>

          <div className="rail-section">
            <div className="rail-section-head"><span>Topics</span><button type="button" aria-label="Add a topic" onClick={addTopic}><Plus size={15}/></button></div>
            <div className="community-topics">
              <button type="button" className={topicFilter===GENERAL_TOPIC?"active":""} onClick={()=>setTopicFilter(current=>current===GENERAL_TOPIC?null:GENERAL_TOPIC)}>
                <span className="community-topic-dot" style={{background:"var(--muted-foreground)"}}/><span className="label">{GENERAL_TOPIC}</span><span className="community-topic-count">{topicCounts[GENERAL_TOPIC]||""}</span>
              </button>
              {topics.map((t,i)=><button type="button" key={t.id} className={topicFilter===t.name?"active":""} onClick={()=>setTopicFilter(current=>current===t.name?null:t.name)}>
                <span className="community-topic-dot" style={{background:avatarColor(t.id||String(i)).bg}}/><span className="label">{t.name}</span><span className="community-topic-count">{topicCounts[t.name]||""}</span>
              </button>)}
            </div>
          </div>

          {popularPosts.length>0 && <div className="rail-section card">
            <div className="rail-section-head"><Sparkles size={14}/><span>Popular this week</span></div>
            <div className="rail-list">
              {popularPosts.map(p=><button type="button" key={p.id} className="rail-list-item" onClick={()=>jumpToTopic(p.topicName??GENERAL_TOPIC)}>
                {p.body.slice(0,72)}{p.body.length>72?"…":""}
                <span>{p.displayName} · {p.comments.length} {p.comments.length===1?"comment":"comments"}</span>
              </button>)}
            </div>
          </div>}

          {upcomingDates.length>0 && <div className="rail-section card">
            <div className="rail-section-head"><span>Upcoming dates</span></div>
            <div className="rail-dates">
              {upcomingDates.map(d=><Link href="/calendar" key={d.title+d.date.toISOString()}>
                <span className="rail-date-num">{d.date.toLocaleDateString(undefined,{month:"short",day:"numeric"})}</span>
                <span>{d.title}</span>
              </Link>)}
            </div>
            <Link href="/calendar" className="rail-see-all">See all dates →</Link>
          </div>}
        </div>
      </aside>

      <section className="feed-column" aria-label="Community feed">
        {composerAndControls}
        {notice&&<p className="community-notice" role="alert">{notice}</p>}
        {feedState==="loading"&&<div className="feed-status">Loading recent posts…</div>}
        {feedState==="error"&&<div className="feed-status error"><CircleAlert/>The feed could not load.<button onClick={loadFeed}>Try again</button></div>}
        {feedState==="ready"&&!filteredPosts.length&&<div className="feed-status"><MessageCircle/><h2>{topicFilter?"Nothing here yet":"Start the conversation"}</h2><p>{topicFilter?"Be the first to post in this topic.":"Ask a question, share a campus tip, or celebrate a student milestone."}</p></div>}

        {view==="feed" && <div className="community-feed-list">{filteredPosts.map(feedCard)}</div>}

        {view==="chat" && filteredPosts.length>0 && <div className="community-chat">
          {chatDays.map(day=><div className="chat-day" key={day.label}>
            <div className="chat-day-label"><span/><span>{day.label}</span><span/></div>
            {day.items.map(chatBubble)}
          </div>)}
        </div>}
      </section>

      <aside className="feed-sidebar right-sidebar">
        <section><p className="community-eyebrow">Community care</p><h2>Keep the village useful.</h2><ul><li>Protect student schedules, room numbers, IDs, and private records.</li><li>Ask before posting another person’s photo.</li><li>Disagree without insulting people.</li><li>Report safety concerns or harmful posts.</li></ul></section>
        <section><h2>Need an official answer?</h2><p>Community experience helps, but CIA remains the source for policies, bills, dates, and student records.</p><Link href="/">Search the Guide &amp; FAQ</Link></section>
      </aside>
    </div>
  </main>;
}

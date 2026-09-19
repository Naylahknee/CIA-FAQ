"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Camera, ChevronDown, CircleAlert, Image as ImageIcon, LogOut, MessageCircle, MoreHorizontal, Send, Smile, Trash2 } from "lucide-react";
import Link from "next/link";
import "./community.css";

type User = { id: string; email: string; displayName: string; role: string; emailVerified: boolean; verificationRequired: boolean };
type Comment = { id: string; body: string; createdAt: number; userId: string; displayName: string };
type Topic = { id: string; name: string };
type Post = { id: string; body: string; gifUrl?: string | null; imageUrl?: string | null; mediaType?: string | null; createdAt: number; userId: string | null; displayName: string; isAnonymous: boolean; topicName?: string | null; canDelete: boolean; comments: Comment[]; reactions: { reaction: string; count: number }[]; myReaction?: string | null };
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

function initials(name: string) { return name.split(/\s+/).slice(0,2).map(part => part[0]).join("").toUpperCase(); }
function relativeTime(value: number) { const delta = Math.max(1, Math.floor((Date.now() - value) / 1000)); if (delta < 60) return "just now"; if (delta < 3600) return `${Math.floor(delta/60)}m`; if (delta < 86400) return `${Math.floor(delta/3600)}h`; return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" }); }

export default function CommunityPage() {
  const [user, setUser] = useState<User | null>(null); const [checking, setChecking] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]); const [feedState, setFeedState] = useState<"loading"|"ready"|"error">("loading");
  const [topics, setTopics] = useState<Topic[]>([]); const [topicId, setTopicId] = useState(""); const [anonymous, setAnonymous] = useState(false);
  const [authMode, setAuthMode] = useState<"signin"|"signup">("signin"); const [notice, setNotice] = useState(""); const [busy, setBusy] = useState(false);
  const [composer, setComposer] = useState(""); const [emojiOpen, setEmojiOpen] = useState(false); const [gifOpen, setGifOpen] = useState(false); const [gifUrl, setGifUrl] = useState(""); const [mediaName, setMediaName] = useState("");
  const mediaRef = useRef<HTMLInputElement>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [googleClientId, setGoogleClientId] = useState("");

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
  return <main className="community-shell"><header className="feed-header"><Link className="community-brand" href="/" aria-label="Open the Guide and FAQ"><span className="brand-icon"><img src="/favicon.svg" alt="" /></span></Link><nav><Link href="/">Guide &amp; FAQ</Link><Link className="active" href="/community">Community</Link></nav><div className="member-menu"><span className="avatar small">{initials(user.displayName)}</span><span>{user.displayName}</span><Link href="/account">Account settings</Link><button onClick={signout} aria-label="Sign out"><LogOut size={18}/></button></div></header>
    <div className="feed-layout"><aside className="feed-sidebar left-sidebar"><div className="member-card"><span className="avatar">{initials(user.displayName)}</span><strong>{user.displayName}</strong><small>Community member</small></div><nav><Link className="active" href="/community"><MessageCircle size={19}/>Community feed</Link><Link href="/#walls-title"><ImageIcon size={19}/>Resource & memory walls</Link><Link href="/"><ChevronDown size={19}/>Guide &amp; FAQ</Link></nav></aside>
      <section className="feed-column" aria-label="Community feed"><form className="composer" onSubmit={createPost}><div className="composer-top"><span className="avatar small">{initials(user.displayName)}</span><textarea value={composer} onChange={e=>setComposer(e.target.value)} maxLength={3000} rows={3} aria-label="Write a post" placeholder={`Share something with the village, ${user.displayName.split(" ")[0]}…`}/></div>{gifUrl&&<div className="selected-gif"><img src={gifUrl} alt="Selected GIF"/><button type="button" onClick={()=>setGifUrl("")}>Remove</button></div>}{mediaName&&<p className="selected-file"><Camera size={16}/>{mediaName}</p>}<div className="composer-tools"><div><label className="tool-button"><ImageIcon size={19}/>Photo or GIF<input ref={mediaRef} name="media" type="file" accept="image/jpeg,image/png,image/webp,image/gif" aria-describedby="media-privacy-note" onChange={e=>setMediaName(e.target.files?.[0]?.name??"")}/></label><button type="button" className="tool-button" onClick={()=>{setGifOpen(!gifOpen);setEmojiOpen(false)}}><span className="gif-mark">GIF</span>Choose GIF</button><button type="button" className="tool-button" onClick={()=>{setEmojiOpen(!emojiOpen);setGifOpen(false)}}><Smile size={19}/>Emoji</button></div><small id="media-privacy-note" className="media-privacy-note">Embedded location and descriptive metadata is removed automatically before storage.</small><button className="post-button" disabled={busy}>{busy?"Posting…":"Post"}</button></div>{emojiOpen&&<div className="picker emoji-picker" aria-label="Choose an emoji">{EMOJIS.map(emoji=><button type="button" key={emoji} onClick={()=>{setComposer(v=>v+emoji);setEmojiOpen(false)}}>{emoji}</button>)}</div>}{gifOpen&&<div className="picker gif-picker">{GIFS.map(([label,url])=><button type="button" key={url} onClick={()=>{setGifUrl(url);setGifOpen(false)}}><img src={url} alt={label}/><span>{label}</span></button>)}</div>}</form>
        <div className="community-post-options"><label>Topic<select value={topicId} onChange={e=>setTopicId(e.target.value)}><option value="">General discussion</option>{topics.map(topic=><option key={topic.id} value={topic.id}>{topic.name}</option>)}</select></label><button type="button" className="topic-button" onClick={addTopic}>Add a topic</button><label className="anonymous-toggle"><input type="checkbox" checked={anonymous} onChange={e=>setAnonymous(e.target.checked)}/>Post anonymously</label><small>Anonymous posts hide your name from members; moderators can see the author to handle safety reports.</small></div>
        {notice&&<p className="community-notice" role="alert">{notice}</p>}{feedState==="loading"&&<div className="feed-status">Loading recent posts…</div>}{feedState==="error"&&<div className="feed-status error"><CircleAlert/>The feed could not load.<button onClick={loadFeed}>Try again</button></div>}{feedState==="ready"&&!posts.length&&<div className="feed-status"><MessageCircle/><h2>Start the conversation</h2><p>Ask a question, share a campus tip, or celebrate a student milestone.</p></div>}
        {posts.map(post=><article className="post-card" key={post.id}><header><span className="avatar small">{initials(post.displayName)}</span><div><strong>{post.displayName}</strong><time dateTime={new Date(post.createdAt).toISOString()}>{relativeTime(post.createdAt)}</time></div><details><summary aria-label="Post options"><MoreHorizontal/></summary><div className="post-menu">{post.userId===user.id?<button onClick={()=>confirm("Remove this post?")&&act(`/api/community/posts/${post.id}`,undefined,"DELETE")}><Trash2 size={16}/>Delete post</button>:<button onClick={()=>{const reason=prompt("What should the moderator review?");if(reason)act(`/api/community/posts/${post.id}/report`,{reason})}}><CircleAlert size={16}/>Report post</button>}</div></details></header>{post.body&&<p className="post-copy">{post.body}</p>}{post.imageUrl&&<img className="post-media" src={post.imageUrl} alt="Photo shared with this post"/>}{post.gifUrl&&<img className="post-media gif" src={post.gifUrl} alt="GIF shared with this post"/>}<div className="reaction-summary">{post.reactions.length?post.reactions.map(r=>`${REACTIONS.find(x=>x[0]===r.reaction)?.[1]} ${r.count}`).join("  "):"Be the first to react"}<span>{post.comments.length} {post.comments.length===1?"comment":"comments"}</span></div><div className="reaction-row">{REACTIONS.map(([value,emoji,label])=><button className={post.myReaction===value?"active":""} key={value} onClick={()=>act(`/api/community/posts/${post.id}/reactions`,{reaction:value})}><span>{emoji}</span>{label}</button>)}</div>{post.comments.length>0&&<div className="comments">{post.comments.map(comment=><div className="comment" key={comment.id}><span className="avatar tiny">{initials(comment.displayName)}</span><div><strong>{comment.displayName}</strong><p>{comment.body}</p><time>{relativeTime(comment.createdAt)}</time></div></div>)}</div>}<form className="comment-form" onSubmit={e=>comment(e,post.id)}><span className="avatar tiny">{initials(user.displayName)}</span><input name="comment" maxLength={800} placeholder="Write a comment…" aria-label={`Comment on ${post.displayName}'s post`}/><button disabled={busy} aria-label="Post comment"><Send size={18}/></button></form></article>)}
      </section><aside className="feed-sidebar right-sidebar"><section><p className="community-eyebrow">Community care</p><h2>Keep the village useful.</h2><ul><li>Protect student schedules, room numbers, IDs, and private records.</li><li>Ask before posting another person’s photo.</li><li>Disagree without insulting people.</li><li>Report safety concerns or harmful posts.</li></ul></section><section><h2>Need an official answer?</h2><p>Community experience helps, but CIA remains the source for policies, bills, dates, and student records.</p><Link href="/">Search the Guide &amp; FAQ</Link></section></aside></div></main>;
}

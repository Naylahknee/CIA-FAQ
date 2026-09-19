"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { ArrowUp, Bell, Bookmark, CalendarDays, ChevronDown, HeartHandshake, Home, Library, LogOut, Menu, MessageCircle, Search, ShieldCheck, ShoppingBag, UserRound, Users, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

type Audience = "student" | "parent";
type Term = "fall" | "spring";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/community", label: "Community", icon: MessageCircle },
  { to: "/faq", label: "FAQs & Help", icon: Search },
  { to: "/resources", label: "Resource Library", icon: Library },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/shopping", label: "Support", icon: ShoppingBag },
  { to: "/safety", label: "Safety & Support", icon: HeartHandshake },
] as const;

const communityViews = [
  { view: "feed", label: "Discussion", icon: MessageCircle },
  { view: "saved", label: "Saved", icon: Bookmark },
  { view: "events", label: "Events", icon: CalendarDays },
  { view: "members", label: "Members", icon: Users },
  { view: "notifications", label: "Notifications", icon: Bell },
] as const;

const SIDEBAR_KEY = "guide-sidebar";

export function revealSidebar() {
  try { window.sessionStorage.setItem(SIDEBAR_KEY, "open"); } catch { /* storage unavailable */ }
  window.dispatchEvent(new Event("guide-sidebar-reveal"));
}

const dispatchPreference = (kind: "audience" | "term", value: Audience | Term) => {
  window.localStorage.setItem(`guide-${kind}`, value);
  window.dispatchEvent(new CustomEvent("guide-preference", { detail: { kind, value } }));
};

export function useGuidePreferences() {
  const [audience, setAudience] = useState<Audience>("parent");
  const [term, setTerm] = useState<Term>("fall");

  useEffect(() => {
    const sync = () => {
      const savedAudience = window.localStorage.getItem("guide-audience");
      const savedTerm = window.localStorage.getItem("guide-term");
      if (savedAudience === "student" || savedAudience === "parent") setAudience(savedAudience);
      if (savedTerm === "fall" || savedTerm === "spring") setTerm(savedTerm);
    };
    sync();
    window.addEventListener("guide-preference", sync);
    return () => window.removeEventListener("guide-preference", sync);
  }, []);

  return {
    audience,
    term,
    setAudience: (value: Audience) => dispatchPreference("audience", value),
    setTerm: (value: Term) => dispatchPreference("term", value),
  };
}

export function GuideShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [moderator, setModerator] = useState(false);
  const { audience, term, setAudience, setTerm } = useGuidePreferences();
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    let open = false;
    try { open = window.sessionStorage.getItem(SIDEBAR_KEY) === "open"; } catch { /* storage unavailable */ }
    if (open) { setSidebarOpen(true); return; }

    const reveal = () => {
      setSidebarOpen(true);
      try { window.sessionStorage.setItem(SIDEBAR_KEY, "open"); } catch { /* storage unavailable */ }
    };
    // Spec: the landing view shows only the header. The first interaction of any
    // kind brings the sidebar in, and it stays for the rest of the visit.
    window.addEventListener("guide-sidebar-reveal", reveal);
    document.addEventListener("pointerdown", reveal, { once: true });
    document.addEventListener("keydown", reveal, { once: true });
    return () => {
      window.removeEventListener("guide-sidebar-reveal", reveal);
      document.removeEventListener("pointerdown", reveal);
      document.removeEventListener("keydown", reveal);
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/community/auth/me")
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        setSignedIn(Boolean(data?.user));
        setModerator(data?.user?.role === "moderator");
      })
      .catch(() => { if (active) setSignedIn(false); });
    return () => { active = false; };
  }, []);

  async function signOut() {
    try { await fetch("/api/community/auth/signout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }); } catch { /* offline */ }
    setSignedIn(false);
    setModerator(false);
    window.location.href = "/";
  }

  const active = (to: string) => pathname === to || (to === "/faq" && pathname.startsWith("/faq/"));

  return (
    <div className={`app-frame min-h-screen bg-background text-foreground${sidebarOpen ? "" : " sidebar-hidden"}`}>
      <aside className="site-sidebar">
        <a href="/" className="site-brand" aria-label="CIA Hyde Park Family Guide home"><span className="brand-seal">CIA</span><span>CIA Hyde Park<br />Family Help Center</span></a>
        <nav className="desktop-nav" aria-label="Main navigation">{links.map(({ to, label, icon: Icon }) => <div key={to}>
          <a href={to} className={active(to) ? "active" : ""}><Icon size={20} /><span>{label}</span>{to === "/community" && signedIn && <button type="button" className={`nav-caret${communityOpen ? " open" : ""}`} aria-label={communityOpen ? "Collapse community menu" : "Expand community menu"} aria-expanded={communityOpen} onClick={(event) => { event.preventDefault(); setCommunityOpen((value) => !value); }}><ChevronDown size={15} /></button>}</a>
          {to === "/community" && signedIn && communityOpen && <div className="sidebar-subnav">
            {communityViews.map(({ view, label: viewLabel, icon: ViewIcon }) => <a key={view} href={`/community?view=${view}`}><ViewIcon size={15} />{viewLabel}</a>)}
            <a href="/account"><UserRound size={15} />Your profile</a>
            {moderator && <a href="/admin"><ShieldCheck size={15} />Moderation</a>}
            <button type="button" onClick={signOut}><LogOut size={15} />Sign out</button>
          </div>}
        </div>)}</nav>
        <div className="sidebar-note"><strong>Family Help Center</strong><span>Official documents and practical answers.</span></div>
      </aside>
      <header className="mobile-header"><a href="/" className="site-brand"><span className="brand-seal">CIA</span><span>Family Guide</span></a><button type="button" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></header>
      {open && <nav className="mobile-nav" aria-label="Mobile navigation">{links.map(({ to, label, icon: Icon }) => <a key={to} href={to} onClick={() => setOpen(false)}><Icon size={18} />{label}</a>)}</nav>}
      <div id="top" className={`app-content audience-${audience}`}>
        {!sidebarOpen && <header className="sticky-site-header">
          <a href="/" className="sticky-site-brand" aria-label="CIA Hyde Park Family Guide and FAQ home"><span className="brand-seal">CIA</span><span>CIA Hyde Park Family Guide &amp;<br />FAQ</span></a>
          <nav aria-label="Primary navigation">
            <a href="/" className={pathname === "/" ? "active" : ""}>Guide home</a>
            <a href="/faq" className={pathname.startsWith("/faq") ? "active" : ""}>FAQs &amp; Help</a>
            <a href="/community" className={pathname.startsWith("/community") ? "active" : ""}>Parent community</a>
            <a href={signedIn ? "/account" : "/community"}>{signedIn ? "Your profile" : "Sign in or join"}</a>
          </nav>
        </header>}
        <div className="utility-bar">
          <div className="radial-selector" role="radiogroup" aria-label="Who is using this guide"><button type="button" role="radio" aria-checked={audience === "parent"} className={audience === "parent" ? "active" : ""} onClick={() => setAudience("parent")}>Parent</button><button type="button" role="radio" aria-checked={audience === "student"} className={audience === "student" ? "active" : ""} onClick={() => setAudience("student")}>Student</button></div>
          <div className="radial-selector" role="radiogroup" aria-label="Academic year"><button type="button" role="radio" aria-checked={term === "fall"} className={term === "fall" ? "active" : ""} onClick={() => setTerm("fall")}>Fall 2026</button><button type="button" role="radio" aria-checked={term === "spring"} className={term === "spring" ? "active" : ""} onClick={() => setTerm("spring")}>Spring 2027</button></div>
        </div>
        {children}
        <footer className="site-footer"><div className="site-footer-inner"><div className="site-footer-about"><strong>CIA Hyde Park Family Guide &amp; FAQ</strong><p>An independent guide built from official documents and anonymized family questions. Anyone can read the FAQs.</p><nav aria-label="Footer navigation"><a href="/privacy">Privacy</a><a href="/corrections">Corrections</a><a href="/share">Share</a><a href="/support">Support the Guide</a></nav></div><a className="footer-community" href="/community"><small>Parent &amp; student community</small><strong>{signedIn ? "Open the community" : "Sign in or create an account"} →</strong><span>No Facebook account required.</span></a></div><div className="site-footer-note">No advertising or analytics tracking. Signed-in accounts use one essential secure cookie.</div><a className="back-to-top" href="#top" aria-label="Back to top"><ArrowUp /></a></footer>
      </div>
    </div>
  );
}

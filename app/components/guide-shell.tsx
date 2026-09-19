"use client";

import { ArrowUp, Bell, Bookmark, CalendarDays, ChevronDown, HeartHandshake, Home, Library, LogOut, Menu, MessageCircle, PanelLeft, Search, ShieldCheck, ShoppingBag, UserRound, Users, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";

type Audience = "student" | "parent";
type Term = "fall" | "spring";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/community", label: "CIA Parents and Family", icon: MessageCircle },
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

const SIDEBAR_KEY = "guide-sidebar-collapsed";

/** The community runs on its own subdomain when NEXT_PUBLIC_COMMUNITY_URL is
 *  set, and falls back to the in-app route otherwise. Either way it opens in a
 *  new window, so the guide keeps its place behind it. */
export const COMMUNITY_URL = process.env.NEXT_PUBLIC_COMMUNITY_URL || "/community";
const communityLinkProps = { href: COMMUNITY_URL, target: "_blank", rel: "noreferrer" } as const;

/** Applied before paint by the inline script in the root layout, so a collapsed
 *  sidebar never flashes open on load. Kept in sync here when the user toggles. */
function applyCollapsed(collapsed: boolean) {
  document.documentElement.dataset.sidebar = collapsed ? "collapsed" : "expanded";
  try { window.localStorage.setItem(SIDEBAR_KEY, collapsed ? "1" : "0"); } catch { /* storage unavailable */ }
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
  const [collapsed, setCollapsed] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [moderator, setModerator] = useState(false);
  const { audience, term, setAudience, setTerm } = useGuidePreferences();
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    // The sidebar is permanent. It changes only when the user presses the
    // collapse button -- never on navigation, scroll, pointer movement or
    // anything else. This reads back what the layout's inline script already
    // applied, so React's idea of the state matches the DOM.
    const timer = setTimeout(() => {
      setCollapsed(document.documentElement.dataset.sidebar === "collapsed");
    }, 0);
    return () => clearTimeout(timer);
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

  // The community is a standalone space with its own chrome (and its own
  // subdomain), so the guide shell steps aside there entirely.
  if (pathname.startsWith("/community")) return <>{children}</>;

  const active = (to: string) => pathname === to || (to === "/faq" && pathname.startsWith("/faq/"));

  return (
    <div className="app-frame min-h-screen bg-background text-foreground">
      <aside className="site-sidebar">
        <div className="sidebar-top">
          <Link href="/" className="site-brand" aria-label="CIA Hyde Park Family Guide home"><span className="brand-seal">CIA</span><span>CIA Hyde Park<br />Family Help Center</span></Link>
          <button type="button" className="sidebar-toggle" aria-label={collapsed ? "Expand menu" : "Collapse menu"} aria-expanded={!collapsed} title={collapsed ? "Expand menu" : "Collapse menu"} onClick={() => { const next = !collapsed; setCollapsed(next); applyCollapsed(next); }}><PanelLeft size={18} /></button>
        </div>
        <nav className="desktop-nav" aria-label="Main navigation">{links.map(({ to, label, icon: Icon }) => <div key={to}>
          {to === "/community"
            ? <a {...communityLinkProps} className={active(to) ? "active" : ""}><Icon size={20} /><span>{label}</span>{signedIn && <button type="button" className={`nav-caret${communityOpen ? " open" : ""}`} aria-label={communityOpen ? "Collapse community menu" : "Expand community menu"} aria-expanded={communityOpen} onClick={(event) => { event.preventDefault(); setCommunityOpen((value) => !value); }}><ChevronDown size={15} /></button>}</a>
            : <Link href={to} className={active(to) ? "active" : ""}><Icon size={20} /><span>{label}</span></Link>}
          {to === "/community" && signedIn && communityOpen && <div className="sidebar-subnav">
            {/* Profile, moderation and sign-out live in the account row at the
                foot of the sidebar, so they are not repeated here. */}
            {communityViews.map(({ view, label: viewLabel, icon: ViewIcon }) => <Link key={view} href={`/community?view=${view}`}><ViewIcon size={15} />{viewLabel}</Link>)}
          </div>}
        </div>)}</nav>
        <div className="sidebar-account">
          {signedIn
            ? <>
                <Link href="/account" className={pathname === "/account" ? "active" : ""}><UserRound size={18} /><span>Your profile</span></Link>
                {moderator && <Link href="/admin" className={pathname === "/admin" ? "active" : ""}><ShieldCheck size={18} /><span>Moderation</span></Link>}
                <button type="button" onClick={signOut}><LogOut size={18} /><span>Sign out</span></button>
              </>
            : <a href="/community?mode=signup" target="_blank" rel="noreferrer"><UserRound size={18} /><span>Sign in or join</span></a>}
        </div>
      </aside>
      <header className="mobile-header"><Link href="/" className="site-brand"><span className="brand-seal">CIA</span><span>Family Guide</span></Link><button type="button" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></header>
      {open && <nav className="mobile-nav" aria-label="Mobile navigation">{links.map(({ to, label, icon: Icon }) => to === "/community"
        ? <a key={to} {...communityLinkProps} onClick={() => setOpen(false)}><Icon size={18} />{label}</a>
        : <Link key={to} href={to} onClick={() => setOpen(false)}><Icon size={18} />{label}</Link>)}</nav>}
      <div id="top" className={`app-content audience-${audience}`}>
        <div className="utility-bar">
          <div className="radial-selector" role="radiogroup" aria-label="Who is using this guide"><button type="button" role="radio" aria-checked={audience === "parent"} className={audience === "parent" ? "active" : ""} onClick={() => setAudience("parent")}>Parent</button><button type="button" role="radio" aria-checked={audience === "student"} className={audience === "student" ? "active" : ""} onClick={() => setAudience("student")}>Student</button></div>
          <div className="radial-selector" role="radiogroup" aria-label="Academic year"><button type="button" role="radio" aria-checked={term === "fall"} className={term === "fall" ? "active" : ""} onClick={() => setTerm("fall")}>Fall 2026</button><button type="button" role="radio" aria-checked={term === "spring"} className={term === "spring" ? "active" : ""} onClick={() => setTerm("spring")}>Spring 2027</button></div>
        </div>
        {children}
        <footer className="site-footer"><div className="site-footer-inner"><div className="site-footer-about"><strong>CIA Hyde Park Family Guide &amp; FAQ</strong><p>An independent guide built from official documents and anonymized family questions. Anyone can read the FAQs.</p><nav aria-label="Footer navigation"><Link href="/privacy">Privacy</Link><Link href="/corrections">Corrections</Link><Link href="/share">Share</Link><Link href="/support">Support the Guide</Link></nav></div><a className="footer-community" {...communityLinkProps}><small>Parent &amp; student community</small><strong>{signedIn ? "Open the community" : "Sign in or create an account"} →</strong><span>No Facebook account required.</span></a></div><div className="site-footer-note">No advertising or analytics tracking. Signed-in accounts use one essential secure cookie.</div><a className="back-to-top" href="#top" aria-label="Back to top"><ArrowUp /></a></footer>
      </div>
    </div>
  );
}

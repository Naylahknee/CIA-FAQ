import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUp, Bell, Bookmark, CalendarDays, ChevronDown, HeartHandshake, Home, Library, LogOut, Menu, MessageCircle, Search, ShieldCheck, ShoppingBag, UserRound, Users, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { sidebarInitiallyOpen } from "@/lib/sidebar";

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

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState<"fall"|"spring">("fall");
  const [audience, setAudience] = useState<"parent"|"student">("parent");
  const [signedIn, setSignedIn] = useState(false);
  const [moderator, setModerator] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    if (sidebarInitiallyOpen()) setSidebarOpen(true);
    const reveal = () => setSidebarOpen(true);
    window.addEventListener("guide-sidebar-reveal", reveal);
    return () => window.removeEventListener("guide-sidebar-reveal", reveal);
  }, []);
  useEffect(()=>{const storedTerm=window.localStorage.getItem("guide-term");const storedAudience=window.localStorage.getItem("guide-audience");if(storedTerm==="fall"||storedTerm==="spring")setTerm(storedTerm);if(storedAudience==="parent"||storedAudience==="student")setAudience(storedAudience);else window.localStorage.setItem("guide-audience","parent");},[]);
  useEffect(()=>{
    let active=true;
    let unsubscribe: (()=>void)|undefined;
    try {
      async function sync(){
        const { data:{ user } } = await supabase.auth.getUser();
        if(!active) return;
        setSignedIn(Boolean(user));
        if(!user){setModerator(false);return;}
        const { data:roles } = await supabase.from("user_roles").select("role").eq("user_id",user.id);
        if(active) setModerator(Boolean(roles?.some((row)=>row.role==="moderator")));
      }
      sync().catch(()=>{setSignedIn(false);setModerator(false);});
      const { data } = supabase.auth.onAuthStateChange(()=>{ sync().catch(()=>undefined); });
      unsubscribe=()=>data.subscription.unsubscribe();
    } catch {
      setSignedIn(false);
      setModerator(false);
    }
    return ()=>{ active=false; unsubscribe?.(); };
  },[]);
  function setPreference(kind:"term"|"audience",value:string){window.localStorage.setItem(`guide-${kind}`,value);window.dispatchEvent(new CustomEvent("guide-preference",{detail:{kind,value}}));if(kind==="term")setTerm(value as "fall"|"spring");else setAudience(value as "parent"|"student");}
  async function signOut(){await supabase.auth.signOut();setSignedIn(false);setModerator(false);}
  const onCommunity = pathname.startsWith("/community");
  return (
    <div className={`app-frame min-h-screen bg-background text-foreground${sidebarOpen ? "" : " sidebar-hidden"}`}>
      <aside className="site-sidebar">
        <Link to="/" className="site-brand" aria-label="CIA Hyde Park Family Guide home"><span className="brand-seal">CIA</span><span>CIA Hyde Park<br/>Family Help Center</span></Link>
        <nav className="desktop-nav" aria-label="Main navigation">{links.map(({ to, label, icon: Icon }) => <div key={to}>
          <Link to={to} className={pathname === to || (to === "/faq" && pathname.startsWith("/faq/")) ? "active" : ""}><Icon size={20}/><span>{label}</span>{to === "/community" && signedIn && <ChevronDown size={15} className="nav-caret"/>}</Link>
          {to === "/community" && signedIn && <div className="sidebar-subnav">
            {communityViews.map(({ view, label: viewLabel, icon: ViewIcon }) => <Link key={view} to="/community" search={{ view }} className={onCommunity ? "" : ""}><ViewIcon size={15}/>{viewLabel}</Link>)}
            <Link to="/profile"><UserRound size={15}/>Your profile</Link>
            {moderator && <Link to="/moderation"><ShieldCheck size={15}/>Moderation</Link>}
            <button type="button" onClick={signOut}><LogOut size={15}/>Sign out</button>
          </div>}
        </div>)}</nav>
        <div className="sidebar-note"><strong>Family Help Center</strong><span>Official documents and practical answers.</span></div>
      </aside>
      <header className="mobile-header"><Link to="/" className="site-brand"><span className="brand-seal">CIA</span><span>Family Guide</span></Link><Button variant="ghost" size="icon" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</Button></header>
      {open && <nav className="mobile-nav" aria-label="Mobile navigation">{links.map(({ to, label, icon: Icon }) => <Link key={to} to={to} onClick={() => setOpen(false)}><Icon size={18}/>{label}</Link>)}</nav>}
       <div id="top" className={`app-content audience-${audience}`}>
         {!sidebarOpen && <header className="sticky-site-header">
           <Link to="/" className="sticky-site-brand" aria-label="CIA Hyde Park Family Guide and FAQ home"><span className="brand-seal">CIA</span><span>CIA Hyde Park Family Guide &amp;<br/>FAQ</span></Link>
           <nav aria-label="Primary navigation">
             <Link to="/" className={pathname==="/"?"active":""}>Guide home</Link>
             <Link to="/faq" className={pathname.startsWith("/faq")?"active":""}>FAQs &amp; Help</Link>
             <Link to="/community" className={pathname.startsWith("/community")?"active":""}>Parent community</Link>
             <Link to={signedIn?"/profile":"/community"}>{signedIn?"Your profile":"Sign in or join"}</Link>
           </nav>
          </header>}
         <div className="utility-bar">
           <div className="radial-selector" role="radiogroup" aria-label="Who is using this guide"><Button variant="ghost" role="radio" aria-checked={audience==="parent"} className={audience==="parent"?"active":""} onClick={()=>setPreference("audience","parent")}>Parent</Button><Button variant="ghost" role="radio" aria-checked={audience==="student"} className={audience==="student"?"active":""} onClick={()=>setPreference("audience","student")}>Student</Button></div>
           <div className="radial-selector" role="radiogroup" aria-label="Academic year"><Button variant="ghost" role="radio" aria-checked={term==="fall"} className={term==="fall"?"active":""} onClick={()=>setPreference("term","fall")}>Fall 2026</Button><Button variant="ghost" role="radio" aria-checked={term==="spring"} className={term==="spring"?"active":""} onClick={()=>setPreference("term","spring")}>Spring 2027</Button></div>
        </div>
        {children}
         <footer className="site-footer"><div className="site-footer-inner"><div className="site-footer-about"><strong>CIA Hyde Park Family Guide &amp; FAQ</strong><p>An independent guide built from official documents and anonymized family questions. Anyone can read the FAQs.</p><nav aria-label="Footer navigation"><Link to="/privacy">Privacy</Link><Link to="/corrections">Corrections</Link><Link to="/share">Share</Link><Link to="/support">Support the Guide</Link></nav></div><Link className="footer-community" to="/community"><small>Parent &amp; student community</small><strong>{signedIn?"Open the community":"Sign in or create an account"} →</strong><span>No Facebook account required.</span></Link></div><div className="site-footer-note">No advertising or analytics tracking. Signed-in accounts use one essential secure cookie.</div><a className="back-to-top" href="#top" aria-label="Back to top"><ArrowUp/></a></footer>
      </div>
    </div>
  );
}

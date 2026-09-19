"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookOpen, Hash, LogOut, Mail, MessagesSquare, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useCommunity, initials } from "./community-data";

/** Food icons rotate per sign-in. Files live in public/icons/avatars/ — add a
 *  name here once the file is there. Missing files fall back to initials, so
 *  the header never shows a broken image. */
const FOOD_ICONS = ["cupcake", "croissant", "wine-glass"] as const;
const ICON_KEY = "cia-community-icon";

const LINKS = [
  { href: "/community", label: "Feed", icon: MessagesSquare, exact: true },
  { href: "/community/topics", label: "Topics", icon: Hash },
  { href: "/community/messages", label: "Messages", icon: Mail },
  { href: "/community/alerts", label: "Alerts", icon: Bell },
  { href: "/community/profile", label: "Profile", icon: UserRound },
] as const;

function pickIcon() {
  try {
    const stored = window.sessionStorage.getItem(ICON_KEY);
    if (stored) return stored;
    const picked = FOOD_ICONS[Math.floor(Math.random() * FOOD_ICONS.length)];
    window.sessionStorage.setItem(ICON_KEY, picked);
    return picked;
  } catch { return FOOD_ICONS[0]; }
}

function useSessionIcon(signedIn: boolean) {
  const [icon, setIcon] = useState<string | null>(null);
  useEffect(() => {
    if (!signedIn) return;
    // Deferred so the read does not set state during the effect body.
    const id = window.setTimeout(() => setIcon(pickIcon()), 0);
    return () => window.clearTimeout(id);
  }, [signedIn]);
  return icon;
}

export function CommunityNav() {
  const { user, signOut } = useCommunity();
  const pathname = usePathname() ?? "/community";
  const icon = useSessionIcon(Boolean(user));
  const [iconFailed, setIconFailed] = useState(false);

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  return (
    <header className="c-topbar">
      <div className="c-topbar-inner">
        <Link className="c-brand" href="/community">
          <span className="c-brand-icon">
            {icon && !iconFailed
              ? <img src={`/icons/avatars/${icon}.svg`} alt="" onError={() => setIconFailed(true)} />
              : <span>{user ? initials(user.displayName) : "CIA"}</span>}
          </span>
          <span>CIA Parents and Family<small>A private space for CIA Hyde Park families</small></span>
        </Link>

        {user && (
          <>
            <nav className="c-nav" aria-label="Community sections">
              {LINKS.map(({ href, label, icon: Icon, exact }) => (
                <Link key={href} href={href} aria-current={isActive(href, exact) ? "page" : undefined}>
                  <Icon size={18} aria-hidden="true" />{label}
                </Link>
              ))}
            </nav>
            <Link className="c-signout" href="/" title="Back to the Guide and FAQ"><BookOpen size={16} aria-hidden="true" />Guide</Link>
            <button type="button" className="c-signout" onClick={signOut}><LogOut size={16} aria-hidden="true" />Sign out</button>
          </>
        )}
      </div>
    </header>
  );
}

"use client";

import type { ReactNode } from "react";
import { useCommunity } from "./community-data";
import { AuthGate } from "./auth-gate";

/** One place decides signed-in vs signed-out, so every view below can assume a
 *  member is present. */
export function CommunityGate({ children }: { children: ReactNode }) {
  const { user, checking } = useCommunity();
  if (checking) return <div className="c-wrap"><p className="c-muted">Opening the community…</p></div>;
  if (!user) return <AuthGate />;
  if (user.verificationRequired && !user.emailVerified) {
    return (
      <div className="c-wrap">
        <div className="c-empty">
          <h1>Verify your email</h1>
          <p>We sent a link to {user.email}. Confirm it and the community opens up.</p>
          <a className="c-btn" href="/account">Account settings</a>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

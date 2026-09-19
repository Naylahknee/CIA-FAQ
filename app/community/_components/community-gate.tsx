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
          {/* This used to state flatly that a link had been sent. It is
              rendered from the account's unverified status, not from the
              result of sending, so it said so even when delivery had failed --
              which sent people to wait for mail that was never going to
              arrive. Point at the resend control instead. */}
          <p>Confirm the link sent to {user.email} and the community opens up.</p>
          <p className="c-muted">Nothing arrived? Check spam, then send a new link from your account settings.</p>
          <a className="c-btn" href="/account">Account settings</a>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

"use client";

import Link from "next/link";
import { Mail } from "lucide-react";

export default function CommunityMessages() {
  return (
    <div className="c-wrap">
      <h1>Messages</h1>
      <p className="c-muted" style={{ margin: "4px 0 20px" }}>Private messages between families and the Family Office.</p>
      <div className="c-empty">
        <span className="c-empty-icon"><Mail size={26} aria-hidden="true" /></span>
        <h2>Messages are not switched on yet</h2>
        <p>
          Direct messaging needs its own storage before it can carry anything real, so it is being built
          properly rather than shown as an empty inbox. Until then, the <Link href="/community">feed</Link>{" "}
          is where conversation happens, and anything urgent should go to the school directly.
        </p>
      </div>
    </div>
  );
}

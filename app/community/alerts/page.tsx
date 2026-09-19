"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

export default function CommunityAlerts() {
  return (
    <div className="c-wrap">
      <h1>Alerts</h1>
      <p className="c-muted" style={{ margin: "4px 0 20px" }}>Replies to your posts, official notices, and calendar reminders.</p>
      <div className="c-empty">
        <span className="c-empty-icon"><Bell size={26} aria-hidden="true" /></span>
        <h2>Alerts are not switched on yet</h2>
        <p>
          Notifications need somewhere to record what you have already seen, which does not exist yet.
          Rather than show a list that never updates, it is being built properly. Check the{" "}
          <Link href="/community">feed</Link> for replies in the meantime.
        </p>
      </div>
    </div>
  );
}

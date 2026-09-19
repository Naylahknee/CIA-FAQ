"use client";

import { useEffect, useMemo, useState } from "react";

type Role = "member" | "moderator" | "admin";
type Member = {
  id: string;
  displayName: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  createdAt: string | number;
};

export function MemberManagement() {
  const [members, setMembers] = useState<Member[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [status, setStatus] = useState("Loading members…");
  const [busy, setBusy] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");

  async function refresh() {
    const response = await fetch("/api/community/admin/members", { cache: "no-store" });
    const data = await response.json();
    if (response.ok) {
      setMembers(data.members ?? []);
      setCurrentUserId(String(data.currentUserId ?? ""));
      setStatus("");
    } else {
      setStatus(data.error || "Member list could not be loaded.");
    }
  }

  useEffect(() => { void refresh(); }, []);

  const visibleMembers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return members.filter((member) => {
      const matchesRole = roleFilter === "all" || member.role === roleFilter;
      const matchesQuery = !needle || (member.displayName + " " + member.email).toLowerCase().includes(needle);
      return matchesRole && matchesQuery;
    });
  }, [members, query, roleFilter]);

  async function act(action: "set-role" | "remove", userId: string, role?: Role) {
    if (action === "remove" && !confirm("Remove this member and their community content?")) return;
    setBusy(userId);
    setStatus("");
    try {
      const response = await fetch("/api/community/admin/members", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, userId, role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Member action could not be completed.");
      await refresh();
      setStatus(action === "remove" ? "Member removed." : "Membership level updated.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Member action could not be completed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="c-member-admin" aria-labelledby="member-management-title">
      <div className="c-member-admin-head">
        <div>
          <p className="c-auth-eyebrow">Community administration</p>
          <h1 id="member-management-title">Members and roles</h1>
          <p>Search every community member, then assign Member, Moderator, or Admin access. Member email addresses are visible only to admins.</p>
        </div>
        <strong className="c-member-count">{members.length} {members.length === 1 ? "member" : "members"}</strong>
      </div>

      <div className="c-member-tools">
        <label>
          <span>Find a member</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or email" />
        </label>
        <label>
          <span>Membership level</span>
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as "all" | Role)}>
            <option value="all">All members</option>
            <option value="member">Members</option>
            <option value="moderator">Moderators</option>
            <option value="admin">Admins</option>
          </select>
        </label>
      </div>

      {status && <p className="c-notice" role="status">{status}</p>}

      <div className="c-member-directory" aria-live="polite">
        {visibleMembers.map((member) => {
          const isCurrentUser = member.id === currentUserId;
          const joined = new Date(member.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
          return (
            <article className="c-member-row" key={member.id}>
              <div className="c-member-identity">
                <strong>{member.displayName}{isCurrentUser ? " (you)" : ""}</strong>
                <span>{member.email}</span>
                <small>{member.emailVerified ? "Verified email" : "Email not verified"} · Joined {joined}</small>
              </div>
              <label className="c-member-role">
                <span className="sr-only">Membership level for {member.displayName}</span>
                <select value={member.role} disabled={isCurrentUser || busy === member.id} onChange={(event) => void act("set-role", member.id, event.target.value as Role)}>
                  <option value="member">Member</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <button type="button" className="c-member-remove" disabled={isCurrentUser || busy === member.id} onClick={() => void act("remove", member.id)}>
                Remove
              </button>
            </article>
          );
        })}
        {!status && visibleMembers.length === 0 && <p className="c-member-empty">No members match that filter.</p>}
      </div>
    </section>
  );
}

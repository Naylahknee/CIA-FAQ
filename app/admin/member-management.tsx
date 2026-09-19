"use client";
import { useEffect, useState } from "react";

type Member = { id: string; displayName: string; email: string; role: "member" | "moderator" | "admin"; emailVerified: boolean; createdAt: string | number };
export function MemberManagement() {
  const [members, setMembers] = useState<Member[]>([]); const [status, setStatus] = useState("Loading members…"); const [busy, setBusy] = useState<string | null>(null);
  async function refresh() { const r = await fetch("/api/community/admin/members"); const d = await r.json(); if (r.ok) { setMembers(d.members); setStatus(""); } else setStatus(d.error || "Member list could not be loaded."); }
  useEffect(() => { void refresh(); }, []);
  async function act(action: "set-role" | "remove", userId: string, role?: string) { if (action === "remove" && !confirm("Remove this member and their community content?")) return; setBusy(userId); setStatus(""); try { const r = await fetch("/api/community/admin/members", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, userId, role }) }); const d = await r.json(); if (!r.ok) throw new Error(d.error); await refresh(); } catch { setStatus("Member action could not be completed."); } finally { setBusy(null); } }
  return <section className="admin-section"><h2>Community members</h2><p>Admins can set a membership level or remove a member for privacy or community-safety reasons. Moderators can review content; only admins can manage membership.</p>{status && <p role="status">{status}</p>}<div className="member-admin-list">{members.map((member) => <article key={member.id}><div><strong>{member.displayName}</strong><span>{member.email} · {member.emailVerified ? "verified" : "unverified"}</span></div><select value={member.role} disabled={busy === member.id} onChange={(event) => void act("set-role", member.id, event.target.value)}><option value="member">Member</option><option value="moderator">Moderator</option><option value="admin">Admin</option></select><button className="reject" disabled={busy === member.id} onClick={() => void act("remove", member.id)}>Remove member</button></article>)}</div></section>;
}

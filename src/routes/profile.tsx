import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { GraduationCap, LockKeyhole, Plus, Save, Trash2, UserRound } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { createCommunityUpload, signCommunityMedia } from "@/lib/community.functions";

type Profile = { id: string; display_name: string; bio: string | null; phone: string | null; location: string | null; avatar_path: string | null; joined_at: string };
type Student = { id: string; first_name: string; last_name: string | null; program: string | null; class_year: string | null; start_term: string | null; housing: string | null; dietary_notes: string | null; notes: string | null };

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [
    { title: "Your family profile — CIA Hyde Park Family Guide" },
    { name: "description", content: "Update your parent account details and keep your student's program, term, and housing information in one private place." },
    { property: "og:title", content: "Your family profile — CIA Hyde Park Family Guide" },
    { property: "og:description", content: "Private parent account details and student information for CIA Hyde Park families." },
    { property: "og:type", content: "profile" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: ProfilePage,
});

function initials(name: string) { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "M"; }

function ProfilePage() {
  const [state, setState] = useState<"loading" | "guest" | "ready">("loading");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const getUpload = useServerFn(createCommunityUpload);
  const getSigned = useServerFn(signCommunityMedia);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setState("guest"); return; }
    setEmail(user.email ?? "");
    const fallbackName = String(user.user_metadata?.["display_name"] ?? user.email?.split("@")[0] ?? "Member");
    await supabase.from("profiles").upsert({ id: user.id, display_name: fallbackName }, { onConflict: "id", ignoreDuplicates: true });
    const [{ data: row }, { data: kids }] = await Promise.all([
      supabase.from("profiles").select("id,display_name,bio,phone,location,avatar_path,joined_at").eq("id", user.id).maybeSingle(),
      supabase.from("family_students").select("id,first_name,last_name,program,class_year,start_term,housing,dietary_notes,notes").eq("parent_id", user.id).order("created_at"),
    ]);
    setProfile(row ?? null);
    setStudents(kids ?? []);
    if (row?.avatar_path) {
      const signed = await getSigned({ data: { paths: [row.avatar_path] } }).catch(() => null);
      setAvatarUrl(signed?.[row.avatar_path] ?? "");
    } else setAvatarUrl("");
    setState("ready");
  }
  useEffect(() => { load().catch(() => setState("guest")); }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!profile) return; setBusy(true); setNotice("");
    const form = new FormData(event.currentTarget);
    const { error } = await supabase.from("profiles").update({
      display_name: String(form.get("display_name") ?? "").trim() || profile.display_name,
      bio: String(form.get("bio") ?? "").trim() || null,
      phone: String(form.get("phone") ?? "").trim() || null,
      location: String(form.get("location") ?? "").trim() || null,
    }).eq("id", profile.id);
    setNotice(error ? error.message : "Your details are saved.");
    if (!error) await load();
    setBusy(false);
  }

  async function uploadAvatar(file: File) {
    if (!profile) return; setBusy(true); setNotice("");
    try {
      const signed = await getUpload({ data: { fileName: file.name, contentType: file.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif" } });
      const upload = await supabase.storage.from("community-media").uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type });
      if (upload.error) throw new Error(upload.error.message);
      const { error } = await supabase.from("profiles").update({ avatar_path: signed.path }).eq("id", profile.id);
      if (error) throw new Error(error.message);
      setNotice("Profile photo updated.");
      await load();
    } catch (error) { setNotice(error instanceof Error ? error.message : "That photo could not be saved."); }
    setBusy(false);
  }

  async function addStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!profile) return; setBusy(true); setNotice("");
    const formElement = event.currentTarget; const form = new FormData(formElement);
    const { error } = await supabase.from("family_students").insert({
      parent_id: profile.id,
      first_name: String(form.get("first_name") ?? "").trim(),
      last_name: String(form.get("last_name") ?? "").trim() || null,
      program: String(form.get("program") ?? "").trim() || null,
      class_year: String(form.get("class_year") ?? "").trim() || null,
      start_term: String(form.get("start_term") ?? "").trim() || null,
      housing: String(form.get("housing") ?? "").trim() || null,
      dietary_notes: String(form.get("dietary_notes") ?? "").trim() || null,
      notes: String(form.get("notes") ?? "").trim() || null,
    });
    setNotice(error ? error.message : "Student details saved.");
    if (!error) { formElement.reset(); setAdding(false); await load(); }
    setBusy(false);
  }

  async function updateStudent(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault(); setBusy(true); setNotice("");
    const form = new FormData(event.currentTarget);
    const { error } = await supabase.from("family_students").update({
      first_name: String(form.get("first_name") ?? "").trim(),
      last_name: String(form.get("last_name") ?? "").trim() || null,
      program: String(form.get("program") ?? "").trim() || null,
      class_year: String(form.get("class_year") ?? "").trim() || null,
      start_term: String(form.get("start_term") ?? "").trim() || null,
      housing: String(form.get("housing") ?? "").trim() || null,
      dietary_notes: String(form.get("dietary_notes") ?? "").trim() || null,
      notes: String(form.get("notes") ?? "").trim() || null,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    setNotice(error ? error.message : "Student details updated.");
    if (!error) await load();
    setBusy(false);
  }

  async function removeStudent(id: string) {
    if (!window.confirm("Remove this student from your profile?")) return;
    setBusy(true);
    const { error } = await supabase.from("family_students").delete().eq("id", id);
    setNotice(error ? error.message : "Student removed.");
    if (!error) await load();
    setBusy(false);
  }

  if (state === "loading") return <AppShell><main className="section-page"><div className="state-panel"><span className="loading-ring"/><h2>Opening your profile…</h2></div></main></AppShell>;
  if (state === "guest" || !profile) return <AppShell><main className="section-page"><div className="state-panel"><LockKeyhole/><h2>Sign in to view your profile</h2><p>Your family details are private to your account.</p><Button asChild><Link to="/community">Sign in</Link></Button></div></main></AppShell>;

  return <AppShell><main className="section-page profile-page">
    <PageHeader eyebrow="Your account" title="Family profile" description="Keep your contact details current and store your student's program information in one private place. Only you can see this page.">
      <div className="profile-identity">
        {avatarUrl ? <img className="avatar-placeholder avatar-image profile-avatar" src={avatarUrl} alt={profile.display_name}/> : <span className="avatar-placeholder profile-avatar">{initials(profile.display_name)}</span>}
        <div>
          <strong>{profile.display_name}</strong>
          <small>{email}</small>
          <small>Member since {new Date(profile.joined_at).toLocaleDateString()}</small>
        </div>
        <label className="photo-upload"><UserRound size={15}/>Change photo
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadAvatar(file); }}/>
        </label>
      </div>
    </PageHeader>
    {notice && <p className="auth-notice">{notice}</p>}

    <section className="profile-card">
      <h2>Your details</h2>
      <form className="profile-form" onSubmit={saveProfile}>
        <label>Name<input name="display_name" defaultValue={profile.display_name} maxLength={80} required/></label>
        <label>Phone<input name="phone" type="tel" defaultValue={profile.phone ?? ""} maxLength={40} placeholder="(000) 000-0000"/></label>
        <label>Where you live<input name="location" defaultValue={profile.location ?? ""} maxLength={80} placeholder="City, State"/></label>
        <label className="full">About your family<textarea name="bio" defaultValue={profile.bio ?? ""} maxLength={500} rows={3} placeholder="Anything you would like other approved families to know."/></label>
        <Button disabled={busy}><Save size={16}/>Save details</Button>
      </form>
    </section>

    <section className="profile-card">
      <div className="section-heading"><div><h2>Your student</h2><p>Program, term, and housing details you can check at a glance.</p></div><Button variant="outline" onClick={() => setAdding(!adding)}><Plus size={16}/>{adding ? "Cancel" : "Add student"}</Button></div>
      {adding && <form className="profile-form" onSubmit={addStudent}>
        <label>First name<input name="first_name" required maxLength={60}/></label>
        <label>Last name<input name="last_name" maxLength={60}/></label>
        <label>Program<input name="program" maxLength={80} placeholder="Culinary Arts"/></label>
        <label>Class year<input name="class_year" maxLength={20} placeholder="2030"/></label>
        <label>Start term<input name="start_term" maxLength={40} placeholder="Fall 2026"/></label>
        <label>Housing<input name="housing" maxLength={80} placeholder="Residence hall or off campus"/></label>
        <label className="full">Dietary or medical notes<input name="dietary_notes" maxLength={200}/></label>
        <label className="full">Other notes<textarea name="notes" rows={2} maxLength={500}/></label>
        <Button disabled={busy}><Save size={16}/>Save student</Button>
      </form>}
      {students.length ? students.map((student) => <form key={student.id} className="profile-form student-form" onSubmit={(event) => updateStudent(event, student.id)}>
        <p className="student-name"><GraduationCap size={16}/>{student.first_name} {student.last_name ?? ""}</p>
        <label>First name<input name="first_name" defaultValue={student.first_name} required maxLength={60}/></label>
        <label>Last name<input name="last_name" defaultValue={student.last_name ?? ""} maxLength={60}/></label>
        <label>Program<input name="program" defaultValue={student.program ?? ""} maxLength={80}/></label>
        <label>Class year<input name="class_year" defaultValue={student.class_year ?? ""} maxLength={20}/></label>
        <label>Start term<input name="start_term" defaultValue={student.start_term ?? ""} maxLength={40}/></label>
        <label>Housing<input name="housing" defaultValue={student.housing ?? ""} maxLength={80}/></label>
        <label className="full">Dietary or medical notes<input name="dietary_notes" defaultValue={student.dietary_notes ?? ""} maxLength={200}/></label>
        <label className="full">Other notes<textarea name="notes" defaultValue={student.notes ?? ""} rows={2} maxLength={500}/></label>
        <div className="student-actions"><Button disabled={busy}><Save size={16}/>Update</Button><Button type="button" variant="ghost" disabled={busy} onClick={() => removeStudent(student.id)}><Trash2 size={16}/>Remove</Button></div>
      </form>) : !adding && <p className="empty-note">No student added yet. Add your student so their program, term, and housing details are always handy.</p>}
    </section>
  </main></AppShell>;
}

"use client";
import { FormEvent, useState } from "react";

export default function SharePage() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const response = await fetch("/api/submissions", { method: "POST", body: new FormData(event.currentTarget) });
    const result = await response.json() as { error?: string; message?: string };
    setMessage(result.message ?? result.error ?? "Something went wrong."); setBusy(false);
    if (response.ok) event.currentTarget.reset();
  }
  return <main className="form-page"><a className="form-back" href="/">← Back to the guide</a><section className="form-card"><p className="eyebrow">Share with the village</p><h1>Submit a resource or memory</h1><p>Every submission is reviewed before publication. GroupMe content is never imported automatically.</p><form onSubmit={submit}>
    <label>Wall<select name="kind" required defaultValue="memory"><option value="memory">Wall of Wonder</option><option value="resource">Resource Wall</option></select></label>
    <label>Title<input name="title" required maxLength={120} placeholder="First day in chef whites" /></label>
    <label>Caption<textarea name="caption" required maxLength={600} rows={4} placeholder="Tell us what is happening and why it matters." /></label>
    <label>Student name or initials <span>(optional)</span><input name="studentName" maxLength={80} /></label>
    <label>Your email<input name="submitterEmail" required type="email" /></label>
    <label>Your full name for the consent record<input name="consentName" required maxLength={120} /></label>
    <label>Image<input name="image" required type="file" accept="image/jpeg,image/png,image/webp" /><span>JPG, PNG, or WebP; maximum 8 MB.</span></label>
    <label className="consent-row"><input name="consent" type="checkbox" required /> <span>I have permission to share this image and understand it may appear on the CIA Hyde Park Family Guide guide.</span></label>
    <button disabled={busy} type="submit">{busy ? "Submitting…" : "Submit for review"}</button>
  </form>{message && <p className="form-message" role="status">{message}</p>}</section></main>;
}

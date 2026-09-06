"use client";
import { FormEvent, useState } from "react";

export default function CorrectionsPage() {
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form=event.currentTarget; const data=new FormData(form);
    const response=await fetch("/api/corrections",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(Object.fromEntries(data))});
    setMessage(response.ok ? "Thank you. Your correction has been sent for review." : "The correction could not be sent."); if(response.ok) form.reset();
  }
  return <main className="form-page"><a className="form-back" href="/">← Back to the guide</a><section className="form-card"><p className="eyebrow">Keep the guide accurate</p><h1>Submit a correction</h1><p>Report an outdated date, price, phone number, link, policy, or missing answer. Include an official source when possible.</p><form onSubmit={submit}>
    <label>Topic<input name="topic" required maxLength={120} placeholder="Meal plan, tuition, move-in…" /></label>
    <label>What needs to change?<textarea name="message" required maxLength={1200} rows={6} /></label>
    <label>Official source link <span>(optional)</span><input name="sourceUrl" type="url" /></label>
    <label>Your email <span>(optional)</span><input name="submitterEmail" type="email" /></label>
    <button type="submit">Send for review</button>
  </form>{message && <p className="form-message" role="status">{message}</p>}</section></main>;
}

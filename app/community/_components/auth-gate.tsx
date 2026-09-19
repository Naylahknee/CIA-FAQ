"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { COMMUNITY_TOPICS } from "../../community-onboarding";
import { useCommunity } from "./community-data";

type GoogleApi = { accounts: { id: { initialize(input: { client_id: string; callback: (response: { credential?: string }) => void; auto_select: boolean; cancel_on_tap_outside: boolean }): void; renderButton(node: HTMLElement, options: Record<string, string | number>): void } } };
declare global { interface Window { google?: GoogleApi } }

function passwordHint(value: string) {
  const checks = [/[a-z]/.test(value), /[A-Z]/.test(value), /\d/.test(value), /[^A-Za-z0-9]/.test(value), value.length >= 12].filter(Boolean).length;
  return checks < 3 ? "Use 12 characters with uppercase, lowercase, number, and symbol." : checks < 5 ? "Almost there — add the missing password requirement." : "Strong password.";
}

export function AuthGate() {
  const { setUser, loadFeed, notice, setNotice, busy, setBusy } = useCommunity();
  const params = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">(() => params.get("mode") === "signup" ? "signup" : "signin");
  const [step, setStep] = useState<"account" | "onboarding">("account");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const onboardingRef = useRef<HTMLFormElement>(null);
  const googleRef = useRef<HTMLDivElement>(null);

  function chooseMode(next: "signin" | "signup") {
    setMode(next); setStep("account"); setNotice("");
    const url = new URL(window.location.href);
    if (next === "signup") url.searchParams.set("mode", "signup"); else url.searchParams.delete("mode");
    window.history.replaceState({}, "", url);
  }

  async function finishOnboarding(form: HTMLFormElement, skipOptional = false) {
    const values = Object.fromEntries(new FormData(form));
    if (skipOptional) { values.studentStage = "prefer_not_to_say"; values.topics = []; }
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/community/account/onboarding", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(values) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Community preferences could not be saved.");
      const me = await fetch("/api/community/auth/me").then((r) => r.json());
      setUser(me.user); if (me.user && (!me.user.verificationRequired || me.user.emailVerified)) await loadFeed();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Community preferences could not be saved."); }
    finally { setBusy(false); }
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/community/auth/providers").then((r) => r.json()).then((data) => {
      const clientId = String(data.google?.clientId ?? ""); if (!clientId || cancelled) return;
      const render = () => {
        if (cancelled || !window.google || !googleRef.current) return;
        window.google.accounts.id.initialize({ client_id: clientId, auto_select: false, cancel_on_tap_outside: true, callback: async ({ credential }) => {
          if (!credential) return;
          if (mode === "signup") {
            const fields = formRef.current ? new FormData(formRef.current) : null;
            if (!fields?.get("termsAccepted") || !fields.get("independentAcknowledged")) { setNotice("Confirm the two required commitments before continuing with Google."); return; }
          }
          setBusy(true); setNotice("");
          try {
            const response = await fetch("/api/community/auth/google", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ credential }) });
            const data = await response.json(); if (!response.ok) throw new Error(data.error || "Google sign-in could not be completed.");
            if (mode === "signup") setStep("onboarding");
            else { const me = await fetch("/api/community/auth/me").then((r) => r.json()); setUser(me.user); if (me.user) await loadFeed(); }
          } catch (error) { setNotice(error instanceof Error ? error.message : "Google sign-in could not be completed."); }
          finally { setBusy(false); }
        }});
        googleRef.current.replaceChildren();
        window.google.accounts.id.renderButton(googleRef.current, { type: "standard", theme: "outline", size: "large", shape: "pill", text: mode === "signup" ? "continue_with" : "signin_with", width: 320 });
      };
      if (window.google) render(); else { const script = document.querySelector<HTMLScriptElement>('script[data-google-identity="true"]') ?? document.head.appendChild(Object.assign(document.createElement("script"), { src: "https://accounts.google.com/gsi/client", async: true, dataset: { googleIdentity: "true" } })); script.addEventListener("load", render, { once: true }); }
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [mode, setBusy, setNotice, setUser, loadFeed]);

  async function submitAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "signup" && new FormData(event.currentTarget).get("password") !== new FormData(event.currentTarget).get("passwordConfirmation")) { setNotice("Passwords do not match."); return; }
    setBusy(true); setNotice("");
    try {
      const response = await fetch(`/api/community/auth/${mode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Account request could not be completed.");
      if (mode === "signup") setStep("onboarding");
      else { const me = await fetch("/api/community/auth/me").then((r) => r.json()); setUser(me.user); if (me.user) await loadFeed(); }
    } catch (error) { setNotice(error instanceof Error ? error.message : "Account request could not be completed."); }
    finally { setBusy(false); }
  }

  const accountForm = <form ref={formRef} onSubmit={submitAccount} className="c-auth-form">
    {mode === "signup" && <label>Display name<span>Use your first name, a nickname, or an alias. This is what other members will see.</span><input name="displayName" required maxLength={60} autoComplete="name" /></label>}
    <label>Email address<span>Used for sign-in, verification, password recovery, and account notices. It is never displayed publicly.</span><input name="email" type="email" required maxLength={200} autoComplete="email" /></label>
    <label>Password<div className="c-password-row"><input name="password" type={showPassword ? "text" : "password"} required minLength={12} maxLength={128} autoComplete={mode === "signup" ? "new-password" : "current-password"} onChange={(event) => setPassword(event.target.value)} /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Hide" : "Show"}</button></div>{mode === "signup" && <span>{passwordHint(password)}</span>}</label>
    {mode === "signup" && <label>Confirm password<input name="passwordConfirmation" type={showPassword ? "text" : "password"} required minLength={12} maxLength={128} autoComplete="new-password" /></label>}
    {mode === "signin" && <><label>Authenticator or recovery code (if enabled)<input name="code" autoComplete="one-time-code" maxLength={32} /></label><Link className="c-auth-link" href="/account">Forgot password?</Link></>}
    {mode === "signup" && <div className="c-auth-checks"><label className="c-check"><input name="termsAccepted" type="checkbox" required />I am at least 18 and agree to the <Link href="/community-guidelines" target="_blank">Community Guidelines</Link> and <Link href="/privacy" target="_blank">Privacy Notice</Link>.</label><label className="c-check"><input name="independentAcknowledged" type="checkbox" required />I understand this is an independent family community, not an official CIA communication channel. I will confirm time-sensitive school information with CIA.</label></div>}
    <button className="c-btn" disabled={busy}>{busy ? "Working…" : mode === "signup" ? "Create account" : "Sign in"}</button>
  </form>;

  const onboardingForm = <form ref={onboardingRef} className="c-auth-form" onSubmit={(event) => { event.preventDefault(); void finishOnboarding(event.currentTarget); }}>
    <h1>A little context helps us point you to the right conversations.</h1><p className="c-muted">These answers are optional except where noted. Do not include a student&rsquo;s name, ID number, dorm, class schedule, medical information, or exact location.</p>
    <label>You are joining as:<select name="memberType" required defaultValue=""><option value="" disabled>Select one</option><option value="parent_guardian">Parent or guardian</option><option value="family_support">Family member/support person</option><option value="cia_student">CIA student</option><option value="other_supporter">Other community supporter</option></select></label>
    <label>Where is your student in the CIA journey? <span>Optional</span><select name="studentStage" defaultValue="prefer_not_to_say"><option value="currently_attending">Currently attending Hyde Park</option><option value="starting_spring_2027">Starting Spring 2027</option><option value="starting_future">Starting in a future term</option><option value="exploring">Exploring or preparing to apply</option><option value="prefer_not_to_say">Prefer not to say</option></select></label>
    <fieldset><legend>Which topics would be most useful? <small>Optional</small></legend>{COMMUNITY_TOPICS.map((topic) => <label className="c-check" key={topic}><input name="topics" type="checkbox" value={topic} />{topic}</label>)}</fieldset>
    <label className="c-check"><input name="safetyAccepted" type="checkbox" required />I will not post student passwords, IDs, room numbers, class schedules, private medical details, or photos of someone else without permission.</label>
    <div className="c-auth-actions"><button className="c-btn" disabled={busy}>{busy ? "Saving…" : "Enter the community"}</button><button type="button" className="c-btn c-btn-ghost" disabled={busy} onClick={() => { if (onboardingRef.current) void finishOnboarding(onboardingRef.current, true); }}>Skip optional questions and enter</button></div>
  </form>;

  return <div className="c-wrap"><div className="c-columns"><section className="c-center"><div className="c-card c-auth-card">{step === "onboarding" ? onboardingForm : <><h1>{mode === "signup" ? "Join the CIA family community" : "CIA Parents and Family"}</h1><p className="c-muted">{mode === "signup" ? "Read the Guide & FAQ without an account. Create one only if you want to ask questions, share resources, or connect with other families." : "A private space for CIA Hyde Park families."}</p><div className="c-pill-row c-auth-tabs"><button type="button" className="c-pill" aria-pressed={mode === "signin"} onClick={() => chooseMode("signin")}>Sign in</button><button type="button" className="c-pill" aria-pressed={mode === "signup"} onClick={() => chooseMode("signup")}>Create an account</button></div>{accountForm}<div className="c-auth-divider"><span>or</span></div><div ref={googleRef} />{mode === "signup" ? <p className="c-muted">Already have an account? <button type="button" className="c-auth-link" onClick={() => chooseMode("signin")}>Sign in</button></p> : <p className="c-muted">Need to join? <button type="button" className="c-auth-link" onClick={() => chooseMode("signup")}>Create an account</button></p>}</>} {notice && <p className="c-notice" role="status" aria-live="polite">{notice}</p>}</div></section><aside className="c-rail"><div className="c-card c-card-green"><h2>Community care</h2><ul><li>Be helpful; do not harass, shame, discriminate, or target another family.</li><li>Do not share student credentials, IDs, room numbers, schedules, or private records.</li><li>Report harmful posts, scams, impersonation, or safety concerns.</li></ul></div><div className="c-card"><img src="/community-login-collage.webp" alt="Families at the CIA Hyde Park campus." style={{ width: "100%", borderRadius: 14 }} /></div></aside></div></div>;
}

"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useCommunity } from "./community-data";

type GoogleApi = { accounts: { id: { initialize(input: { client_id: string; callback: (response: { credential?: string }) => void; auto_select: boolean; cancel_on_tap_outside: boolean }): void; renderButton(node: HTMLElement, options: Record<string, string | number>): void } } };
declare global { interface Window { google?: GoogleApi } }

export function AuthGate() {
  const { setUser, loadFeed, notice, setNotice, busy, setBusy } = useCommunity();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">(() => searchParams.get("mode") === "signup" ? "signup" : "signin");
  const googleRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function chooseMode(nextMode: "signin" | "signup") {
    setMode(nextMode); setNotice("");
    const url = new URL(window.location.href);
    if (nextMode === "signup") url.searchParams.set("mode", "signup");
    else url.searchParams.delete("mode");
    window.history.replaceState({}, "", url);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/community/auth/providers").then((r) => r.json()).then((data) => {
      const clientId = String(data.google?.clientId ?? "");
      if (!clientId || cancelled) return;
      const render = () => {
        if (cancelled || !window.google || !googleRef.current) return;
        window.google.accounts.id.initialize({
          client_id: clientId, auto_select: false, cancel_on_tap_outside: true,
          callback: async (response) => {
            if (!response.credential) return;
            setBusy(true); setNotice("");
            try {
              const formData = formRef.current ? Object.fromEntries(new FormData(formRef.current)) : {};
              const result = await fetch("/api/community/auth/google", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ credential: response.credential, ...formData, signupIntent: mode === "signup" }) });
              const body = await result.json();
              if (!result.ok) throw new Error(body.error || "Google sign-in could not be completed.");
              const me = await fetch("/api/community/auth/me").then((r) => r.json());
              setUser(me.user); if (me.user) await loadFeed();
            } catch { setNotice("Google sign-in could not be completed. Please try again."); }
            finally { setBusy(false); }
          },
        });
        googleRef.current.replaceChildren();
        window.google.accounts.id.renderButton(googleRef.current, { type: "standard", theme: "outline", size: "large", shape: "pill", text: mode === "signup" ? "signup_with" : "signin_with", width: 320 });
      };
      if (window.google) render();
      else {
        const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity="true"]');
        if (existing) existing.addEventListener("load", render, { once: true });
        else {
          const script = document.createElement("script");
          script.src = "https://accounts.google.com/gsi/client"; script.async = true;
          script.dataset.googleIdentity = "true";
          script.addEventListener("load", render, { once: true });
          document.head.append(script);
        }
      }
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [mode, setBusy, setNotice, setUser, loadFeed]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice("");
    try {
      const form = new FormData(event.currentTarget);
      if (mode === "signup" && form.get("password") !== form.get("passwordConfirmation")) {
        setNotice("Passwords do not match."); return;
      }
      const response = await fetch(`/api/community/auth/${mode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
      const data = await response.json();
      if (!response.ok) setNotice(data.error);
      else {
        const me = await fetch("/api/community/auth/me").then((r) => r.json());
        setUser(me.user);
        if (me.user && (!me.user.verificationRequired || me.user.emailVerified)) await loadFeed();
      }
    } catch { setNotice("The account service could not be reached. Please try again."); }
    finally { setBusy(false); }
  }

  return (
    <div className="c-wrap">
      <div className="c-columns">
        <section className="c-center">
          <div className="c-card">
            <h1>{mode === "signup" ? "Join the community" : "CIA Parents and Family"}</h1>
            <p className="c-muted" style={{ marginTop: 8 }}>
              {mode === "signup" ? "Create a basic account, then tell us only the context needed to make the community useful." : "A private space for CIA Hyde Park families. Ask the questions you would ask another parent, share what worked, and get answers from people who have been through it."}
            </p>
            <hr className="c-post-divider" />
            <div className="c-pill-row" style={{ justifyContent: "flex-start" }}>
              <button type="button" className="c-pill" aria-pressed={mode === "signin"} onClick={() => chooseMode("signin")}>Sign in</button>
              <button type="button" className="c-pill" aria-pressed={mode === "signup"} onClick={() => chooseMode("signup")}>Create an account</button>
            </div>

            {mode === "signup" && <p className="c-muted" style={{ margin: "16px 0 0", fontSize: ".86rem" }}>Step 1: account details. Step 2: community preferences. We do not ask for a student&rsquo;s name, ID, dorm, schedule, medical information, or live location.</p>}
            <form ref={formRef} onSubmit={submit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
              {mode === "signup" && (
                <label style={{ display: "grid", gap: 6, fontWeight: 700, fontSize: ".9rem" }}>Display name
                  <input name="displayName" required maxLength={60} autoComplete="name" style={{ minHeight: 44, padding: "0 14px", border: "1px solid var(--c-card-border)", borderRadius: 999, font: "inherit" }} />
                </label>
              )}
              <label style={{ display: "grid", gap: 6, fontWeight: 700, fontSize: ".9rem" }}>Email
                <input name="email" type="email" required maxLength={200} autoComplete="email" style={{ minHeight: 44, padding: "0 14px", border: "1px solid var(--c-card-border)", borderRadius: 999, font: "inherit" }} />
              </label>
              <label style={{ display: "grid", gap: 6, fontWeight: 700, fontSize: ".9rem" }}>Password
                <input name="password" type="password" required minLength={12} maxLength={128} autoComplete={mode === "signup" ? "new-password" : "current-password"} style={{ minHeight: 44, padding: "0 14px", border: "1px solid var(--c-card-border)", borderRadius: 999, font: "inherit" }} />
              </label>
              {mode === "signup" && <label style={{ display: "grid", gap: 6, fontWeight: 700, fontSize: ".9rem" }}>Confirm password
                <input name="passwordConfirmation" type="password" required minLength={12} maxLength={128} autoComplete="new-password" style={{ minHeight: 44, padding: "0 14px", border: "1px solid var(--c-card-border)", borderRadius: 999, font: "inherit" }} />
              </label>}
              {mode === "signup" && <fieldset style={{ display: "grid", gap: 12, margin: "6px 0 0", padding: "16px", border: "1px solid var(--c-card-border)", borderRadius: 14 }}>
                <legend style={{ padding: "0 6px", fontWeight: 800 }}>Community context</legend>
                <label style={{ display: "grid", gap: 6, fontWeight: 700, fontSize: ".9rem" }}>How are you connected to CIA?
                  <select name="memberType" required defaultValue="" style={{ minHeight: 44, padding: "0 12px", border: "1px solid var(--c-card-border)", borderRadius: 10, font: "inherit" }}><option value="" disabled>Select one</option><option value="parent_guardian">Parent or guardian</option><option value="student">Current or incoming student</option><option value="family_supporter">Family member or supporter</option></select>
                </label>
                <label style={{ display: "grid", gap: 6, fontWeight: 700, fontSize: ".9rem" }}>Student&rsquo;s CIA stage
                  <select name="studentStage" required defaultValue="" style={{ minHeight: 44, padding: "0 12px", border: "1px solid var(--c-card-border)", borderRadius: 10, font: "inherit" }}><option value="" disabled>Select one</option><option value="currently_enrolled">Currently enrolled</option><option value="starting_spring_2027">Starting Spring 2027</option><option value="starting_later">Starting in a later term</option><option value="exploring">Exploring or planning ahead</option></select>
                </label>
                <label className="c-check"><input name="guidelinesAccepted" type="checkbox" required />I will not share student names, ID numbers, room numbers, schedules, health details, or other private information.</label>
                <label className="c-check"><input name="privacyAccepted" type="checkbox" required />I understand this is an independent family community and will confirm time-sensitive school information with CIA.</label>
              </fieldset>}
              {mode === "signin" && (
                <label style={{ display: "grid", gap: 6, fontWeight: 700, fontSize: ".9rem" }}>Authenticator or recovery code (if enabled)
                  <input name="code" autoComplete="one-time-code" maxLength={32} style={{ minHeight: 44, padding: "0 14px", border: "1px solid var(--c-card-border)", borderRadius: 999, font: "inherit" }} />
                </label>
              )}
              <button className="c-btn" disabled={busy}>{busy ? "Working…" : mode === "signup" ? "Create account and join" : "Sign in"}</button>
            </form>

            <div ref={googleRef} style={{ marginTop: 14 }} />
            {notice && <p className="c-notice" role="status" aria-live="polite" style={{ marginTop: 14 }}>{notice}</p>}
            <p className="c-muted" style={{ marginTop: 14 }}>
              You can read every FAQ on the <Link href="/">Guide</Link> without an account.{" "}
              <Link href="/privacy">Privacy details</Link>.
            </p>
          </div>
        </section>

        <aside className="c-rail">
          <div className="c-card c-card-green">
            <h2>Community care</h2>
            <ul style={{ margin: "0 0 0 18px", padding: 0, display: "grid", gap: 8, fontSize: ".92rem" }}>
              <li>Share experience, not advice you are not qualified to give.</li>
              <li>No student names, room numbers, or schedules.</li>
              <li>Confirm time-sensitive details with the school.</li>
              <li>For emergencies, call 911 or Campus Safety.</li>
            </ul>
          </div>
          <div className="c-card">
            <img src="/community-login-collage.webp" alt="Families at the CIA Hyde Park campus." style={{ width: "100%", borderRadius: 14 }} />
          </div>
        </aside>
      </div>
    </div>
  );
}

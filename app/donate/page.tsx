import { env } from "cloudflare:workers";
import "../scholarship/scholarship.css";
import Link from "next/link";

export const dynamic = "force-dynamic";

const BUY_ME_A_COFFEE_URL = "https://buymeacoffee.com/tq4yIJli7f";

export default function SupportPage() {
  const rawTotal = env.SUPPORT_CONFIRMED_TOTAL_CENTS;
  const amount = Number(rawTotal);
  const total = rawTotal !== undefined && String(rawTotal).trim() !== "" && Number.isSafeInteger(amount) && amount >= 0 ? amount : null;
  const target = Number(env.SUPPORT_GOAL_CENTS);
  const goal = Number.isSafeInteger(target) && target > 0 ? target : null;
  const percent = total !== null && goal !== null ? Math.min(100, total / goal * 100) : 0;
  const money = (cents: number) => new Intl.NumberFormat("en-US", {style:"currency", currency:"USD"}).format(cents / 100);
  let paymentUrl = BUY_ME_A_COFFEE_URL;
  try {
    const url = new URL(String(env.SUPPORT_PAYMENT_URL ?? ""));
    if (url.protocol === "https:" && !url.username && !url.password) paymentUrl = url.href;
  } catch { /* Use the verified Buy Me a Coffee page when no override is configured. */ }

  return <main className="form-page"><Link className="form-back" href="/">Back to the Guide &amp; FAQ</Link>
    <section className="form-card scholarship"><p className="eyebrow">An independent family guide &amp; FAQ</p><h1>Support the Guide</h1>
      <p>If this guide saved you some time—or a few frantic parent texts—you can buy me a coffee. Contributions support my time and the costs of keeping this independent guide updated. Giving is optional, and the FAQs stay free.</p>
      <div className="scholarship-progress">
        <svg viewBox="0 0 300 300" role="img" aria-labelledby="support-hat-title support-hat-desc">
          <title id="support-hat-title">Guide support chef’s hat</title><desc id="support-hat-desc">{total === null ? "Support tracking is not connected yet." : goal === null ? `${money(total)} in confirmed support.` : `${Math.round(percent)} percent of the guide support goal.`}</desc>
          <defs><clipPath id="support-hat"><path d="M65 185C12 184 8 97 66 88C67 20 137 13 154 57C199 8 255 46 248 91C298 111 285 178 237 185L229 270H75Z"/></clipPath></defs>
          <path d="M65 185C12 184 8 97 66 88C67 20 137 13 154 57C199 8 255 46 248 91C298 111 285 178 237 185L229 270H75Z" fill="var(--cream)" stroke="currentColor" strokeWidth="5"/>
          <g clipPath="url(#support-hat)"><rect x="0" y={270-percent*2.5} width="300" height={percent*2.5} fill="var(--gold)" className="hat-fill"/></g>
          <path d="M74 235H230M106 185L111 232M151 180V232M198 185L192 232" stroke="currentColor" strokeWidth="4" fill="none"/>
        </svg>
        <div><h2>Help keep the guide going</h2>
          {total === null ? <p>Support tracking is being set up.</p> : <p className="fund-total">{money(total)}<span>{goal === null ? "in confirmed support" : `of ${money(goal)} goal`}</span></p>}
          {total !== null && goal !== null && <progress aria-label="Guide support funding progress" value={percent} max="100">{Math.round(percent)}%</progress>}
          <a className="support-button" href={paymentUrl} target="_blank" rel="noopener noreferrer">Buy me a coffee</a>
          <p id="support-status">Your contribution is processed securely on Buy Me a Coffee.</p>
          <p className="support-total-note">The hat shows confirmed support recorded by the guide owner. Totals are not automatically synced with a payment provider yet.</p>
        </div>
      </div>
      <h2>What your support makes possible</h2><p>Updating FAQs and campus links, checking dates and resources, and covering website hosting and maintenance.</p>
      <p>Contributions support the guide’s creator. Reading the FAQs never requires an account or contribution. Sign up only to interact with other parents and students.</p>
      <p>This independent guide is not affiliated with The Culinary Institute of America.</p><Link href="/privacy">Privacy information</Link>
    </section>
  </main>;
}

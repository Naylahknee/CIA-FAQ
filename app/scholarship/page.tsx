import { env } from "cloudflare:workers";
import "./scholarship.css";

export const dynamic = "force-dynamic";

export default async function ScholarshipPage() {
  const configuredGoal = Number(env.SCHOLARSHIP_MONTHLY_GOAL_CENTS ?? 0);
  const goalCents = Number.isSafeInteger(configuredGoal) && configuredGoal > 0 ? configuredGoal : null;
  let totalCents: number | null = null;
  try {
    const row = await env.DB.prepare("SELECT COALESCE(SUM(amount_cents), 0) AS total FROM scholarship_contributions WHERE status = 'confirmed'").first<{ total: number }>();
    totalCents = Number(row?.total ?? 0);
  } catch {
    totalCents = null;
  }
  const progress = totalCents === null || goalCents === null ? 0 : Math.min(100, Math.round((totalCents / goalCents) * 100));
  const dollars = totalCents === null ? "Tracker temporarily unavailable" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(totalCents / 100);
  const goal = goalCents === null ? "Monthly goal will be published before donations open." : `of ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(goalCents / 100)}`;

  return <main className="form-page"><a className="form-back" href="/">Back to the family guide</a><section className="form-card scholarship"><p className="eyebrow">Families supporting future chefs</p><h1>A little from each family. More opportunity for a student.</h1><p>All confirmed proceeds will be reserved for a planned monthly CIA student scholarship selected at random. The organizer, award rules, eligibility and payment arrangements will be published before fundraising opens.</p><div className="scholarship-progress"><svg viewBox="0 0 300 300" role="img" aria-labelledby="hat-title hat-desc"><title id="hat-title">Scholarship fund chef’s hat</title><desc id="hat-desc">{goalCents === null ? "The monthly goal has not been set." : `${progress}% of the monthly scholarship goal is funded.`}</desc><defs><clipPath id="chef-hat"><path d="M65 185C12 184 8 97 66 88C67 20 137 13 154 57C199 8 255 46 248 91C298 111 285 178 237 185L229 270H75Z"/></clipPath></defs><path d="M65 185C12 184 8 97 66 88C67 20 137 13 154 57C199 8 255 46 248 91C298 111 285 178 237 185L229 270H75Z" fill="var(--cream)" stroke="currentColor" strokeWidth="5"/><g clipPath="url(#chef-hat)"><rect x="0" y={300 - (progress * 3)} width="300" height={progress * 3} fill="var(--gold)" className="hat-fill"/></g><path d="M74 235H230M106 185L111 232M151 180V232M198 185L192 232" stroke="currentColor" strokeWidth="4" fill="none"/></svg><div><h2>Monthly scholarship fund</h2><p className="fund-total">{dollars} <span>{goal}</span></p>{goalCents !== null && <><progress value={progress} max="100">{progress}%</progress><p>{progress}% of the monthly goal is funded from confirmed contributions.</p></>}<button disabled aria-describedby="donations-status">Donate — opening soon</button><p id="donations-status">Donations are not being accepted until the payment account and official drawing rules are published.</p></div></div><h2>Before donations open</h2><p>This page will identify the fund organizer and recipient, processing fees, eligibility, selection method and award date. It will explain whether donations affect eligibility and how refunds or canceled awards are handled.</p><p>This is an independent family initiative, not an official Culinary Institute of America fundraiser. Contributions are not represented as tax deductible.</p><p><a href="/privacy">Privacy information</a></p></section></main>;
}

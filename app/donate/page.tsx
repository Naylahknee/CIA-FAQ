import { env } from "cloudflare:workers";
import "../scholarship/scholarship.css";
import Link from "next/link";

export const dynamic = "force-dynamic";

const BUY_ME_A_COFFEE_URL = "https://buymeacoffee.com/tq4yIJli7f";

/** Deliberately has no funding goal, total or progress bar. There is no
 *  campaign to track any more -- the page exists to say what the guide costs
 *  to keep running and to point at Buy Me a Coffee. The chef's hat that used
 *  to fill as a gauge is now just the page's illustration. */
export default function DonatePage() {
  let paymentUrl = BUY_ME_A_COFFEE_URL;
  try {
    const url = new URL(String(env.SUPPORT_PAYMENT_URL ?? ""));
    if (url.protocol === "https:" && !url.username && !url.password) paymentUrl = url.href;
  } catch { /* Use the verified Buy Me a Coffee page when no override is configured. */ }

  return <main className="form-page"><Link className="form-back" href="/">Back to the Guide &amp; FAQ</Link>
    <section className="form-card scholarship"><p className="eyebrow">An independent family guide &amp; FAQ</p><h1>Support the Guide</h1>
      <p>If this guide saved you some time&mdash;or a few frantic parent texts&mdash;you can buy me a coffee. Contributions support my time and the costs of keeping this independent guide updated. Giving is optional, and the FAQs stay free.</p>
      <div className="scholarship-progress">
        <svg viewBox="0 0 300 300" role="img" aria-labelledby="support-hat-title">
          <title id="support-hat-title">A chef&rsquo;s hat</title>
          <path d="M65 185C12 184 8 97 66 88C67 20 137 13 154 57C199 8 255 46 248 91C298 111 285 178 237 185L229 270H75Z" fill="var(--gold)" stroke="currentColor" strokeWidth="5"/>
          <path d="M74 235H230M106 185L111 232M151 180V232M198 185L192 232" stroke="currentColor" strokeWidth="4" fill="none"/>
        </svg>
        <div><h2>Help keep the guide going</h2>
          <p>Every contribution goes to one person keeping one site accurate. There is no company behind it and no target to hit.</p>
          <a className="support-button" href={paymentUrl} target="_blank" rel="noopener noreferrer">Buy me a coffee</a>
          <p id="support-status">Your contribution is processed securely on Buy Me a Coffee.</p>
        </div>
      </div>
      <h2>What your support makes possible</h2><p>Updating FAQs and campus links, checking dates and resources, and covering website hosting and maintenance.</p>
      <p>Contributions support the guide&rsquo;s creator. Reading the FAQs never requires an account or contribution. Sign up only to interact with other parents and students.</p>
      <p>This independent guide is not affiliated with The Culinary Institute of America.</p><Link href="/privacy">Privacy information</Link>
    </section>
  </main>;
}

import Link from "next/link";

export default function NotFound() {
  return <main className="system-page"><p className="eyebrow">404</p><h1>That page is not here.</h1><p>Check the link, or return to the Family Guide &amp; FAQ.</p><Link href="/" className="primary-button">Return to the guide</Link></main>;
}

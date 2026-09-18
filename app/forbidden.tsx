import Link from "next/link";

export default function Forbidden() {
  return <main className="system-page"><p className="eyebrow">403</p><h1>You do not have access to this page.</h1><p>Sign in with an authorized account, or return to the Family Guide &amp; FAQ.</p><Link href="/community" className="primary-button">Go to community sign in</Link></main>;
}

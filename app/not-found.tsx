/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export default function NotFound() {
  return <main className="system-page not-found-page">
    <div className="not-found-copy">
      <p className="eyebrow">404</p>
      <h1>That page is not here.</h1>
      <p>Check the link, or return to the Family Guide &amp; FAQ.</p>
      <Link href="/" className="primary-button">Return to the guide</Link>
    </div>
    {/* Decorative: the heading already says everything a screen reader needs,
        so the illustration is hidden rather than described twice. */}
    <img
      className="not-found-art"
      src="/lost-with-map.webp"
      alt=""
      aria-hidden="true"
      width={1122}
      height={1402}
      sizes="(max-width: 760px) 60vw, 380px"
    />
  </main>;
}

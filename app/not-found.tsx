/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { LOST_AUNTIE_ART } from "./lost-auntie-art";

export default function NotFound() {
  return (
    <main className="lost-page">
      <section className="lost-page-copy">
        <p className="eyebrow">404</p>
        <h1>Looks like you made a wrong turn....</h1>
        <p>You&rsquo;re not lost for good. Head back to the CIA Hyde Park Family Guide &amp; FAQ.</p>
        <Link href="/" className="primary-button">Return to the guide</Link>
      </section>
      <figure className="lost-page-art">
        <img src={LOST_AUNTIE_ART} alt="A parent looking at a map with question marks overhead." />
      </figure>
    </main>
  );
}

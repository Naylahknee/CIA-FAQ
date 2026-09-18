"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="system-page"><p className="eyebrow">Temporary problem</p><h1>We could not load this page.</h1><p>Please try again. If the problem continues, return to the guide and try again later.</p><button className="primary-button" type="button" onClick={reset}>Try again</button></main>;
}

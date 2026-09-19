import Link from "next/link";

export default function CommunityGuidelinesPage() {
  return <main className="policy-page page-wrap"><Link className="policy-back" href="/community">Back to the community</Link><p className="eyebrow">CIA Parents and Family</p><h1>Community Guidelines</h1><p>This is an independent family community, not an official CIA channel. Members must be at least 18.</p><ol>
    <li>Be helpful. Do not harass, shame, discriminate, or target another family.</li>
    <li>Do not share student credentials, IDs, room numbers, live schedules, private records, or financial information.</li>
    <li>Ask permission before sharing another person&rsquo;s photo or personal information.</li>
    <li>Community experience is not medical, legal, financial, or official CIA advice.</li>
    <li>Report safety concerns, impersonation, harassment, scams, or harmful posts.</li>
    <li>Moderators may remove content or accounts that endanger privacy or community safety.</li>
  </ol></main>;
}

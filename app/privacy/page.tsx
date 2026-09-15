export default function PrivacyPage() {
  return (
    <main className="form-page">
      <a className="form-back" href="/">← Back to the guide</a>
      <section className="form-card privacy-page-card">
        <p className="eyebrow">Plain-language privacy</p>
        <h1>What we collect—and what we do not.</h1>
        <p>You do not need an account to read the FAQs. Sign up and verify your email to post, comment and interact with other parents and students.</p>
        <h2>Cookies belong in jars—hidden from the kids.</h2>
        <p>We do not use advertising cookies, analytics cookies, tracking pixels, or cross-site trackers. Signing in creates one essential, secure session cookie so the guide can recognize your account. It cannot be read by page scripts, and signing out removes it.</p>
        <h2>What we do not share or track</h2>
        <p>We do not sell personal information or share it for advertising, and we do not track which FAQs you read. We keep the account and submission information needed to operate the community. Our hosting and email providers process limited information to deliver and protect those services. Security controls temporarily use a one-way identifier to rate-limit attacks. Posts and photos you choose to share are visible to their intended audience.</p>
        <p><a href="/account">Manage your account, export your information or request account deletion</a>.</p>
        <div className="privacy-grid">
          <div><strong>Community submissions</strong><span>We collect the image, caption, submitter email, and consent name needed to review a voluntary wall submission.</span></div>
          <div><strong>No automatic GroupMe imports</strong><span>Chat images and names are not republished merely because they appeared in the exported conversation.</span></div>
          <div><strong>Owner review</strong><span>Every photo and resource remains pending until the site owner approves it.</span></div>
          <div><strong>Corrections and removal</strong><span>Families can report outdated information or request that an approved submission be removed.</span></div>
        </div>
        <p>This independent guide is not operated by or affiliated with The Culinary Institute of America. Official CIA sources and the student portal remain the authority for current policies, charges, dates, and student records.</p>
        <div className="privacy-actions"><a href="/corrections">Submit a correction or removal request</a><a href="/share">Share with the community walls</a></div>
      </section>
    </main>
  );
}

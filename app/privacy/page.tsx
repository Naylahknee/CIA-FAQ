export default function PrivacyPage() {
  return (
    <main className="form-page">
      <a className="form-back" href="/">← Back to the guide</a>
      <section className="form-card privacy-page-card">
        <p className="eyebrow">Plain-language privacy</p>
        <h1>What we collect—and what we do not.</h1>
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

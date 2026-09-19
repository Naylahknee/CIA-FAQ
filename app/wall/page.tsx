export const metadata = {
  title: "Celebration Wall | CIA FAQ",
  description: "Share and celebrate student achievements and culinary milestones.",
};

export default function CelebrationWallPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] w-full bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Student Celebration Wall
          </h1>
          <p className="text-sm text-slate-500">
            Pin photos, celebrate milestones, and drag polaroids to explore.
          </p>
        </div>

        <div className="w-full h-[78vh] min-h-[600px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
          <iframe
            src="/celebration-wall.html"
            title="Celebration Wall"
            className="w-full h-full border-0"
            loading="lazy"
          />
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { BedDouble, BusFront, CalendarDays, ExternalLink, Luggage, MapPinned, PackageCheck, TrainFront } from "lucide-react";
import { PageHeader } from "../components/page-header";
import { TravelMatrix } from "../components/travel-matrix";
import { familyResources } from "../guide-sections";

const resourceTitles = ["Where to Stay near the New York campus","Dutchess County public transit routes","MTA TrainTime","Transit app","CIA area guide","USPS Hold for Pickup","What to Bring"];
const iconFor = (title: string) => {
  if (title.includes("Stay")) return <BedDouble aria-hidden="true" />;
  if (title.includes("Dutchess")) return <BusFront aria-hidden="true" />;
  if (title.includes("Train")) return <TrainFront aria-hidden="true" />;
  if (title.includes("USPS")) return <PackageCheck aria-hidden="true" />;
  if (title.includes("Bring")) return <Luggage aria-hidden="true" />;
  return <MapPinned aria-hidden="true" />;
};

export default function TravelPage() {
  const resources = familyResources.flatMap((group) => group.links).filter((item) => resourceTitles.includes(item.title));
  return <main className="help-page travel-page">
    <div className="page-wrap">
      <PageHeader eyebrow="Travel & Visits" title="Plan your trip to CIA Hyde Park" description={<>Compare the practical ways to get to campus, estimate the trip cost, and keep the travel resources families use in one place.</>} />
      <section className="travel-page-intro">
        <div><MapPinned aria-hidden="true" /><span><strong>Start with the trip planner</strong><small>Open the map to enter your starting point, then compare driving, train and flight planning costs.</small></span></div>
        <a href="#trip-planner">Compare options</a>
      </section>
      <section id="trip-planner" className="travel-page-planner">
        <div className="travel-section-heading"><p className="eyebrow">Compare your options</p><h2>Getting to Hyde Park</h2><p>These regional times are rough planning comparisons, not live quotes. Use the planner for your route and current costs.</p></div>
        <TravelMatrix />
      </section>
      <section className="travel-page-resources">
        <div className="travel-section-heading"><p className="eyebrow">Travel resources</p><h2>Useful before you leave</h2></div>
        <div className="travel-resource-grid">
          {resources.map((item) => <a href={item.href} target="_blank" rel="noreferrer nofollow" key={item.href}><span>{iconFor(item.title)}</span><div><strong>{item.title}</strong><small>{item.description}</small></div><ExternalLink aria-hidden="true" /></a>)}
          <Link href="/calendar"><span><CalendarDays aria-hidden="true" /></span><div><strong>Check dates before booking</strong><small>Confirm breaks, deadlines, campus events and the student's actual schedule before purchasing travel.</small></div><span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </div>
  </main>;
}

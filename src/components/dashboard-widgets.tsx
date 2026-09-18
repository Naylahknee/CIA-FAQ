import { Link } from "@tanstack/react-router";
import { CalendarDays, FileText, HeartHandshake, Mail, Phone } from "lucide-react";
import { fullDates, resourceLibrary } from "@/data/guide-sections";
import { academicEventImage } from "@/lib/calendar-display";
import { Button } from "@/components/ui/button";

export function GuideRail() {
  return <aside className="context-rail">
    <section className="rail-panel"><div className="rail-title"><CalendarDays/><h2>Important dates</h2></div>{fullDates.slice(0, 4).map((date) => <div className="rail-row date-row" key={`${date.term}-${date.title}`}><img className="rail-thumb" src={academicEventImage(date.title)} alt="" width={40} height={40} loading="lazy"/><strong>{date.title}</strong><span>{date.month} {date.day}</span></div>)}<Link to="/calendar">View all dates →</Link></section>
    <section className="rail-panel support-callout"><div className="rail-title"><HeartHandshake/><h2>Need support?</h2></div><p>Start with the office that owns the problem. For immediate danger, call 911.</p><Button asChild><Link to="/safety">Safety &amp; support</Link></Button></section>
    <section className="rail-panel"><div className="rail-title"><FileText/><h2>Quick files</h2></div>{resourceLibrary.slice(0, 4).map((resource) => <a className="file-row" key={resource.title} href={resource.href} target="_blank" rel="noreferrer"><span>{resource.format}</span><div><strong>{resource.title}</strong><small>{resource.kind}</small></div></a>)}<Link to="/resources">Open library →</Link></section>
  </aside>;
}

export function ContactStrip() {
  return <section className="contact-strip"><div><Phone/><span><strong>Still need help?</strong><small>Use the current official contact for the issue.</small></span></div><Button asChild><Link to="/safety"><Mail/>Find the right contact</Link></Button></section>;
}
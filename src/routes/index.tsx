import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink, Gift, HeartPulse, MapPin, ShoppingBag, Utensils } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { facts, topics } from "@/data/guide";
import { HelpSearch } from "@/components/help-search";
import { GuideIcon } from "@/components/guide-icon";
import { fullDates, resourceLibrary } from "@/data/guide-sections";
import { academicEventAlt, academicEventDate, academicEventImage } from "@/lib/calendar-display";
import { listPublishedCalendarEvents } from "@/lib/calendar.functions";
import { listInstagramHighlights } from "@/lib/instagram-highlights.functions";
import { InstagramCarousel } from "@/components/instagram-carousel";
import { Button } from "@/components/ui/button";
import campusCoverAsset from "@/assets/cia-campus-cover.webp.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "CIA Hyde Park Family Guide & FAQ" },
    { name: "description", content: "Practical answers, official resources, important dates, and a private community for CIA Hyde Park families." },
    { property: "og:title", content: "CIA Hyde Park Family Guide & FAQ" },
    { property: "og:description", content: "Practical answers and support for CIA Hyde Park students and families." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  const [term,setTerm]=useState<"fall"|"spring">("fall");const [audience,setAudience]=useState<"parent"|"student">("parent");
  const [focusedEventIndex,setFocusedEventIndex]=useState(0);
  const highlights=useQuery({queryKey:["instagram-highlights"],queryFn:()=>listInstagramHighlights()});
  const publishedEvents=useQuery({queryKey:["published-calendar-events"],queryFn:()=>listPublishedCalendarEvents()});
  useEffect(()=>{const sync=()=>{const t=window.localStorage.getItem("guide-term");if(t==="fall"||t==="spring")setTerm(t);const a=window.localStorage.getItem("guide-audience");if(a==="parent"||a==="student")setAudience(a);};sync();window.addEventListener("guide-preference",sync);return()=>window.removeEventListener("guide-preference",sync);},[]);
  const selectedTerm=term==="fall"?"Fall 2026":"Spring 2027";
  const mostAsked=["meal","medical","calendar","groceries"].map(id=>facts.find(f=>f.id===id)).filter((fact):fact is (typeof facts)[number]=>Boolean(fact));
  const meal=facts.find(f=>f.id==="meal"); const medical=facts.find(f=>f.id==="medical"); const mealFile=resourceLibrary.find(r=>r.title==="Freshman Meal Plan");
  const openingQuestions=["meal","deposit","movein","textbooks"].map(id=>facts.find(f=>f.id===id)).filter((fact):fact is (typeof facts)[number]=>Boolean(fact));
  const upcomingEvents=useMemo(()=>{
    const cutoff=new Date(2026,8,18);
    const campus=(publishedEvents.data??[]).map(event=>({id:event.id,date:new Date(event.event_at),title:event.title,description:event.description,location:event.location,image:event.image_url??academicEventImage(event.title),alt:event.image_alt??academicEventAlt(event.title),sourceUrl:event.source_url,instagram:Boolean(event.source_url),kind:"Campus event"}));
    if(audience==="student")return campus.filter(event=>event.instagram&&event.date>=cutoff).sort((a,b)=>a.date.getTime()-b.date.getTime()).slice(0,6);
    const academic=fullDates.filter(item=>item.term===selectedTerm).map(item=>({id:`academic-${item.term}-${item.month}-${item.day}-${item.title}`,date:academicEventDate(item),title:item.title,description:item.note,location:null as string|null,image:academicEventImage(item.title),alt:academicEventAlt(item.title),sourceUrl:null as string|null,instagram:false,kind:item.term}));
    return [...academic,...campus].filter(event=>event.date>=cutoff).sort((a,b)=>a.date.getTime()-b.date.getTime()).slice(0,6);
  },[audience,publishedEvents.data,selectedTerm]);
  useEffect(()=>setFocusedEventIndex(0),[audience,selectedTerm,upcomingEvents.length]);
  const focusedEvent=upcomingEvents[focusedEventIndex];
  const moveEvent=(direction:number)=>setFocusedEventIndex(current=>(current+direction+upcomingEvents.length)%upcomingEvents.length);

  return (
    <AppShell><main className="guide-home">
      <section className="home-opening page-wrap"><div className="home-opening-copy"><p className="eyebrow">CIA Hyde Park Family Guide &amp; FAQ</p><h1>{audience==="student"?"Your CIA Hyde Park student guide.":"Your CIA Hyde Park survival guide."}</h1><p>{audience==="student"?"Official information, real questions from students, and the next useful step for your term on campus.":"Official information, real family questions, and what to do after move-in—without digging through six thousand chat messages."}</p><span>CIA Hyde Park · {selectedTerm}</span><HelpSearch title="" compact/><div className="opening-question-grid">{openingQuestions.map(fact=><Link key={fact.id} to="/faq/$topic" params={{topic:fact.category}}>{audience==="student"?fact.studentQ:fact.parentQ}</Link>)}</div></div><div className="home-opening-media"><img src={campusCoverAsset.url} alt="The Culinary Institute of America Hyde Park campus" width={720} height={980}/>{highlights.data?.length?<InstagramCarousel items={highlights.data}/>:null}</div></section>
      <section className="home-resource-wall"><div className="page-wrap"><div className="resource-wall-heading"><div><p className="eyebrow">{audience==="student"?"From Student Activities":"On the family calendar"}</p><h2>Upcoming events</h2></div><Link to="/calendar">Full calendar <ArrowRight/></Link></div>{focusedEvent?<div className="home-event-carousel"><article className="home-event-focus" aria-live="polite"><span className="calendar-event-term">{focusedEvent.kind}</span><h3>{focusedEvent.title}</h3><time dateTime={focusedEvent.date.toISOString()}>{focusedEvent.date.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</time>{focusedEvent.location&&<p className="home-event-location"><MapPin/>{focusedEvent.location}</p>}<p>{focusedEvent.description||"Add this date to your calendar and check the full calendar for the latest details."}</p><div className="home-event-focus-links">{focusedEvent.sourceUrl&&<a href={focusedEvent.sourceUrl} target="_blank" rel="noreferrer">View original post <ExternalLink/></a>}<Link to="/calendar">See calendar details <ArrowRight/></Link></div></article><div className="home-event-slides"><div className="home-event-slide"><img key={focusedEvent.id} src={focusedEvent.image} alt={focusedEvent.alt} loading="lazy" width={1200} height={800}/><div className="home-event-date-badge"><strong>{focusedEvent.date.toLocaleDateString("en-US",{month:"short"}).toUpperCase()}</strong><span>{focusedEvent.date.getDate()}</span></div></div><div className="home-event-carousel-controls"><span>{focusedEventIndex+1} / {upcomingEvents.length}</span><div><Button variant="outline" size="icon" onClick={()=>moveEvent(-1)} aria-label="Previous event"><ChevronLeft/></Button><Button variant="outline" size="icon" onClick={()=>moveEvent(1)} aria-label="Next event"><ChevronRight/></Button></div></div><div className="home-event-dots" aria-label="Choose an event">{upcomingEvents.map((event,index)=><Button key={event.id} variant="ghost" size="icon" className={index===focusedEventIndex?"active":""} onClick={()=>setFocusedEventIndex(index)} aria-label={`Show ${event.title}`} aria-current={index===focusedEventIndex?"true":undefined}><span>{index+1}</span></Button>)}</div></div></div>:<p className="resource-wall-note">{audience==="student"?"No student activities events have been published yet. Follow @ciaactivities on Instagram for the latest campus happenings.":"No upcoming dates to show right now."}</p>}{audience==="student"&&<p className="resource-wall-note"><a href="https://www.instagram.com/ciaactivities/" target="_blank" rel="noreferrer">Follow @ciaactivities <ExternalLink/></a></p>}</div></section>
      <section className="home-section page-wrap"><header><p className="eyebrow">Guide sections</p><h2>Browse by topic</h2></header><div className="editorial-topic-grid">{Object.entries(topics).map(([key,value])=><Link key={key} to="/faq/$topic" params={{topic:key}}><GuideIcon id={key}/><span><strong>{value.name}</strong><small>{value.description}</small></span><ArrowRight/></Link>)}</div></section>
      <section className="home-section home-tint"><div className="page-wrap"><header><p className="eyebrow">Most asked</p><h2>Questions families are asking now</h2></header><div className="most-asked-list">{mostAsked.map((fact)=><Link key={fact.id} to="/faq/$topic" params={{topic:fact.category}}><GuideIcon id={fact.id}/><strong>{audience==="student"?fact.studentQ:fact.parentQ}</strong><ArrowRight/></Link>)}</div></div></section>
      {term==="spring"&&meal&&<section className="feature-story page-wrap"><div><p className="eyebrow">Freshman meal plan</p><h2>Blue today. Gold for later.</h2><p>{audience==="student"?meal.studentA:meal.parentA}</p><strong>{audience==="student"?meal.stepStudent:meal.stepParent}</strong><div className="story-links"><Link to="/faq/$topic" params={{topic:"living"}}>Read meal-plan answers <ArrowRight/></Link>{mealFile&&<a href={mealFile.href} target="_blank" rel="noreferrer">Open the meal-plan guide <ExternalLink/></a>}</div></div><Utensils/></section>}
      {medical&&<section className="feature-story safety-story"><div className="page-wrap"><HeartPulse/><div><p className="eyebrow">Save this before it is needed</p><h2>Sick, injured, or out of medication?</h2><p>{audience==="student"?medical.studentA:medical.parentA}</p><Link to="/safety">Save contacts and local care <ArrowRight/></Link></div></div></section>}
      <section className="shopping-preview"><div className="page-wrap"><div><p className="eyebrow">{audience==="student"?"Shop near campus":"Shop for your student"}</p><h2>{audience==="student"?"Pick up what you still need for your room and kit.":"Send what they need—and something that says you care."}</h2><p>{audience==="student"?"Local stores for supplies, groceries, and uniform care, with pickup and delivery options near campus.":"Find practical items for pickup or delivery after your student confirms what the room needs, or send a CIA Celebration Gram for a birthday, milestone, or encouraging moment."}</p><div className="story-links"><Link to="/shopping">{audience==="student"?"Browse stores near campus":"Shop for your student"} <ShoppingBag/></Link><a href="https://ciachef.formstack.com/forms/celebration_gram" target="_blank" rel="noreferrer">Send a Celebration Gram <Gift/></a></div></div><ShoppingBag/></div></section>
    </main></AppShell>
  );
}

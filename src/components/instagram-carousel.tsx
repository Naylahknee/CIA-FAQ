import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

type Highlight = { id: string; post_url: string; caption: string | null; posted_at: string | null };

declare global { interface Window { instgrm?: { Embeds: { process: () => void } } } }

export function InstagramCarousel({ items, handle = "ciaactivities" }: { items: Highlight[]; handle?: string }) {
  const [index, setIndex] = useState(0);
  const frame = useRef<HTMLDivElement>(null);
  const current = items[index];

  useEffect(() => {
    if (!items.length) return;
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://www.instagram.com/embed.js"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
      return;
    }
    window.instgrm?.Embeds.process();
  }, [items.length]);

  useEffect(() => { const timer = window.setTimeout(() => window.instgrm?.Embeds.process(), 60); return () => window.clearTimeout(timer); }, [index, current?.post_url]);

  if (!items.length || !current) return null;

  return (
    <aside className="instagram-carousel" aria-label="Latest campus posts on Instagram">
      <header><Instagram size={16}/><div><p className="eyebrow">Latest on campus</p><strong>@{handle}</strong></div></header>
      <div className="carousel-frame" ref={frame}>
        <blockquote key={current.post_url} className="instagram-media" data-instgrm-permalink={`${current.post_url}/?utm_source=ig_embed`} data-instgrm-version="14">
          <a href={current.post_url} target="_blank" rel="noreferrer">View this post on Instagram</a>
        </blockquote>
      </div>
      {current.caption && <p className="carousel-caption">{current.caption}</p>}
      {items.length > 1 && <div className="carousel-controls">
        <Button variant="ghost" size="icon-sm" aria-label="Previous post" onClick={() => setIndex((index - 1 + items.length) % items.length)}><ChevronLeft/></Button>
        <div className="carousel-dots">{items.map((item, position) => <button key={item.id} type="button" aria-label={`Show post ${position + 1}`} aria-current={position === index} className={position === index ? "active" : ""} onClick={() => setIndex(position)}/>)}</div>
        <Button variant="ghost" size="icon-sm" aria-label="Next post" onClick={() => setIndex((index + 1) % items.length)}><ChevronRight/></Button>
      </div>}
      <a className="carousel-follow" href={`https://www.instagram.com/${handle}/`} target="_blank" rel="noreferrer">Follow @{handle} on Instagram <ExternalLink size={14}/></a>
    </aside>
  );
}

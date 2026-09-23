"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

/** Permanent closure notice for the homepage. It cannot be dismissed: there is
 *  no close control, Escape and Tab are swallowed, and everything else on the
 *  page is made inert and hidden from assistive technology while it is shown.
 *
 *  The server renders it inline so it covers the page from first paint; once
 *  hydrated it moves to a direct child of <body>, so the rest of the document
 *  (sidebar, headers, any later portals) can be made inert around it. */
/** Nothing to subscribe to: the only question is server or client. */
const subscribeNever = () => () => {};

export function SiteClosureLightbox() {
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!mounted || !overlay) return;
    const body = document.body;

    const restored = new Map<Element, { inert: boolean; ariaHidden: string | null }>();
    const hide = (element: Element) => {
      if (element === overlay || restored.has(element) || element.tagName === "SCRIPT") return;
      const target = element as HTMLElement;
      restored.set(element, { inert: target.inert, ariaHidden: target.getAttribute("aria-hidden") });
      target.inert = true;
      target.setAttribute("aria-hidden", "true");
    };
    Array.from(body.children).forEach(hide);
    const observer = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => {
      if (node instanceof Element) hide(node);
    })));
    observer.observe(body, { childList: true });

    const html = document.documentElement;
    const previousOverflow = { html: html.style.overflow, body: body.style.overflow };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    const keepFocus = (event: KeyboardEvent) => {
      if (event.key === "Tab" || event.key === "Escape") {
        event.preventDefault();
        dialogRef.current?.focus();
      }
    };
    document.addEventListener("keydown", keepFocus, true);
    dialogRef.current?.focus();

    return () => {
      observer.disconnect();
      document.removeEventListener("keydown", keepFocus, true);
      restored.forEach(({ inert, ariaHidden }, element) => {
        const target = element as HTMLElement;
        target.inert = inert;
        if (ariaHidden === null) target.removeAttribute("aria-hidden");
        else target.setAttribute("aria-hidden", ariaHidden);
      });
      html.style.overflow = previousOverflow.html;
      body.style.overflow = previousOverflow.body;
    };
  }, [mounted]);

  const lightbox = (
    <div ref={overlayRef} className="site-closure-lightbox">
      <div
        ref={dialogRef}
        className="site-closure-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-closure-title"
        aria-describedby="site-closure-message"
        tabIndex={-1}
      >
        <p className="site-closure-emoji" aria-hidden="true">🙂</p>
        <h2 id="site-closure-title">This site is no longer available.</h2>
        <p id="site-closure-message">Please check the GroupMe group or Facebook group for updates and community support.</p>
      </div>
    </div>
  );

  return mounted ? createPortal(lightbox, document.body) : lightbox;
}

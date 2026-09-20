"use client";

import { Car, ExternalLink, MapPinned, Plane, TrainFront, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { travelRegions } from "../guide-sections";

const CAMPUS_ADDRESS = "1946 Campus Drive, Hyde Park, NY 12538";

function parseOption(option: string) {
  const [modeRaw, durationRaw = ""] = option.split("·").map((value) => value.trim());
  const mode = modeRaw.toLowerCase();
  const Icon = mode.startsWith("drive") ? Car : mode.startsWith("train") ? TrainFront : Plane;
  return { label: modeRaw, duration: durationRaw, Icon };
}

function mapsUrl(origin: string, embed = false) {
  const base = embed ? "https://www.google.com/maps" : "https://www.google.com/maps/dir/";
  if (embed) {
    const params = new URLSearchParams({ output: "embed", daddr: CAMPUS_ADDRESS });
    if (origin.trim()) params.set("saddr", origin.trim());
    return `${base}?${params.toString()}`;
  }
  const params = new URLSearchParams({ api: "1", destination: CAMPUS_ADDRESS });
  if (origin.trim()) params.set("origin", origin.trim());
  return `${base}?${params.toString()}`;
}

/** Rough drive / train / fly comparisons for getting to Hyde Park.
 *
 * Used anywhere a family may be planning a campus trip. The visual intentionally
 * communicates relative effort rather than pretending these are live quotes.
 */
export function TravelMatrix() {
  const [mapOpen, setMapOpen] = useState(false);
  const [origin, setOrigin] = useState("");
  const [plannedOrigin, setPlannedOrigin] = useState("");

  const embedUrl = useMemo(() => mapsUrl(plannedOrigin, true), [plannedOrigin]);
  const externalUrl = useMemo(() => mapsUrl(plannedOrigin, false), [plannedOrigin]);

  function planTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPlannedOrigin(origin.trim());
  }

  return <>
    <div className="travel-visual" aria-label="Travel comparisons by region">
      {travelRegions.map((region) => (
        <article className="travel-route-card" key={region.title}>
          <div className="travel-route-head">
            <div>
              <h3>{region.title}</h3>
              <p>{region.summary}</p>
            </div>
            <MapPinned aria-hidden="true" />
          </div>

          <div className="travel-mode-list">
            {region.options.map((option) => {
              const { label, duration, Icon } = parseOption(option);
              return <div className="travel-mode" key={option}>
                <span className="travel-mode-icon"><Icon aria-hidden="true" /></span>
                <span className="travel-mode-label">{label}</span>
                <span className="travel-mode-line" aria-hidden="true" />
                <strong>{duration}</strong>
              </div>;
            })}
          </div>
        </article>
      ))}
    </div>

    <div className="travel-plan-cta">
      <div>
        <span className="travel-plan-icon"><MapPinned aria-hidden="true" /></span>
        <div>
          <strong>Plan your trip to Hyde Park</strong>
          <p>Enter your starting point and compare the route on a map.</p>
        </div>
      </div>
      <button type="button" className="travel-map-button" onClick={() => setMapOpen(true)}>
        Open trip planner
      </button>
    </div>

    {mapOpen && (
      <div className="travel-map-lightbox" role="dialog" aria-modal="true" aria-labelledby="travel-map-title" onMouseDown={(event) => {
        if (event.currentTarget === event.target) setMapOpen(false);
      }}>
        <div className="travel-map-dialog">
          <header>
            <div>
              <p className="eyebrow">Trip planner</p>
              <h2 id="travel-map-title">Plan your route to CIA Hyde Park</h2>
              <p>{CAMPUS_ADDRESS}</p>
            </div>
            <button type="button" className="travel-map-close" aria-label="Close trip planner" onClick={() => setMapOpen(false)}>
              <X aria-hidden="true" />
            </button>
          </header>

          <form className="travel-origin-form" onSubmit={planTrip}>
            <label htmlFor="travel-origin">Where are you starting from?</label>
            <div>
              <input
                id="travel-origin"
                value={origin}
                onChange={(event) => setOrigin(event.target.value)}
                placeholder="City, ZIP code, or address"
                autoComplete="street-address"
              />
              <button type="submit">Show route</button>
            </div>
          </form>

          <div className="travel-map-frame">
            <iframe
              key={embedUrl}
              title={plannedOrigin ? `Map route from ${plannedOrigin} to CIA Hyde Park` : "Map of CIA Hyde Park"}
              src={embedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <footer>
            <span>Map and live routing are provided by Google Maps.</span>
            <a href={externalUrl} target="_blank" rel="noreferrer">
              Open full directions <ExternalLink aria-hidden="true" />
            </a>
          </footer>
        </div>
      </div>
    )}
  </>;
}

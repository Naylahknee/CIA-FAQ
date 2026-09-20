"use client";

import { BedDouble, Car, ExternalLink, Fuel, MapPinned, Plane, Sandwich, TrainFront, X } from "lucide-react";
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
  const [tripMode, setTripMode] = useState<"drive" | "train" | "fly">("drive");
  const [travelers, setTravelers] = useState(2);
  const [miles, setMiles] = useState(300);
  const [mpg, setMpg] = useState(25);
  const [gasPrice, setGasPrice] = useState(3.5);
  const [driveDays, setDriveDays] = useState(1);
  const [lodgingNight, setLodgingNight] = useState(160);
  const [foodPersonDay, setFoodPersonDay] = useState(45);
  const [trainFare, setTrainFare] = useState(90);
  const [flightFare, setFlightFare] = useState(250);
  const [flightClass, setFlightClass] = useState<"Economy" | "Business" | "First">("Economy");

  const embedUrl = useMemo(() => mapsUrl(plannedOrigin, true), [plannedOrigin]);
  const externalUrl = useMemo(() => mapsUrl(plannedOrigin, false), [plannedOrigin]);
  const safeTravelers = Math.max(1, travelers || 1);
  const gasEstimate = Math.max(0, miles) / Math.max(1, mpg) * Math.max(0, gasPrice);
  const lodgingEstimate = Math.max(0, driveDays - 1) * Math.max(0, lodgingNight);
  const driveFoodEstimate = safeTravelers * Math.max(1, driveDays) * Math.max(0, foodPersonDay);
  const driveEstimate = gasEstimate + lodgingEstimate + driveFoodEstimate;
  const trainEstimate = safeTravelers * Math.max(0, trainFare);
  const flightEstimate = safeTravelers * Math.max(0, flightFare);

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

          <section className="travel-budget-planner" aria-label="Trip cost planner">
            <div className="travel-budget-head">
              <div>
                <h3>Estimate the trip</h3>
                <p>Use your own current prices for a planning estimate. These are not live fares or quotes.</p>
              </div>
              <div className="travel-mode-tabs" role="group" aria-label="Travel mode">
                <button type="button" className={tripMode === "drive" ? "active" : ""} onClick={() => setTripMode("drive")}><Car aria-hidden="true" /> Drive</button>
                <button type="button" className={tripMode === "train" ? "active" : ""} onClick={() => setTripMode("train")}><TrainFront aria-hidden="true" /> Train</button>
                <button type="button" className={tripMode === "fly" ? "active" : ""} onClick={() => setTripMode("fly")}><Plane aria-hidden="true" /> Fly</button>
              </div>
            </div>

            <label className="travel-budget-travelers">Travelers <input type="number" min="1" max="12" value={travelers} onChange={(e) => setTravelers(Number(e.target.value))} /></label>

            {tripMode === "drive" && <div className="travel-budget-grid">
              <label><Fuel aria-hidden="true" /> One-way miles<input type="number" min="0" value={miles} onChange={(e) => setMiles(Number(e.target.value))} /></label>
              <label><Car aria-hidden="true" /> Vehicle MPG<input type="number" min="1" value={mpg} onChange={(e) => setMpg(Number(e.target.value))} /></label>
              <label><Fuel aria-hidden="true" /> Gas $ / gallon<input type="number" min="0" step=".01" value={gasPrice} onChange={(e) => setGasPrice(Number(e.target.value))} /></label>
              <label><MapPinned aria-hidden="true" /> Travel days<input type="number" min="1" value={driveDays} onChange={(e) => setDriveDays(Number(e.target.value))} /></label>
              <label><BedDouble aria-hidden="true" /> Hotel $ / night<input type="number" min="0" value={lodgingNight} onChange={(e) => setLodgingNight(Number(e.target.value))} /></label>
              <label><Sandwich aria-hidden="true" /> Food $ / person / day<input type="number" min="0" value={foodPersonDay} onChange={(e) => setFoodPersonDay(Number(e.target.value))} /></label>
              <div className="travel-estimate-summary">
                <span><Fuel aria-hidden="true" /> Gas <strong>${gasEstimate.toFixed(0)}</strong></span>
                <span><BedDouble aria-hidden="true" /> Lodging <strong>${lodgingEstimate.toFixed(0)}</strong></span>
                <span><Sandwich aria-hidden="true" /> Food <strong>${driveFoodEstimate.toFixed(0)}</strong></span>
                <b>Estimated one-way trip <strong>${driveEstimate.toFixed(0)}</strong></b>
              </div>
            </div>}

            {tripMode === "train" && <div className="travel-fare-planner">
              <label>Estimated fare per traveler <span>$ <input type="number" min="0" value={trainFare} onChange={(e) => setTrainFare(Number(e.target.value))} /></span></label>
              <div className="travel-estimate-total"><TrainFront aria-hidden="true" /><span>Estimated train total<small>{safeTravelers} traveler{safeTravelers === 1 ? "" : "s"} × ${Math.max(0, trainFare).toFixed(0)}</small></span><strong>${trainEstimate.toFixed(0)}</strong></div>
              <p>Enter the current fare you find for your route; rail pricing changes by origin, date, train, and ticket type.</p>
            </div>}

            {tripMode === "fly" && <div className="travel-fare-planner">
              <div className="travel-class-tabs" role="group" aria-label="Flight class">
                {(["Economy", "Business", "First"] as const).map((c) => <button type="button" key={c} className={flightClass === c ? "active" : ""} onClick={() => setFlightClass(c)}>{c}</button>)}
              </div>
              <label>Estimated {flightClass.toLowerCase()} fare per traveler <span>$ <input type="number" min="0" value={flightFare} onChange={(e) => setFlightFare(Number(e.target.value))} /></span></label>
              <div className="travel-estimate-total"><Plane aria-hidden="true" /><span>Estimated {flightClass.toLowerCase()} total<small>{safeTravelers} traveler{safeTravelers === 1 ? "" : "s"} × ${Math.max(0, flightFare).toFixed(0)}</small></span><strong>${flightEstimate.toFixed(0)}</strong></div>
              <p>Enter a current fare for the class you are comparing. Airline prices vary substantially by airport, date, baggage, and booking conditions.</p>
            </div>}
          </section>

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

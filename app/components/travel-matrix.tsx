import { travelRegions } from "../guide-sections";

/** Rough drive / train / fly comparisons for getting to Hyde Park.
 *
 *  Lived inside the "Arrival & move-in" FAQ topic only, which is the wrong
 *  place for it: families need route comparisons all year -- Family Weekend,
 *  breaks, a mid-semester visit -- not just in the week they move in. Pulled
 *  out so the same table can appear wherever a trip is being planned.
 *
 *  No hooks and no state, so it renders in both server and client pages. */
export function TravelMatrix() {
  return <div className="travel-grid">
    {travelRegions.map((region) => <article key={region.title}>
      <h3>{region.title}</h3>
      <p>{region.summary}</p>
      {region.options.map((option) => <span key={option}>{option}</span>)}
    </article>)}
  </div>;
}

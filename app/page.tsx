import { GuideHome } from "./components/guide-home";
import { SiteClosureLightbox } from "./components/site-closure-lightbox";
import { SiteStructuredData } from "./components/structured-data";

export default function Home() {
  return <><SiteStructuredData /><GuideHome /><SiteClosureLightbox /></>;
}

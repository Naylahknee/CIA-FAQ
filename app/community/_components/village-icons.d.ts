/** Types for village-icons.js, which is kept byte-identical to the authored
 *  source. The `lucide` field is the icon's name in lucide-react, so each entry
 *  renders as a component with no visual change from the inline `svg` glyph. */
export type VillageIcon = {
  id: string;
  label: string;
  lucide: string;
  set: string;
  ink: string;
  bg: string;
  svg: string;
};
export const VILLAGE_ICONS: VillageIcon[];

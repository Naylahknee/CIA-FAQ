import { Cake, CakeSlice, ChefHat, Cherry, Coffee, Cookie, CookingPot, Croissant, CupSoda, Donut, EggFried, IceCreamCone, Martini, Pizza, Salad, Sandwich, Soup, Utensils, Wheat, Wine, type LucideIcon } from "lucide-react";

/** Rotating member icon for the community header.
 *
 *  Icons come from lucide (lucide.dev, ISC licensed), which is already a
 *  dependency and already draws every other icon on the site. They are React
 *  components rendering inline SVG, so nothing is fetched and no file can 404.
 *
 *  Grouped so the badge colour carries meaning rather than being random, and
 *  every pairing is drawn from the community palette in community-theme.css.
 *  Each pair is a dark stroke on a light tint, or the reverse, so the icon
 *  stays legible either way. */

export type IconGroup = {
  id: string;
  label: string;
  /** circle behind the icon */
  badge: string;
  /** icon stroke */
  stroke: string;
  icons: { name: string; Icon: LucideIcon }[];
};

export const ICON_GROUPS: IconGroup[] = [
  {
    id: "baking",
    label: "Baking and pastry",
    badge: "var(--c-orange-tint)",
    stroke: "var(--c-orange-ink)",
    icons: [
      { name: "croissant", Icon: Croissant },
      { name: "cake", Icon: Cake },
      { name: "cake-slice", Icon: CakeSlice },
      { name: "cookie", Icon: Cookie },
      { name: "donut", Icon: Donut },
      { name: "wheat", Icon: Wheat },
    ],
  },
  {
    id: "kitchen",
    label: "On the line",
    badge: "var(--c-green-tint)",
    stroke: "var(--c-green)",
    icons: [
      { name: "chef-hat", Icon: ChefHat },
      { name: "cooking-pot", Icon: CookingPot },
      { name: "utensils", Icon: Utensils },
      { name: "egg-fried", Icon: EggFried },
      { name: "soup", Icon: Soup },
      { name: "pizza", Icon: Pizza },
    ],
  },
  {
    id: "beverage",
    label: "Beverage",
    badge: "var(--c-green)",
    stroke: "var(--c-sand)",
    icons: [
      { name: "wine", Icon: Wine },
      { name: "martini", Icon: Martini },
      { name: "coffee", Icon: Coffee },
      { name: "cup-soda", Icon: CupSoda },
    ],
  },
  {
    id: "fresh",
    label: "Fresh",
    badge: "var(--c-sand)",
    stroke: "var(--c-orange-ink)",
    icons: [
      { name: "salad", Icon: Salad },
      { name: "cherry", Icon: Cherry },
      { name: "sandwich", Icon: Sandwich },
      { name: "ice-cream-cone", Icon: IceCreamCone },
    ],
  },
];

export type FoodIcon = { name: string; group: string };

const FLAT = ICON_GROUPS.flatMap((group) => group.icons.map((icon) => ({ name: icon.name, group: group.id })));

export function randomFoodIcon(): FoodIcon {
  return FLAT[Math.floor(Math.random() * FLAT.length)];
}

export function resolveFoodIcon(value: FoodIcon | null) {
  const group = ICON_GROUPS.find((g) => g.id === value?.group) ?? ICON_GROUPS[0];
  const entry = group.icons.find((i) => i.name === value?.name) ?? group.icons[0];
  return { Icon: entry.Icon, badge: group.badge, stroke: group.stroke, label: group.label };
}

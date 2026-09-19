"use client";

import * as lucide from "lucide-react";
import { VILLAGE_ICONS, type VillageIcon } from "./village-icons";

export type { VillageIcon };
export { VILLAGE_ICONS };

/** "cake-slice" -> "CakeSlice" */
function componentName(name: string) {
  return name.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
}

const REGISTRY = lucide as unknown as Record<string, lucide.LucideIcon | undefined>;

export function resolveVillageIcon(id: string | null): VillageIcon {
  return VILLAGE_ICONS.find((icon) => icon.id === id) ?? VILLAGE_ICONS[0];
}

export function randomVillageIcon(): VillageIcon {
  return VILLAGE_ICONS[Math.floor(Math.random() * VILLAGE_ICONS.length)];
}

/** The sets as authored: Everyday, Spring, Summer, Fall, Winter, Celebration. */
export function villageIconSets() {
  const sets = new Map<string, VillageIcon[]>();
  for (const icon of VILLAGE_ICONS) {
    const list = sets.get(icon.set) ?? [];
    list.push(icon);
    sets.set(icon.set, list);
  }
  return sets;
}

export function VillageIconMark({ icon, size = 22 }: { icon: VillageIcon; size?: number }) {
  const Icon = REGISTRY[componentName(icon.lucide)];
  if (!Icon) return null;
  return <Icon size={size} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" />;
}

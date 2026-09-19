import { BellRing, BookOpen, CalendarDays, CircleDollarSign, CookingPot, CreditCard, Gift, GraduationCap, HeartPulse, Hotel, House, Laptop, PackageOpen, ReceiptText, ShieldCheck, Shirt, ShoppingCart, Smartphone, Utensils, Wrench, type LucideIcon } from "lucide-react";

const factIcons: Record<string, LucideIcon> = {
  deposit: CreditCard, costs: ReceiptText, proxy: ShieldCheck, textbooks: BookOpen, kits: CookingPot,
  meal: Utensils, allergy: ShieldCheck, medical: HeartPulse, everbridge: Smartphone, movein: PackageOpen,
  roommate: House, calendar: CalendarDays, uniform: Shirt, groceries: ShoppingCart,
  "housing-help": Wrench, "it-help": Laptop, activities: BellRing, "family-weekend": Hotel, celebration: Gift,
};

const topicIcons: Record<string, LucideIcon> = {
  money: CircleDollarSign, arrival: PackageOpen, classes: GraduationCap, living: House, health: HeartPulse,
};

export function GuideIcon({ id, className }: { id: string; className?: string }) {
  const Icon = factIcons[id] ?? topicIcons[id] ?? BookOpen;
  return <Icon className={className} aria-hidden="true" />;
}

import classesImage from "@/assets/calendar/classes.jpg";
import careerFairImage from "@/assets/calendar/career-fair.jpg";
import departureImage from "@/assets/calendar/departure.jpg";
import gradesImage from "@/assets/calendar/grades.jpg";
import orientationImage from "@/assets/calendar/orientation.jpg";
import travelImage from "@/assets/calendar/recess-travel.jpg";
import communityDayImage from "@/assets/calendar/community-day.jpg";
import tuitionRefundImage from "@/assets/calendar/tuition-refund.jpg";
import healthInsuranceImage from "@/assets/calendar/health-insurance.jpg";
import restaurantsImage from "@/assets/calendar/restaurants.jpg";
import commencementImage from "@/assets/calendar/commencement.jpg";
import { fullDates } from "@/data/guide-sections";

const monthNumbers: Record<string, number> = { SEP: 8, OCT: 9, NOV: 10, DEC: 11, JAN: 0, FEB: 1, APR: 3 };

export function academicEventDate(event: (typeof fullDates)[number]) {
  const year = event.term === "Fall 2026" ? 2026 : 2027;
  return new Date(year, monthNumbers[event.month] ?? 0, Number.parseInt(event.day, 10));
}

export function academicEventImage(title: string) {
  const value = title.toLowerCase();
  if (value.includes("career fair")) return careerFairImage;
  if (value.includes("thanksgiving") || value.includes("winter break") || value.includes("recess") || value.includes("resume")) return travelImage;
  if (value.includes("tuition") || value.includes("refund") || value.includes("add/drop")) return tuitionRefundImage;
  if (value.includes("health insurance")) return healthInsuranceImage;
  if (value.includes("community day") || value === "no classes" || value.includes("intersession")) return communityDayImage;
  if (value.includes("restaurant")) return restaurantsImage;
  if (value.includes("commencement")) return commencementImage;
  if (value.includes("departure") || value.includes("semester ends")) return departureImage;
  if (value.includes("grade")) return gradesImage;
  if (value.includes("orientation") || value.includes("welcome") || value.includes("return") || value.includes("semester begins")) return orientationImage;
  return classesImage;
}

export function academicEventAlt(title: string) {
  const value = title.toLowerCase();
  if (value.includes("career fair")) return "Career fair tables prepared for employers and students";
  if (value.includes("thanksgiving") || value.includes("winter break") || value.includes("recess") || value.includes("resume")) return "Travel bag and chef jacket ready for an academic break";
  if (value.includes("tuition") || value.includes("refund") || value.includes("add/drop")) return "Parent and student reviewing college account information together";
  if (value.includes("health insurance")) return "Culinary student reviewing health coverage information";
  if (value.includes("community day") || value === "no classes" || value.includes("intersession")) return "Culinary students gathering for a campus community day";
  if (value.includes("restaurant")) return "CIA teaching restaurant dining room and open kitchen";
  if (value.includes("commencement")) return "Graduating culinary students celebrating with their families";
  if (value.includes("departure") || value.includes("semester ends")) return "Residence hall room packed for campus departure";
  if (value.includes("grade")) return "Student desk prepared for reviewing semester grades";
  if (value.includes("orientation") || value.includes("welcome") || value.includes("return") || value.includes("semester begins")) return "Campus welcome table prepared for student arrival";
  return "Professional teaching kitchen prepared for classes";
}
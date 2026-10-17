import { PageHeader } from "../components/page-header";
import { careDirectory, contacts } from "../guide-sections";

export const metadata = {
  title: "Important contacts",
  description:
    "The phone numbers every CIA Hyde Park family should save: campus safety, student services, crisis lines, and nearby care. Tap any number to call.",
};

const tel = (phone: string) => `tel:${phone.replace(/\D/g, "")}`;

/** Campus offices beyond the shared contacts list, each already published
 *  elsewhere on this site with its label. Nothing here is invented. */
const extraOffices = [
  {
    title: "Student Financial Services",
    label: "Tuition bills and payments",
    phone: "845-905-4518",
    note: "Confirm current pricing before choosing a meal plan tier.",
  },
  {
    title: "Counseling",
    label: "Student Commons, Room 218",
    phone: "845-905-4241",
    note: "Monday to Friday, 9 a.m. to 5 p.m.",
  },
  {
    title: "CIA Restaurant Group reservations",
    label: "American Bounty · Bocuse · Caterina de' Medici",
    phone: "845-905-4533",
    note: "Separate reservation, separate cost.",
  },
] as const;

const crisisLines = [
  { name: "988 Suicide & Crisis Lifeline", detail: "Call or text 988", href: "tel:988" },
  { name: "Dutchess County Helpline", detail: "Call or text 845-485-9700", href: tel("845-485-9700") },
  { name: "Crisis Text Line", detail: "Text HOME to 741741", href: "sms:741741?body=HOME" },
  { name: "Trans Lifeline", detail: "1-877-565-8860", href: tel("1-877-565-8860") },
  { name: "National Sexual Assault Hotline", detail: "1-800-656-4673", href: tel("1-800-656-4673") },
  {
    name: "MidHudson Regional Hospital Emergency Psychiatric Care",
    detail: "845-433-5000",
    href: tel("845-433-5000"),
  },
] as const;

export default function ContactsPage() {
  return (
    <main className="contacts-page page-wrap page-main">
      <PageHeader
        eyebrow="Keep handy"
        title="Important contacts"
        description="Save these before you need them. Tap any number to call."
      />
      <aside className="warning-panel" aria-label="Emergency numbers">
        <div>
          <strong>In an emergency, call 911 first.</strong>
          <p>
            Then call CIA Campus Safety at <a href={tel("845-451-1268")}>845-451-1268</a> (24-hour
            presence; extension 1111 from a campus phone).
          </p>
        </div>
      </aside>
      <section className="detail-panel" aria-labelledby="contacts-campus">
        <p className="eyebrow">Campus offices</p>
        <h2 id="contacts-campus">Who to call at CIA</h2>
        <div className="care-grid">
          {[...contacts, ...extraOffices].map((office) => (
            <article key={office.title}>
              <h3>{office.title}</h3>
              <div className="care-row">
                <div>
                  <strong>{office.label}</strong>
                  {"note" in office && office.note ? <span>{office.note}</span> : null}
                  {"description" in office && office.description ? <span>{office.description}</span> : null}
                </div>
                <a href={tel(office.phone)}>{office.phone}</a>
              </div>
              {"email" in office && office.email ? (
                <div className="care-row">
                  <div>
                    <strong>Email</strong>
                  </div>
                  <a href={`mailto:${office.email}`}>{office.email}</a>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
      <section className="detail-panel" aria-labelledby="contacts-crisis">
        <p className="eyebrow">Crisis support</p>
        <h2 id="contacts-crisis">Someone to talk to, any time</h2>
        <div className="care-grid">
          <article>
            <h3>Call or text lines</h3>
            {crisisLines.map((line) => (
              <div className="care-row" key={line.name}>
                <div>
                  <strong>{line.name}</strong>
                </div>
                <a href={line.href}>{line.detail}</a>
              </div>
            ))}
          </article>
        </div>
      </section>
      <section className="detail-panel" aria-labelledby="contacts-local">
        <p className="eyebrow">Nearby care</p>
        <h2 id="contacts-local">Pharmacies, urgent care, and hospitals</h2>
        <div className="care-grid">
          {careDirectory.map((group) => (
            <article key={group.kind}>
              <h3>{group.kind}</h3>
              {group.items.map(([name, address, phone]) => (
                <div className="care-row" key={name + address}>
                  <div>
                    <strong>{name}</strong>
                    <span>{address}</span>
                  </div>
                  <a href={tel(phone)}>{phone}</a>
                </div>
              ))}
            </article>
          ))}
        </div>
      </section>
      <aside className="warning-panel" aria-label="Verify numbers">
        <div>
          <strong>Numbers can change.</strong>
          <p>
            If a number does not work, check the official CIA website or the student portal for the
            current one, and send a correction through the Corrections page so this list stays fresh.
          </p>
        </div>
      </aside>
    </main>
  );
}

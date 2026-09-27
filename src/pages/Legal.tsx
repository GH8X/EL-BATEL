import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Reveal } from "@/components/site/motion";

const DOCS: Record<
  string,
  { title: string; sections: { heading: string; body: string }[] }
> = {
  privacy: {
    title: "PRIVACY POLICY",
    sections: [
      {
        heading: "WHAT WE STORE",
        body: "We store the details you give at checkout — name, email, phone, shipping address — together with the pieces and serial numbers on your order. Passwords are stored only as salted scrypt hashes; we never keep them in readable form.",
      },
      {
        heading: "WHY WE STORE IT",
        body: "To fulfil your order, register your serial number to you, provide support after the fact, and let you see your own order history. Nothing is sold to third parties.",
      },
      {
        heading: "SERIAL RECORDS",
        body: "A serial number is permanently linked to the order it left the studio with. If you ask us to delete your account, the serial record stays attached to the archive in anonymised form so an edition's history stays intact.",
      },
      {
        heading: "YOUR CHOICES",
        body: "Write to the studio email to access, correct or remove your personal data, or to close your account.",
      },
    ],
  },
  terms: {
    title: "TERMS & CONDITIONS",
    sections: [
      {
        heading: "LIMITED EDITIONS",
        body: "Numbered pieces are released in fixed quantities. Once an edition closes it is not restocked. Serial numbers are allocated in order of purchase or selected by the customer when available, and each serial belongs to one order only.",
      },
      {
        heading: "ORDERS",
        body: "An order is registered immediately and held with payment status pending until the studio confirms payment. Serial numbers reserved to a cancelled order return to the edition automatically.",
      },
      {
        heading: "PROMISES ON THE NUMBER",
        body: "Every piece is photographed and described as accurately as possible. Colour may differ marginally between screens and fabric. The serial printed on the piece is the serial recorded on your order.",
      },
      {
        heading: "PRICING",
        body: "Prices are shown in the store currency and may change for future editions. The price you paid at checkout is the price recorded on your order.",
      },
    ],
  },
  shipping: {
    title: "SHIPPING & RETURNS",
    sections: [
      {
        heading: "DISPATCH",
        body: "Orders leave the studio within 3–5 working days, tracked. Numbered pieces ship sealed with their edition card so the serial arrives intact.",
      },
      {
        heading: "RATES",
        body: "A flat shipping rate applies to every destination, and shipping is free above the threshold shown in the cart. The exact cost is always displayed before the order is placed.",
      },
      {
        heading: "RETURNS",
        body: "Unworn pieces can be returned within 14 days of delivery. Once returned, the serial number is released back to the edition and can be claimed again — the piece itself is never re-cut.",
      },
      {
        heading: "DUTIES",
        body: "Orders outside the studio's country may attract import duties set by your own customs authority; these are not included in the order total.",
      },
    ],
  },
};

export default function Legal() {
  const { doc } = useParams<{ doc: string }>();
  const settings = useQuery(api.catalog.getSettings, {});
  const entry = DOCS[doc ?? "privacy"] ?? DOCS.privacy;

  return (
    <div className="pt-[68px]">
      <header className="border-b border-white/10 bg-black">
        <div className="container py-14 sm:py-20">
          <Reveal>
            <span className="eyebrow">EL BATEL · POLICY</span>
            <h1 className="mt-5 font-display text-[44px] leading-[0.86] tracking-tight text-white sm:text-[86px]">
              {entry.title}
            </h1>
          </Reveal>
        </div>
      </header>

      <section className="py-14 sm:py-20">
        <div className="container grid gap-12 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-10">
            {entry.sections.map((section, index) => (
              <Reveal key={section.heading} delay={index * 0.05}>
                <h2 className="font-display text-[22px] uppercase tracking-wide text-white sm:text-[26px]">
                  {section.heading}
                </h2>
                <p className="mt-4 max-w-2xl text-[14px] leading-[1.85] text-white/55">
                  {section.body}
                </p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.15}>
            <div className="border border-white/12 p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
                STUDIO NOTES
              </p>
              <p className="mt-4 text-[13px] leading-relaxed text-white/50">
                {settings?.settings?.shippingInfo ?? "Shipped worldwide from the studio."}
              </p>
              {settings?.settings?.contactEmail ? (
                <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                  {settings.settings.contactEmail}
                </p>
              ) : null}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

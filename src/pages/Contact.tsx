import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Mail, MessageCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Reveal } from "@/components/site/motion";
import { platformIcon } from "@/components/site/PlatformIcons";

export default function Contact() {
  const data = useQuery(api.catalog.getSettings, {});
  const send = useMutation(api.adminContent.sendMessage);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const settings = data?.settings;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await send({
        name: form.name,
        email: form.email,
        subject: form.subject || undefined,
        message: form.message,
      });
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast.success("Message sent to the studio");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send your message");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pt-[68px]">
      <header className="border-b border-white/10 bg-black">
        <div className="container py-16 sm:py-24">
          <Reveal>
            <span className="eyebrow">CONTACT</span>
            <h1 className="mt-5 font-display text-[58px] leading-[0.84] tracking-mega text-white sm:text-[132px]">
              THE STUDIO
            </h1>
            <p className="mt-7 max-w-xl text-[14px] leading-relaxed text-white/50">
              Questions about sizing, serials, an order in transit or a wholesale enquiry — this
              reaches the studio directly.
            </p>
          </Reveal>
        </div>
      </header>

      <section className="py-14 sm:py-20">
        <div className="container grid gap-14 lg:grid-cols-[1fr_0.85fr]">
          <Reveal>
            <form onSubmit={submit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">NAME</Label>
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">EMAIL</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    placeholder="you@email.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="subject">SUBJECT</Label>
                <Input
                  id="subject"
                  value={form.subject}
                  onChange={(event) => setForm({ ...form, subject: event.target.value })}
                  placeholder="Order, sizing, press…"
                />
              </div>
              <div>
                <Label htmlFor="message">MESSAGE</Label>
                <Textarea
                  id="message"
                  required
                  rows={7}
                  value={form.message}
                  onChange={(event) => setForm({ ...form, message: event.target.value })}
                  placeholder="Tell us what you need."
                />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Button type="submit" size="lg" disabled={busy}>
                  {busy ? "SENDING…" : "SEND MESSAGE"}
                </Button>
                {sent ? (
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-batel">
                    RECEIVED — THE STUDIO WILL REPLY BY EMAIL
                  </span>
                ) : null}
              </div>
            </form>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="space-y-px">
              <ContactRow
                icon={<Mail className="h-4 w-4" />}
                label="EMAIL"
                value={settings?.contactEmail ?? "studio@elbatel.com"}
                href={settings?.contactEmail ? `mailto:${settings.contactEmail}` : undefined}
              />
              {settings?.whatsapp ? (
                <ContactRow
                  icon={<MessageCircle className="h-4 w-4" />}
                  label="WHATSAPP"
                  value={settings.whatsapp}
                  href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`}
                />
              ) : null}
              <ContactRow
                icon={<Package className="h-4 w-4" />}
                label="SHIPPING"
                value={settings?.shippingInfo ?? "Shipped worldwide from the studio."}
              />
            </div>

            <div className="mt-10">
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/35">
                FOLLOW
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {(data?.socials ?? []).map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-11 w-11 items-center justify-center border border-white/12 text-white/60 transition-all duration-300 hover:border-red-batel hover:text-white"
                    aria-label={social.label}
                  >
                    {platformIcon(social.platform, { className: "h-4 w-4" })}
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="text-white/40 transition-colors group-hover:text-red-batel">{icon}</span>
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/35">{label}</p>
        <p className="mt-2 text-[13px] leading-relaxed text-white/70">{value}</p>
      </div>
    </>
  );

  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-start gap-4 border border-white/[0.08] p-5 transition-colors hover:border-white/25"
    >
      {content}
    </a>
  ) : (
    <div className="group flex items-start gap-4 border border-white/[0.08] p-5">{content}</div>
  );
}

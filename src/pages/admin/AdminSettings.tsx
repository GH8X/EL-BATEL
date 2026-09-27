import { useEffect, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/primitives";
import { useAuth } from "@/providers/AuthProvider";
import { AdminHeader, Field, Panel } from "./ui";

export default function AdminSettings() {
  const { token } = useAuth();
  const content = useQuery(api.adminContent.adminContent, token ? { token } : "skip");
  const updateSettings = useMutation(api.adminContent.updateSettings);
  const changePassword = useAction(api.authActions.changePassword);

  const [form, setForm] = useState({
    logoText: "",
    logoImage: "",
    faviconUrl: "",
    contactEmail: "",
    whatsapp: "",
    shippingInfo: "",
    shippingFlatRate: "12",
    freeShippingThreshold: "250",
    currency: "EUR",
    footerText: "",
    announcement: "",
    announcementActive: false,
  });
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const settings = content?.settings;
    if (!settings || loaded) return;
    setForm({
      logoText: settings.logoText,
      logoImage: settings.logoImage ?? "",
      faviconUrl: settings.faviconUrl ?? "",
      contactEmail: settings.contactEmail,
      whatsapp: settings.whatsapp ?? "",
      shippingInfo: settings.shippingInfo,
      shippingFlatRate: String(settings.shippingFlatRate / 100),
      freeShippingThreshold: String(settings.freeShippingThreshold / 100),
      currency: settings.currency,
      footerText: settings.footerText,
      announcement: settings.announcement ?? "",
      announcementActive: settings.announcementActive,
    });
    setLoaded(true);
  }, [content, loaded]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setBusy(true);
    try {
      await updateSettings({
        token,
        logoText: form.logoText,
        logoImage: form.logoImage || null,
        faviconUrl: form.faviconUrl || null,
        contactEmail: form.contactEmail,
        whatsapp: form.whatsapp || null,
        shippingInfo: form.shippingInfo,
        shippingFlatRate: Math.round(Number(form.shippingFlatRate || 0) * 100),
        freeShippingThreshold: Math.round(Number(form.freeShippingThreshold || 0) * 100),
        currency: form.currency,
        footerText: form.footerText,
        announcement: form.announcement || null,
        announcementActive: form.announcementActive,
      });
      toast.success("Site settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the settings");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-7">
      <AdminHeader eyebrow="CONFIGURATION" title="SITE SETTINGS" />

      <form onSubmit={save} className="space-y-6">
        <Panel title="BRAND">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="LOGO TEXT">
              <Input
                value={form.logoText}
                onChange={(event) => setForm({ ...form, logoText: event.target.value })}
              />
            </Field>
            <Field label="LOGO IMAGE URL" hint="Optional — replaces the wordmark.">
              <Input
                value={form.logoImage}
                onChange={(event) => setForm({ ...form, logoImage: event.target.value })}
              />
            </Field>
            <Field label="FAVICON URL">
              <Input
                value={form.faviconUrl}
                onChange={(event) => setForm({ ...form, faviconUrl: event.target.value })}
              />
            </Field>
          </div>
        </Panel>

        <Panel title="CONTACT">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="CONTACT EMAIL">
              <Input
                type="email"
                value={form.contactEmail}
                onChange={(event) => setForm({ ...form, contactEmail: event.target.value })}
              />
            </Field>
            <Field label="WHATSAPP" hint="Digits, including country code.">
              <Input
                value={form.whatsapp}
                onChange={(event) => setForm({ ...form, whatsapp: event.target.value })}
                placeholder="+213 555 000 000"
              />
            </Field>
            <Field label="FOOTER TEXT" className="sm:col-span-2">
              <Textarea
                rows={3}
                value={form.footerText}
                onChange={(event) => setForm({ ...form, footerText: event.target.value })}
              />
            </Field>
          </div>
        </Panel>

        <Panel
          title="SHIPPING & CURRENCY"
          description="Used by the cart, the product page and the checkout totals."
        >
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="FLAT SHIPPING RATE" hint="In currency units, e.g. 12">
              <Input
                type="number"
                step="0.01"
                value={form.shippingFlatRate}
                onChange={(event) => setForm({ ...form, shippingFlatRate: event.target.value })}
              />
            </Field>
            <Field label="FREE SHIPPING OVER">
              <Input
                type="number"
                step="0.01"
                value={form.freeShippingThreshold}
                onChange={(event) => setForm({ ...form, freeShippingThreshold: event.target.value })}
              />
            </Field>
            <Field label="CURRENCY CODE">
              <Input
                value={form.currency}
                onChange={(event) => setForm({ ...form, currency: event.target.value })}
                placeholder="EUR"
              />
            </Field>
            <Field label="SHIPPING INFORMATION" className="sm:col-span-3">
              <Textarea
                rows={3}
                value={form.shippingInfo}
                onChange={(event) => setForm({ ...form, shippingInfo: event.target.value })}
              />
            </Field>
          </div>
        </Panel>

        <Panel title="ANNOUNCEMENT BAR">
          <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
            <Field label="MESSAGE">
              <Input
                value={form.announcement}
                onChange={(event) => setForm({ ...form, announcement: event.target.value })}
                placeholder="DROP 002 — 80 PIECES · REGISTER FOR EARLY ACCESS"
              />
            </Field>
            <div className="flex items-end">
              <div className="flex w-full items-center justify-between border border-white/10 p-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white">
                  SHOW BAR
                </span>
                <Switch
                  checked={form.announcementActive}
                  onCheckedChange={(value) => setForm({ ...form, announcementActive: value })}
                />
              </div>
            </div>
          </div>
        </Panel>

        <div className="sticky bottom-4 flex items-center gap-3 border border-white/12 bg-black/95 p-4 backdrop-blur">
          <Button type="submit" disabled={busy}>
            {busy ? "SAVING…" : "SAVE SETTINGS"}
          </Button>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
            APPLIES TO THE STOREFRONT IMMEDIATELY
          </p>
        </div>
      </form>

      <PasswordPanel />
    </div>
  );
}

function PasswordPanel() {
  const { token } = useAuth();
  const changePassword = useAction(api.authActions.changePassword);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setBusy(true);
    try {
      await changePassword({ token, currentPassword: current, newPassword: next });
      toast.success("Admin password updated");
      setCurrent("");
      setNext("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not change the password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel
      title="ADMIN PASSWORD"
      description="The seeded studio password should be replaced before the site goes live."
    >
      <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
        <Field label="CURRENT PASSWORD">
          <Input
            type="password"
            required
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
          />
        </Field>
        <Field label="NEW PASSWORD" hint="At least 8 characters.">
          <Input
            type="password"
            required
            minLength={8}
            value={next}
            onChange={(event) => setNext(event.target.value)}
          />
        </Field>
        <div className="sm:col-span-2">
          <Button type="submit" variant="outline" disabled={busy}>
            {busy ? "UPDATING…" : "UPDATE PASSWORD"}
          </Button>
        </div>
      </form>
    </Panel>
  );
}

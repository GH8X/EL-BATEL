import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useAuth } from "@/providers/AuthProvider";
import { AdminHeader, Field, Panel } from "./ui";
import { cn } from "@/lib/utils";

export default function AdminHomepage() {
  const { token } = useAuth();
  const content = useQuery(api.adminContent.adminContent, token ? { token } : "skip");
  const products = useQuery(api.adminCatalog.adminListProducts, token ? { token } : "skip");
  const updateHomepage = useMutation(api.adminContent.updateHomepage);

  const [form, setForm] = useState({
    eyebrow: "",
    heroTitle: "",
    heroSubtitle: "",
    ctaPrimaryLabel: "",
    ctaPrimaryHref: "",
    ctaSecondaryLabel: "",
    ctaSecondaryHref: "",
    heroImage: "",
    heroVideoUrl: "",
    brandStatement: "",
    brandSubstatement: "",
  });
  const [featured, setFeatured] = useState<Id<"products">[]>([]);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const home = content?.home;
    if (!home || loaded) return;
    setForm({
      eyebrow: home.eyebrow,
      heroTitle: home.heroTitle,
      heroSubtitle: home.heroSubtitle,
      ctaPrimaryLabel: home.ctaPrimaryLabel,
      ctaPrimaryHref: home.ctaPrimaryHref,
      ctaSecondaryLabel: home.ctaSecondaryLabel,
      ctaSecondaryHref: home.ctaSecondaryHref,
      heroImage: home.heroImage ?? "",
      heroVideoUrl: home.heroVideoUrl ?? "",
      brandStatement: home.brandStatement,
      brandSubstatement: home.brandSubstatement,
    });
    setFeatured(home.featuredProductIds);
    setLoaded(true);
  }, [content, loaded]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setBusy(true);
    try {
      await updateHomepage({
        token,
        eyebrow: form.eyebrow,
        heroTitle: form.heroTitle,
        heroSubtitle: form.heroSubtitle,
        ctaPrimaryLabel: form.ctaPrimaryLabel,
        ctaPrimaryHref: form.ctaPrimaryHref,
        ctaSecondaryLabel: form.ctaSecondaryLabel,
        ctaSecondaryHref: form.ctaSecondaryHref,
        heroImage: form.heroImage || null,
        heroVideoUrl: form.heroVideoUrl || null,
        brandStatement: form.brandStatement,
        brandSubstatement: form.brandSubstatement,
        featuredProductIds: featured,
      });
      toast.success("Homepage updated — the storefront reflects it instantly");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the homepage");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-7">
      <AdminHeader eyebrow="CONTENT" title="HOMEPAGE" />

      <form onSubmit={save} className="space-y-6">
        <Panel title="HERO">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="EYEBROW LABEL">
              <Input
                value={form.eyebrow}
                onChange={(event) => setForm({ ...form, eyebrow: event.target.value })}
                placeholder="NUMBERED PIECES · LIMITED RUNS"
              />
            </Field>
            <Field label="HERO TITLE" hint="Second line of the giant headline.">
              <Input
                value={form.heroTitle}
                onChange={(event) => setForm({ ...form, heroTitle: event.target.value })}
                placeholder="WEAR THE CULTURE."
              />
            </Field>
            <Field label="HERO SUBTITLE" className="sm:col-span-2">
              <Textarea
                rows={3}
                value={form.heroSubtitle}
                onChange={(event) => setForm({ ...form, heroSubtitle: event.target.value })}
              />
            </Field>
            <Field label="PRIMARY CTA LABEL">
              <Input
                value={form.ctaPrimaryLabel}
                onChange={(event) => setForm({ ...form, ctaPrimaryLabel: event.target.value })}
              />
            </Field>
            <Field label="PRIMARY CTA LINK">
              <Input
                value={form.ctaPrimaryHref}
                onChange={(event) => setForm({ ...form, ctaPrimaryHref: event.target.value })}
                placeholder="/shop"
              />
            </Field>
            <Field label="SECONDARY CTA LABEL">
              <Input
                value={form.ctaSecondaryLabel}
                onChange={(event) => setForm({ ...form, ctaSecondaryLabel: event.target.value })}
              />
            </Field>
            <Field label="SECONDARY CTA LINK">
              <Input
                value={form.ctaSecondaryHref}
                onChange={(event) => setForm({ ...form, ctaSecondaryHref: event.target.value })}
                placeholder="/collections"
              />
            </Field>
            <Field label="HERO IMAGE" hint="URL or art: preset. Layered behind the 3D scene.">
              <Input
                value={form.heroImage}
                onChange={(event) => setForm({ ...form, heroImage: event.target.value })}
                placeholder="https://… or art:hoodie:black:front"
              />
            </Field>
            <Field label="HERO VIDEO URL" hint="Optional. Reserved for a cinematic loop.">
              <Input
                value={form.heroVideoUrl}
                onChange={(event) => setForm({ ...form, heroVideoUrl: event.target.value })}
              />
            </Field>
          </div>
        </Panel>

        <Panel title="BRAND STATEMENT">
          <div className="grid gap-5">
            <Field label="STATEMENT" hint="Line breaks are respected in the editorial display.">
              <Textarea
                rows={3}
                value={form.brandStatement}
                onChange={(event) => setForm({ ...form, brandStatement: event.target.value })}
                placeholder={"NOT JUST CLOTHES.\nA PIECE OF THE CULTURE."}
              />
            </Field>
            <Field label="SUPPORTING COPY">
              <Textarea
                rows={3}
                value={form.brandSubstatement}
                onChange={(event) => setForm({ ...form, brandSubstatement: event.target.value })}
              />
            </Field>
          </div>
        </Panel>

        <Panel
          title="FEATURED PIECES"
          description="These pieces appear in the homepage archive grid, in this order."
        >
          <div className="grid gap-2.5 sm:grid-cols-2">
            {(products ?? []).map((product) => {
              const selected = featured.includes(product.id);
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() =>
                    setFeatured((current) =>
                      selected
                        ? current.filter((id) => id !== product.id)
                        : [...current, product.id],
                    )
                  }
                  className={cn(
                    "flex items-center justify-between gap-3 border px-4 py-3 text-left transition-colors",
                    selected ? "border-red-batel bg-red-batel/[0.06]" : "border-white/10 hover:border-white/30",
                  )}
                >
                  <span>
                    <span className="block font-display text-[14px] uppercase tracking-wide text-white">
                      {product.name}
                    </span>
                    <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">
                      {product.category} · {product.limited ? "LIMITED" : "OPEN RUN"}
                    </span>
                  </span>
                  {selected ? <Check className="h-4 w-4 text-red-batel" /> : null}
                </button>
              );
            })}
          </div>
          <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
            {featured.length} PIECES SELECTED
          </p>
        </Panel>

        <div className="sticky bottom-4 flex items-center gap-3 border border-white/12 bg-black/95 p-4 backdrop-blur">
          <Button type="submit" disabled={busy}>
            {busy ? "SAVING…" : "SAVE HOMEPAGE"}
          </Button>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
            CHANGES GO LIVE ON THE STOREFRONT IMMEDIATELY
          </p>
        </div>
      </form>
    </div>
  );
}

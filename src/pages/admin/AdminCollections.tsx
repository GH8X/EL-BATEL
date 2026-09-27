import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/primitives";
import { ProductImage } from "@/components/art/ProductImage";
import { useAuth } from "@/providers/AuthProvider";
import { AdminHeader, Field, Panel } from "./ui";

type Form = {
  id?: Id<"collections">;
  name: string;
  title: string;
  tagline: string;
  description: string;
  coverImage: string;
  order: string;
  visible: boolean;
};

const EMPTY: Form = {
  name: "COLLECTION 04",
  title: "",
  tagline: "",
  description: "",
  coverImage: "art:hoodie:black:front",
  order: "4",
  visible: true,
};

export default function AdminCollections() {
  const { token } = useAuth();
  const collections = useQuery(api.adminCatalog.adminListCollections, token ? { token } : "skip");
  const upsert = useMutation(api.adminCatalog.upsertCollection);
  const remove = useMutation(api.adminCatalog.deleteCollection);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setBusy(true);
    try {
      await upsert({
        token,
        collectionId: form.id,
        name: form.name,
        title: form.title,
        tagline: form.tagline || undefined,
        description: form.description || undefined,
        coverImage: form.coverImage || undefined,
        visible: form.visible,
        order: Number(form.order || 0),
      });
      toast.success(form.id ? "Collection updated" : "Collection created");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save that collection");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-7">
      <AdminHeader
        eyebrow="EDITORIAL"
        title="COLLECTIONS"
        actions={
          <Button
            size="sm"
            onClick={() => {
              setForm({ ...EMPTY, order: String((collections?.length ?? 0) + 1) });
              setOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" /> NEW COLLECTION
          </Button>
        }
      />

      <Panel description="Collection names and titles are exactly what the storefront displays — rename them any time.">
        {collections === undefined ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse-soft bg-white/[0.03]" />
            ))}
          </div>
        ) : (
          <div className="space-y-px">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="flex flex-wrap items-center gap-5 border-b border-white/[0.07] py-4 last:border-b-0"
              >
                <div className="h-20 w-16 shrink-0 overflow-hidden border border-white/10 bg-graphite">
                  <ProductImage src={collection.coverImage} alt={collection.title} />
                </div>
                <div className="min-w-[180px] flex-1">
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">
                    {collection.name} {collection.visible ? "" : "· HIDDEN"}
                  </p>
                  <p className="mt-1.5 font-display text-[22px] uppercase tracking-wide text-white">
                    {collection.title}
                  </p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
                    /{collection.slug} · {collection.productCount} PIECES · ORDER {collection.order}
                  </p>
                </div>
                <p className="max-w-sm flex-1 text-[12px] leading-relaxed text-white/45">
                  {collection.description}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({
                        id: collection.id,
                        name: collection.name,
                        title: collection.title,
                        tagline: collection.tagline ?? "",
                        description: collection.description ?? "",
                        coverImage: collection.coverImage ?? "",
                        order: String(collection.order),
                        visible: collection.visible,
                      });
                      setOpen(true);
                    }}
                    className="flex h-8 w-8 items-center justify-center border border-white/12 text-white/60 transition-colors hover:border-white/40 hover:text-white"
                    aria-label={`Edit ${collection.title}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!token || !window.confirm(`Delete ${collection.title}?`)) return;
                      try {
                        await remove({ token, collectionId: collection.id });
                        toast.success("Collection deleted");
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Could not delete");
                      }
                    }}
                    className="flex h-8 w-8 items-center justify-center border border-white/12 text-white/60 transition-colors hover:border-red-batel hover:text-red-batel"
                    aria-label={`Delete ${collection.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogTitle className="font-display text-[20px] uppercase tracking-wide text-white">
            {form.id ? "EDIT COLLECTION" : "NEW COLLECTION"}
          </DialogTitle>
          <form onSubmit={submit} className="mt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="LABEL" hint="Shown above the title, e.g. COLLECTION 04">
                <Input
                  required
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </Field>
              <Field label="TITLE" hint="The big editorial word, e.g. ORIGIN">
                <Input
                  required
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                />
              </Field>
              <Field label="TAGLINE">
                <Input
                  value={form.tagline}
                  onChange={(event) => setForm({ ...form, tagline: event.target.value })}
                  placeholder="WHERE IT STARTED"
                />
              </Field>
              <Field label="ORDER">
                <Input
                  type="number"
                  value={form.order}
                  onChange={(event) => setForm({ ...form, order: event.target.value })}
                />
              </Field>
              <Field label="COVER IMAGE" className="sm:col-span-2" hint="URL or art: preset">
                <Input
                  value={form.coverImage}
                  onChange={(event) => setForm({ ...form, coverImage: event.target.value })}
                />
              </Field>
              <Field label="DESCRIPTION" className="sm:col-span-2">
                <Textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
              </Field>
            </div>

            <div className="flex items-center justify-between border border-white/10 p-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white">
                  VISIBLE ON SITE
                </p>
                <p className="mt-1.5 text-[11px] text-white/40">
                  Hidden collections stay in the dashboard only.
                </p>
              </div>
              <Switch
                checked={form.visible}
                onCheckedChange={(value) => setForm({ ...form, visible: value })}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={busy}>
                {busy ? "SAVING…" : form.id ? "SAVE" : "CREATE"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                CANCEL
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

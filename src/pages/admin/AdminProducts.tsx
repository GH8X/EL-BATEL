import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Badge, Switch, TD, TH, THead, TR, Table } from "@/components/ui/primitives";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ProductImage } from "@/components/art/ProductImage";
import { useAuth } from "@/providers/AuthProvider";
import { AdminHeader, Field, Panel } from "./ui";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Hoodies", "T-Shirts", "Pants", "Accessories"] as const;
const ART_PRESETS = [
  "art:hoodie:black:front",
  "art:hoodie:black:back",
  "art:hoodie:black:detail",
  "art:hoodie:charcoal:front",
  "art:tee:bone:front",
  "art:tee:black:front",
  "art:tee:bone:detail",
  "art:pants:black:front",
  "art:cap:black:front",
  "art:beanie:black:front",
  "art:bag:bone:front",
];

type FormState = {
  name: string;
  category: (typeof CATEGORIES)[number];
  collectionId: string;
  description: string;
  story: string;
  price: string;
  compareAtPrice: string;
  sizes: string;
  quantity: string;
  material: string;
  color: string;
  care: string;
  limited: boolean;
  featured: boolean;
  isNew: boolean;
  status: "draft" | "active";
  dropDate: string;
  images: string[];
  editionName: string;
  editionTotal: string;
  serialPrefix: string;
  serialStart: string;
};

const EMPTY: FormState = {
  name: "",
  category: "Hoodies",
  collectionId: "",
  description: "",
  story: "",
  price: "",
  compareAtPrice: "",
  sizes: "S, M, L, XL",
  quantity: "10",
  material: "",
  color: "",
  care: "",
  limited: false,
  featured: false,
  isNew: true,
  status: "active",
  dropDate: "",
  images: ["art:hoodie:black:front"],
  editionName: "",
  editionTotal: "100",
  serialPrefix: "ELB",
  serialStart: "1",
};

export default function AdminProducts() {
  const { token } = useAuth();
  const products = useQuery(api.adminCatalog.adminListProducts, token ? { token } : "skip");
  const collections = useQuery(api.adminCatalog.adminListCollections, token ? { token } : "skip");
  const createProduct = useMutation(api.adminCatalog.createProduct);
  const updateProduct = useMutation(api.adminCatalog.updateProduct);
  const deleteProduct = useMutation(api.adminCatalog.deleteProduct);
  const generateUploadUrl = useMutation(api.adminCatalog.generateUploadUrl);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"products"> | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!products) return [];
    if (!search.trim()) return products;
    const needle = search.trim().toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(needle) ||
        product.category.toLowerCase().includes(needle),
    );
  }, [products, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY, collectionId: collections?.[0]?.id ?? "" });
    setOpen(true);
  };

  const openEdit = (product: NonNullable<typeof products>[number]) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      collectionId: product.collectionId ?? "",
      description: product.description,
      story: product.story ?? "",
      price: (product.price / 100).toString(),
      compareAtPrice: product.compareAtPrice ? (product.compareAtPrice / 100).toString() : "",
      sizes: product.sizes.join(", "),
      quantity: String(product.quantity),
      material: product.material ?? "",
      color: product.color ?? "",
      care: product.care ?? "",
      limited: product.limited,
      featured: product.featured,
      isNew: product.isNew,
      status: product.status,
      dropDate: product.dropDate ? new Date(product.dropDate).toISOString().slice(0, 16) : "",
      images: product.images.length ? product.images : [""],
      editionName: product.edition?.name ?? "",
      editionTotal: String(product.edition?.total ?? 100),
      serialPrefix: product.edition?.prefix ?? "ELB",
      serialStart: String(product.edition?.serialStart ?? 1),
    });
    setOpen(true);
  };

  const upload = async (file: File) => {
    if (!token) return;
    try {
      const url = await generateUploadUrl({ token });
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      const body = (await response.json()) as { storageId?: string };
      if (!body.storageId) throw new Error("Upload failed");
      setForm((current) => ({
        ...current,
        images: [...current.images.filter((image) => image.trim()), `storage:${body.storageId}`],
      }));
      toast.success("Image uploaded");
    } catch {
      toast.error("Could not upload that image");
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setBusy(true);
    const sizes = form.sizes
      .split(",")
      .map((size) => size.trim())
      .filter(Boolean);
    const images = form.images.map((image) => image.trim()).filter(Boolean);

    try {
      if (editingId) {
        await updateProduct({
          token,
          productId: editingId,
          name: form.name,
          category: form.category,
          collectionId: form.collectionId ? (form.collectionId as Id<"collections">) : null,
          description: form.description,
          story: form.story || undefined,
          price: Math.round(Number(form.price || 0) * 100),
          compareAtPrice: form.compareAtPrice ? Math.round(Number(form.compareAtPrice) * 100) : null,
          sizes,
          quantity: Number(form.quantity || 0),
          material: form.material || undefined,
          color: form.color || undefined,
          care: form.care || undefined,
          limited: form.limited,
          featured: form.featured,
          isNew: form.isNew,
          status: form.status,
          dropDate: form.dropDate ? new Date(form.dropDate).getTime() : null,
          images,
        });
        toast.success(`${form.name} updated`);
      } else {
        await createProduct({
          token,
          name: form.name,
          category: form.category,
          collectionId: form.collectionId ? (form.collectionId as Id<"collections">) : undefined,
          description: form.description,
          story: form.story || undefined,
          price: Math.round(Number(form.price || 0) * 100),
          compareAtPrice: form.compareAtPrice
            ? Math.round(Number(form.compareAtPrice) * 100)
            : undefined,
          sizes,
          quantity: Number(form.quantity || 0),
          material: form.material || undefined,
          color: form.color || undefined,
          care: form.care || undefined,
          limited: form.limited,
          featured: form.featured,
          isNew: form.isNew,
          status: form.status,
          dropDate: form.dropDate ? new Date(form.dropDate).getTime() : undefined,
          images,
          editionName: form.editionName || undefined,
          editionTotal: form.limited ? Number(form.editionTotal || 0) : undefined,
          serialPrefix: form.serialPrefix,
          serialStart: Number(form.serialStart || 1),
        });
        toast.success(`${form.name} created`);
      }
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save this product");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (product: NonNullable<typeof products>[number]) => {
    if (!token) return;
    try {
      await deleteProduct({ token, productId: product.id });
      toast.success(`${product.name} deleted`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("already sold")) {
        if (window.confirm(`${message}\n\nDelete anyway and keep the sold records?`)) {
          await deleteProduct({ token, productId: product.id, force: true });
          toast.success(`${product.name} deleted`);
        }
      } else {
        toast.error(message || "Could not delete this product");
      }
    }
  };

  return (
    <div className="space-y-7">
      <AdminHeader
        eyebrow="CATALOGUE"
        title="PRODUCTS"
        actions={
          <>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="SEARCH PIECES…"
              className="w-full sm:w-52"
            />
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-3.5 w-3.5" /> NEW PIECE
            </Button>
          </>
        }
      />

      <Panel>
        {products === undefined ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse-soft bg-white/[0.03]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">
            NO PIECES MATCH THAT SEARCH
          </p>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>PIECE</TH>
                <TH>CATEGORY</TH>
                <TH>COLLECTION</TH>
                <TH>PRICE</TH>
                <TH>AVAILABILITY</TH>
                <TH>STATUS</TH>
                <TH className="text-right">ACTIONS</TH>
              </TR>
            </THead>
            <tbody>
              {filtered.map((product) => (
                <TR key={product.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-10 shrink-0 overflow-hidden border border-white/10 bg-graphite">
                        <ProductImage src={product.images[0]} alt={product.name} />
                      </div>
                      <div>
                        <p className="font-display text-[14px] uppercase tracking-wide text-white">
                          {product.name}
                        </p>
                        <p className="mt-0.5 font-mono text-[9px] text-white/35">/{product.slug}</p>
                      </div>
                    </div>
                  </TD>
                  <TD className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/50">
                    {product.category}
                  </TD>
                  <TD className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/50">
                    {product.collectionName ?? "—"}
                  </TD>
                  <TD className="font-mono text-[12px] text-white">{formatPrice(product.price)}</TD>
                  <TD>
                    {product.limited ? (
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/70">
                        {product.serials.available}/{product.serials.total} SERIALS
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/70">
                        {product.quantity} UNITS
                      </span>
                    )}
                  </TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <Badge variant={product.status === "active" ? "default" : "muted"}>
                        {product.status}
                      </Badge>
                      {product.limited ? <Badge variant="accent">LIMITED</Badge> : null}
                    </div>
                  </TD>
                  <TD>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(product)}
                        className="flex h-8 w-8 items-center justify-center border border-white/12 text-white/60 transition-colors hover:border-white/40 hover:text-white"
                        aria-label={`Edit ${product.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(product)}
                        className="flex h-8 w-8 items-center justify-center border border-white/12 text-white/60 transition-colors hover:border-red-batel hover:text-red-batel"
                        aria-label={`Delete ${product.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        )}
      </Panel>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
          <DialogTitle className="font-display text-[22px] uppercase tracking-wide text-white">
            {editingId ? "EDIT PIECE" : "NEW PIECE"}
          </DialogTitle>

          <form onSubmit={submit} className="mt-7 space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="NAME" className="sm:col-span-2">
                <Input
                  required
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="EL BATEL — BLACK EDITION"
                />
              </Field>
              <Field label="CATEGORY">
                <Select
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value as FormState["category"] })
                  }
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="COLLECTION">
                <Select
                  value={form.collectionId}
                  onChange={(event) => setForm({ ...form, collectionId: event.target.value })}
                >
                  <option value="">No collection</option>
                  {(collections ?? []).map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name} — {collection.title}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="PRICE (CURRENCY UNITS)">
                <Input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(event) => setForm({ ...form, price: event.target.value })}
                  placeholder="245"
                />
              </Field>
              <Field label="COMPARE AT PRICE">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.compareAtPrice}
                  onChange={(event) => setForm({ ...form, compareAtPrice: event.target.value })}
                  placeholder="290"
                />
              </Field>
              <Field label="SIZES (COMMA SEPARATED)">
                <Input
                  value={form.sizes}
                  onChange={(event) => setForm({ ...form, sizes: event.target.value })}
                  placeholder="S, M, L, XL"
                />
              </Field>
              <Field label="STOCK QUANTITY">
                <Input
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                />
              </Field>
              <Field label="MATERIAL">
                <Input
                  value={form.material}
                  onChange={(event) => setForm({ ...form, material: event.target.value })}
                  placeholder="480 gsm brushed cotton fleece"
                />
              </Field>
              <Field label="COLOUR">
                <Input
                  value={form.color}
                  onChange={(event) => setForm({ ...form, color: event.target.value })}
                  placeholder="Deep black"
                />
              </Field>
              <Field label="CARE INSTRUCTIONS" className="sm:col-span-2">
                <Input
                  value={form.care}
                  onChange={(event) => setForm({ ...form, care: event.target.value })}
                  placeholder="Machine wash cold, inside out."
                />
              </Field>
              <Field label="DESCRIPTION" className="sm:col-span-2">
                <Textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
              </Field>
              <Field label="STORY / EDITORIAL NOTE" className="sm:col-span-2">
                <Textarea
                  rows={3}
                  value={form.story}
                  onChange={(event) => setForm({ ...form, story: event.target.value })}
                />
              </Field>
              <Field
                label="DROP DATE (OPTIONAL)"
                hint="Set a future date and the storefront shows a countdown and locks checkout."
              >
                <Input
                  type="datetime-local"
                  value={form.dropDate}
                  onChange={(event) => setForm({ ...form, dropDate: event.target.value })}
                />
              </Field>
              <Field label="STATUS">
                <Select
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value as FormState["status"] })
                  }
                >
                  <option value="active">Active (visible on site)</option>
                  <option value="draft">Draft (hidden)</option>
                </Select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <ToggleRow
                label="LIMITED EDITION"
                hint="Numbered run with unique serials"
                checked={form.limited}
                onChange={(value) => setForm({ ...form, limited: value })}
              />
              <ToggleRow
                label="FEATURED"
                hint="Shown on the homepage archive"
                checked={form.featured}
                onChange={(value) => setForm({ ...form, featured: value })}
              />
              <ToggleRow
                label="NEW DROP"
                hint="Badged as a new release"
                checked={form.isNew}
                onChange={(value) => setForm({ ...form, isNew: value })}
              />
            </div>

            {form.limited ? (
              <div className="border border-red-batel/30 bg-red-batel/[0.05] p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-red-batel">
                  EDITION &amp; SERIAL NUMBERS
                </p>
                <div className="mt-4 grid gap-5 sm:grid-cols-4">
                  <Field label="EDITION NAME">
                    <Input
                      value={form.editionName}
                      onChange={(event) => setForm({ ...form, editionName: event.target.value })}
                      placeholder="BLACK EDITION"
                    />
                  </Field>
                  <Field label="TOTAL PIECES">
                    <Input
                      type="number"
                      min="1"
                      value={form.editionTotal}
                      onChange={(event) => setForm({ ...form, editionTotal: event.target.value })}
                    />
                  </Field>
                  <Field label="SERIAL PREFIX">
                    <Input
                      value={form.serialPrefix}
                      onChange={(event) => setForm({ ...form, serialPrefix: event.target.value })}
                    />
                  </Field>
                  <Field label="START NUMBER">
                    <Input
                      type="number"
                      min="1"
                      value={form.serialStart}
                      onChange={(event) => setForm({ ...form, serialStart: event.target.value })}
                    />
                  </Field>
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-white/45">
                  {editingId
                    ? "Serials are generated when the piece is created. Use the Serial numbers page to add or edit numbers for this edition."
                    : `${Number(form.editionTotal || 0)} serials will be created, from ${form.serialPrefix}-${String(
                        Number(form.serialStart || 1),
                      ).padStart(4, "0")} upward. Duplicates are skipped automatically.`}
                </p>
              </div>
            ) : null}

            <div>
              <Label>IMAGES</Label>
              <div className="space-y-2.5">
                {form.images.map((image, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-14 w-12 shrink-0 overflow-hidden border border-white/10 bg-graphite">
                      <ProductImage src={image} alt="Product image" />
                    </div>
                    <Input
                      value={image}
                      onChange={(event) => {
                        const next = [...form.images];
                        next[index] = event.target.value;
                        setForm({ ...form, images: next });
                      }}
                      placeholder="https://… or art:hoodie:black:front"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          images: form.images.filter((_, i) => i !== index),
                        })
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/12 text-white/50 transition-colors hover:border-red-batel hover:text-red-batel"
                      aria-label="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setForm({ ...form, images: [...form.images, ""] })}
                >
                  <Plus className="h-3.5 w-3.5" /> ADD IMAGE ROW
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInput.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5" /> UPLOAD FILE
                </Button>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void upload(file);
                    event.target.value = "";
                  }}
                />
                <Select
                  value=""
                  className="h-9 w-auto"
                  onChange={(event) => {
                    if (!event.target.value) return;
                    setForm((current) => ({
                      ...current,
                      images: [...current.images.filter((i) => i.trim()), event.target.value],
                    }));
                  }}
                >
                  <option value="">ART PRESET…</option>
                  {ART_PRESETS.map((preset) => (
                    <option key={preset} value={preset}>
                      {preset}
                    </option>
                  ))}
                </Select>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-white/35">
                Paste a hosted image URL, upload a file, or use an <span className="font-mono">art:</span>{" "}
                preset to render the studio garment artwork.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
              <Button type="submit" disabled={busy}>
                {busy ? "SAVING…" : editingId ? "SAVE CHANGES" : "CREATE PIECE"}
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

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border p-4 transition-colors",
        checked ? "border-red-batel/40 bg-red-batel/[0.05]" : "border-white/10",
      )}
    >
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white">{label}</p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-white/40">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Hash, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge, TD, TH, THead, TR, Table } from "@/components/ui/primitives";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/providers/AuthProvider";
import { AdminHeader, Field, Panel, StatCard } from "./ui";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type Status = "available" | "reserved" | "sold";

const STATUS_VARIANT: Record<Status, "default" | "accent" | "outline" | "muted"> = {
  available: "default",
  reserved: "outline",
  sold: "accent",
};

export default function AdminSerials() {
  const { token } = useAuth();
  const products = useQuery(api.adminCatalog.adminListProducts, token ? { token } : "skip");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Status | "">("");
  const [productId, setProductId] = useState<string>("");

  const serials = useQuery(
    api.serials.adminListSerials,
    token
      ? {
          token,
          search: search.trim() || undefined,
          status: status || undefined,
          productId: productId ? (productId as Id<"products">) : undefined,
          limit: 400,
        }
      : "skip",
  );

  const updateSerial = useMutation(api.serials.updateSerial);
  const deleteSerial = useMutation(api.serials.deleteSerial);
  const generateSerials = useMutation(api.serials.generateSerials);

  const [edit, setEdit] = useState<{ id: Id<"serial_numbers">; serial: string; status: Status } | null>(
    null,
  );
  const [gen, setGen] = useState({
    productId: "",
    editionName: "",
    prefix: "ELB",
    start: "1",
    total: "50",
  });
  const [busy, setBusy] = useState(false);

  const rows = serials?.rows ?? [];
  const counts = {
    available: rows.filter((row) => row.status === "available").length,
    reserved: rows.filter((row) => row.status === "reserved").length,
    sold: rows.filter((row) => row.status === "sold").length,
  };

  const saveEdit = async () => {
    if (!token || !edit) return;
    setBusy(true);
    try {
      await updateSerial({
        token,
        serialId: edit.id,
        serial: edit.serial,
        status: edit.status,
      });
      toast.success(`Serial ${edit.serial} saved`);
      setEdit(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update that serial");
    } finally {
      setBusy(false);
    }
  };

  const runGenerate = async () => {
    if (!token || !gen.productId) {
      toast.error("Choose a product first");
      return;
    }
    setBusy(true);
    try {
      const result = await generateSerials({
        token,
        productId: gen.productId as Id<"products">,
        editionName: gen.editionName || undefined,
        prefix: gen.prefix,
        start: Number(gen.start || 1),
        total: Number(gen.total || 1),
      });
      toast.success(
        `${result.created} serials created${result.skipped ? `, ${result.skipped} already existed` : ""}`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate serials");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-7">
      <AdminHeader
        eyebrow="INVENTORY"
        title="SERIAL NUMBERS"
        actions={
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="SEARCH ELB-0047…"
            className="w-full font-mono sm:w-56"
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="AVAILABLE" value={String(counts.available)} hint="claimable right now" accent />
        <StatCard label="RESERVED" value={String(counts.reserved)} hint="held in carts" />
        <StatCard label="SOLD" value={String(counts.sold)} hint="registered to an owner" />
      </div>

      <Panel
        title="GENERATE SERIALS"
        description="Create a numbered run for a product. Existing numbers are skipped, so this can never create a duplicate."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="PRODUCT" className="lg:col-span-1">
            <Select value={gen.productId} onChange={(event) => setGen({ ...gen, productId: event.target.value })}>
              <option value="">Choose…</option>
              {(products ?? []).map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="EDITION NAME">
            <Input
              value={gen.editionName}
              onChange={(event) => setGen({ ...gen, editionName: event.target.value })}
              placeholder="BLACK EDITION"
            />
          </Field>
          <Field label="PREFIX">
            <Input
              value={gen.prefix}
              onChange={(event) => setGen({ ...gen, prefix: event.target.value })}
            />
          </Field>
          <Field label="START AT">
            <Input
              type="number"
              min="1"
              value={gen.start}
              onChange={(event) => setGen({ ...gen, start: event.target.value })}
            />
          </Field>
          <Field label="HOW MANY">
            <Input
              type="number"
              min="1"
              value={gen.total}
              onChange={(event) => setGen({ ...gen, total: event.target.value })}
            />
          </Field>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <Button size="sm" onClick={() => void runGenerate()} disabled={busy}>
            <Hash className="h-3.5 w-3.5" /> {busy ? "WORKING…" : "GENERATE"}
          </Button>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
            SERIALS ARE UNIQUE — DUPLICATES ARE REJECTED AT THE DATABASE LEVEL
          </p>
        </div>
      </Panel>

      <Panel
        title={`SERIAL LEDGER ${serials ? `(${rows.length} OF ${serials.total})` : ""}`}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Select
              className="h-9 w-auto"
              value={status}
              onChange={(event) => setStatus(event.target.value as Status | "")}
            >
              <option value="">All statuses</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
            </Select>
            <Select
              className="h-9 w-auto"
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
            >
              <option value="">All products</option>
              {(products ?? []).map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </Select>
          </div>
        }
      >
        {serials === undefined ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-11 animate-pulse-soft bg-white/[0.03]" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="py-10 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">
            NO SERIALS MATCH THAT FILTER
          </p>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>SERIAL</TH>
                <TH>PRODUCT</TH>
                <TH>EDITION</TH>
                <TH>STATUS</TH>
                <TH>ORDER</TH>
                <TH>OWNER</TH>
                <TH>DATE</TH>
                <TH className="text-right">ACTIONS</TH>
              </TR>
            </THead>
            <tbody>
              {rows.map((row) => (
                <TR key={row.id}>
                  <TD className="font-mono text-[12px] tracking-[0.1em] text-white">{row.serial}</TD>
                  <TD className="text-[12px] text-white/70">{row.productName}</TD>
                  <TD className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
                    {row.editionName}
                  </TD>
                  <TD>
                    <Badge variant={STATUS_VARIANT[row.status as Status]}>
                      {row.status.toUpperCase()}
                    </Badge>
                  </TD>
                  <TD className="font-mono text-[10px] text-white/50">{row.orderNumber ?? "—"}</TD>
                  <TD className="max-w-[180px] truncate text-[12px] text-white/50">
                    {row.ownerLabel ?? "—"}
                  </TD>
                  <TD className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                    {row.soldAt
                      ? `SOLD ${formatDate(row.soldAt)}`
                      : row.reservedAt
                        ? `HELD ${formatDate(row.reservedAt)}`
                        : formatDate(row.createdAt)}
                  </TD>
                  <TD>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEdit({ id: row.id, serial: row.serial, status: row.status as Status })
                        }
                        className="flex h-8 w-8 items-center justify-center border border-white/12 text-white/60 transition-colors hover:border-white/40 hover:text-white"
                        aria-label={`Edit ${row.serial}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!token || !window.confirm(`Delete ${row.serial}?`)) return;
                          try {
                            await deleteSerial({ token, serialId: row.id });
                            toast.success(`${row.serial} deleted`);
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : "Could not delete");
                          }
                        }}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center border border-white/12 text-white/60 transition-colors hover:border-red-batel hover:text-red-batel",
                          row.status === "sold" && "opacity-40",
                        )}
                        aria-label={`Delete ${row.serial}`}
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

      <Dialog open={Boolean(edit)} onOpenChange={(open) => (open ? undefined : setEdit(null))}>
        <DialogContent className="max-w-md">
          <DialogTitle className="font-display text-[20px] uppercase tracking-wide text-white">
            EDIT SERIAL
          </DialogTitle>
          {edit ? (
            <div className="mt-6 space-y-5">
              <Field label="SERIAL" hint="Letters, numbers and dashes. Duplicates are rejected.">
                <Input
                  value={edit.serial}
                  onChange={(event) => setEdit({ ...edit, serial: event.target.value.toUpperCase() })}
                />
              </Field>
              <Field label="STATUS">
                <Select
                  value={edit.status}
                  onChange={(event) => setEdit({ ...edit, status: event.target.value as Status })}
                >
                  <option value="available">Available — claimable</option>
                  <option value="reserved">Reserved — held in a cart</option>
                  <option value="sold">Sold — owned</option>
                </Select>
              </Field>
              <div className="flex gap-3">
                <Button onClick={() => void saveEdit()} disabled={busy}>
                  {busy ? "SAVING…" : "SAVE"}
                </Button>
                <Button variant="ghost" onClick={() => setEdit(null)}>
                  CANCEL
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/primitives";
import { ProductImage } from "@/components/art/ProductImage";
import { useAuth } from "@/providers/AuthProvider";
import { AdminHeader, Field, Panel } from "./ui";
import { formatDate, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUSES = ["pending", "paid", "processing", "shipped", "completed", "cancelled"] as const;
const PAYMENTS = ["unpaid", "pending", "paid", "refunded"] as const;

type Status = (typeof STATUSES)[number];
type Payment = (typeof PAYMENTS)[number];

export default function AdminOrders() {
  const { token } = useAuth();
  const [status, setStatus] = useState<Status | "">("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const orders = useQuery(
    api.orders.adminList,
    token ? { token, status: status || undefined, search: search.trim() || undefined } : "skip",
  );
  const setOrderStatus = useMutation(api.orders.setStatus);
  const [busyId, setBusyId] = useState<string | null>(null);

  const update = async (
    orderId: Id<"orders">,
    patch: { status?: Status; paymentStatus?: Payment },
  ) => {
    if (!token) return;
    setBusyId(orderId);
    try {
      await setOrderStatus({ token, orderId, ...patch });
      toast.success("Order updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update that order");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-7">
      <AdminHeader
        eyebrow="FULFILMENT"
        title="ORDERS"
        actions={
          <>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="SEARCH ORDER / CUSTOMER…"
              className="w-full sm:w-60"
            />
            <Select
              className="h-11 w-auto"
              value={status}
              onChange={(event) => setStatus(event.target.value as Status | "")}
            >
              <option value="">All statuses</option>
              {STATUSES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </>
        }
      />

      <Panel description="Cancelling an order returns its serial numbers to the edition automatically.">
        {orders === undefined ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse-soft bg-white/[0.03]" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <p className="py-10 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">
            NO ORDERS MATCH THAT FILTER
          </p>
        ) : (
          <div className="space-y-px">
            {orders.map((order) => {
              const isOpen = expanded === order.id;
              const serials = order.items.filter((item) => item.serial);
              return (
                <div key={order.id} className="border border-white/[0.08]">
                  <div className="flex flex-wrap items-center gap-5 p-4">
                    <div className="min-w-[160px] flex-1">
                      <p className="font-mono text-[12px] tracking-[0.1em] text-white">
                        {order.orderNumber}
                      </p>
                      <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
                        {formatDate(order.createdAt, true)}
                      </p>
                    </div>
                    <div className="min-w-[180px] flex-1">
                      <p className="text-[13px] text-white">{order.fullName}</p>
                      <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">
                        {order.email} · {order.city}, {order.country}
                      </p>
                    </div>
                    <div className="min-w-[120px]">
                      <p className="font-mono text-[12px] text-white">
                        {formatPrice(order.total, order.currency)}
                      </p>
                      <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">
                        {order.items.length} ITEMS
                        {serials.length ? ` · ${serials.length} SERIALS` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Select
                        className="h-9 w-auto"
                        value={order.status}
                        disabled={busyId === order.id}
                        onChange={(event) =>
                          void update(order.id, { status: event.target.value as Status })
                        }
                      >
                        {STATUSES.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </Select>
                      <Select
                        className="h-9 w-auto"
                        value={order.paymentStatus}
                        disabled={busyId === order.id}
                        onChange={(event) =>
                          void update(order.id, { paymentStatus: event.target.value as Payment })
                        }
                      >
                        {PAYMENTS.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </Select>
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : order.id)}
                        className="flex h-9 items-center gap-2 border border-white/12 px-3 font-mono text-[9px] uppercase tracking-[0.16em] text-white/60 transition-colors hover:border-white/35 hover:text-white"
                      >
                        DETAILS
                        <ChevronDown
                          className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")}
                        />
                      </button>
                    </div>
                  </div>

                  {isOpen ? (
                    <div className="grid gap-8 border-t border-white/[0.08] p-5 lg:grid-cols-[1.4fr_0.6fr]">
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4">
                            <div className="h-20 w-16 shrink-0 overflow-hidden border border-white/10 bg-graphite">
                              <ProductImage src={item.image} alt={item.productName} serial={item.serial} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-display text-[14px] uppercase tracking-wide text-white">
                                {item.productName}
                              </p>
                              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">
                                {item.collectionName ?? "—"} · {item.size ?? "ONE SIZE"} · QTY{" "}
                                {item.quantity}
                              </p>
                            </div>
                            {item.serial ? (
                              <Badge variant="accent">{item.serial}</Badge>
                            ) : null}
                            <span className="font-mono text-[11px] text-white/70">
                              {formatPrice(item.unitPrice * item.quantity, order.currency)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-5">
                        <Field label="SHIPPING ADDRESS">
                          <p className="border border-white/10 p-4 text-[12px] leading-relaxed text-white/60">
                            {order.fullName}
                            <br />
                            {order.address}
                            <br />
                            {order.city}, {order.country} {order.postalCode ?? ""}
                            <br />
                            {order.phone ?? ""}
                          </p>
                        </Field>
                        <Field label="PAYMENT RECORD" hint="These fields are written by a payment provider webhook.">
                          <div className="space-y-2 border border-white/10 p-4 font-mono text-[10px] uppercase tracking-[0.14em] text-white/50">
                            <p>STATUS · {order.paymentStatus}</p>
                            <p>PROVIDER · pending integration</p>
                            <p>REFERENCE · —</p>
                          </div>
                        </Field>
                        {order.note ? (
                          <Field label="CUSTOMER NOTE">
                            <p className="border border-white/10 p-4 text-[12px] leading-relaxed text-white/60">
                              {order.note}
                            </p>
                          </Field>
                        ) : null}
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <a href={`mailto:${order.email}?subject=Order ${order.orderNumber}`}>
                            EMAIL CUSTOMER
                          </a>
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}

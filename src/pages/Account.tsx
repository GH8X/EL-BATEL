import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { ProductImage } from "@/components/art/ProductImage";
import { Reveal } from "@/components/site/motion";
import { useAuth } from "@/providers/AuthProvider";
import { formatDate, formatPrice } from "@/lib/format";

const STATUS_TONE: Record<string, "default" | "accent" | "outline" | "muted"> = {
  pending: "outline",
  paid: "accent",
  processing: "default",
  shipped: "default",
  completed: "muted",
  cancelled: "muted",
};

export default function Account() {
  const { token, user, isAdmin, signOut } = useAuth();
  const orders = useQuery(api.orders.mine, token ? { token } : "skip");
  const [params] = useSearchParams();
  const forbidden = params.get("forbidden");

  const serials = (orders ?? []).flatMap((order) =>
    order.items.filter((item) => item.serial).map((item) => ({ serial: item.serial!, name: item.productName, order: order.orderNumber })),
  );

  return (
    <div className="pt-[68px]">
      <header className="border-b border-white/10 bg-black">
        <div className="container flex flex-wrap items-end justify-between gap-6 py-12 sm:py-16">
          <div>
            <span className="eyebrow">MY ACCOUNT</span>
            <h1 className="mt-4 font-display text-[44px] leading-[0.86] tracking-tight text-white sm:text-[80px]">
              {user?.name || "COLLECTOR"}
            </h1>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
              {user?.email}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {isAdmin ? (
              <Button asChild>
                <Link to="/admin">STUDIO DASHBOARD</Link>
              </Button>
            ) : null}
            <Button variant="outline" onClick={() => void signOut()}>
              SIGN OUT
            </Button>
          </div>
        </div>
      </header>

      <section className="py-12 sm:py-16">
        <div className="container">
          {forbidden ? (
            <div className="mb-8 border border-red-batel/40 bg-red-batel/[0.06] px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-red-batel">
                THAT AREA IS RESTRICTED TO THE STUDIO ADMIN ACCOUNT
              </p>
            </div>
          ) : null}

          <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
            <div>
              <Reveal>
                <div className="flex items-end justify-between gap-4">
                  <h2 className="font-display text-[30px] uppercase tracking-tight text-white sm:text-[40px]">
                    ORDER HISTORY
                  </h2>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                    {orders?.length ?? 0} ORDERS
                  </span>
                </div>
              </Reveal>

              <div className="mt-8 space-y-4">
                {orders === undefined ? (
                  Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="h-28 animate-pulse-soft border border-white/10 bg-white/[0.02]" />
                  ))
                ) : orders.length === 0 ? (
                  <div className="border border-white/10 px-6 py-16 text-center">
                    <p className="font-display text-2xl uppercase tracking-wide text-white">
                      No orders yet
                    </p>
                    <p className="mt-3 text-[13px] text-white/45">
                      Numbered pieces you claim will appear here with their serials.
                    </p>
                    <div className="mt-7 flex justify-center">
                      <Button asChild>
                        <Link to="/shop">SHOP THE ARCHIVE</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  orders.map((order, index) => (
                    <Reveal key={order.id} delay={Math.min(index * 0.05, 0.2)}>
                      <div className="border border-white/[0.1] p-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="font-mono text-[12px] tracking-[0.1em] text-white">
                              {order.orderNumber}
                            </p>
                            <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
                              {formatDate(order.createdAt, true)} · {order.city}, {order.country}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={STATUS_TONE[order.status] ?? "outline"}>
                              {order.status}
                            </Badge>
                            <span className="font-mono text-[12px] text-white">
                              {formatPrice(order.total, order.currency)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 space-y-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4">
                              <div className="h-16 w-14 shrink-0 overflow-hidden border border-white/10 bg-graphite">
                                <ProductImage src={item.image} alt={item.productName} serial={item.serial} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-display text-[14px] uppercase tracking-wide text-white">
                                  {item.productName}
                                </p>
                                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">
                                  {item.size ? `SIZE ${item.size}` : "ONE SIZE"} · QTY {item.quantity}
                                </p>
                              </div>
                              {item.serial ? (
                                <span className="inline-flex items-center gap-2 border border-white/12 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white">
                                  <span className="h-1 w-1 bg-red-batel" />
                                  {item.serial}
                                </span>
                              ) : null}
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
                            PAYMENT · {order.paymentStatus}
                          </span>
                          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
                            {order.items.length} PIECES
                          </span>
                        </div>
                      </div>
                    </Reveal>
                  ))
                )}
              </div>
            </div>

            <aside>
              <Reveal>
                <div className="border border-white/12 p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
                    MY SERIALS
                  </p>
                  {serials.length === 0 ? (
                    <p className="mt-4 text-[12px] leading-relaxed text-white/40">
                      Serial numbers you own will be listed here — your permanent record of the
                      editions you were part of.
                    </p>
                  ) : (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {serials.map((entry) => (
                        <span
                          key={`${entry.order}-${entry.serial}`}
                          title={entry.name}
                          className="inline-flex items-center gap-2 border border-white/15 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.12em] text-white"
                        >
                          <span className="h-1 w-1 bg-red-batel" />
                          {entry.serial}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="mt-4 border border-white/12 p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
                    NEED HELP?
                  </p>
                  <p className="mt-4 text-[12px] leading-relaxed text-white/45">
                    Sizing, shipping or a serial question — the studio answers directly.
                  </p>
                  <div className="mt-5">
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link to="/contact">CONTACT THE STUDIO</Link>
                    </Button>
                  </div>
                </div>
              </Reveal>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

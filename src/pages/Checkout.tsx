import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Check, CreditCard, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { ProductImage } from "@/components/art/ProductImage";
import { Reveal } from "@/components/site/motion";
import { useCart } from "@/providers/CartProvider";
import { useAuth } from "@/providers/AuthProvider";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { clearPendingOrder, readPendingOrder, savePendingOrder } from "@/lib/pendingOrder";

type Confirmation = {
  orderNumber: string;
  email: string;
  total: number;
  currency: string;
  serials: string[];
};

export default function Checkout() {
  const { items, subtotal, shipping, total, currency, clear, freeShippingThreshold } = useCart();
  const { user, token } = useAuth();
  const settings = useQuery(api.catalog.getSettings, {});
  const checkout = useMutation(api.orders.checkout);
  const startCheckout = useAction(api.payments.startCheckout);
  const paymentsStatus = useAction(api.payments.status);
  const releaseUnpaid = useMutation(api.orders.releaseUnpaid);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [form, setForm] = useState({
    email: "",
    fullName: "",
    phone: "",
    address: "",
    city: "",
    country: "Algeria",
    postalCode: "",
    note: "",
  });
  const [busy, setBusy] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  /** null while we ask the backend whether card payments are live. */
  const [cardPayments, setCardPayments] = useState<boolean | null>(null);

  useEffect(() => {
    if (user?.email) setForm((current) => (current.email ? current : { ...current, email: user.email }));
    if (user?.name) setForm((current) => (current.fullName ? current : { ...current, fullName: user.name ?? "" }));
  }, [user]);

  useEffect(() => {
    let alive = true;
    void paymentsStatus({})
      .then((result) => {
        if (alive) setCardPayments(result.configured);
      })
      .catch(() => {
        if (alive) setCardPayments(false);
      });
    return () => {
      alive = false;
    };
  }, [paymentsStatus]);

  // Came back from Stripe without paying: cancel the pending order so the
  // number goes straight back into the drop.
  useEffect(() => {
    if (params.get("cancelled") !== "1") return;
    const pending = readPendingOrder();
    if (!pending) return;
    clearPendingOrder();
    void releaseUnpaid(pending)
      .then((result) => {
        if (result.reason === "released") {
          toast.message("Payment cancelled", {
            description: `${pending.orderNumber} is void. Your number is back in the drop.`,
          });
        }
      })
      .catch(() => undefined);
  }, [params, releaseUnpaid]);

  const remaining = freeShippingThreshold - subtotal;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (items.length === 0) {
      toast.error("Your bag is empty");
      return;
    }
    setBusy(true);
    try {
      const orderArgs = {
        token: token ?? undefined,
        email: form.email,
        fullName: form.fullName,
        phone: form.phone || undefined,
        address: form.address,
        city: form.city,
        country: form.country,
        postalCode: form.postalCode || undefined,
        note: form.note || undefined,
        items: items.map((item) => ({
          productId: item.productId,
          size: item.size ?? undefined,
          quantity: item.quantity,
          serialId: item.serialId ?? undefined,
        })),
      };

      if (cardPayments) {
        // Order is created server-side first, then Stripe hosts the payment.
        const session = await startCheckout({ ...orderArgs, origin: window.location.origin });
        savePendingOrder({
          orderNumber: session.orderNumber,
          email: form.email.trim().toLowerCase(),
        });
        window.location.href = session.url;
        return;
      }

      // No card provider configured: reserve the number and invoice by email.
      const result = await checkout(orderArgs);
      setConfirmation({
        orderNumber: result.orderNumber,
        email: form.email.trim().toLowerCase(),
        total: result.total,
        currency: result.currency,
        serials: items.map((item) => item.serial).filter((s): s is string => Boolean(s)),
      });
      clear();
      window.scrollTo({ top: 0 });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  };

  if (confirmation) {
    return (
      <div className="pt-[68px]">
        <section className="border-b border-white/10 bg-black py-16 sm:py-24">
          <div className="container max-w-3xl">
            <Reveal>
              <span className="flex h-12 w-12 items-center justify-center border border-red-batel text-red-batel">
                <Check className="h-5 w-5" />
              </span>
              <p className="eyebrow mt-7">ORDER REGISTERED</p>
              <h1 className="mt-5 font-display text-[44px] leading-[0.86] tracking-tight text-white sm:text-[80px]">
                YOUR NUMBER IS RESERVED
              </h1>
              <p className="mt-6 text-[14px] leading-relaxed text-white/55">
                Order <span className="font-mono text-white">{confirmation.orderNumber}</span> has
                been registered against {confirmation.email}. Your serial number is now attached to
                this order and cannot be sold to anyone else.
              </p>
            </Reveal>

            {confirmation.serials.length > 0 ? (
              <div className="mt-9 border border-white/12 p-6">
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/40">
                  SERIALS REGISTERED
                </p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {confirmation.serials.map((serial) => (
                    <span
                      key={serial}
                      className="inline-flex items-center gap-2 border border-white/15 px-3 py-2 font-mono text-[11px] tracking-[0.12em] text-white"
                    >
                      <span className="h-1.5 w-1.5 bg-red-batel" />
                      {serial}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-9 flex items-start gap-4 border border-white/12 p-6">
              <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-white/40" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white">
                  PAYMENT · NOT COLLECTED YET
                </p>
                <p className="mt-3 text-[13px] leading-relaxed text-white/50">
                  Your order is stored with status <span className="font-mono text-white/80">PENDING</span>{" "}
                  and <span className="font-mono text-white/80">UNPAID</span>, and your number is
                  held against it. The studio invoices and ships by email. Once card payments are
                  connected, this step becomes Stripe's hosted checkout instead.
                </p>
              </div>
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/shop">CONTINUE SHOPPING</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/account">VIEW MY ORDERS</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-[68px]">
        <div className="container py-24 text-center">
          <h1 className="font-display text-[40px] uppercase tracking-tight text-white sm:text-[64px]">
            NOTHING TO CHECK OUT
          </h1>
          <p className="mt-4 text-[13px] text-white/45">Your bag is empty.</p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg" onClick={() => navigate("/shop")}>
              <Link to="/shop">SHOP THE DROP</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[68px]">
      <header className="border-b border-white/10 bg-black">
        <div className="container py-12 sm:py-16">
          <span className="eyebrow">CHECKOUT</span>
          <h1 className="mt-4 font-display text-[46px] leading-[0.86] tracking-tight text-white sm:text-[88px]">
            CLAIM YOUR NUMBER
          </h1>
        </div>
      </header>

      <section className="py-12 sm:py-16">
        <div className="container grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <form onSubmit={submit} className="space-y-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
                01 · CONTACT
              </p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
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
                <div>
                  <Label htmlFor="fullName">FULL NAME</Label>
                  <Input
                    id="fullName"
                    required
                    value={form.fullName}
                    onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                    placeholder="First and last name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">PHONE</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    placeholder="+213 …"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
                02 · SHIPPING
              </p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="address">ADDRESS</Label>
                  <Input
                    id="address"
                    required
                    value={form.address}
                    onChange={(event) => setForm({ ...form, address: event.target.value })}
                    placeholder="Street, building, apartment"
                  />
                </div>
                <div>
                  <Label htmlFor="city">CITY</Label>
                  <Input
                    id="city"
                    required
                    value={form.city}
                    onChange={(event) => setForm({ ...form, city: event.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="country">COUNTRY</Label>
                  <Select
                    id="country"
                    value={form.country}
                    onChange={(event) => setForm({ ...form, country: event.target.value })}
                  >
                    {[
                      "Algeria",
                      "France",
                      "Belgium",
                      "Netherlands",
                      "Germany",
                      "Spain",
                      "Italy",
                      "United Kingdom",
                      "United Arab Emirates",
                      "Canada",
                      "United States",
                      "Other",
                    ].map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="postalCode">POSTAL CODE</Label>
                  <Input
                    id="postalCode"
                    value={form.postalCode}
                    onChange={(event) => setForm({ ...form, postalCode: event.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="note">ORDER NOTE</Label>
                  <Input
                    id="note"
                    value={form.note}
                    onChange={(event) => setForm({ ...form, note: event.target.value })}
                    placeholder="Anything the studio should know"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
                03 · PAYMENT
              </p>
              <div
                className={cn(
                  "mt-5 border p-5",
                  cardPayments === false ? "border-red-batel/40 bg-red-batel/[0.05]" : "border-white/12",
                )}
              >
                <div className="flex items-start gap-3">
                  {cardPayments ? (
                    <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-red-batel" />
                  ) : (
                    <Lock className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
                  )}
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/50">
                      {cardPayments ? "SECURE CARD PAYMENT · STRIPE" : "PAYMENT · ON INVOICE"}
                    </p>
                    <p className="mt-2.5 text-[12px] leading-relaxed text-white/50">
                      {cardPayments
                        ? "Placing the order reserves your number and opens Stripe's hosted checkout. Card details are entered on Stripe — they never touch this site. Your number is held for 30 minutes while you pay."
                        : cardPayments === null
                          ? "Checking how this store takes payment…"
                          : "Card payment is not connected yet. You can still reserve your number — the order is registered as pending and the studio invoices it by email."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" disabled={busy} className="w-full sm:w-auto">
              {busy
                ? cardPayments
                  ? "OPENING STRIPE…"
                  : "RESERVING…"
                : cardPayments
                  ? "PAY & CLAIM YOUR NUMBER"
                  : "PLACE ORDER & RESERVE SERIAL"}
            </Button>
          </form>

          <aside className="lg:sticky lg:top-[110px] lg:self-start">
            <div className="border border-white/12">
              <p className="border-b border-white/10 px-5 py-4 font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
                YOUR ORDER
              </p>
              <div className="max-h-[320px] overflow-y-auto">
                {items.map((item) => (
                  <div key={item.key} className="flex gap-4 border-b border-white/[0.07] px-5 py-4">
                    <div className="h-20 w-16 shrink-0 overflow-hidden border border-white/10 bg-graphite">
                      <ProductImage src={item.image} alt={item.name} serial={item.serial} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-[14px] uppercase tracking-wide text-white">
                        {item.name}
                      </p>
                      <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">
                        {item.size ? `SIZE ${item.size}` : "ONE SIZE"} · QTY {item.quantity}
                      </p>
                      {item.serial ? (
                        <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-red-batel">
                          {item.serial}
                        </p>
                      ) : null}
                    </div>
                    <span className="font-mono text-[11px] text-white/80">
                      {formatPrice(item.price * item.quantity, currency)}
                    </span>
                  </div>
                ))}
              </div>
              <dl className="space-y-3 px-5 py-5">
                <div className="flex justify-between">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                    SUBTOTAL
                  </dt>
                  <dd className="font-mono text-[12px] text-white">{formatPrice(subtotal, currency)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                    SHIPPING
                  </dt>
                  <dd className="font-mono text-[12px] text-white">
                    {shipping === 0 ? "FREE" : formatPrice(shipping, currency)}
                  </dd>
                </div>
                <div className="flex items-end justify-between border-t border-white/10 pt-4">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.24em] text-white">TOTAL</dt>
                  <dd className="font-display text-[26px] leading-none text-white">
                    {formatPrice(total, currency)}
                  </dd>
                </div>
              </dl>
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-white/35">
              {settings?.settings?.shippingInfo ?? "Shipped worldwide from the studio."}
              {remaining > 0 ? ` Add ${formatPrice(remaining, currency)} for free shipping.` : ""}
            </p>
          </aside>
        </div>
      </section>
    </div>
  );
}

# EL BATEL

Numbered streetwear from the studio of **EL BATEL**. Every limited piece exists in a fixed run,
carries its own serial number, and is registered to the person who bought it.

Black and white, with red used only where it matters: the serial, the seam, the active state.

## Stack

- **Vite + React 19 + TypeScript** storefront (Tailwind, shadcn/ui primitives, Framer Motion)
- **Three.js / React Three Fiber** for the 3D scenes (hero collector tag, drop package)
- **Convex** for the database, auth and all business logic
- **Stripe** for hosted card checkout

## Getting started

```bash
bun install
bun convex dev          # runs the local deployment + generates types
```

The store boots empty. Seed it once (idempotent — pass `reset:true` to rebuild the catalogue):

```bash
bun convex run seedActions:run '{"reset":false}'
```

That creates the three collections, twelve products, four numbered editions and their serial
rows, all editable site copy, and the studio admin account.

### Studio access

The admin dashboard lives at `/admin` and is restricted to accounts on the admin allow-list.

- Seeded email: `admin@elbatel.com`
- Seeded password: `ADMIN_PASSWORD`, or `elbatel-drop-001` when that variable is not set
- Change it from **/admin → Settings** after the first sign-in

## Payments (Stripe)

Set these in **Settings → Environment**:

| Key | Purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` | Server-side key. Required — checkout offers card payment only when it is present. |
| `STRIPE_WEBHOOK_SECRET` | Only needed once the webhook below is wired up. |

Billing keys are read inside Convex actions (`src/convex/payments.ts`, a `"use node"` module), so
the secret never reaches the browser.

### How the flow works

1. **The store places the order first.** `orders.checkout` is the only thing allowed to price a
   cart, validate serial holds and commit inventory. The client can never dictate a price.
2. **Then Stripe hosts the payment.** `payments.startCheckout` opens a Checkout Session for that
   exact total and returns its URL; the storefront redirects to it. Card details are entered on
   Stripe and never touch this site.
3. **The return page settles the order.** Stripe sends the buyer back to
   `/checkout/success?order=…&session_id=…`, where `payments.confirmCheckout` re-reads the session
   from the Stripe API and only marks the order paid when Stripe reports it settled. The action is
   idempotent, so a refresh cannot double-commit anything.
4. **Abandoned payments unwind themselves.** The checkout stores the pending order in
   sessionStorage; returning to `/checkout?cancelled=1` calls `orders.releaseUnpaid` (guarded by
   both order number and email) which cancels the order and puts its numbers back in the drop.

Without `STRIPE_SECRET_KEY` the store stays usable: checkout falls back to reserving the number as a
pending, unpaid order that the studio invoices by email. `Admin → Orders` can mark such an order
paid, which commits its serials the same way Stripe does.

### Webhook (recommended next step)

The return-page confirmation covers the normal path. To also settle orders when a buyer pays and
closes the tab before returning, add an HTTP action at `/stripe-webhook` that verifies
`STRIPE_WEBHOOK_SECRET` and calls the same `paymentsInternal.markPaid` mutation on
`checkout.session.completed`. It needs a publicly reachable Convex deployment.

## The serial number model

- A serial is **available** → **reserved** → **sold**, and never goes back once paid.
- Adding a limited piece to a bag holds a number for 45 minutes.
- A number held by an order awaiting payment is protected for 30 minutes, then released.
- Serials are unique by index lookup on write, so the same code can never be sold twice.
- A piece is only marked **sold** when its payment settles — cancelled orders return their numbers
  to the drop.

## Routes

`/` · `/shop` · `/product/:id` · `/collections` · `/collections/:slug` · `/limited-drops` · `/about`
· `/music` · `/contact` · `/cart` · `/checkout` · `/checkout/success` · `/account` · `/legal/:doc`
· `/auth` · `/admin`

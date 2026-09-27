/**
 * The order that is currently out at Stripe waiting to be paid. Kept in
 * sessionStorage so the checkout and the Stripe return page can agree on what
 * to unwind if the buyer walks away from the payment page.
 */

const PENDING_ORDER_KEY = "elbatel.pendingOrder";

export type PendingOrder = { orderNumber: string; email: string };

export function savePendingOrder(pending: PendingOrder) {
  try {
    sessionStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(pending));
  } catch {
    /* private mode — the checkout still works, it just cannot be unwound */
  }
}

export function readPendingOrder(): PendingOrder | null {
  try {
    const raw = sessionStorage.getItem(PENDING_ORDER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingOrder;
    if (!parsed?.orderNumber || !parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingOrder() {
  try {
    sessionStorage.removeItem(PENDING_ORDER_KEY);
  } catch {
    /* ignore */
  }
}

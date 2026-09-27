import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const CART_KEY = "elbatel.cart.v1";

export type CartItem = {
  key: string;
  productId: Id<"products">;
  slug: string;
  name: string;
  collectionName: string | null;
  price: number;
  size: string | null;
  quantity: number;
  image: string | null;
  limited: boolean;
  serialId: Id<"serial_numbers"> | null;
  serial: string | null;
};

export type AddToCartInput = {
  productId: Id<"products">;
  slug: string;
  name: string;
  collectionName?: string | null;
  price: number;
  size?: string | null;
  image?: string | null;
  limited: boolean;
  /** Optional: the exact number the collector picked on the product page. */
  serialId?: Id<"serial_numbers"> | null;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  freeShippingThreshold: number;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  adding: boolean;
  add: (input: AddToCartInput) => Promise<CartItem | null>;
  remove: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  itemKey: (productId: string, size?: string | null) => string;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStored(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readStored());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  const settings = useQuery(api.catalog.getSettings, {});
  const reserve = useMutation(api.serials.reserveForCart);
  const reserveOne = useMutation(api.serials.reserveSerial);
  const release = useMutation(api.serials.release);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota errors */
    }
  }, [items]);

  const itemKey = useCallback(
    (productId: string, size?: string | null) => `${productId}::${size ?? "one"}`,
    [],
  );

  const add = useCallback(
    async (input: AddToCartInput) => {
      setAdding(true);
      try {
        const key = itemKey(input.productId, input.size);
        let serialId: Id<"serial_numbers"> | null = null;
        let serial: string | null = null;

        if (input.limited) {
          // Limited pieces are numbered: hold a serial while it sits in the cart.
          const existing = items.find((i) => i.key === key);
          if (existing?.serialId) {
            serialId = existing.serialId;
            serial = existing.serial;
          } else if (input.serialId) {
            const reserved = await reserveOne({ serialId: input.serialId });
            serialId = reserved.serialId;
            serial = reserved.serial;
          } else {
            const reserved = await reserve({ productId: input.productId });
            serialId = reserved.serialId ?? null;
            serial = reserved.serial ?? null;
          }
        }

        let created: CartItem | null = null;
        setItems((current) => {
          const existingIndex = current.findIndex((i) => i.key === key);
          if (existingIndex >= 0 && !input.limited) {
            const next = [...current];
            next[existingIndex] = {
              ...next[existingIndex],
              quantity: Math.min(10, next[existingIndex].quantity + 1),
            };
            created = next[existingIndex];
            return next;
          }
          const item: CartItem = {
            key,
            productId: input.productId,
            slug: input.slug,
            name: input.name,
            collectionName: input.collectionName ?? null,
            price: input.price,
            size: input.size ?? null,
            quantity: 1,
            image: input.image ?? null,
            limited: input.limited,
            serialId,
            serial,
          };
          created = item;
          if (existingIndex >= 0) {
            const next = [...current];
            next[existingIndex] = item;
            return next;
          }
          return [...current, item];
        });
        setDrawerOpen(true);
        return created;
      } finally {
        setAdding(false);
      }
    },
    [itemKey, items, reserve, reserveOne],
  );

  const remove = useCallback(
    (key: string) => {
      setItems((current) => {
        const target = current.find((i) => i.key === key);
        if (target?.serialId) {
          // Free the number so another collector can hold it.
          release({ serialId: target.serialId }).catch(() => undefined);
        }
        return current.filter((i) => i.key !== key);
      });
    },
    [release],
  );

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((current) =>
      current.map((item) =>
        item.key === key
          ? { ...item, quantity: Math.max(1, Math.min(item.limited ? 1 : 10, quantity)) }
          : item,
      ),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const shippingFlatRate = settings?.settings?.shippingFlatRate ?? 1200;
  const freeShippingThreshold = settings?.settings?.freeShippingThreshold ?? 25000;
  const currency = settings?.settings?.currency ?? "EUR";
  const shipping =
    items.length === 0 || subtotal >= freeShippingThreshold ? 0 : shippingFlatRate;

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      currency,
      freeShippingThreshold,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      adding,
      add,
      remove,
      setQuantity,
      clear,
      itemKey,
    }),
    [
      items,
      subtotal,
      shipping,
      currency,
      freeShippingThreshold,
      drawerOpen,
      adding,
      add,
      remove,
      setQuantity,
      clear,
      itemKey,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

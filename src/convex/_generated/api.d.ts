/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminCatalog from "../adminCatalog.js";
import type * as adminContent from "../adminContent.js";
import type * as auth from "../auth.js";
import type * as authActions from "../authActions.js";
import type * as authInternal from "../authInternal.js";
import type * as catalog from "../catalog.js";
import type * as lib from "../lib.js";
import type * as orders from "../orders.js";
import type * as payments from "../payments.js";
import type * as paymentsInternal from "../paymentsInternal.js";
import type * as seed from "../seed.js";
import type * as seedActions from "../seedActions.js";
import type * as serials from "../serials.js";
import type * as translations from "../translations.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adminCatalog: typeof adminCatalog;
  adminContent: typeof adminContent;
  auth: typeof auth;
  authActions: typeof authActions;
  authInternal: typeof authInternal;
  catalog: typeof catalog;
  lib: typeof lib;
  orders: typeof orders;
  payments: typeof payments;
  paymentsInternal: typeof paymentsInternal;
  seed: typeof seed;
  seedActions: typeof seedActions;
  serials: typeof serials;
  translations: typeof translations;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

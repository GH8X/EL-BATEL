import { Navigate, Route, Routes } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { RequireAdmin, RequireAuth } from "@/components/RequireAuth";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import Product from "@/pages/Product";
import Collections from "@/pages/Collections";
import CollectionDetail from "@/pages/CollectionDetail";
import LimitedDrops from "@/pages/LimitedDrops";
import About from "@/pages/About";
import Music from "@/pages/Music";
import Contact from "@/pages/Contact";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import Auth from "@/pages/Auth";
import Account from "@/pages/Account";
import Legal from "@/pages/Legal";
import NotFound from "@/pages/NotFound";
import AdminLayout from "@/pages/admin/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminSerials from "@/pages/admin/AdminSerials";
import AdminCollections from "@/pages/admin/AdminCollections";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminHomepage from "@/pages/admin/AdminHomepage";
import AdminMusic from "@/pages/admin/AdminMusic";
import AdminAbout from "@/pages/admin/AdminAbout";
import AdminSocials from "@/pages/admin/AdminSocials";
import AdminSettings from "@/pages/admin/AdminSettings";

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/collections/:slug" element={<CollectionDetail />} />
        <Route path="/limited-drops" element={<LimitedDrops />} />
        <Route path="/about" element={<About />} />
        <Route path="/music" element={<Music />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/legal/:doc" element={<Legal />} />
        <Route element={<RequireAuth />}>
          <Route path="/account" element={<Account />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<RequireAdmin />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="serials" element={<AdminSerials />} />
          <Route path="collections" element={<AdminCollections />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="homepage" element={<AdminHomepage />} />
          <Route path="music" element={<AdminMusic />} />
          <Route path="about" element={<AdminAbout />} />
          <Route path="socials" element={<AdminSocials />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route path="/dashboard" element={<Navigate to="/account" replace />} />
    </Routes>
  );
}

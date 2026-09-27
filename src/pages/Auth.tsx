import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Reveal } from "@/components/site/motion";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

export default function Auth() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { signIn, signUp, isAuthenticated, user, isAdmin } = useAuth();
  const site = useQuery(api.catalog.getSettings, {});

  const returnTo = params.get("returnTo");
  const initialMode = params.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);

  // Where a signed-in visitor lands when no specific path was requested.
  const redirectAfterAuth = useMemo(() => {
    if (returnTo) return returnTo;
    if (isAdmin) return "/admin";
    return "/account";
  }, [returnTo, isAdmin]);

  useEffect(() => {
    if (isAuthenticated) navigate(redirectAfterAuth, { replace: true });
  }, [isAuthenticated, redirectAfterAuth, navigate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(form.email, form.password);
        toast.success("Signed in");
      } else {
        await signUp(form.email, form.password, form.name || undefined);
        toast.success("Account created");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pt-[68px]">
      <section className="relative overflow-hidden border-b border-white/10 bg-black">
        <div className="pointer-events-none absolute -right-24 top-0 h-[380px] w-[380px] rounded-full bg-red-batel/10 blur-[130px]" />
        <div className="container relative grid gap-14 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
          <Reveal>
            <span className="eyebrow">EL BATEL · ACCOUNT</span>
            <h1 className="mt-5 font-display text-[52px] leading-[0.84] tracking-mega text-white sm:text-[92px]">
              {mode === "signin" ? "WELCOME\nBACK" : "JOIN THE\nARCHIVE"}
            </h1>
            <p className="mt-7 max-w-md text-[14px] leading-relaxed text-white/50">
              An account keeps every serial you own on record — your numbers stay yours, even years
              after the edition closes.
            </p>

            <ul className="mt-9 space-y-3.5">
              {[
                "Order history with every serial number you own",
                "Faster checkout with saved details",
                "Early access to limited drops",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3 text-[13px] text-white/55">
                  <span className="mt-1.5 h-1 w-1 shrink-0 bg-red-batel" />
                  {line}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex items-start gap-3 border border-white/10 p-5">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
              <p className="text-[12px] leading-relaxed text-white/45">
                Studio access is restricted. Only accounts on the EL BATEL admin allow-list can open{" "}
                <Link to="/admin" className="font-mono text-white/70 underline-offset-4 hover:underline">
                  /admin
                </Link>
                .
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="border border-white/12 bg-white/[0.015] p-7 sm:p-9">
              <div className="flex items-center gap-6 border-b border-white/10 pb-5">
                {(["signin", "signup"] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMode(key)}
                    className={cn(
                      "relative pb-3 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors",
                      mode === key ? "text-white" : "text-white/40 hover:text-white/70",
                    )}
                  >
                    {key === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
                    {mode === key ? (
                      <span className="absolute inset-x-0 bottom-0 h-px bg-red-batel" />
                    ) : null}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="mt-7 space-y-5">
                {mode === "signup" ? (
                  <div>
                    <Label htmlFor="name">FULL NAME</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      placeholder="Your name"
                      autoComplete="name"
                    />
                  </div>
                ) : null}
                <div>
                  <Label htmlFor="email">EMAIL</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    placeholder="you@email.com"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <Label htmlFor="password">PASSWORD</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    placeholder="At least 8 characters"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  />
                </div>

                <Button type="submit" size="block" disabled={busy}>
                  {busy ? "PLEASE WAIT…" : mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
                </Button>
              </form>

              <p className="mt-6 text-[11px] leading-relaxed text-white/35">
                {site?.settings?.contactEmail
                  ? `Trouble signing in? Write to ${site.settings.contactEmail}.`
                  : "Passwords are stored hashed with a per-account salt."}
              </p>

              {user ? (
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
                  SIGNED IN AS {user.email}
                </p>
              ) : null}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

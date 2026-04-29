import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api, tokenStore } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Ադմին" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const [authState, setAuthState] = useState<"loading" | "unauth" | "auth-no-role" | "admin">("loading");
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const check = async () => {
    if (!tokenStore.get()) { setAuthState("unauth"); return; }
    try {
      const me = await api.me();
      setAuthState(me.role === "admin" ? "admin" : "auth-no-role");
    } catch {
      tokenStore.clear();
      setAuthState("unauth");
    }
  };

  useEffect(() => { check(); }, []);

  if (authState === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Բեռնվում է...</div>;
  }

  if (authState !== "admin") {
    return <AuthScreen authState={authState} onLoggedIn={check} />;
  }

  const tabs = [
    { to: "/admin", label: "Կարգավորումներ" },
    { to: "/admin/events", label: "Իրադարձություններ" },
    { to: "/admin/rsvps", label: "Պատասխաններ" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <h1 className="font-display text-2xl text-rose-deep">Ադմին վահանակ</h1>
          <div className="flex gap-2 items-center flex-wrap">
            {tabs.map((t) => (
              <Link key={t.to} to={t.to} className={`px-3 py-1.5 rounded-md text-sm transition ${path === t.to ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                {t.label}
              </Link>
            ))}
            <Button variant="ghost" size="sm" onClick={() => { tokenStore.clear(); setAuthState("unauth"); navigate({ to: "/admin" }); }}>Ելք</Button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
}

function AuthScreen({ authState, onLoggedIn }: { authState: "unauth" | "auth-no-role"; onLoggedIn: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = mode === "signup" ? await api.signup(email, password) : await api.login(email, password);
      tokenStore.set(res.token);
      if (mode === "signup") {
        toast.success("Հաշիվ ստեղծվեց։ Ադմին իրավունքը պետք է տրվի սերվերում (DB-ում փոխեք role='admin')։");
      }
      onLoggedIn();
    } catch (err: any) {
      toast.error(err.message || "Սխալ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-soft">
      <div className="w-full max-w-md bg-card rounded-3xl p-8 shadow-romantic border">
        <h1 className="font-display text-3xl text-rose-deep text-center mb-2">Ադմին մուտք</h1>
        {authState === "auth-no-role" ? (
          <div className="text-sm text-center text-muted-foreground mb-4">
            <p>Ձեր հաշիվը չունի ադմին իրավունք։</p>
            <p className="mt-2">Փոխեք ձեր օգտատիրոջ <code className="text-xs bg-muted px-1 rounded">role</code>-ը <code className="text-xs bg-muted px-1 rounded">admin</code> PostgreSQL-ում, կամ վերագործարկեք seed-ը։</p>
            <Button variant="ghost" className="mt-4" onClick={() => { tokenStore.clear(); window.location.reload(); }}>Ելք</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="email">Էլ. փոստ</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Գաղտնաբառ</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "..." : mode === "login" ? "Մուտք" : "Գրանցում"}
            </Button>
            <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-sm text-muted-foreground hover:text-foreground w-full text-center">
              {mode === "login" ? "Չունեմ հաշիվ — գրանցվել" : "Արդեն ունեմ հաշիվ — մուտք"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — HireSmart" }] }),
  component: LoginPage,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  const emailError = !EMAIL_RE.test(email) ? "Enter a valid email address" : "";
  const passwordError = password.length < 8 ? "Password must be at least 8 characters" : "";
  const valid = !emailError && !passwordError;

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-primary text-white">
            <span className="font-bold">H</span>
          </div>
          <span className="text-lg text-brand-primary">
            <span className="font-normal">Hire</span>
            <span className="font-semibold">Smart</span>
          </span>
        </div>
        <h1 className="text-xl font-semibold text-brand-text">Welcome back</h1>
        <p className="mt-1 text-sm text-brand-text-secondary">
          Sign in to your recruitment workspace.
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setTouched({ email: true, password: true });
            if (!valid) return;
            window.location.href = "/dashboard";
          }}
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              placeholder="you@agency.com"
              className="mt-1"
              maxLength={255}
            />
            {touched.email && emailError && (
              <p className="mt-1 text-xs text-status-danger">{emailError}</p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              placeholder="••••••••"
              className="mt-1"
              maxLength={128}
            />
            {touched.password && passwordError && (
              <p className="mt-1 text-xs text-status-danger">{passwordError}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={!valid}>
            Sign in
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-brand-text-secondary">
          New here?{" "}
          <Link to="/signup" className="text-brand-primary underline-offset-2 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

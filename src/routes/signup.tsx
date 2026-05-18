import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — HireSmart" }] }),
  component: SignupPage,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SignupPage() {
  const [name, setName] = useState("");
  const [agency, setAgency] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = {
    name: name.trim().length === 0 ? "Full name is required" : "",
    agency: agency.trim().length === 0 ? "Agency name is required" : "",
    email: !EMAIL_RE.test(email) ? "Enter a valid email address" : "",
    password: password.length < 8 ? "Password must be at least 8 characters" : "",
  };
  const valid = Object.values(errors).every((e) => !e);
  const showErr = (k: keyof typeof errors) => touched[k] && errors[k];

  const fieldBlur = (k: keyof typeof errors) =>
    setTouched((t) => ({ ...t, [k]: true }));

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
        <h1 className="text-xl font-semibold text-brand-text">Create your workspace</h1>
        <p className="mt-1 text-sm text-brand-text-secondary">
          Spin up an AI-native recruitment OS for your agency.
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setTouched({ name: true, agency: true, email: true, password: true });
            if (!valid) return;
            window.location.href = "/dashboard";
          }}
        >
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => fieldBlur("name")} placeholder="Priya Sharma" className="mt-1" maxLength={100} />
            {showErr("name") && <p className="mt-1 text-xs text-status-danger">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="agency">Agency name</Label>
            <Input id="agency" value={agency} onChange={(e) => setAgency(e.target.value)} onBlur={() => fieldBlur("agency")} placeholder="Norvex Solutions" className="mt-1" maxLength={120} />
            {showErr("agency") && <p className="mt-1 text-xs text-status-danger">{errors.agency}</p>}
          </div>
          <div>
            <Label htmlFor="email">Work email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => fieldBlur("email")} placeholder="you@agency.com" className="mt-1" maxLength={255} />
            {showErr("email") && <p className="mt-1 text-xs text-status-danger">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => fieldBlur("password")} placeholder="At least 8 characters" className="mt-1" maxLength={128} />
            {showErr("password") && <p className="mt-1 text-xs text-status-danger">{errors.password}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={!valid}>
            Create workspace
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-brand-text-secondary">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-primary underline-offset-2 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — HireSmart" }] }),
  component: SignupPage,
});

function SignupPage() {
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
            window.location.href = "/dashboard";
          }}
        >
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" placeholder="Priya Sharma" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="agency">Agency name</Label>
            <Input id="agency" placeholder="Norvex Solutions" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="email">Work email</Label>
            <Input id="email" type="email" placeholder="you@agency.com" className="mt-1" />
          </div>
          <Button type="submit" className="w-full">Create workspace</Button>
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

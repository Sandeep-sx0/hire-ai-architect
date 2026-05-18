import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Mail, MessageCircle, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";

function Wordmark({ className }: { className?: string }) {
  return (
    <Link to="/jobs" className={cn("text-lg leading-none", className)}>
      <span className="font-normal">Hire</span>
      <span className="font-semibold">Smart</span>
    </Link>
  );
}

function PublicHeader({ clientName, portalLabel }: { clientName?: string; portalLabel?: string }) {
  const [open, setOpen] = useState(false);
  const navLinks = [
    { to: "/jobs", label: "Open positions" },
    { to: "/site/about", label: "About" },
    { to: "/site/contact", label: "Contact" },
  ] as const;

  const isPortal = Boolean(clientName);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6 md:h-16">
        <Wordmark className="text-brand-primary" />

        {isPortal ? (
          <div className="hidden flex-1 justify-center md:flex">
            <span className="text-[13px] text-brand-text-secondary">{portalLabel ?? "Employer Portal"}</span>
          </div>
        ) : (
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm text-brand-text-secondary transition-colors hover:text-brand-primary"
                activeProps={{ className: "text-sm text-brand-primary font-medium" }}
                activeOptions={{ exact: true }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="hidden md:block">
          {isPortal ? (
            <span className="text-sm font-medium text-brand-text">{clientName}</span>
          ) : (
            <Link
              to="/hire/$token"
              params={{ token: "demo" }}
              className="text-sm font-medium text-brand-primary hover:underline"
            >
              I'm a hiring client
            </Link>
          )}
        </div>

        <button
          type="button"
          aria-label="Open menu"
          className="rounded-md p-2 text-brand-text md:hidden"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white md:hidden">
          <div className="flex h-14 items-center justify-between border-b border-gray-100 px-6">
            <Wordmark className="text-brand-primary" />
            <button
              type="button"
              aria-label="Close menu"
              className="rounded-md p-2"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 p-6">
            {isPortal ? (
              <div className="rounded-lg bg-brand-seafoam/20 px-3 py-3 text-center text-base font-medium text-brand-text">
                {clientName}
                <div className="mt-1 text-xs font-normal text-brand-text-secondary">{portalLabel ?? "Employer Portal"}</div>
              </div>
            ) : (
              <>
                {navLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-base text-brand-text hover:bg-brand-seafoam/20"
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  to="/hire/$token"
                  params={{ token: "demo" }}
                  onClick={() => setOpen(false)}
                  className="mt-4 rounded-lg bg-brand-primary px-3 py-3 text-center text-base font-medium text-white"
                >
                  I'm a hiring client
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="bg-brand-primary text-white">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-12 md:grid-cols-3">
        <div>
          <div className="text-lg leading-none">
            <span className="font-normal">Hire</span>
            <span className="font-semibold">Smart</span>
          </div>
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-white/70">
            AI-powered recruitment made smart, fast, and human.
          </p>
          <p className="mt-6 text-xs text-white/50">
            © 2026 HireSmart. All rights reserved.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-white">Explore</h3>
          <ul className="mt-4 space-y-2 text-[13px] text-white/70">
            <li><Link to="/jobs" className="hover:text-white">Open positions</Link></li>
            <li><Link to="/hire/$token" params={{ token: "demo" }} className="hover:text-white">For hiring clients</Link></li>
            <li><Link to="/site/about" className="hover:text-white">About</Link></li>
            <li><Link to="/site/contact" className="hover:text-white">Contact</Link></li>
            <li><a className="hover:text-white" href="#">Privacy policy</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium text-white">Contact</h3>
          <ul className="mt-4 space-y-3 text-[13px] text-white/80">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-white/60" />
              <a className="hover:text-white" href="mailto:hello@hiresmart.com">hello@hiresmart.com</a>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 shrink-0 text-white/60" />
              <a className="hover:text-white" href="https://wa.me/628194421035" target="_blank" rel="noreferrer">
                +62 819 4421 0355
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Linkedin className="h-4 w-4 shrink-0 text-white/60" />
              <a className="hover:text-white" href="#">LinkedIn</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout({ children, clientName, portalLabel }: { children: ReactNode; clientName?: string; portalLabel?: string }) {
  return (
    <div className="flex min-h-screen flex-col bg-brand-bg">
      <PublicHeader clientName={clientName} portalLabel={portalLabel} />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}

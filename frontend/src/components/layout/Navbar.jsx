import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { hasClerk } from "../../lib/config";

const links = [
  { to: "/#features", label: "Features" },
  { to: "/#pricing", label: "Pricing" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-white">
          <img src="/logo.svg" alt="" className="h-8 w-8" />
          Devlyst
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <a key={link.to} href={link.to} className="text-sm text-zinc-400 hover:text-white">
              {link.label}
            </a>
          ))}
          {hasClerk ? (
            <>
              <SignedOut>
                <Link to="/sign-in" className="text-sm text-zinc-300 hover:text-white">Sign in</Link>
                <Link to="/sign-up" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-950">Get started</Link>
              </SignedOut>
              <SignedIn>
                <NavLink to="/dashboard" className="text-sm text-zinc-300 hover:text-white">Dashboard</NavLink>
                <UserButton />
              </SignedIn>
            </>
          ) : (
            <Link to="/dashboard" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-950">Open editor</Link>
          )}
        </div>
        <button className="rounded-lg bg-white/5 p-2 text-zinc-300 md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
      {open && (
        <div className="space-y-3 border-t border-white/10 px-4 py-4 md:hidden">
          <Link to="/dashboard" className="block text-sm text-zinc-300" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link to="/sign-in" className="block text-sm text-zinc-300" onClick={() => setOpen(false)}>Sign in</Link>
        </div>
      )}
    </header>
  );
}

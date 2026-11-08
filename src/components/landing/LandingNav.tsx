import Link from "next/link";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#faq", label: "FAQ" },
];

export function LandingNav({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6" aria-label="Main">
        <Link href="/" className="rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
          <Brand />
        </Link>
        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Button asChild size="sm" variant={signedIn ? "default" : "outline"}>
            <Link href={signedIn ? "/dashboard" : "/sign-in"}>{signedIn ? "Open dashboard" : "Sign in"}</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}

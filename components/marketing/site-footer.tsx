import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/#product", label: "Overview" },
      { href: "/#service", label: "Service" },
      { href: "/#scales", label: "Who it's for" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/register", label: "Get started" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-ink/5 bg-fog">
      <Container className="flex flex-col gap-10 py-12 md:flex-row md:justify-between">
        <div className="flex max-w-xs flex-col gap-3">
          <Logo />
          <p className="text-caption text-muted-stone text-pretty">
            Indoor food-growing within reach — from a kitchen herb shelf to
            industrial systems.
          </p>
        </div>

        <div className="flex gap-16">
          {COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <span className="text-caption font-medium text-ink">{col.title}</span>
              {col.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-caption text-muted-stone transition-colors hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </Container>
      <Container className="border-t border-ink/5 py-6">
        <p className="text-caption text-light-steel">
          © {new Date().getFullYear()} Catarina. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}

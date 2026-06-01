import { Logo } from "@/components/ui/logo";

/** Minimal centered shell for auth screens — no marketing nav. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-fog px-6 py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <Logo />
        {children}
      </div>
    </main>
  );
}

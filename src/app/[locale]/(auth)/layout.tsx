import { LanguageSwitcher } from "@/components/language-switcher";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-brand-deep text-white">
      <div className="flex justify-end px-6 pt-4">
        <LanguageSwitcher />
      </div>
      {children}
    </div>
  );
}

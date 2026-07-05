import { LanguageSwitcher } from "@/components/language-switcher";

export default function TeamJoinLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-brand-deep text-white">
      <div className="flex justify-end px-6 pt-4">
        <LanguageSwitcher />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

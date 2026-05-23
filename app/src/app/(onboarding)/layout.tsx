'use client';

import { LanguageProvider } from '@/hooks/useLanguage';

export default function OnboardingGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-slate-50">{children}</div>
    </LanguageProvider>
  );
}

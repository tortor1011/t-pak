import OnboardingWizard from "./_components/OnboardingWizard";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden">
        <OnboardingWizard />
      </div>
    </div>
  );
}

'use client';

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export default function PageHeader({ title, onBack, rightAction }: PageHeaderProps) {
  return (
    <header className="w-full top-0 sticky z-40 bg-white shadow-[0_20px_50px_rgba(18,28,40,0.05)] flex justify-between items-center px-6 py-4">
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="active:scale-95 duration-200 text-slate-500"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
        )}
        <h1 className="text-xl font-bold tracking-tight text-on-surface">{title}</h1>
      </div>
      {rightAction && (
        <div className="flex items-center gap-3">{rightAction}</div>
      )}
    </header>
  );
}

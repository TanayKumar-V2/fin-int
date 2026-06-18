import { Briefcase, Activity } from 'lucide-react';

export function TopBar() {
  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2">
        <div className="bg-cyan/10 p-1.5 rounded-md">
          <Briefcase className="w-5 h-5 text-cyan" />
        </div>
        <h1 className="text-lg font-bold text-text tracking-tight">DueDiligence<span className="text-cyan">AI</span></h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-medium text-emerald bg-emerald/10 px-2.5 py-1.5 rounded-full border border-emerald/20">
          <Activity className="w-3.5 h-3.5" />
          <span>System Online</span>
        </div>
      </div>
    </header>
  );
}

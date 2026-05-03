import { Sparkles } from "lucide-react";

export function CRMPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/80">{eyebrow}</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/8 px-2 py-0.5 text-[10px] font-semibold text-primary">
            <Sparkles className="h-2.5 w-2.5" /> IA ativa
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-black tracking-tight md:text-[40px] md:leading-[1.05]">
          {title}<span className="text-gradient-primary">.</span>
        </h1>
        {description && <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

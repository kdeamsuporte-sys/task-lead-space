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
    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end md:justify-between md:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.22em] text-primary/80 truncate">{eyebrow}</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/8 px-2 py-0.5 text-[10px] font-semibold text-primary">
            <Sparkles className="h-2.5 w-2.5" /> IA ativa
          </span>
        </div>
        <h1 className="mt-1.5 text-xl font-black tracking-tight sm:text-2xl md:text-[34px] lg:text-[40px] md:leading-[1.05] break-words">
          {title}<span className="text-gradient-primary">.</span>
        </h1>
        {description && <p className="mt-1.5 max-w-xl text-[12px] sm:text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && (
        <div className="-mx-3 sm:mx-0 px-3 sm:px-0 flex md:flex-wrap items-center gap-2 overflow-x-auto md:overflow-visible no-scrollbar [&>*]:min-h-[36px] [&>*]:shrink-0 md:[&>*]:shrink">
          {actions}
        </div>
      )}
    </div>
  );
}

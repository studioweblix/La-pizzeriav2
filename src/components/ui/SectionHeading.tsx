interface SectionHeadingProps {
  title: string;
  light?: boolean;
  className?: string;
}

export function SectionHeading({ title, light = true, className = "" }: SectionHeadingProps) {
  return (
    <div className={`text-center ${className}`}>
      <h2
        className={`font-heading text-3xl font-medium tracking-wide md:text-4xl lg:text-5xl ${
          light ? "text-white" : "text-neutral-900"
        }`}
        style={{ fontFamily: "var(--font-heading), serif" }}
      >
        {title}
      </h2>
      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="h-px w-8 bg-[var(--color-secondary)]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-secondary)]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-secondary)]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-secondary)]" />
        <span className="h-px w-8 bg-[var(--color-secondary)]" />
      </div>
    </div>
  );
}

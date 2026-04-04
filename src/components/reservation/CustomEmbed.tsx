"use client";

import { useEffect, useRef } from "react";

interface CustomEmbedProps {
  code: string;
}

export function CustomEmbed({ code }: CustomEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !code) return;
    const container = containerRef.current;

    container.innerHTML = code;

    const scripts = container.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value)
      );
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });

    return () => {
      container.innerHTML = "";
    };
  }, [code]);

  if (!code) {
    return (
      <div className="rounded border border-white/10 bg-[var(--color-dark-card)] px-6 py-12 text-center">
        <p className="text-sm text-white/40">
          Kein Embed-Code hinterlegt. Bitte im Dashboard unter{" "}
          <code className="text-[var(--color-secondary)]">reservation_widget_code</code>{" "}
          den HTML/Script-Code eintragen.
        </p>
      </div>
    );
  }

  return <div ref={containerRef} className="min-h-[300px]" />;
}

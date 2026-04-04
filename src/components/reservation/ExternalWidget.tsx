"use client";

import { useEffect, useRef } from "react";
import type { ReservationType } from "@/types";

interface ExternalWidgetProps {
  provider: ReservationType;
  externalId: string;
}

function QuandooWidget({ merchantId }: { merchantId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const div = document.createElement("div");
    div.id = "quandoo-booking-widget";
    div.setAttribute("data-merchant-id", merchantId);
    container.appendChild(div);

    const script = document.createElement("script");
    script.src = "https://booking-widget.quandoo.com/index.js";
    script.async = true;
    script.setAttribute("data-merchant-id", merchantId);
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [merchantId]);

  return <div ref={containerRef} className="min-h-[500px]" />;
}

function OpenTableWidget({ restaurantId }: { restaurantId: string }) {
  return (
    <div className="flex justify-center">
      <iframe
        src={`https://www.opentable.com/widget/reservation/loader?rid=${restaurantId}&type=standard&theme=tall&iframe=true&domain=com&lang=de-DE&overlay=false`}
        width="100%"
        height="520"
        frameBorder="0"
        className="max-w-md rounded"
        title="OpenTable Reservierung"
      />
    </div>
  );
}

function ResyWidget({ venueId }: { venueId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const div = document.createElement("div");
    div.id = "resy-widget";
    div.setAttribute("data-resy-venue", venueId);
    container.appendChild(div);

    const script = document.createElement("script");
    script.src = "https://widgets.resy.com/embed.js";
    script.async = true;
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [venueId]);

  return <div ref={containerRef} className="min-h-[400px]" />;
}

function FormitableWidget({ restaurantUid }: { restaurantUid: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const div = document.createElement("div");
    div.className = "ft-widget-b2";
    div.setAttribute("data-restaurant", restaurantUid);
    div.setAttribute("data-open", "1");
    div.setAttribute("data-language", "de");
    container.appendChild(div);

    const script = document.createElement("script");
    script.id = "formitable-sdk";
    script.src = "https://cdn.formitable.com/sdk/v1/ft.sdk.min.js";
    script.async = true;
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [restaurantUid]);

  return <div ref={containerRef} className="min-h-[400px]" />;
}

export function ExternalWidget({ provider, externalId }: ExternalWidgetProps) {
  if (!externalId) {
    return (
      <div className="rounded border border-white/10 bg-[var(--color-dark-card)] px-6 py-12 text-center">
        <p className="text-sm text-white/40">
          Externe ID nicht hinterlegt. Bitte im Dashboard unter <code className="text-[var(--color-secondary)]">reservation_external_id</code> die
          {" "}{provider === "quandoo" ? "Merchant-ID" : provider === "opentable" ? "Restaurant-ID" : provider === "resy" ? "Venue-ID" : "Restaurant-UID"}{" "}
          eintragen.
        </p>
      </div>
    );
  }

  switch (provider) {
    case "quandoo":
      return <QuandooWidget merchantId={externalId} />;
    case "opentable":
      return <OpenTableWidget restaurantId={externalId} />;
    case "resy":
      return <ResyWidget venueId={externalId} />;
    case "formitable":
      return <FormitableWidget restaurantUid={externalId} />;
    default:
      return null;
  }
}

import Link from "next/link";
import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";
import type { Tenant, StoreSettings } from "@/types";

const footerLinks = [
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/speisekarte", label: "Speisekarte" },
  { href: "/kontakt", label: "Kontakt" },
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
];

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15z" />
    </svg>
  );
}

function SocialIcon({
  href,
  label,
  icon,
}: {
  href: string | null | undefined;
  label: string;
  icon: React.ReactNode;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)]"
    >
      {icon}
    </a>
  );
}

export function Footer({
  tenant,
  settings,
}: {
  tenant: Tenant | null;
  settings: StoreSettings | null;
}) {
  const year = new Date().getFullYear();
  const tenantName = tenant?.name ?? "Restaurant";

  const mapsQuery = settings?.address
    ? encodeURIComponent(settings.address)
    : "";
  const mapsUrl = mapsQuery
    ? `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`
    : null;

  return (
    <footer className="bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 text-center">
          <img
            src="/logo.svg"
            alt="La Pizza Kempten"
            className="mx-auto h-20 w-auto"
          />
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="h-px w-6 bg-[var(--color-secondary)]/50" />
            <span className="h-1 w-1 rounded-full bg-[var(--color-secondary)]" />
            <span className="h-px w-6 bg-[var(--color-secondary)]/50" />
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          <div>
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-secondary)]">
              <MapPin className="h-4 w-4" />
              Adresse
            </h3>
            {settings?.address ? (
              <div className="mt-3 space-y-2 text-sm text-white/70">
                <p className="whitespace-pre-line">{settings.address}</p>
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[var(--color-secondary)] hover:underline text-sm"
                  >
                    Auf Karte anzeigen
                  </a>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-white/40">
                Keine Adresse hinterlegt.
              </p>
            )}
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-secondary)]">
              Entdecken
            </h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-secondary)]">
              Kontakt
            </h3>
            <div className="mt-3 space-y-2 text-sm text-white/70">
              {settings?.phone && (
                <a
                  href={`tel:${settings.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Phone className="h-4 w-4 text-[var(--color-secondary)]" />
                  {settings.phone}
                </a>
              )}
              {settings?.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Mail className="h-4 w-4 text-[var(--color-secondary)]" />
                  {settings.email}
                </a>
              )}
            </div>
            <div className="mt-4 flex gap-3">
              <SocialIcon
                href={settings?.instagram}
                label="Instagram"
                icon={<Instagram className="h-4 w-4" />}
              />
              <SocialIcon
                href={settings?.facebook}
                label="Facebook"
                icon={<Facebook className="h-4 w-4" />}
              />
              <SocialIcon
                href={settings?.tiktok}
                label="TikTok"
                icon={<TikTokIcon />}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
          <span className="text-xs text-white/50">
            &copy; {year} {tenantName}. Alle Rechte vorbehalten.
          </span>
          <p className="text-[10px] text-white/30">Website by StudioWeblix</p>
        </div>
      </div>
    </footer>
  );
}

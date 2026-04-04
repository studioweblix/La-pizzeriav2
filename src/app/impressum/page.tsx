import { getSettings, getTenant } from "@/lib/data";

export const metadata = {
  title: "Impressum",
  description: "Impressum und Angaben gemäß § 5 TMG",
};

export default async function ImpressumPage() {
  const [settings, tenant] = await Promise.all([
    getSettings(),
    getTenant(),
  ]);

  const name = tenant?.name ?? "[Name des Betreibers]";
  const address = settings?.address ?? "[Adresse]";
  const phone = settings?.phone ?? "[Telefonnummer]";
  const email = settings?.email ?? "[E-Mail-Adresse]";

  return (
    <main className="mx-auto max-w-3xl px-4 pt-28 pb-16 sm:px-6 lg:px-8">
      <h1
        className="font-heading text-3xl font-medium tracking-wide text-white md:text-4xl"
        style={{ fontFamily: "var(--font-heading), serif" }}
      >
        Impressum
      </h1>
      <p className="mt-2 text-sm text-white/50">
        Angaben gemäß § 5 TMG
      </p>

      <div className="mt-10 space-y-8 text-white/70 leading-relaxed">
        <section>
          <h2 className="font-heading text-xl font-medium text-white">
            Anbieter und verantwortlich für den Inhalt
          </h2>
          <p className="mt-2 whitespace-pre-line">{name}</p>
          <p className="mt-2 whitespace-pre-line">{address}</p>
          <p className="mt-2">
            Telefon:{" "}
            {phone.startsWith("[") ? (
              phone
            ) : (
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="text-[var(--color-secondary)] hover:underline"
              >
                {phone}
              </a>
            )}
          </p>
          <p className="mt-1">
            E-Mail:{" "}
            {email.startsWith("[") ? (
              email
            ) : (
              <a
                href={`mailto:${email}`}
                className="text-[var(--color-secondary)] hover:underline"
              >
                {email}
              </a>
            )}
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-medium text-white">
            Redaktionell verantwortlich
          </h2>
          <p className="mt-2">
            Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV: {name}
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-medium text-white">
            Haftungsausschluss
          </h2>
          <p className="mt-2">
            Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für
            die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können
            wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir
            gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den
            allgemeinen Gesetzen verantwortlich.
          </p>
          <p className="mt-4">
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
            diesen Seiten unterliegen dem deutschen Urheberrecht. Die
            Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
            Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
            schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
        </section>
      </div>
    </main>
  );
}

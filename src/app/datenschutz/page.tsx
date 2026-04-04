import { getSettings, getTenant } from "@/lib/data";

export const metadata = {
  title: "Datenschutz",
  description: "Datenschutzerklärung",
};

export default async function DatenschutzPage() {
  const [settings, tenant] = await Promise.all([
    getSettings(),
    getTenant(),
  ]);

  const name = tenant?.name ?? "[Name des Verantwortlichen]";
  const address = settings?.address ?? "[Adresse]";
  const email = settings?.email ?? "[E-Mail-Adresse]";

  return (
    <main className="mx-auto max-w-3xl px-4 pt-28 pb-16 sm:px-6 lg:px-8">
      <h1
        className="font-heading text-3xl font-medium tracking-wide text-white md:text-4xl"
        style={{ fontFamily: "var(--font-heading), serif" }}
      >
        Datenschutzerklärung
      </h1>
      <p className="mt-2 text-sm text-white/50">
        Informationen zum Umgang mit Ihren Daten
      </p>

      <div className="mt-10 space-y-8 text-white/70 leading-relaxed">
        <section>
          <h2 className="font-heading text-xl font-medium text-white">
            1. Verantwortlicher
          </h2>
          <p className="mt-2">
            Verantwortlich für die Datenverarbeitung auf dieser Website ist:
          </p>
          <p className="mt-2 whitespace-pre-line">{name}</p>
          <p className="mt-2 whitespace-pre-line">{address}</p>
          <p className="mt-2">
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
            2. Erhebung und Speicherung personenbezogener Daten
          </h2>
          <p className="mt-2">
            Beim Aufruf unserer Website werden durch den Browser auf Ihrem
            Endgerät automatisch Informationen an den Server gesendet. Diese
            Informationen werden temporär in einem sogenannten Logfile
            gespeichert. Erfasst werden u. a. IP-Adresse, Datum und Uhrzeit des
            Zugriffs, Name und URL der abgerufenen Datei, übertragene
            Datenmenge sowie die anfragende Stelle (Referrer-URL). Die
            Verarbeitung erfolgt zur Gewährleistung eines reibungslosen
            Verbindungsaufbaus und zur Auswertung der Systemsicherheit.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-medium text-white">
            3. Cookies
          </h2>
          <p className="mt-2">
            Unsere Website kann Cookies verwenden. Cookies sind kleine
            Textdateien, die auf Ihrem Endgerät gespeichert werden. Sie dienen
            dazu, unser Angebot nutzerfreundlicher zu gestalten. Sie können Ihren
            Browser so einstellen, dass Sie über die Speicherung von Cookies
            informiert werden und diese einzeln erlauben oder ablehnen.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-medium text-white">
            4. Ihre Rechte
          </h2>
          <p className="mt-2">
            Sie haben das Recht auf Auskunft, Berichtigung, Löschung und
            Einschränkung der Verarbeitung Ihrer personenbezogenen Daten sowie
            ein Recht auf Datenübertragbarkeit. Sie haben ferner das Recht, sich
            bei einer Aufsichtsbehörde zu beschweren. Bei Fragen zum
            Datenschutz wenden Sie sich bitte an die oben genannte E-Mail-Adresse.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-medium text-white">
            5. Aktualität
          </h2>
          <p className="mt-2">
            Diese Datenschutzerklärung wird bei Bedarf an geänderte
            Rechtslagen oder unsere Angebote angepasst. Die jeweils aktuelle
            Version finden Sie auf dieser Seite.
          </p>
        </section>
      </div>
    </main>
  );
}

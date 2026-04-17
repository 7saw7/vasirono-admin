import { SettingsFilters } from "./SettingsFilters";
import type { SettingsDashboardData } from "@/features/backoffice/settings/types";

type SettingsViewProps = {
  data: SettingsDashboardData;
};

export function SettingsView({ data }: SettingsViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-neutral-500">Backoffice</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
          Configuración
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Catálogos operativos y estados base del sistema.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Roles" value={String(data.summary.totalRoles)} />
        <SummaryCard
          label="Estados verificación"
          value={String(data.summary.totalVerificationStatuses)}
        />
        <SummaryCard
          label="Estados claim"
          value={String(data.summary.totalClaimStatuses)}
        />
        <SummaryCard
          label="Tipos notificación"
          value={String(data.summary.totalNotificationTypes)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Estados pago"
          value={String(data.summary.totalPaymentStatuses)}
        />
        <SummaryCard
          label="Estados suscripción"
          value={String(data.summary.totalSubscriptionStatuses)}
        />
        <SummaryCard
          label="Niveles verificación"
          value={String(data.summary.totalVerificationLevels)}
        />
        <SummaryCard
          label="Métodos verificación"
          value={String(data.summary.totalVerificationMethods)}
        />
      </div>

      <SettingsFilters />

      <Section
        title="Roles"
        headers={["Nombre"]}
        rows={data.roles.items.map((item) => [item.name])}
        emptyMessage="No se encontraron roles."
      />

      <Section
        title="Estados de verificación"
        headers={["Nombre"]}
        rows={data.verificationStatuses.items.map((item) => [item.name])}
        emptyMessage="No se encontraron estados de verificación."
      />

      <Section
        title="Estados de claim"
        headers={["Nombre"]}
        rows={data.claimStatuses.items.map((item) => [item.name])}
        emptyMessage="No se encontraron estados de claim."
      />

      <Section
        title="Estados de pago"
        headers={["Nombre"]}
        rows={data.paymentStatuses.items.map((item) => [item.name])}
        emptyMessage="No se encontraron estados de pago."
      />

      <Section
        title="Estados de suscripción"
        headers={["Nombre"]}
        rows={data.subscriptionStatuses.items.map((item) => [item.name])}
        emptyMessage="No se encontraron estados de suscripción."
      />

      <Section
        title="Tipos de notificación"
        headers={["Nombre"]}
        rows={data.notificationTypes.items.map((item) => [item.name])}
        emptyMessage="No se encontraron tipos de notificación."
      />

      <Section
        title="Niveles de verificación"
        headers={["Código", "Nombre", "Orden", "Descripción"]}
        rows={data.verificationLevels.items.map((item) => [
          item.code,
          item.name,
          String(item.sortOrder),
          item.description ?? "—",
        ])}
        emptyMessage="No se encontraron niveles de verificación."
      />

      <MethodsSection />

      <StatusSection
        title="Estados de request de verificación"
        items={data.verificationRequestStatuses.items}
        emptyMessage="No se encontraron estados de request."
      />

      <StatusSection
        title="Estados de check de verificación"
        items={data.verificationCheckStatuses.items}
        emptyMessage="No se encontraron estados de check."
      />

      <Section
        title="Tipos de documento de verificación"
        headers={["Código", "Nombre", "Descripción"]}
        rows={data.verificationDocumentTypes.items.map((item) => [
          item.code,
          item.name,
          item.description ?? "—",
        ])}
        emptyMessage="No se encontraron tipos de documento."
      />

      <StatusSection
        title="Estados de revisión documental"
        items={data.verificationDocumentReviewStatuses.items}
        emptyMessage="No se encontraron estados de revisión documental."
      />
    </div>
  );

  function MethodsSection() {
    if (data.verificationMethods.items.length === 0) {
      return (
        <EmptySection
          title="Métodos de verificación"
          message="No se encontraron métodos de verificación."
        />
      );
    }

    return (
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-neutral-950">
          Métodos de verificación
        </h2>
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Método
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Documento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Revisión manual
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Estado
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100 bg-white">
                {data.verificationMethods.items.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-4 text-sm text-neutral-700">
                      <div>
                        <p className="font-medium text-neutral-900">
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {item.description ?? "—"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-700">
                      {item.code}
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-700">
                      {item.requiresDocument ? "Sí" : "No"}
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-700">
                      {item.requiresManualReview ? "Sí" : "No"}
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-700">
                      {item.isActive ? "Activo" : "Inactivo"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  }
}

function StatusSection({
  title,
  items,
  emptyMessage,
}: {
  title: string;
  items: SettingsDashboardData["verificationRequestStatuses"]["items"];
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return <EmptySection title={title} message={emptyMessage} />;
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-neutral-950">{title}</h2>
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Código
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Orden
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Terminal
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Descripción
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100 bg-white">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-4 text-sm text-neutral-700">
                    {item.code}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-neutral-900">
                    {item.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-700">
                    {item.sortOrder}
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-700">
                    {item.isTerminal ? "Sí" : "No"}
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-700">
                    {item.description ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Section({
  title,
  headers,
  rows,
  emptyMessage,
}: {
  title: string;
  headers: string[];
  rows: string[][];
  emptyMessage: string;
}) {
  if (rows.length === 0) {
    return <EmptySection title={title} message={emptyMessage} />;
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-neutral-950">{title}</h2>
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-neutral-50">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={`${rowIndex}-${cellIndex}`}
                      className="px-4 py-4 text-sm text-neutral-700"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-950">{value}</p>
    </div>
  );
}

function EmptySection({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-neutral-950">{title}</h2>
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
        {message}
      </div>
    </section>
  );
}
type BusinessChannelMessageInput = {
  channel: "email" | "whatsapp";
  to: string;
  type: string;
  data: Record<string, unknown>;
};

type BusinessChannelMessageResponse = {
  sent?: boolean;
  prepared?: boolean;
  manualActionRequired?: boolean;
  provider?: string | null;
  deliveryMode?: string | null;
  manualSendUrl?: string | null;
  messageText?: string | null;
  error?: string | null;
};

function getNotificationsBaseUrl() {
  return process.env.NOTIFICATIONS_SERVICE_URL?.replace(/\/$/, "") ?? null;
}

function getInternalToken() {
  return (
    process.env.NOTIFICATIONS_INTERNAL_TOKEN ??
    process.env.INTERNAL_SERVICE_TOKEN ??
    process.env.SERVICE_INTERNAL_TOKEN ??
    null
  );
}

function buildManualWhatsappFallback(input: BusinessChannelMessageInput) {
  const code = String(input.data.code ?? "");
  const businessName = String(input.data.businessName ?? "tu negocio");
  const expiresAt = String(input.data.expiresAt ?? "");
  const text = [
    `Hola, somos Vasirono.`,
    `El código de verificación para ${businessName} es ${code}.`,
    expiresAt ? `Vence: ${expiresAt}.` : `Este código vence pronto.`,
    `No compartas este código con terceros.`,
  ].join(" ");

  return {
    sent: false,
    prepared: true,
    manualActionRequired: true,
    provider: "manual_link_fallback",
    deliveryMode: "manual",
    manualSendUrl: `https://wa.me/${input.to.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`,
    messageText: text,
    error: null,
  } satisfies Required<Pick<BusinessChannelMessageResponse, "sent" | "prepared" | "manualActionRequired">> & BusinessChannelMessageResponse;
}

export async function sendBusinessChannelMessage(
  input: BusinessChannelMessageInput
): Promise<Required<Pick<BusinessChannelMessageResponse, "sent" | "prepared" | "manualActionRequired">> & BusinessChannelMessageResponse> {
  const baseUrl = getNotificationsBaseUrl();

  if (!baseUrl) {
    if (input.channel === "whatsapp") return buildManualWhatsappFallback(input);
    throw new Error("NOTIFICATIONS_SERVICE_URL_NOT_CONFIGURED");
  }

  const token = getInternalToken();
  const response = await fetch(`${baseUrl}/api/internal/notifications/business-channel-message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "x-internal-token": token, authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    if (input.channel === "whatsapp") {
      const fallback = buildManualWhatsappFallback(input);
      return {
        ...fallback,
        error: `notifications-service respondió ${response.status}`,
      };
    }
    throw new Error("NOTIFICATION_SEND_FAILED");
  }

  const data =
    payload && typeof payload === "object" && "data" in payload
      ? (payload as { data?: BusinessChannelMessageResponse }).data
      : (payload as BusinessChannelMessageResponse | null);

  return {
    sent: Boolean(data?.sent),
    prepared: Boolean(data?.prepared ?? data?.manualSendUrl),
    manualActionRequired: Boolean(data?.manualActionRequired ?? data?.manualSendUrl),
    provider: data?.provider ?? null,
    deliveryMode: data?.deliveryMode ?? null,
    manualSendUrl: data?.manualSendUrl ?? null,
    messageText: data?.messageText ?? null,
    error: data?.error ?? null,
  };
}

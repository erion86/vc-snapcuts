/**
 * Server-only Xendit client (Payment Sessions).
 * Secret key must never be exposed to the client.
 */

const XENDIT_API = "https://api.xendit.co";

function getSecretKey(): string {
  const key = process.env.XENDIT_SECRET_KEY;
  if (!key) throw new Error("XENDIT_SECRET_KEY is not configured");
  return key;
}

function authHeader(): string {
  return `Basic ${Buffer.from(`${getSecretKey()}:`).toString("base64")}`;
}

export function isXenditConfigured(): boolean {
  return Boolean(process.env.XENDIT_SECRET_KEY);
}

export function getXenditWebhookToken(): string | null {
  return process.env.XENDIT_WEBHOOK_TOKEN ?? null;
}

export interface CreateXenditPaymentSessionInput {
  referenceId: string;
  amountCentavos: number;
  description: string;
  successUrl: string;
  cancelUrl: string;
  customer: {
    email: string;
    phone: string;
    givenNames: string;
    surname: string;
  };
  metadata?: Record<string, string>;
}

export async function createXenditPaymentSession(
  input: CreateXenditPaymentSessionInput
): Promise<{ checkoutUrl: string; sessionId: string }> {
  const phone = formatPhilippinesMobile(input.customer.phone);

  const body = {
    reference_id: input.referenceId,
    session_type: "PAY",
    mode: "PAYMENT_LINK",
    amount: String(input.amountCentavos),
    currency: "PHP",
    country: "PH",
    locale: "en",
    description: input.description,
    success_return_url: input.successUrl,
    cancel_return_url: input.cancelUrl,
    metadata: input.metadata ?? {},
    customer: {
      reference_id: input.referenceId,
      type: "INDIVIDUAL",
      email: input.customer.email,
      mobile_number: phone,
      individual_detail: {
        given_names: input.customer.givenNames,
        surname: input.customer.surname,
      },
    },
  };

  const res = await fetch(`${XENDIT_API}/sessions`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as Record<string, unknown>;

  if (!res.ok) {
    const err = json as { message?: string; error_code?: string };
    throw new Error(err.message ?? err.error_code ?? "Xendit payment session failed");
  }

  const checkoutUrl = json.payment_link_url as string | undefined;
  const sessionId = (json.payment_session_id as string) ?? "";

  if (!checkoutUrl) {
    throw new Error("Xendit did not return a payment link URL");
  }

  return { checkoutUrl, sessionId };
}

function formatPhilippinesMobile(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("63")) return `+${digits}`;
  if (digits.startsWith("0")) return `+63${digits.slice(1)}`;
  if (digits.length === 10) return `+63${digits}`;
  return phone.startsWith("+") ? phone : `+${digits}`;
}

export function verifyXenditWebhookToken(request: Request): boolean {
  const expected = getXenditWebhookToken();
  if (!expected) {
    console.warn("XENDIT_WEBHOOK_TOKEN not set — skipping webhook verification");
    return true;
  }

  const token = request.headers.get("x-callback-token");
  return token === expected;
}

export function parseXenditWebhookEvent(payload: unknown): {
  event: string;
  referenceId: string | null;
  sessionId: string | null;
} {
  const body = payload as {
    event?: string;
    data?: {
      reference_id?: string;
      payment_session_id?: string;
    };
  };

  return {
    event: body.event ?? "",
    referenceId: body.data?.reference_id ?? null,
    sessionId: body.data?.payment_session_id ?? null,
  };
}

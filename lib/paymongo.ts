/**
 * Server-only PayMongo client.
 * Secret key must never be exposed to the client.
 */

const PAYMONGO_API = "https://api.paymongo.com/v1";

function getSecretKey(): string {
  const key = process.env.PAYMONGO_SECRET_KEY;
  if (!key) throw new Error("PAYMONGO_SECRET_KEY is not configured");
  return key;
}

function authHeader(): string {
  return `Basic ${Buffer.from(`${getSecretKey()}:`).toString("base64")}`;
}

interface CheckoutLineItem {
  name: string;
  amount: number;
  currency: string;
  quantity: number;
}

interface CreateCheckoutSessionInput {
  lineItems: CheckoutLineItem[];
  successUrl: string;
  cancelUrl: string;
  description: string;
  metadata?: Record<string, string>;
}

export async function createCheckoutSession(
  input: CreateCheckoutSessionInput
): Promise<{ checkoutUrl: string; sessionId: string }> {
  const body = {
    data: {
      attributes: {
        send_email_receipt: true,
        show_description: true,
        show_line_items: true,
        description: input.description,
        line_items: input.lineItems.map((item) => ({
          currency: item.currency,
          amount: item.amount,
          name: item.name,
          quantity: item.quantity,
        })),
        payment_method_types: ["gcash", "paymaya", "card", "grab_pay"],
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        metadata: input.metadata ?? {},
      },
    },
  };

  const res = await fetch(`${PAYMONGO_API}/checkout_sessions`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!res.ok) {
    const message =
      json?.errors?.[0]?.detail ?? json?.errors?.[0]?.title ?? "PayMongo checkout failed";
    throw new Error(message);
  }

  const attrs = json.data.attributes;
  return {
    checkoutUrl: attrs.checkout_url as string,
    sessionId: json.data.id as string,
  };
}

export function isPayMongoConfigured(): boolean {
  return Boolean(process.env.PAYMONGO_SECRET_KEY);
}

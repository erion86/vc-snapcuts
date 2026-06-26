/** Amounts in centavos (PHP) */
export const checkoutConfig = {
  freeShippingMin: 99900,
  standardShippingFee: 12000,
  currency: "PHP" as const,
  couriers: [
    { id: "jt" as const, name: "J&T Express", eta: "2–4 business days" },
    { id: "lbc" as const, name: "LBC", eta: "3–5 business days" },
  ],
};

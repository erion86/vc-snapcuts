import { Suspense } from "react";
import CheckoutSuccessContent from "./SuccessContent";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

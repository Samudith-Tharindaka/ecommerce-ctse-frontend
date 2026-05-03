import { apiJson } from "./client";
import type { PaymentResponse, SpringPage } from "./types";

export function getPaymentByOrder(orderId: string): Promise<PaymentResponse> {
  return apiJson<PaymentResponse>(
    `/api/payments/order/${encodeURIComponent(orderId)}`,
    { method: "GET", auth: true }
  );
}

export function paymentHistory(params: {
  page?: number;
  size?: number;
}): Promise<SpringPage<PaymentResponse>> {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.size != null) q.set("size", String(params.size));
  const qs = q.toString();
  return apiJson<SpringPage<PaymentResponse>>(
    `/api/payments/history${qs ? `?${qs}` : ""}`,
    { method: "GET", auth: true }
  );
}

export function refundPayment(
  id: string,
  reason: string
): Promise<PaymentResponse> {
  return apiJson<PaymentResponse>(
    `/api/payments/${encodeURIComponent(id)}/refund`,
    {
      method: "POST",
      body: JSON.stringify({ reason }),
      auth: true,
    }
  );
}

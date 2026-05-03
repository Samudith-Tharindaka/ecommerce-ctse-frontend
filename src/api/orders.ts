import { apiJson } from "./client";
import type { OrderResponse, SpringPage } from "./types";

export interface CreateOrderRequest {
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }[];
  shippingAddress: string;
  notes?: string;
}

export function createOrder(body: CreateOrderRequest): Promise<OrderResponse> {
  return apiJson<OrderResponse>("/api/orders", {
    method: "POST",
    body: JSON.stringify(body),
    auth: true,
  });
}

export function listOrders(params: {
  page?: number;
  size?: number;
}): Promise<SpringPage<OrderResponse>> {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.size != null) q.set("size", String(params.size));
  const qs = q.toString();
  return apiJson<SpringPage<OrderResponse>>(
    `/api/orders${qs ? `?${qs}` : ""}`,
    { method: "GET", auth: true }
  );
}

export function getOrder(id: string): Promise<OrderResponse> {
  return apiJson<OrderResponse>(`/api/orders/${encodeURIComponent(id)}`, {
    method: "GET",
    auth: true,
  });
}

export function updateOrderStatus(
  id: string,
  status: string
): Promise<OrderResponse> {
  return apiJson<OrderResponse>(
    `/api/orders/${encodeURIComponent(id)}/status`,
    {
      method: "PUT",
      body: JSON.stringify({ status }),
      auth: true,
    }
  );
}

export function cancelOrder(id: string): Promise<OrderResponse> {
  return apiJson<OrderResponse>(`/api/orders/${encodeURIComponent(id)}`, {
    method: "DELETE",
    auth: true,
  });
}

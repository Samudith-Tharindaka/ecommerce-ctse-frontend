import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../api/client";
import * as paymentsApi from "../api/payments";
import * as ordersApi from "../api/orders";
import * as catalogApi from "../api/catalog";
import type {
  OrderResponse,
  OrderStatus,
  PaymentResponse,
  Product,
  ProductRequest,
  SpringPage,
} from "../api/types";
import { formatDate, formatMoney } from "../lib/format";
import { useAuth } from "../context/AuthContext";

type Tab = "payments" | "orders" | "products";

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const statusColor: Record<string, string> = {
  PAID: "#16a34a",
  DELIVERED: "#16a34a",
  CONFIRMED: "#2563eb",
  PROCESSING: "#7c3aed",
  SHIPPED: "#0891b2",
  PENDING: "#d97706",
  FAILED: "#dc2626",
  CANCELLED: "#dc2626",
  REFUNDED: "#6b7280",
  SUCCESS: "#16a34a",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.2rem 0.6rem",
        borderRadius: "4px",
        fontSize: "0.78rem",
        fontWeight: 600,
        background: `${statusColor[status] ?? "#6b7280"}18`,
        color: statusColor[status] ?? "#6b7280",
        border: `1px solid ${statusColor[status] ?? "#6b7280"}40`,
      }}
    >
      {status}
    </span>
  );
}

// ── Payments tab ─────────────────────────────────────────────────────────────

function PaymentsTab() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<SpringPage<PaymentResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refunding, setRefunding] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [confirmRefund, setConfirmRefund] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await paymentsApi.paymentHistory({ page, size: 10 });
      setData(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleRefund(id: string) {
    setSaving(true);
    try {
      const updated = await paymentsApi.refundPayment(id, refundReason || "Admin refund");
      setData((prev) =>
        prev
          ? { ...prev, content: prev.content.map((p) => (p.id === id ? updated : p)) }
          : prev
      );
      setConfirmRefund(null);
      setRefundReason("");
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Refund failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="muted">Loading payments…</p>;
  if (error) return <p className="banner error">{error}</p>;
  if (!data || data.content.length === 0)
    return <p className="muted">No payments found.</p>;

  return (
    <>
      {confirmRefund && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Refund payment</h2>
            </div>
            <div className="stack">
              <p className="subtle" style={{ margin: 0 }}>
                Payment ID: <code>{confirmRefund.slice(0, 12)}…</code>
              </p>
              <label>
                <span className="label-text">Reason (optional)</span>
                <input
                  type="text"
                  placeholder="Customer request, duplicate charge…"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                />
              </label>
              <div className="row">
                <button
                  className="btn ghost"
                  onClick={() => { setConfirmRefund(null); setRefundReason(""); }}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="btn primary"
                  onClick={() => void handleRefund(confirmRefund)}
                  disabled={saving}
                >
                  {saving ? "Processing…" : "Confirm refund"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Payment ID</th>
              <th>Order</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.content.map((p) => (
              <tr key={p.id}>
                <td style={{ whiteSpace: "nowrap" }}>{formatDate(p.createdAt)}</td>
                <td>
                  <span title={p.id} style={{ fontSize: "0.8rem", fontFamily: "monospace" }}>
                    {p.id.slice(0, 10)}…
                  </span>
                </td>
                <td>
                  <Link to={`/orders/${p.orderId}`} style={{ fontSize: "0.85rem" }}>
                    {p.orderId.slice(0, 8)}…
                  </Link>
                </td>
                <td>{formatMoney(p.amount)}</td>
                <td>{p.method}</td>
                <td><StatusBadge status={p.status} /></td>
                <td>
                  {p.status === "PAID" ? (
                    <button
                      className="btn danger small"
                      onClick={() => { setConfirmRefund(p.id); setRefunding(p.id); }}
                      disabled={refunding === p.id}
                    >
                      Refund
                    </button>
                  ) : (
                    <span className="subtle" style={{ fontSize: "0.8rem" }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.totalPages > 1 && (
        <div className="pagination">
          <button className="btn ghost small" disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span className="muted">Page {page + 1} of {data.totalPages}</span>
          <button className="btn ghost small" disabled={page >= data.totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      )}
    </>
  );
}

// ── Orders tab ────────────────────────────────────────────────────────────────

function OrdersTab() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<SpringPage<OrderResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ordersApi.listOrders({ page, size: 10 });
      setData(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveStatus(id: string) {
    setSaving(true);
    try {
      const updated = await ordersApi.updateOrderStatus(id, editStatus);
      setData((prev) =>
        prev
          ? { ...prev, content: prev.content.map((o) => (o.id === id ? updated : o)) }
          : prev
      );
      setEditingId(null);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="muted">Loading orders…</p>;
  if (error) return <p className="banner error">{error}</p>;
  if (!data || data.content.length === 0)
    return <p className="muted">No orders found.</p>;

  return (
    <>
      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Order ID</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.content.map((o) => (
              <tr key={o.id}>
                <td style={{ whiteSpace: "nowrap" }}>{formatDate(o.createdAt)}</td>
                <td>
                  <Link to={`/orders/${o.id}`} style={{ fontSize: "0.85rem", fontFamily: "monospace" }}>
                    {o.id.slice(0, 10)}…
                  </Link>
                </td>
                <td>{o.items.length}</td>
                <td>{formatMoney(o.totalAmount)}</td>
                <td><StatusBadge status={o.paymentStatus} /></td>
                <td>
                  {editingId === o.id ? (
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      style={{ padding: "0.25rem" }}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <StatusBadge status={o.status} />
                  )}
                </td>
                <td>
                  <div className="row tight">
                    {editingId === o.id ? (
                      <>
                        <button className="btn primary small" onClick={() => void saveStatus(o.id)} disabled={saving}>
                          {saving ? "…" : "Save"}
                        </button>
                        <button className="btn ghost small" onClick={() => setEditingId(null)} disabled={saving}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn ghost small"
                        onClick={() => { setEditingId(o.id); setEditStatus(o.status); }}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.totalPages > 1 && (
        <div className="pagination">
          <button className="btn ghost small" disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span className="muted">Page {page + 1} of {data.totalPages}</span>
          <button className="btn ghost small" disabled={page >= data.totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      )}
    </>
  );
}

// ── Products tab ──────────────────────────────────────────────────────────────

const emptyForm: ProductRequest = { name: "", description: "", price: 0, category: "", stock: 0 };

function ProductsTab() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<SpringPage<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductRequest>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await catalogApi.listProducts({ page, size: 10 });
      setData(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditProduct(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(p: Product) {
    setEditProduct(p);
    setForm({ name: p.name, description: p.description, price: p.price, category: p.category, stock: p.stock });
    setFormOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editProduct) {
        const updated = await catalogApi.updateProduct(editProduct.id, form);
        setData((prev) =>
          prev
            ? { ...prev, content: prev.content.map((p) => (p.id === updated.id ? updated : p)) }
            : prev
        );
      } else {
        await catalogApi.createProduct(form);
        await load();
      }
      setFormOpen(false);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product? (soft delete — it won't appear in the store)")) return;
    setDeleting(id);
    try {
      await catalogApi.deleteProduct(id);
      setData((prev) =>
        prev ? { ...prev, content: prev.content.filter((p) => p.id !== id) } : prev
      );
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Delete failed");
    } finally {
      setDeleting(null);
    }
  }

  function field(key: keyof ProductRequest, label: string, type = "text") {
    return (
      <label key={key}>
        <span className="label-text">{label}</span>
        <input
          type={type}
          value={String(form[key])}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              [key]: type === "number" ? Number(e.target.value) : e.target.value,
            }))
          }
          required
          step={type === "number" ? "any" : undefined}
          min={type === "number" ? "0" : undefined}
        />
      </label>
    );
  }

  return (
    <>
      {formOpen && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <h2>{editProduct ? "Edit product" : "New product"}</h2>
            </div>
            <form onSubmit={(e) => void handleSave(e)} className="stack">
              {field("name", "Name")}
              <label>
                <span className="label-text">Description</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  required
                />
              </label>
              {field("category", "Category")}
              <div className="row">
                <label style={{ flex: 1 }}>
                  <span className="label-text">Price ($)</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                    required
                  />
                </label>
                <label style={{ flex: 1 }}>
                  <span className="label-text">Stock</span>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
                    required
                  />
                </label>
              </div>
              <div className="row">
                <button type="button" className="btn ghost" onClick={() => setFormOpen(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? "Saving…" : editProduct ? "Save changes" : "Create product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="row spread" style={{ marginBottom: "1rem" }}>
        <span className="muted">{data?.totalElements ?? 0} products total</span>
        <button className="btn primary small" onClick={openCreate}>+ New product</button>
      </div>

      {loading && <p className="muted">Loading products…</p>}
      {error && <p className="banner error">{error}</p>}

      {!loading && data && data.content.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Seller</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/products/${p.id}`}>{p.name}</Link>
                  </td>
                  <td>{p.category}</td>
                  <td>{formatMoney(p.price)}</td>
                  <td>
                    <span style={{ color: p.stock === 0 ? "var(--accent)" : "inherit" }}>
                      {p.stock}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                    {p.sellerName ?? "—"}
                  </td>
                  <td>
                    <div className="row tight">
                      <button className="btn ghost small" onClick={() => openEdit(p)}>
                        Edit
                      </button>
                      <button
                        className="btn danger small"
                        onClick={() => void handleDelete(p.id)}
                        disabled={deleting === p.id}
                      >
                        {deleting === p.id ? "…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && data && data.content.length === 0 && (
        <p className="muted">No products yet.</p>
      )}

      {data && data.totalPages > 1 && (
        <div className="pagination">
          <button className="btn ghost small" disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span className="muted">Page {page + 1} of {data.totalPages}</span>
          <button className="btn ghost small" disabled={page >= data.totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      )}
    </>
  );
}

// ── Main AdminPage ────────────────────────────────────────────────────────────

export function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("orders");

  const isAdmin = user?.roles.some((r) => r.toUpperCase().includes("ADMIN")) ?? false;

  if (!isAdmin) {
    return (
      <div className="page">
        <p className="banner error">Access denied. Admin role required.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="row spread" style={{ marginBottom: "2rem" }}>
        <h1 style={{ margin: 0 }}>Admin portal</h1>
        <span className="pill subtle">Logged in as {user?.username}</span>
      </div>

      <div className="admin-tabs">
        {(["orders", "payments", "products"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`admin-tab-btn${tab === t ? " active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        {tab === "payments" && <PaymentsTab />}
        {tab === "orders" && <OrdersTab />}
        {tab === "products" && <ProductsTab />}
      </div>
    </div>
  );
}

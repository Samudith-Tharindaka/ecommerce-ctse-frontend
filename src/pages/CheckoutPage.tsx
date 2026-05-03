import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as cartApi from "../api/cart";
import * as ordersApi from "../api/orders";
import { ApiError } from "../api/client";
import type { CartResponse, OrderResponse } from "../api/types";
import { formatMoney } from "../lib/format";
import { PaymentModal } from "../components/PaymentModal";

export function CheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<OrderResponse | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const c = await cartApi.getCart();
        if (!cancelled) setCart(c);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof ApiError ? e.message : "Could not load cart");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function openPaymentModal(e: React.FormEvent) {
    e.preventDefault();
    if (!cart || cart.items.length === 0) return;
    setError(null);
    setShowPayment(true);
  }

  async function handlePaymentConfirm() {
    if (!cart) return;
    setSubmitting(true);
    setError(null);
    try {
      const order = await ordersApi.createOrder({
        items: cart.items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          price: i.price,
          quantity: i.quantity,
        })),
        shippingAddress: address.trim(),
        notes: notes.trim() || undefined,
      });
      setShowPayment(false);
      setResult(order);
      try {
        const c = await cartApi.getCart();
        setCart(c);
      } catch {
        /* cart may already be empty */
      }
    } catch (e) {
      setShowPayment(false);
      setError(e instanceof ApiError ? e.message : "Order failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  if (result) {
    const paid = result.paymentStatus === "PAID";
    const failed = result.paymentStatus === "FAILED";
    return (
      <div className="page narrow">
        <div className="card">
          <h1>Order placed</h1>
          <p>
            Order <strong>{result.id}</strong> — status{" "}
            <code>{result.status}</code>, payment{" "}
            <code>{result.paymentStatus}</code>
          </p>
          {result.paymentId && (
            <p className="subtle">Payment id: {result.paymentId}</p>
          )}
          {paid && (
            <p className="banner success">Payment succeeded. Thank you!</p>
          )}
          {failed && (
            <p className="banner error">
              Payment failed. Check your order for details.
            </p>
          )}
          <div className="row">
            <Link to="/orders" className="btn primary">
              View orders
            </Link>
            <Link to="/" className="btn ghost">
              Back to shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];
  if (items.length === 0) {
    return (
      <div className="page">
        <p className="muted">Your cart is empty.</p>
        <Link to="/">Shop</Link>
      </div>
    );
  }

  return (
    <>
      {showPayment && (
        <PaymentModal
          amount={cart?.totalAmount ?? 0}
          onConfirm={() => void handlePaymentConfirm()}
          onCancel={() => setShowPayment(false)}
          processing={submitting}
        />
      )}

      <div className="page narrow">
        <h1>Checkout</h1>
        {error && <p className="banner error">{error}</p>}

        <div className="card stack">
          <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Order summary</h2>
          <ul className="plain-list">
            {items.map((i) => (
              <li key={i.productId}>
                {i.productName} × {i.quantity} —{" "}
                {formatMoney(i.price * i.quantity)}
              </li>
            ))}
          </ul>
          <p className="total">
            Total: <strong>{formatMoney(cart?.totalAmount ?? 0)}</strong>
          </p>
        </div>

        <form onSubmit={openPaymentModal} className="card stack">
          <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Shipping details</h2>
          <label>
            <span className="label-text">Shipping address</span>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              rows={3}
              placeholder="Street, city, postal code…"
            />
          </label>
          <label>
            <span className="label-text">Notes (optional)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </label>
          <div className="row">
            <button
              type="button"
              className="btn ghost"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
            <button type="submit" className="btn primary">
              Continue to payment
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

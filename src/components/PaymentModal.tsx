import { useState } from "react";
import { formatMoney } from "../lib/format";

interface Props {
  amount: number;
  onConfirm: () => void;
  onCancel: () => void;
  processing: boolean;
}

function fmtCard(v: string): string {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function fmtExpiry(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export function PaymentModal({ amount, onConfirm, onCancel, processing }: Props) {
  const [cardNumber, setCardNumber] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const valid =
    cardNumber.replace(/\s/g, "").length === 16 &&
    name.trim().length > 0 &&
    expiry.length === 5 &&
    cvv.length >= 3;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || processing) return;
    onConfirm();
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h2>Complete payment</h2>
          <span className="modal-amount">{formatMoney(amount)}</span>
        </div>

        <div className="payment-card-visual">
          <div className="card-chip" />
          <div className="card-number-display">
            {cardNumber || "•••• •••• •••• ••••"}
          </div>
          <div className="card-bottom">
            <span>{name || "CARDHOLDER NAME"}</span>
            <span>{expiry || "MM/YY"}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="stack">
          <label>
            <span className="label-text">Card number</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(fmtCard(e.target.value))}
              maxLength={19}
              disabled={processing}
              required
            />
          </label>
          <label>
            <span className="label-text">Cardholder name</span>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              disabled={processing}
              required
            />
          </label>
          <div className="row">
            <label style={{ flex: 1 }}>
              <span className="label-text">Expiry</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(fmtExpiry(e.target.value))}
                maxLength={5}
                disabled={processing}
                required
              />
            </label>
            <label style={{ flex: 1 }}>
              <span className="label-text">CVV</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="•••"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                maxLength={4}
                disabled={processing}
                required
              />
            </label>
          </div>

          <p className="subtle" style={{ margin: 0, fontSize: "0.8rem" }}>
            Demo mode — no real card data is sent.
          </p>

          <div className="row">
            <button
              type="button"
              className="btn ghost"
              onClick={onCancel}
              disabled={processing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn primary"
              style={{ flex: 1 }}
              disabled={!valid || processing}
            >
              {processing ? "Processing…" : `Pay ${formatMoney(amount)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

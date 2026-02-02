import { useState } from "react";
import { gqlRequest } from "../api/graphqlFetch";
import { useNavigate } from "react-router-dom";

export default function FarmerCheckout() {
  const farmerId = localStorage.getItem("userId") || "";
  const nav = useNavigate();

  const [managerId, setManagerId] = useState("");
  const [cardType, setCardType] = useState("CREDIT");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [order, setOrder] = useState(null);

  async function checkout(e) {
    e.preventDefault();
    setErr("");
    setOrder(null);

    if (!farmerId) return setErr("Farmer ID missing. Go to Login.");
    if (!managerId.trim()) return setErr("Manager ID is required.");
    if (!cardNumber.trim() || cardNumber.trim().length < 8) return setErr("Enter a valid card number.");
    if (!cvv.trim() || cvv.trim().length < 3) return setErr("Enter a valid CVV.");

    try {
      setLoading(true);

      const mutation = `
        mutation CheckoutFromCart($input: CheckoutInput!) {
          checkoutFromCart(input: $input) {
            id
            farmerId
            managerId
            status
            totalAmount
            orderDate
            items { productId quantity price }
          }
        }
      `;

      const variables = {
        input: {
          farmerId,
          managerId: managerId.trim(),
          cardType,
          cardNumber: cardNumber.trim(),
          cvv: cvv.trim(),
        },
      };

      const data = await gqlRequest(mutation, variables);
      setOrder(data.checkoutFromCart);
    } catch (e2) {
      setErr(e2.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h2 className="page-title">Checkout</h2>
        <p className="page-subtitle">Confirm your manager and payment details to place the order.</p>
      </header>

      <div className="info-row">
        <span className="info-chip">Farmer ID: {farmerId || "(not set)"}</span>
      </div>

      <div className="split-grid">
        <form onSubmit={checkout} className="form-grid">
          <label>
            Manager ID
            <input
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
              placeholder="Paste managerId here"
            />
          </label>

          <label>
            Card Type
            <select
              value={cardType}
              onChange={(e) => setCardType(e.target.value)}
            >
              <option value="CREDIT">CREDIT</option>
              <option value="DEBIT">DEBIT</option>
            </select>
          </label>

          <label>
            Card Number
            <input
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="1234 5678 9012 3456"
            />
          </label>

          <label>
            CVV
            <input
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              placeholder="123"
              className="input-compact"
            />
          </label>

          <div className="form-actions">
            <button disabled={loading}>
              {loading ? "Processing..." : "Checkout From Cart"}
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => nav("/farmer/cart")}
            >
              Back to Cart
            </button>
          </div>
        </form>

        <div className="panel">
          <div className="panel-title">Order summary</div>
          <p>Review your order in the cart before submitting payment details.</p>
          <div className="info-banner info-banner--neutral">
            Payments are simulated for this demo environment.
          </div>
        </div>
      </div>

      {err && <div className="info-banner info-banner--error">{err}</div>}

      {order && (
        <div className="panel">
          <div className="panel-title">✅ Order Placed</div>
          <div className="meta-list">
            <div><span>Order ID:</span> {order.id}</div>
            <div><span>Status:</span> {order.status}</div>
            <div><span>Total:</span> ${order.totalAmount}</div>
            <div><span>Date:</span> {order.orderDate}</div>
          </div>

          <div className="divider" />

          <div className="panel-title">Items</div>
          <pre className="code-block">{JSON.stringify(order.items, null, 2)}</pre>

          <button onClick={() => nav("/farmer/orders")}>Go to Orders</button>
        </div>
      )}
    </div>
  );
}

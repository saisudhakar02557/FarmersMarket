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
    <div style={{ padding: 20, maxWidth: 900 }}>
      <h2>Farmer: Checkout</h2>
      <div style={{ marginBottom: 10 }}>
        <b>Farmer ID:</b> {farmerId || "(not set)"}
      </div>

      <form onSubmit={checkout} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
        <label>
          Manager ID
          <input
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
            placeholder="Paste managerId here"
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          Card Type
          <select
            value={cardType}
            onChange={(e) => setCardType(e.target.value)}
            style={{ width: "100%", padding: 8 }}
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
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          CVV
          <input
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            placeholder="123"
            style={{ width: "100%", padding: 8, maxWidth: 120 }}
          />
        </label>

        <button disabled={loading} style={{ padding: "10px 12px", cursor: "pointer" }}>
          {loading ? "Processing..." : "Checkout From Cart"}
        </button>

        <button
          type="button"
          onClick={() => nav("/farmer/cart")}
          style={{ padding: "10px 12px", cursor: "pointer" }}
        >
          Back to Cart
        </button>
      </form>

      {err && <pre style={{ color: "crimson", marginTop: 12 }}>{err}</pre>}

      {order && (
        <div style={{ marginTop: 16 }}>
          <h3>✅ Order Placed</h3>
          <div style={{ display: "grid", gap: 4 }}>
            <div><b>Order ID:</b> {order.id}</div>
            <div><b>Status:</b> {order.status}</div>
            <div><b>Total:</b> ${order.totalAmount}</div>
            <div><b>Date:</b> {order.orderDate}</div>
          </div>

          <h4 style={{ marginTop: 12 }}>Items</h4>
          <pre>{JSON.stringify(order.items, null, 2)}</pre>

          <button
            onClick={() => nav("/farmer/orders")}
            style={{ padding: "10px 12px", cursor: "pointer" }}
          >
            Go to Orders
          </button>
        </div>
      )}
    </div>
  );
}

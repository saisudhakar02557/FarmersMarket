import { useEffect, useState } from "react";
import { gqlRequest } from "../api/graphqlFetch";

export default function FarmerOrders() {
  const farmerId = localStorage.getItem("userId") || "";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    try {
      setLoading(true);
      setErr("");
      setMsg("");

      if (!farmerId) {
        setErr("Farmer ID missing. Go to Login and set your farmerId.");
        setOrders([]);
        return;
      }

      const query = `
        query OrdersByFarmer($farmerId: String!) {
          ordersByFarmer(farmerId: $farmerId) {
            id
            status
            totalAmount
            orderDate
            managerId
            items { productId quantity price }
          }
        }
      `;

      const data = await gqlRequest(query, { farmerId });
      setOrders(data.ordersByFarmer || []);
    } catch (e) {
      setErr(e.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function markReceived(orderId) {
    try {
      setErr("");
      setMsg("");

      const mutation = `
        mutation MarkOrderReceived($orderId: ID!) {
          markOrderReceived(orderId: $orderId) {
            id
            status
            totalAmount
            orderDate
            managerId
            items { productId quantity price }
          }
        }
      `;

      await gqlRequest(mutation, { orderId });
      setMsg("Order marked as RECEIVED ✅");
      await load();
    } catch (e) {
      setErr(e.message || "Failed to mark received");
    }
  }

  if (loading) return <p style={{ padding: 20 }}>Loading orders...</p>;

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <h2>Farmer: Orders</h2>
      <div style={{ marginBottom: 10 }}>
        <b>Farmer ID:</b> {farmerId || "(not set)"}
      </div>

      {msg && <div style={{ color: "green", marginBottom: 10 }}>{msg}</div>}
      {err && <pre style={{ color: "crimson" }}>{err}</pre>}

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {orders.map((o) => (
            <div
              key={o.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <h3 style={{ margin: 0 }}>Order #{o.id}</h3>
                  <div><b>Status:</b> {o.status}</div>
                  <div><b>Total:</b> ${o.totalAmount}</div>
                  <div><b>Date:</b> {o.orderDate}</div>
                  <div><b>Manager:</b> {o.managerId}</div>
                </div>

                {o.status === "DISPATCHED" && (
                  <button
                    onClick={() => markReceived(o.id)}
                    style={{ padding: "8px 12px", cursor: "pointer", height: 40 }}
                  >
                    Mark Received
                  </button>
                )}

                {o.status === "RECEIVED" && (
                  <span style={{ color: "green", fontWeight: "bold" }}>✅ RECEIVED</span>
                )}
              </div>

              <h4 style={{ marginTop: 10, marginBottom: 6 }}>Items</h4>
              <div style={{ display: "grid", gap: 6 }}>
                {o.items.map((it, idx) => (
                  <div key={idx} style={{ padding: 8, background: "#fafafa", borderRadius: 6 }}>
                    <div><b>Product:</b> {it.productId}</div>
                    <div><b>Qty:</b> {it.quantity}</div>
                    <div><b>Price:</b> ${it.price}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

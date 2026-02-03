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

  if (loading) return <div className="info-banner info-banner--neutral">Loading orders...</div>;

  return (
    <div className="page">
      <header className="page-header">
        <h2 className="page-title">Orders</h2>
        <p className="page-subtitle">Track statuses, totals, and mark dispatches as received.</p>
      </header>

      <div className="info-row">
        <span className="info-chip chip">Farmer ID: {farmerId || "(not set)"}</span>
      </div>

      {msg && <div className="info-banner">{msg}</div>}
      {err && <div className="info-banner info-banner--error">{err}</div>}

      {orders.length === 0 ? (
        <div className="info-banner info-banner--neutral">No orders found.</div>
      ) : (
        <div className="card-grid">
          {orders.map((o) => (
            <div key={o.id} className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Order #{o.id}</h3>
                  <p className="card-subtitle">Manager: {o.managerId}</p>
                </div>
                <span className={`badge ${o.status === "RECEIVED" ? "badge--success" : "badge--warning"}`}>
                  {o.status}
                </span>
              </div>

              <div className="meta-list">
                <div><span>Total:</span> ${o.totalAmount}</div>
                <div><span>Date:</span> {o.orderDate}</div>
              </div>

              <div className="card-actions">
                {o.status === "DISPATCHED" && (
                  <button className="btn" onClick={() => markReceived(o.id)}>Mark Received</button>
                )}
                {o.status === "RECEIVED" && (
                  <span className="badge badge--success">✅ Received</span>
                )}
              </div>

              <div className="divider" />

              <div className="panel-title">Items</div>
              <div className="table-list">
                {o.items.map((it, idx) => (
                  <div key={idx} className="table-item">
                    <div><strong>Product:</strong> {it.productId}</div>
                    <div><strong>Qty:</strong> {it.quantity}</div>
                    <div><strong>Price:</strong> ${it.price}</div>
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

import { useEffect, useMemo, useState } from "react";
import { gqlRequest } from "../api/graphqlFetch";
import { useNavigate } from "react-router-dom";

export default function FarmerCart() {
  const farmerId = localStorage.getItem("userId") || "";
  const nav = useNavigate();

  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState([]);
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
        setCart(null);
        return;
      }

      const cartQuery = `
        query CartByFarmer($farmerId: String!) {
          cartByFarmer(farmerId: $farmerId) {
            id
            farmerId
            updatedAt
            items { productId quantity }
          }
        }
      `;

      const productsQuery = `
        query {
          products { id name status }
        }
      `;

      const [cData, pData] = await Promise.all([
        gqlRequest(cartQuery, { farmerId }),
        gqlRequest(productsQuery),
      ]);

      setCart(cData.cartByFarmer);
      setProducts(pData.products || []);
    } catch (e) {
      setErr(e.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const productMap = useMemo(() => {
    const m = new Map();
    for (const p of products) m.set(p.id, p);
    return m;
  }, [products]);

  const rows = useMemo(() => {
    if (!cart?.items?.length) return [];
    return cart.items.map((it) => ({
      ...it,
      name: productMap.get(it.productId)?.name || "(Unknown Product)",
      status: productMap.get(it.productId)?.status || "UNKNOWN",
    }));
  }, [cart, productMap]);

  async function updateItem(productId, quantity) {
    try {
      setErr("");
      setMsg("");

      const q = Number(quantity);
      if (!Number.isInteger(q) || q <= 0) {
        setErr("Quantity must be a positive integer.");
        return;
      }

      const mutation = `
        mutation UpdateCartItem($farmerId: String!, $productId: String!, $quantity: Int!) {
          updateCartItem(farmerId: $farmerId, productId: $productId, quantity: $quantity) {
            id
            updatedAt
            items { productId quantity }
          }
        }
      `;

      await gqlRequest(mutation, { farmerId, productId, quantity: q });
      setMsg("Cart updated ✅");
      await load();
    } catch (e) {
      setErr(e.message || "Update failed");
    }
  }

  async function removeItem(productId) {
    try {
      setErr("");
      setMsg("");

      const mutation = `
        mutation RemoveFromCart($farmerId: String!, $productId: String!) {
          removeFromCart(farmerId: $farmerId, productId: $productId) {
            id
            updatedAt
            items { productId quantity }
          }
        }
      `;

      await gqlRequest(mutation, { farmerId, productId });
      setMsg("Item removed ✅");
      await load();
    } catch (e) {
      setErr(e.message || "Remove failed");
    }
  }

  async function clearCart() {
    try {
      setErr("");
      setMsg("");

      const mutation = `
        mutation ClearCart($farmerId: String!) {
          clearCart(farmerId: $farmerId) {
            id
            updatedAt
            items { productId quantity }
          }
        }
      `;

      await gqlRequest(mutation, { farmerId });
      setMsg("Cart cleared ✅");
      await load();
    } catch (e) {
      setErr(e.message || "Clear failed");
    }
  }

  if (loading) return <p style={{ padding: 20 }}>Loading cart...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Farmer: Cart</h2>

      <div style={{ marginBottom: 10 }}>
        <b>Farmer ID:</b> {farmerId || "(not set)"}
      </div>

      {msg && <div style={{ color: "green", marginBottom: 10 }}>{msg}</div>}
      {err && <pre style={{ color: "crimson" }}>{err}</pre>}

      {!cart || rows.length === 0 ? (
        <div>
          <p>Your cart is empty.</p>
          <button onClick={() => nav("/farmer/browse")} style={{ padding: "8px 12px" }}>
            Go to Browse
          </button>
        </div>
      ) : (
        <div style={{ maxWidth: 800 }}>
          <div style={{ marginBottom: 10 }}>
            <button onClick={clearCart} style={{ padding: "8px 12px", marginRight: 10 }}>
              Clear Cart
            </button>
            <button
              onClick={() => nav("/farmer/checkout")}
              style={{ padding: "8px 12px" }}
            >
              Go to Checkout
            </button>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {rows.map((it) => (
              <CartRow
                key={it.productId}
                item={it}
                onUpdate={updateItem}
                onRemove={removeItem}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CartRow({ item, onUpdate, onRemove }) {
  const [qty, setQty] = useState(item.quantity);

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 12,
        display: "grid",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div>
          <h3 style={{ margin: 0 }}>{item.name}</h3>
          <div style={{ color: "#555" }}>
            <b>Status:</b> {item.status}
          </div>
          <div style={{ color: "#555" }}>
            <b>Product ID:</b> {item.productId}
          </div>
        </div>

        <button
          onClick={() => onRemove(item.productId)}
          style={{ padding: "8px 12px", cursor: "pointer" }}
        >
          Remove
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <label>
          Qty:{" "}
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            style={{ padding: 8, width: 120 }}
          />
        </label>

        <button
          onClick={() => onUpdate(item.productId, qty)}
          style={{ padding: "8px 12px", cursor: "pointer" }}
        >
          Update Qty
        </button>
      </div>
    </div>
  );
}

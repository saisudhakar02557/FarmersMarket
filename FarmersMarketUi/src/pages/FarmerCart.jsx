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

  if (loading) return <div className="info-banner info-banner--neutral">Loading cart...</div>;

  return (
    <div className="page">
      <header className="page-header">
        <h2 className="page-title">Your cart</h2>
        <p className="page-subtitle">Review items, adjust quantities, and get ready to check out.</p>
      </header>

      <div className="info-row">
        <span className="info-chip chip">Farmer ID: {farmerId || "(not set)"}</span>
      </div>

      {msg && <div className="info-banner">{msg}</div>}
      {err && <div className="info-banner info-banner--error">{err}</div>}

      {!cart || rows.length === 0 ? (
        <div className="panel card-panel">
          <div className="panel-title">Your cart is empty</div>
          <p>Browse inventory to start adding fresh produce.</p>
          <button className="btn" onClick={() => nav("/farmer/browse")}>Go to Browse</button>
        </div>
      ) : (
        <div className="section-grid">
          <div className="form-actions">
            <button className="btn-flat" onClick={clearCart}>Clear Cart</button>
            <button className="btn" onClick={() => nav("/farmer/checkout")}>Go to Checkout</button>
          </div>

          <div className="card-grid">
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
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">{item.name}</h3>
          <p className="card-subtitle">Product ID: {item.productId}</p>
        </div>
        <span className="badge badge--accent">{item.status}</span>
      </div>

      <div className="card-actions">
        <div className="input-field input-compact">
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
          <label className="active">Qty</label>
        </div>
        <button className="btn" onClick={() => onUpdate(item.productId, qty)}>Update Qty</button>
        <button className="btn-flat" onClick={() => onRemove(item.productId)}>
          Remove
        </button>
      </div>
    </div>
  );
}

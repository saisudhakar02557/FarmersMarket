import { useEffect, useMemo, useState } from "react";
import { gqlRequest } from "../api/graphqlFetch";

export default function FarmerBrowse() {
  const farmerId = localStorage.getItem("userId") || "";

  const [products, setProducts] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [search, setSearch] = useState("");
  const [qtyByProduct, setQtyByProduct] = useState({}); // { productId: qty }
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setErr("");
        setMsg("");

        const productsQuery = `
          query {
            products {
              id
              name
              description
              categoryId
              status
            }
          }
        `;

        const inventoriesQuery = `
          query {
            inventories {
              id
              managerId
              productId
              quantity
              price
              lastUpdated
            }
          }
        `;

        const [pData, iData] = await Promise.all([
          gqlRequest(productsQuery),
          gqlRequest(inventoriesQuery),
        ]);

        setProducts(pData.products || []);
        setInventories(iData.inventories || []);
      } catch (e) {
        setErr(e.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // Map products by id for quick lookup
  const productMap = useMemo(() => {
    const m = new Map();
    for (const p of products) m.set(p.id, p);
    return m;
  }, [products]);

  // Create a merged list of inventory rows with product data
  const merged = useMemo(() => {
    const rows = inventories.map((inv) => {
      const p = productMap.get(inv.productId);
      return {
        ...inv,
        productName: p?.name || "(Unknown Product)",
        productStatus: p?.status || "UNKNOWN",
        productDescription: p?.description || "",
      };
    });

    const s = search.trim().toLowerCase();
    if (!s) return rows;

    return rows.filter((r) =>
      (r.productName || "").toLowerCase().includes(s)
    );
  }, [inventories, productMap, search]);

  async function addToCart(productId) {
    try {
      setErr("");
      setMsg("");

      if (!farmerId) {
        setErr("Farmer ID missing. Go to Login and set your farmerId.");
        return;
      }

      const qty = Number(qtyByProduct[productId] ?? 1);
      if (!Number.isInteger(qty) || qty <= 0) {
        setErr("Quantity must be a positive number.");
        return;
      }

      const mutation = `
        mutation AddToCart($input: AddToCartInput!) {
          addToCart(input: $input) {
            id
            farmerId
            updatedAt
            items { productId quantity }
          }
        }
      `;

      const variables = {
        input: {
          farmerId,
          productId,
          quantity: qty,
        },
      };

      await gqlRequest(mutation, variables);

      setMsg(`Added ${qty} item(s) to cart ✅`);
    } catch (e) {
      setErr(e.message || "Add to cart failed");
    }
  }

  if (loading) return <div className="info-banner info-banner--neutral">Loading inventories...</div>;

  return (
    <div className="page">
      <header className="page-header">
        <h2 className="page-title">Browse inventory</h2>
        <p className="page-subtitle">Find fresh items, review stock levels, and add them to your cart.</p>
      </header>

      <div className="info-row">
        <span className="info-chip chip">Farmer ID: {farmerId || "(not set)"}</span>
        {!farmerId && <span className="info-chip info-chip--warning chip">Go to Login to set your farmer ID</span>}
      </div>

      <div className="search-row">
        <div className="input-field search-input">
          <input
            id="inventory-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name..."
          />
          <label htmlFor="inventory-search" className="active">Search products</label>
        </div>
        <span className="badge badge--accent">{merged.length} items</span>
      </div>

      {msg && <div className="info-banner">{msg}</div>}
      {err && <div className="info-banner info-banner--error">{err}</div>}

      {merged.length === 0 ? (
        <div className="info-banner info-banner--neutral">No inventory found.</div>
      ) : (
        <div className="card-grid">
          {merged.map((row) => (
            <div key={row.id} className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">{row.productName}</h3>
                  <p className="card-subtitle">{row.productDescription || "No description provided."}</p>
                </div>
                <span className="badge badge--success">{row.productStatus}</span>
              </div>

              <div className="divider" />

              <div className="meta-list">
                <div><span>Stock:</span> {row.quantity}</div>
                <div><span>Price:</span> ${row.price}</div>
                <div><span>Manager:</span> {row.managerId}</div>
                <div><span>Last Updated:</span> {row.lastUpdated}</div>
              </div>

              <div className="card-actions">
                <div className="input-field input-compact">
                  <input
                    type="number"
                    min="1"
                    value={qtyByProduct[row.productId] ?? 1}
                    onChange={(e) =>
                      setQtyByProduct((prev) => ({
                        ...prev,
                        [row.productId]: e.target.value,
                      }))
                    }
                  />
                  <label className="active">Qty</label>
                </div>
                <button className="btn" onClick={() => addToCart(row.productId)}>Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

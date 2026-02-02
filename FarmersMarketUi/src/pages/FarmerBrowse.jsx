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

  if (loading) return <p style={{ padding: 20 }}>Loading inventories...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Farmer: Browse Inventory</h2>

      <div style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 6 }}>
          <b>Farmer ID:</b> {farmerId || "(not set)"}{" "}
          {!farmerId && <span style={{ color: "crimson" }}> ← go to Login</span>}
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by product name..."
          style={{ padding: 8, width: 320 }}
        />
      </div>

      {msg && <div style={{ color: "green", marginBottom: 10 }}>{msg}</div>}
      {err && <pre style={{ color: "crimson" }}>{err}</pre>}

      {merged.length === 0 ? (
        <p>No inventory found.</p>
      ) : (
        <div style={{ display: "grid", gap: 12, maxWidth: 800 }}>
          {merged.map((row) => (
            <div
              key={row.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 12,
              }}
            >
              <h3 style={{ margin: 0 }}>{row.productName}</h3>
              <p style={{ margin: "6px 0", color: "#555" }}>
                {row.productDescription}
              </p>

              <div style={{ display: "grid", gap: 4 }}>
                <div><b>Product Status:</b> {row.productStatus}</div>
                <div><b>Stock:</b> {row.quantity}</div>
                <div><b>Price:</b> ${row.price}</div>
                <div><b>Manager:</b> {row.managerId}</div>
                <div><b>Last Updated:</b> {row.lastUpdated}</div>
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
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
                  style={{ padding: 8, width: 120 }}
                />

                <button
                  onClick={() => addToCart(row.productId)}
                  style={{ padding: "8px 12px", cursor: "pointer" }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

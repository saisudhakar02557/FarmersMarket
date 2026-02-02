import { useEffect, useState } from "react";
import { gqlRequest } from "../api/graphqlFetch";

export default function FarmerReviews() {
  const farmerId = localStorage.getItem("userId") || "";

  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");

  const [existingReview, setExistingReview] = useState(null);

  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState("");

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);

  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function loadProducts() {
    try {
      setLoading(true);
      setErr("");
      setMsg("");

      const q = `
        query {
          products { id name status }
        }
      `;
      const data = await gqlRequest(q);
      setProducts(data.products || []);
    } catch (e) {
      setErr(e.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function checkReview(productId) {
    if (!farmerId || !productId) return;

    try {
      setChecking(true);
      setErr("");
      setMsg("");
      setExistingReview(null);

      const q = `
        query ReviewByFarmerAndProduct($farmerId: String!, $productId: String!) {
          reviewByFarmerAndProduct(farmerId: $farmerId, productId: $productId) {
            id
            productId
            farmerId
            rating
            comments
            reviewDate
          }
        }
      `;

      const data = await gqlRequest(q, { farmerId, productId });
      setExistingReview(data.reviewByFarmerAndProduct || null);

      // reset form (optional)
      setRating(5);
      setComments("");
    } catch (e) {
      setErr(e.message || "Failed to check review");
    } finally {
      setChecking(false);
    }
  }

  async function addReview() {
    if (!farmerId) return setErr("Farmer ID missing. Go to Login.");
    if (!selectedProductId) return setErr("Select a product first.");

    const r = Number(rating);
    if (!Number.isInteger(r) || r < 1 || r > 5) return setErr("Rating must be 1 to 5.");

    try {
      setSaving(true);
      setErr("");
      setMsg("");

      const mutation = `
        mutation AddReview($input: AddReviewInput!) {
          addReview(input: $input) {
            id
            productId
            farmerId
            rating
            comments
            reviewDate
          }
        }
      `;

      const variables = {
        input: {
          productId: selectedProductId,
          farmerId,
          rating: r,
          comments: comments.trim() || null,
        },
      };

      const data = await gqlRequest(mutation, variables);
      setExistingReview(data.addReview);
      setMsg("Review added ✅");
    } catch (e) {
      // Backend will throw if not received — show that nicely
      setErr(e.message || "Add review failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p style={{ padding: 20 }}>Loading products...</p>;

  return (
    <div style={{ padding: 20, maxWidth: 800 }}>
      <h2>Farmer: Reviews</h2>
      <div style={{ marginBottom: 10 }}>
        <b>Farmer ID:</b> {farmerId || "(not set)"}
      </div>

      {msg && <div style={{ color: "green", marginBottom: 10 }}>{msg}</div>}
      {err && <pre style={{ color: "crimson" }}>{err}</pre>}

      <div style={{ display: "grid", gap: 10, maxWidth: 420 }}>
        <label>
          Select Product
          <select
            value={selectedProductId}
            onChange={(e) => {
              const pid = e.target.value;
              setSelectedProductId(pid);
              checkReview(pid);
            }}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="">-- choose --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.status})
              </option>
            ))}
          </select>
        </label>
      </div>

      {checking && <p>Checking existing review...</p>}

      {!selectedProductId ? null : existingReview ? (
        <div style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Your Review ✅</h3>
          <div><b>Rating:</b> {existingReview.rating}/5</div>
          <div><b>Comments:</b> {existingReview.comments || "(none)"}</div>
          <div><b>Date:</b> {existingReview.reviewDate}</div>
        </div>
      ) : (
        <div style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Add Review</h3>

          <div style={{ display: "grid", gap: 10, maxWidth: 420 }}>
            <label>
              Rating (1–5)
              <input
                type="number"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </label>

            <label>
              Comments
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="optional"
                rows={4}
                style={{ width: "100%", padding: 8 }}
              />
            </label>

            <button
              disabled={saving}
              onClick={addReview}
              style={{ padding: "10px 12px", cursor: "pointer" }}
            >
              {saving ? "Saving..." : "Submit Review"}
            </button>

            <div style={{ fontSize: 12, color: "#555" }}>
              Note: You can review only after your order is <b>RECEIVED</b> for that product.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

  if (loading) return <div className="info-banner info-banner--neutral">Loading products...</div>;

  return (
    <div className="page">
      <header className="page-header">
        <h2 className="page-title">Reviews</h2>
        <p className="page-subtitle">Share feedback on products after receiving your order.</p>
      </header>

      <div className="info-row">
        <span className="info-chip chip">Farmer ID: {farmerId || "(not set)"}</span>
      </div>

      {msg && <div className="info-banner">{msg}</div>}
      {err && <div className="info-banner info-banner--error">{err}</div>}

      <div className="card-panel form-grid">
        <div className="input-field">
          <select
            value={selectedProductId}
            onChange={(e) => {
              const pid = e.target.value;
              setSelectedProductId(pid);
              checkReview(pid);
            }}
            className="browser-default"
          >
            <option value="">-- choose --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.status})
              </option>
            ))}
          </select>
          <label className="active">Select Product</label>
        </div>
      </div>

      {checking && <div className="info-banner info-banner--neutral">Checking existing review...</div>}

      {!selectedProductId ? null : existingReview ? (
        <div className="card-panel">
          <h3 className="card-title">Your Review ✅</h3>
          <div className="meta-list">
            <div><span>Rating:</span> {existingReview.rating}/5</div>
            <div><span>Comments:</span> {existingReview.comments || "(none)"}</div>
            <div><span>Date:</span> {existingReview.reviewDate}</div>
          </div>
        </div>
      ) : (
        <div className="card-panel">
          <h3 className="card-title">Add Review</h3>

          <div className="form-grid">
            <div className="input-field input-compact">
              <input
                id="review-rating"
                type="number"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              />
              <label htmlFor="review-rating" className="active">Rating (1–5)</label>
            </div>

            <div className="input-field">
              <textarea
                id="review-comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="optional"
                rows={4}
                className="materialize-textarea"
              />
              <label htmlFor="review-comments" className="active">Comments</label>
            </div>

            <button
              className="btn"
              disabled={saving}
              onClick={addReview}
            >
              {saving ? "Saving..." : "Submit Review"}
            </button>

            <div className="info-chip info-chip--warning chip">
              Note: Reviews are available after orders are marked RECEIVED.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

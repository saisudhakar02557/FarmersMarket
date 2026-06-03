import { useCallback, useEffect, useState } from "react";
import { gqlRequest } from "../api/graphqlFetch";

export default function AdminDashboard() {
  const adminId = localStorage.getItem("userId") || "";
  const [roleFilter, setRoleFilter] = useState("Farmer");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [approveForm, setApproveForm] = useState({ managerId: "" });
  const [categoryForm, setCategoryForm] = useState({ name: "" });
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    categoryId: "",
  });

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setError("");
    try {
      const query = `
        query UsersByRole($role: String!) {
          usersByRole(role: $role) {
            id
            firstName
            lastName
            email
            status
            role
          }
        }
      `;
      const data = await gqlRequest(query, { role: roleFilter });
      setUsers(data.usersByRole ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingUsers(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleApproveManager = async (event) => {
    event.preventDefault();
    setStatus("");
    setError("");
    try {
      const mutation = `
        mutation ApproveManager($managerId: ID!) {
          approveManager(managerId: $managerId) {
            id
            status
            role
          }
        }
      `;
      await gqlRequest(mutation, { managerId: approveForm.managerId });
      setStatus("Manager approved.");
      setApproveForm({ managerId: "" });
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    setStatus("");
    setError("");
    try {
      const mutation = `
        mutation CreateCategory($input: CreateCategoryInput!) {
          createCategory(input: $input) {
            id
            name
          }
        }
      `;
      await gqlRequest(mutation, { input: { name: categoryForm.name } });
      setStatus("Category created.");
      setCategoryForm({ name: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    setStatus("");
    setError("");
    try {
      const mutation = `
        mutation CreateProduct($input: CreateProductInput!) {
          createProduct(input: $input) {
            id
            name
            status
          }
        }
      `;
      await gqlRequest(mutation, { input: productForm });
      setStatus("Product created.");
      setProductForm({ name: "", description: "", categoryId: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h2 className="page-title">Admin Command</h2>
        <p className="page-subtitle">Monitor system health, manage users, and review marketplace insights.</p>
      </header>

      <div className="info-row">
        <span className="info-chip chip">Admin ID: {adminId || "(not set)"}</span>
        {!adminId && <span className="info-chip info-chip--warning chip">Login to set your admin ID</span>}
      </div>
      {error && <div className="info-banner info-banner--error">{error}</div>}
      {status && <div className="info-banner info-banner--success">{status}</div>}

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Active farmers</div>
          <div className="stat-value">72</div>
          <div className="stat-caption">+8 this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Managers online</div>
          <div className="stat-value">6</div>
          <div className="stat-caption">Across 3 hubs</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Revenue tracked</div>
          <div className="stat-value">$48.2k</div>
          <div className="stat-caption">Last 30 days</div>
        </div>
      </div>

      <div className="section-grid">
        <section className="card card-panel">
          <div className="section-header">
            <div>
              <h3 className="card-title">User approvals</h3>
              <p className="card-subtitle">Approve manager accounts and monitor user roles.</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleApproveManager}>
            <div className="input-field">
              <input
                id="approve-manager-id"
                value={approveForm.managerId}
                onChange={(event) => setApproveForm({ managerId: event.target.value })}
                placeholder="Manager ID"
                required
              />
              <label htmlFor="approve-manager-id" className="active">Manager ID</label>
            </div>
            <div className="form-actions">
              <button className="btn" type="submit">Approve manager</button>
            </div>
          </form>
          <div className="form-grid">
            <div className="input-field">
              <select
                id="role-filter"
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="browser-default"
              >
                <option value="Farmer">Farmer</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
              <label htmlFor="role-filter" className="active">Filter by role</label>
            </div>
          </div>
          <div className="table-list">
            {loadingUsers && <div className="info-banner info-banner--neutral">Loading users...</div>}
            {!loadingUsers && users.length === 0 && (
              <div className="info-banner info-banner--neutral">No users for this role.</div>
            )}
            {users.map((user) => (
              <div key={user.id} className="table-item">
                <div><strong>Name:</strong> {user.firstName} {user.lastName}</div>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Role:</strong> {user.role}</div>
                <div><strong>Status:</strong> {user.status}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card card-panel">
          <div className="section-header">
            <div>
              <h3 className="card-title">Catalog management</h3>
              <p className="card-subtitle">Create categories and products for the marketplace.</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleCreateCategory}>
            <div className="input-field">
              <input
                id="category-name"
                value={categoryForm.name}
                onChange={(event) => setCategoryForm({ name: event.target.value })}
                placeholder="Produce"
                required
              />
              <label htmlFor="category-name" className="active">Category name</label>
            </div>
            <div className="form-actions">
              <button className="btn" type="submit">Create category</button>
            </div>
          </form>
          <form className="form-grid" onSubmit={handleCreateProduct}>
            <div className="input-field">
              <input
                id="product-name"
                value={productForm.name}
                onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Organic Kale"
                required
              />
              <label htmlFor="product-name" className="active">Product name</label>
            </div>
            <div className="input-field">
              <input
                id="product-description"
                value={productForm.description}
                onChange={(event) =>
                  setProductForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Optional"
              />
              <label htmlFor="product-description" className="active">Description</label>
            </div>
            <div className="input-field">
              <input
                id="product-category-id"
                value={productForm.categoryId}
                onChange={(event) =>
                  setProductForm((prev) => ({ ...prev, categoryId: event.target.value }))
                }
                placeholder="Category ID"
                required
              />
              <label htmlFor="product-category-id" className="active">Category ID</label>
            </div>
            <div className="form-actions">
              <button className="btn" type="submit">Create product</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import { gqlRequest } from "../api/graphqlFetch";

export default function ManagerDashboard() {
  const managerId = localStorage.getItem("userId") || "";
  const [inventories, setInventories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const [addInventoryForm, setAddInventoryForm] = useState({
    productId: "",
    quantity: "",
    price: "",
  });
  const [updateInventoryForm, setUpdateInventoryForm] = useState({
    inventoryId: "",
    quantity: "",
    price: "",
  });

  const fetchDashboard = useCallback(async () => {
    if (!managerId) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const query = `
        query ManagerDashboard($managerId: String!) {
          inventoriesByManager(managerId: $managerId) {
            id
            productId
            quantity
            price
            lastUpdated
          }
          ordersByManager(managerId: $managerId) {
            id
            farmerId
            status
            totalAmount
            orderDate
            items {
              productId
              quantity
              price
            }
          }
        }
      `;
      const data = await gqlRequest(query, { managerId });
      setInventories(data.inventoriesByManager ?? []);
      setOrders(data.ordersByManager ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [managerId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleAddInventory = async (event) => {
    event.preventDefault();
    setActionStatus("");
    if (!managerId) {
      setError("Manager ID is required to add inventory.");
      return;
    }
    setError("");
    try {
      const mutation = `
        mutation AddInventory($input: AddInventoryInput!) {
          addInventory(input: $input) {
            id
            productId
            quantity
            price
            lastUpdated
          }
        }
      `;
      await gqlRequest(mutation, {
        input: {
          managerId,
          productId: addInventoryForm.productId,
          quantity: Number(addInventoryForm.quantity),
          price: Number(addInventoryForm.price),
        },
      });
      setActionStatus("Inventory added.");
      setAddInventoryForm({ productId: "", quantity: "", price: "" });
      fetchDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateInventory = async (event) => {
    event.preventDefault();
    setActionStatus("");
    setError("");
    try {
      const mutation = `
        mutation UpdateInventory($input: UpdateInventoryInput!) {
          updateInventory(input: $input) {
            id
            productId
            quantity
            price
            lastUpdated
          }
        }
      `;
      await gqlRequest(mutation, {
        input: {
          inventoryId: updateInventoryForm.inventoryId,
          quantity: Number(updateInventoryForm.quantity),
          price: Number(updateInventoryForm.price),
        },
      });
      setActionStatus("Inventory updated.");
      setUpdateInventoryForm({ inventoryId: "", quantity: "", price: "" });
      fetchDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOrderAction = async (orderId, action) => {
    setActionStatus("");
    setError("");
    try {
      const mutation = `
        mutation OrderAction($orderId: ID!) {
          ${action}(orderId: $orderId) {
            id
            status
          }
        }
      `;
      await gqlRequest(mutation, { orderId });
      setActionStatus(`Order ${orderId} updated.`);
      fetchDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h2 className="page-title">Manager Control Center</h2>
        <p className="page-subtitle">Oversee inventory, dispatch orders, and coordinate with farmers.</p>
      </header>

      <div className="info-row">
        <span className="info-chip chip">Manager ID: {managerId || "(not set)"}</span>
        {!managerId && <span className="info-chip info-chip--warning chip">Login to set your manager ID</span>}
      </div>
      {error && <div className="info-banner info-banner--error">{error}</div>}
      {actionStatus && <div className="info-banner info-banner--success">{actionStatus}</div>}
      {managerId && loading && <div className="info-banner info-banner--neutral">Loading manager data...</div>}

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Active listings</div>
          <div className="stat-value">128</div>
          <div className="stat-caption">Across 6 categories</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Orders in queue</div>
          <div className="stat-value">14</div>
          <div className="stat-caption">Need dispatch today</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Low stock alerts</div>
          <div className="stat-value">5</div>
          <div className="stat-caption">Reorder soon</div>
        </div>
      </div>

      <div className="section-grid">
        <section className="card card-panel">
          <div className="section-header">
            <div>
              <h3 className="card-title">Inventory highlights</h3>
              <p className="card-subtitle">Track and update live inventory for this manager.</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleAddInventory}>
            <div className="input-field">
              <input
                id="add-product-id"
                value={addInventoryForm.productId}
                onChange={(event) =>
                  setAddInventoryForm((prev) => ({ ...prev, productId: event.target.value }))
                }
                placeholder="Product ID"
                required
              />
              <label htmlFor="add-product-id" className="active">Product ID</label>
            </div>
            <div className="input-field">
              <input
                id="add-quantity"
                type="number"
                min="0"
                value={addInventoryForm.quantity}
                onChange={(event) =>
                  setAddInventoryForm((prev) => ({ ...prev, quantity: event.target.value }))
                }
                placeholder="0"
                required
              />
              <label htmlFor="add-quantity" className="active">Quantity</label>
            </div>
            <div className="input-field">
              <input
                id="add-price"
                type="number"
                min="0"
                step="0.01"
                value={addInventoryForm.price}
                onChange={(event) =>
                  setAddInventoryForm((prev) => ({ ...prev, price: event.target.value }))
                }
                placeholder="0.00"
                required
              />
              <label htmlFor="add-price" className="active">Price</label>
            </div>
            <div className="form-actions">
              <button className="btn" type="submit" disabled={!managerId}>
                Add inventory
              </button>
            </div>
          </form>
          <form className="form-grid" onSubmit={handleUpdateInventory}>
            <div className="input-field">
              <input
                id="update-inventory-id"
                value={updateInventoryForm.inventoryId}
                onChange={(event) =>
                  setUpdateInventoryForm((prev) => ({ ...prev, inventoryId: event.target.value }))
                }
                placeholder="Inventory ID"
                required
              />
              <label htmlFor="update-inventory-id" className="active">Inventory ID</label>
            </div>
            <div className="input-field">
              <input
                id="update-quantity"
                type="number"
                min="0"
                value={updateInventoryForm.quantity}
                onChange={(event) =>
                  setUpdateInventoryForm((prev) => ({ ...prev, quantity: event.target.value }))
                }
                placeholder="0"
                required
              />
              <label htmlFor="update-quantity" className="active">Quantity</label>
            </div>
            <div className="input-field">
              <input
                id="update-price"
                type="number"
                min="0"
                step="0.01"
                value={updateInventoryForm.price}
                onChange={(event) =>
                  setUpdateInventoryForm((prev) => ({ ...prev, price: event.target.value }))
                }
                placeholder="0.00"
                required
              />
              <label htmlFor="update-price" className="active">Price</label>
            </div>
            <div className="form-actions">
              <button className="btn" type="submit" disabled={!managerId}>
                Update inventory
              </button>
            </div>
          </form>
          <div className="table-list">
            {inventories.length === 0 && managerId && !loading && (
              <div className="info-banner info-banner--neutral">No inventory records yet.</div>
            )}
            {inventories.map((item) => (
              <div key={item.id} className="table-item">
                <div><strong>Inventory ID:</strong> {item.id}</div>
                <div><strong>Product ID:</strong> {item.productId}</div>
                <div><strong>Quantity:</strong> {item.quantity}</div>
                <div><strong>Price:</strong> ${item.price.toFixed(2)}</div>
                <div><strong>Last updated:</strong> {item.lastUpdated}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card card-panel">
          <div className="section-header">
            <div>
              <h3 className="card-title">Dispatch queue</h3>
              <p className="card-subtitle">Orders ready for pickup and delivery confirmation.</p>
            </div>
          </div>
          <div className="card-grid card-grid--two">
            {orders.length === 0 && managerId && !loading && (
              <div className="info-banner info-banner--neutral">No orders assigned yet.</div>
            )}
            {orders.map((order) => (
              <div key={order.id} className="panel card-panel">
                <div className="panel-title">{order.id}</div>
                <div className="meta-list">
                  <div><span>Farmer:</span> {order.farmerId}</div>
                  <div><span>Status:</span> {order.status}</div>
                  <div><span>Total:</span> ${order.totalAmount.toFixed(2)}</div>
                  <div><span>Order date:</span> {order.orderDate}</div>
                </div>
                <div className="table-list">
                  {order.items.map((item, index) => (
                    <div key={`${order.id}-${item.productId}-${index}`} className="table-item">
                      <div><strong>Product ID:</strong> {item.productId}</div>
                      <div><strong>Quantity:</strong> {item.quantity}</div>
                      <div><strong>Price:</strong> ${item.price.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
                <div className="card-actions">
                  <button className="btn" type="button" onClick={() => handleOrderAction(order.id, "acceptOrder")}>
                    Accept
                  </button>
                  <button type="button" className="btn-flat" onClick={() => handleOrderAction(order.id, "rejectOrder")}>
                    Reject
                  </button>
                  <button className="btn" type="button" onClick={() => handleOrderAction(order.id, "dispatchOrder")}>
                    Mark dispatched
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

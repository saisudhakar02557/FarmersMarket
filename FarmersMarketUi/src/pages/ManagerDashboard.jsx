export default function ManagerDashboard() {
  const managerId = localStorage.getItem("userId") || "";

  return (
    <div className="page">
      <header className="page-header">
        <h2 className="page-title">Manager Control Center</h2>
        <p className="page-subtitle">Oversee inventory, dispatch orders, and coordinate with farmers.</p>
      </header>

      <div className="info-row">
        <span className="info-chip">Manager ID: {managerId || "(not set)"}</span>
        {!managerId && <span className="info-chip info-chip--warning">Login to set your manager ID</span>}
      </div>

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
        <section className="card">
          <div className="section-header">
            <div>
              <h3 className="card-title">Inventory highlights</h3>
              <p className="card-subtitle">Track top-performing and low-stock products.</p>
            </div>
            <button className="ghost-button">Add new listing</button>
          </div>
          <div className="table-list">
            {[
              { name: "Organic Tomatoes", stock: 44, status: "Healthy stock" },
              { name: "Baby Spinach", stock: 8, status: "Low stock" },
              { name: "Golden Potatoes", stock: 62, status: "Healthy stock" },
            ].map((item) => (
              <div key={item.name} className="table-item">
                <div><strong>Product:</strong> {item.name}</div>
                <div><strong>On hand:</strong> {item.stock} units</div>
                <div><strong>Status:</strong> {item.status}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="section-header">
            <div>
              <h3 className="card-title">Dispatch queue</h3>
              <p className="card-subtitle">Orders ready for pickup and delivery confirmation.</p>
            </div>
            <button>View all orders</button>
          </div>
          <div className="card-grid card-grid--two">
            {[
              { id: "ORD-3491", farmer: "Green Acres Farm", eta: "Today, 4:00 PM" },
              { id: "ORD-3495", farmer: "Sunny Fields", eta: "Tomorrow, 9:00 AM" },
            ].map((order) => (
              <div key={order.id} className="panel">
                <div className="panel-title">{order.id}</div>
                <div className="meta-list">
                  <div><span>Farmer:</span> {order.farmer}</div>
                  <div><span>ETA:</span> {order.eta}</div>
                </div>
                <div className="card-actions">
                  <button>Mark dispatched</button>
                  <button className="ghost-button">Contact farmer</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

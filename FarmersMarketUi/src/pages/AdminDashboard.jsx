export default function AdminDashboard() {
  const adminId = localStorage.getItem("userId") || "";

  return (
    <div className="page">
      <header className="page-header">
        <h2 className="page-title">Admin Command</h2>
        <p className="page-subtitle">Monitor system health, manage users, and review marketplace insights.</p>
      </header>

      <div className="info-row">
        <span className="info-chip">Admin ID: {adminId || "(not set)"}</span>
        {!adminId && <span className="info-chip info-chip--warning">Login to set your admin ID</span>}
      </div>

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
        <section className="card">
          <div className="section-header">
            <div>
              <h3 className="card-title">User approvals</h3>
              <p className="card-subtitle">Review recent signup requests and access changes.</p>
            </div>
            <button className="ghost-button">View all</button>
          </div>
          <div className="table-list">
            {[
              { name: "Harvest Ridge Farms", role: "Farmer", status: "Pending" },
              { name: "North Market Hub", role: "Manager", status: "Pending" },
              { name: "Olive Grove Co.", role: "Farmer", status: "Approved" },
            ].map((item) => (
              <div key={item.name} className="table-item">
                <div><strong>Account:</strong> {item.name}</div>
                <div><strong>Role:</strong> {item.role}</div>
                <div><strong>Status:</strong> {item.status}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="section-header">
            <div>
              <h3 className="card-title">System safeguards</h3>
              <p className="card-subtitle">Quick controls for risk mitigation and platform integrity.</p>
            </div>
            <button>Open settings</button>
          </div>
          <div className="card-grid card-grid--two">
            {[
              { title: "Fraud monitoring", detail: "2 alerts need review" },
              { title: "Data exports", detail: "Last export 2 days ago" },
              { title: "Support queue", detail: "4 escalations open" },
              { title: "API health", detail: "99.9% uptime" },
            ].map((item) => (
              <div key={item.title} className="panel">
                <div className="panel-title">{item.title}</div>
                <p>{item.detail}</p>
                <button className="ghost-button">Review</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

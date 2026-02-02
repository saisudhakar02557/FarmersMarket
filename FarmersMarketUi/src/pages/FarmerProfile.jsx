import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FarmerProfile() {
  const [role, setRole] = useState("FARMER");
  const [userId, setUserId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("role") || "FARMER";
    const storedUserId = localStorage.getItem("userId") || "";
    setRole(storedRole);
    setUserId(storedUserId);
  }, []);

  function saveSession(e) {
    e.preventDefault();
    if (!userId.trim()) {
      setStatusMessage("Please enter a user ID before saving.");
      return;
    }

    localStorage.setItem("role", role);
    localStorage.setItem("userId", userId.trim());
    setStatusMessage("Session updated.");
  }

  function clearSession() {
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    setRole("FARMER");
    setUserId("");
    setStatusMessage("Session cleared. Redirecting to login...");
    setTimeout(() => navigate("/login"), 600);
  }

  return (
    <div className="page">
      <header className="page-header">
        <h2 className="page-title">Farmer Profile & Session</h2>
        <p className="page-subtitle">
          Review your current role, update the active user ID, or quickly reset
          the demo session.
        </p>
      </header>

      <div className="info-row">
        <span className="info-chip">Current role: {role || "—"}</span>
        <span className="info-chip">User ID: {userId || "Not set"}</span>
      </div>

      {statusMessage && <div className="info-banner">{statusMessage}</div>}

      <form className="form-grid" onSubmit={saveSession}>
        <label>
          Role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="FARMER">FARMER</option>
            <option value="MANAGER">MANAGER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </label>

        <label>
          User ID
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="e.g. 697ff0d28d3077d52606a059"
          />
        </label>

        <div className="form-actions">
          <button type="submit">Save session</button>
          <button type="button" className="ghost-button" onClick={clearSession}>
            Logout & clear
          </button>
          <button type="button" className="ghost-button" onClick={() => navigate("/farmer/browse")}>
            Back to browse
          </button>
        </div>
      </form>

      <div className="section-grid">
        <div className="panel">
          <p className="panel-title">Quick links</p>
          <div className="table-list">
            <div className="table-item">Browse products → /farmer/browse</div>
            <div className="table-item">View cart → /farmer/cart</div>
            <div className="table-item">Orders → /farmer/orders</div>
          </div>
        </div>
        <div className="panel">
          <p className="panel-title">Session tips</p>
          <p className="page-subtitle">
            Use this page to swap between farmer, manager, and admin roles while
            demoing. All pages read the same local storage values.
          </p>
        </div>
      </div>
    </div>
  );
}

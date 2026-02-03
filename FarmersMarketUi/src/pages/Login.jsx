import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [role, setRole] = useState("FARMER");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();

  function onSubmit(e) {
    e.preventDefault();
    if (!userId.trim()) {
      setError("Enter your MongoDB user ID to continue.");
      return;
    }

    localStorage.setItem("role", role);
    localStorage.setItem("userId", userId.trim());
    setError("");
    nav("/test");
  }

  return (
    <div className="page">
      <header className="page-header">
        <h2 className="page-title">Welcome back</h2>
        <p className="page-subtitle">Choose your role and enter your user ID to continue.</p>
      </header>

      {error && <div className="info-banner info-banner--error">{error}</div>}

      <form onSubmit={onSubmit} className="card-panel form-grid">
        <div className="input-field">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="browser-default"
          >
            <option value="FARMER">FARMER</option>
            <option value="MANAGER">MANAGER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <label className="active">Role</label>
        </div>

        <div className="input-field">
          <input
            id="user-id"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              setError("");
            }}
            placeholder="e.g. 697ff0d28d3077d52606a059"
          />
          <label htmlFor="user-id" className="active">User ID</label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn">Continue</button>
          <span className="info-chip info-chip--warning">Temporary login flow</span>
        </div>
      </form>
    </div>
  );
}

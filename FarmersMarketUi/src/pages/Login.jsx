import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [role, setRole] = useState("FARMER");
  const [userId, setUserId] = useState("");
  const nav = useNavigate();

  function onSubmit(e) {
    e.preventDefault();
    if (!userId.trim()) return alert("Enter your MongoDB userId");

    localStorage.setItem("role", role);
    localStorage.setItem("userId", userId.trim());

    nav("/test");
  }

  return (
    <div className="page">
      <header className="page-header">
        <h2 className="page-title">Welcome back</h2>
        <p className="page-subtitle">Choose your role and enter your user ID to continue.</p>
      </header>

      <form onSubmit={onSubmit} className="form-grid">
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
          <button type="submit">Continue</button>
          <span className="info-chip info-chip--warning">Temporary login flow</span>
        </div>
      </form>
    </div>
  );
}

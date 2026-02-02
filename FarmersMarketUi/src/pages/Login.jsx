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
    <div style={{ padding: 20 }}>
      <h2>Login (Temporary)</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
        <label>
          Role:
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: "100%", padding: 8 }}>
            <option value="FARMER">FARMER</option>
            <option value="MANAGER">MANAGER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </label>

        <label>
          UserId:
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="e.g. 697ff0d28d3077d52606a059"
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <button style={{ padding: 10 }}>Continue</button>
      </form>
    </div>
  );
}

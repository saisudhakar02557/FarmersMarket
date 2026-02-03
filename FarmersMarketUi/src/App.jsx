import { Routes, Route, Link, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login.jsx";
import TestGraphQL from "./pages/TestGraphQL.jsx";
import FarmerBrowse from "./pages/FarmerBrowse.jsx";
import FarmerCart from "./pages/FarmerCart.jsx";
import GraphiQLPage from "./pages/GraphiQLPage.jsx";
import FarmerCheckout from "./pages/FarmerCheckout.jsx";
import FarmerOrders from "./pages/FarmerOrders.jsx";
import FarmerReviews from "./pages/FarmerReviews.jsx";
import FarmerProfile from "./pages/FarmerProfile.jsx";
import ManagerDashboard from "./pages/ManagerDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Assistant from "./pages/Assistant.jsx";

function RoleRoute({ allowedRoles, children }) {
  const role = localStorage.getItem("role") || "";
  const userId = localStorage.getItem("userId") || "";
  const normalizedRole = role.trim().toLowerCase();
  const normalizedUserId = userId.trim();
  const allowed = allowedRoles.map((allowedRole) => allowedRole.toLowerCase());

  if (!normalizedUserId || !normalizedRole || !allowed.includes(normalizedRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}








export default function App() {
  return (
    <div className="app-shell">
      <header className="navbar-fixed">
        <nav className="app-nav">
          <div className="nav-wrapper">
            <Link to="/" className="brand-logo">
              <span className="brand-logo__icon" aria-hidden="true">🌿</span>
              Farmers Marketplace
            </Link>
            <div className="app-nav__links">
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/test" className="nav-link">Test GraphQL</Link>
              <Link to="/farmer/browse" className="nav-link">Farmer Browse</Link>
              <Link to="/farmer/cart" className="nav-link">Cart</Link>
              <Link to="/farmer/profile" className="nav-link">Farmer Profile</Link>
              <Link to="/graphiql-ui" className="nav-link">GraphiQL UI</Link>
              <Link to="/farmer/checkout" className="nav-link">Checkout</Link>
              <Link to="/farmer/orders" className="nav-link">Orders</Link>
              <Link to="/farmer/reviews" className="nav-link">Reviews</Link>
              <Link to="/assistant" className="nav-link">Assistant</Link>
              <Link to="/manager" className="nav-link">Manager</Link>
              <Link to="/admin" className="nav-link">Admin</Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="app-content container">
        <section className="content-card card">
          <div className="card-content">
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/test" element={<TestGraphQL />} />
              <Route
                path="/farmer/browse"
                element={
                  <RoleRoute allowedRoles={["farmer"]}>
                    <FarmerBrowse />
                  </RoleRoute>
                }
              />
              <Route
                path="/farmer/cart"
                element={
                  <RoleRoute allowedRoles={["farmer"]}>
                    <FarmerCart />
                  </RoleRoute>
                }
              />
              <Route
                path="/farmer/profile"
                element={
                  <RoleRoute allowedRoles={["farmer"]}>
                    <FarmerProfile />
                  </RoleRoute>
                }
              />
              <Route path="/graphiql-ui" element={<GraphiQLPage />} />
              <Route
                path="/farmer/checkout"
                element={
                  <RoleRoute allowedRoles={["farmer"]}>
                    <FarmerCheckout />
                  </RoleRoute>
                }
              />
              <Route
                path="/farmer/orders"
                element={
                  <RoleRoute allowedRoles={["farmer"]}>
                    <FarmerOrders />
                  </RoleRoute>
                }
              />
              <Route
                path="/farmer/reviews"
                element={
                  <RoleRoute allowedRoles={["farmer"]}>
                    <FarmerReviews />
                  </RoleRoute>
                }
              />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/manager" element={<ManagerDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </div>
        </section>
      </main>
    </div>
  );
}

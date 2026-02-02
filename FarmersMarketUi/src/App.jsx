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
import ManagerDashboard from "./pages/ManagerDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";








export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">🌿</span>
          <div>
            <p className="brand-title">Farmers Marketplace</p>
            <p className="brand-subtitle">Fresh produce, simple ordering, and a smooth farmer experience.</p>
          </div>
        </div>
        <div className="header-actions">
          <span className="status-chip">GraphQL Connected UI</span>
          <span className="status-chip status-chip--accent">Demo Environment</span>
        </div>
      </header>

      <nav className="app-nav">
        <Link to="/login" className="nav-link">Login</Link>
        <Link to="/test" className="nav-link">Test GraphQL</Link>
        <Link to="/farmer/browse" className="nav-link">Farmer Browse</Link>
        <Link to="/farmer/cart" className="nav-link">Cart</Link>
        <Link to="/graphiql-ui" className="nav-link">GraphiQL UI</Link>
        <Link to="/farmer/checkout" className="nav-link">Checkout</Link>
        <Link to="/farmer/orders" className="nav-link">Orders</Link>
        <Link to="/farmer/reviews" className="nav-link">Reviews</Link>
        <Link to="/manager" className="nav-link">Manager</Link>
        <Link to="/admin" className="nav-link">Admin</Link>
      </nav>

      <main className="app-content">
        <div className="content-card">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/test" element={<TestGraphQL />} />
            <Route path="/farmer/browse" element={<FarmerBrowse />} />
            <Route path="/farmer/cart" element={<FarmerCart />} />
            <Route path="/graphiql-ui" element={<GraphiQLPage />} />
            <Route path="/farmer/checkout" element={<FarmerCheckout />} />
            <Route path="/farmer/orders" element={<FarmerOrders />} />
            <Route path="/farmer/reviews" element={<FarmerReviews />} />
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

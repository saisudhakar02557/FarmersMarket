import { Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import TestGraphQL from "./pages/TestGraphQL.jsx";
import FarmerBrowse from "./pages/FarmerBrowse.jsx";
import FarmerCart from "./pages/FarmerCart.jsx";
import GraphiQLPage from "./pages/GraphiQLPage.jsx";
import FarmerCheckout from "./pages/FarmerCheckout.jsx";
import FarmerOrders from "./pages/FarmerOrders.jsx";
import FarmerReviews from "./pages/FarmerReviews.jsx";








export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Farmer Marketplace UI</h1>

      <nav style={{ marginBottom: 16 }}>
        <Link to="/login" style={{ marginRight: 12 }}>Login</Link>
        <Link to="/test" style={{ marginRight: 12 }}>Test GraphQL</Link>
        <Link to="/farmer/browse">Farmer Browse</Link>
        <Link to="/farmer/cart" style={{ marginLeft: 12 }}>Cart</Link>
        <Link to="/graphiql-ui" style={{ marginLeft: 12 }}>GraphiQL UI</Link>
       
        <Link to="/farmer/checkout" style={{ marginLeft: 12 }}>Checkout</Link>
        <Link to="/farmer/orders" style={{ marginLeft: 12 }}>Orders</Link>
        <Link to="/farmer/reviews" style={{ marginLeft: 12 }}>Reviews</Link>

      </nav>

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

      </Routes>
    </div>
  );
}

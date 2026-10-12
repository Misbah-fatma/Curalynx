import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import "./App.css";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "./Pages/DashBoard";
import About from "./Pages/About";
import Products from "./Pages/Products";
import Faq from "./Pages/Faq";
import Contact from "./Pages/Contact";
import Cart from "./Pages/Cart";
import ProductDetails from "./Pages/ProductDetails";
import CheckoutPage from "./Pages/Payment/CheckOut";
import OrderSuccess from "./Pages/Payment/OrderSuccess";
import Wishlist from "./Pages/WishList";
import Profile from "./Pages/Profile";
import FloatingActions from "./Pages/floatingActions";

function App() {
  return (
    <Router>
      <FloatingActions />
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/type/:type" element={<Products />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/wishList" element={<Wishlist />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/products/:id" element={<ProductDetails />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;

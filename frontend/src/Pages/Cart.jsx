import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useCart } from "../Context/CartContext";
import SEO from "../Components/Seo";

const Cart = () => {
  const { cart, setCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [successPopup, setSuccessPopup] = useState(null);

  useEffect(() => {
    if (!location.state?.orderSuccess) return;

    const order = location.state.order;
    setSuccessPopup({
      orderId: order?._id || order?.order?._id || "",
      amount: order?.amount,
      paymentMethod: order?.paymentMethod,
    });

    // Clear navigation state so refresh doesn't reopen the popup
    navigate("/cart", { replace: true, state: null });
  }, [location.state, navigate]);

  const closeSuccessPopup = () => setSuccessPopup(null);

  const cartItemKey = (item) => `${item._id}__${item.packSize || "default"}`;

  const increaseQty = (item) => {
    setCart((prev) =>
      prev.map((cartItem) =>
        cartItemKey(cartItem) === cartItemKey(item)
          ? { ...cartItem, qty: cartItem.qty + 1 }
          : cartItem
      )
    );
  };

  const decreaseQty = (item) => {
    setCart((prev) =>
      prev
        .map((cartItem) =>
          cartItemKey(cartItem) === cartItemKey(item)
            ? { ...cartItem, qty: Math.max(1, cartItem.qty - 1) }
            : cartItem
        )
        .filter((cartItem) => cartItem.qty > 0)
    );
  };

  const removeItem = (item) => {
    setCart((prev) =>
      prev.filter((cartItem) => cartItemKey(cartItem) !== cartItemKey(item))
    );
  };

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  const handleCheckout = () => {
    navigate("/checkout", {
      state: {
        cart,
        totalPrice,
      },
    });
  };

  return (
    <>
      <SEO
        title="Buy Medicines Online | Curalynx Pharma"
        description="Shop trusted medicines and healthcare products online with fast delivery."
      />

      <Navbar />

      <section className="cart_area py-5 bg-light">
        <div className="container">
          {cart.length === 0 ? (
            <div className="text-center py-5 bg-white rounded shadow-sm">
              <h4>Your cart is empty 🛒</h4>
              <p className="text-muted mt-2">
                Add some products to continue shopping
              </p>
              <a href="/products" className="btn btn-primary mt-3">
                Go to Shop
              </a>
            </div>
          ) : (
            <div className="row">
              <div className="col-lg-8">
                {cart.map((item) => (
                  <div
                    className="card mb-3 shadow-sm border-0"
                    key={cartItemKey(item)}
                  >
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-md-3 text-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="img-fluid rounded"
                            style={{ maxHeight: "100px" }}
                          />
                        </div>

                        <div className="col-md-4">
                          <h6 className="mb-1 font-weight-bold">{item.name}</h6>
                          <small className="text-muted d-block">
                            {item.category}
                          </small>
                          {item.packSize ? (
                            <small className="text-muted d-block mt-1">
                              Pack size: {item.packSize} units · $
                              {Number(item.price).toFixed(2)} each
                            </small>
                          ) : (
                            <small className="text-muted d-block mt-1">
                              ${Number(item.price).toFixed(2)} each
                            </small>
                          )}
                        </div>

                        <div className="col-md-3">
                          <div className="d-flex align-items-center">
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => decreaseQty(item)}
                            >
                              −
                            </button>
                            <span className="mx-3 font-weight-bold">
                              {item.qty}
                            </span>
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => increaseQty(item)}
                            >
                              +
                            </button>
                          </div>
                          <small className="text-muted d-block mt-1">
                            Qty: {item.qty}
                          </small>
                        </div>

                        <div className="col-md-2 text-right">
                          <p className="mb-1 font-weight-bold">
                            ${(item.price * item.qty).toFixed(2)}
                          </p>
                          <button
                            className="btn btn-link text-danger p-0"
                            onClick={() => removeItem(item)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="col-lg-4">
                <div className="card shadow-sm border-0">
                  <div className="card-body">
                    <h5 className="font-weight-bold mb-3">Order Summary</h5>

                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                      <span>Shipping</span>
                      <span className="text-success">Free</span>
                    </div>

                    <hr />

                    <div className="d-flex justify-content-between font-weight-bold">
                      <span>Total</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>

                    <button
                      className="btn btn-primary btn-block mt-4"
                      onClick={handleCheckout}
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {successPopup && (
        <div
          className="order-success-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-success-title"
          onClick={closeSuccessPopup}
        >
          <div
            className="order-success-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="order-success-popup__close"
              aria-label="Close"
              onClick={closeSuccessPopup}
            >
              ×
            </button>

            <div className="order-success-popup__icon" aria-hidden="true">
              ✓
            </div>

            <h3 id="order-success-title">Order Successful!</h3>
            <p className="order-success-popup__lead">
              Thank you for your purchase. Your order has been received and is
              pending payment verification.
            </p>

            <div className="order-success-popup__details">
              {successPopup.orderId && (
                <div className="order-success-popup__row">
                  <span>Order ID</span>
                  <strong>{successPopup.orderId}</strong>
                </div>
              )}
              {successPopup.amount != null && (
                <div className="order-success-popup__row">
                  <span>Amount</span>
                  <strong>${Number(successPopup.amount).toFixed(2)}</strong>
                </div>
              )}
              {successPopup.paymentMethod && (
                <div className="order-success-popup__row">
                  <span>Payment</span>
                  <strong style={{ textTransform: "capitalize" }}>
                    {successPopup.paymentMethod}
                  </strong>
                </div>
              )}
            </div>

            <p className="order-success-popup__note">
              A confirmation email has been sent. We’ll notify you once payment
              is verified.
            </p>

            <div className="order-success-popup__actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={closeSuccessPopup}
              >
                Continue Shopping
              </button>
              <a href="/" className="btn btn-outline-secondary">
                Back to Home
              </a>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Cart;

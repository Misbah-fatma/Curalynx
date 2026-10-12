import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import SEO from "../Components/Seo";
import { useWishlist } from "../Context/WishListContext";
import { useCart } from "../Context/CartContext";
import { CATEGORY_LABELS } from "../constants/medicineTypes";
import {
  FaHeart,
  FaShoppingCart,
  FaTrashAlt,
  FaBoxOpen,
} from "react-icons/fa";

const Wishlist = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState("");
  const feedbackTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

  const showFeedback = (message) => {
    setFeedback(message);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(""), 2200);
  };

  const handleAddToCart = (item) => {
    addToCart(item);
    showFeedback("Added to cart");
  };

  const handleRemove = (id, name) => {
    removeFromWishlist(id);
    showFeedback(`${name || "Item"} removed`);
  };

  const handleMoveAllToCart = () => {
    if (!wishlist.length) return;
    wishlist.forEach((item) => addToCart(item));
    clearWishlist();
    showFeedback("All items moved to cart");
  };

  const itemCount = wishlist.length;
  const totalValue = wishlist.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0
  );

  return (
    <div className="wishlist-page">
      <SEO
        title="My Wishlist"
        description="View and manage your saved medicines at Curalynx Pharma."
        keywords="wishlist, saved medicines, pharmacy"
        url="https://curalynxpharma.online/wishlist"
      />

      <Navbar />

      <section className="banner_area">
        <div className="banner_inner d-flex align-items-center">
          <div className="container">
            <div className="banner_content d-md-flex justify-content-between align-items-center">
              <div className="mb-3 mb-md-0">
                <h2>My Wishlist</h2>
                <p>Keep track of medicines you love and add them anytime.</p>
              </div>
              <div className="page_link">
                <Link to="/">Home</Link>
                <span>Wishlist</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="wishlist-catalog">
        <div className="container">
          <div className="wishlist-toolbar">
            <div className="wishlist-toolbar__main">
              <div className="wishlist-toolbar__icon" aria-hidden="true">
                <FaHeart />
              </div>
              <div className="wishlist-toolbar__info">
                <p className="wishlist-toolbar__eyebrow mb-0">Saved items</p>
                <h3 className="wishlist-toolbar__title mb-0">
                  {itemCount === 0
                    ? "Your wishlist is empty"
                    : `${itemCount} item${itemCount === 1 ? "" : "s"} saved`}
                </h3>
                {itemCount > 0 && (
                  <p className="wishlist-toolbar__subtitle mb-0">
                    Estimated total{" "}
                    <strong>${totalValue.toFixed(2)}</strong>
                  </p>
                )}
              </div>
            </div>

            {itemCount > 0 && (
              <div className="wishlist-toolbar__actions">
                <Link to="/products" className="wishlist-btn wishlist-btn--ghost">
                  Continue shopping
                </Link>
                <button
                  type="button"
                  className="wishlist-btn wishlist-btn--primary"
                  onClick={handleMoveAllToCart}
                >
                  <FaShoppingCart />
                  Add all to cart
                </button>
              </div>
            )}
          </div>

          {wishlist.length === 0 ? (
            <div className="wishlist-empty">
              <div className="wishlist-empty__icon">
                <FaHeart />
              </div>
              <h4>Nothing saved yet</h4>
              <p>
                Browse our catalog and tap Wishlist on products you want to
                come back to later.
              </p>
              <Link to="/products" className="main_btn">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="wishlist-grid">
              {wishlist.map((item) => {
                const inStock = Number(item.quantity) > 0 || item.quantity == null;

                return (
                  <article key={item._id} className="wishlist-card">
                    <button
                      type="button"
                      className="wishlist-card__remove"
                      onClick={() => handleRemove(item._id, item.name)}
                      aria-label={`Remove ${item.name}`}
                      title="Remove"
                    >
                      <FaTrashAlt />
                    </button>

                    <div
                      className="wishlist-card__media"
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/products/${item._id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(`/products/${item._id}`);
                        }
                      }}
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.name} loading="lazy" />
                      ) : (
                        <div className="wishlist-card__placeholder">
                          <FaBoxOpen />
                        </div>
                      )}
                    </div>

                    <div className="wishlist-card__body">
                      <p className="wishlist-card__meta">
                        {item.category ||
                          CATEGORY_LABELS[item.medicineType] ||
                          "Medicine"}
                      </p>
                      <h6
                        className="wishlist-card__name"
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/products/${item._id}`)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            navigate(`/products/${item._id}`);
                          }
                        }}
                      >
                        {item.name}
                      </h6>

                      <div className="wishlist-card__footer">
                        <span className="wishlist-card__price">
                          ${Number(item.price || 0).toFixed(2)}
                        </span>
                        <span
                          className={`wishlist-card__stock ${
                            inStock ? "is-in" : "is-out"
                          }`}
                        >
                          {inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>

                      <div className="wishlist-card__actions">
                        <button
                          type="button"
                          className="wishlist-card__btn is-primary"
                          disabled={!inStock}
                          onClick={() => handleAddToCart(item)}
                        >
                          <FaShoppingCart />
                          <span>Add to Cart</span>
                        </button>
                        <button
                          type="button"
                          className="wishlist-card__btn"
                          onClick={() => handleRemove(item._id, item.name)}
                        >
                          <FaTrashAlt />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {feedback && (
        <div className="products-toast" role="status">
          {feedback}
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Wishlist;

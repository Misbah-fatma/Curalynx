import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCart } from "../Context/CartContext";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaShoppingCart,
  FaHeart,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaCheck,
  FaSortAmountDown,
  FaBoxOpen,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useWishlist } from "../Context/WishListContext";
import SEO from "../Components/Seo";
import { CATEGORY_LABELS } from "../constants/medicineTypes";

const PRODUCTS_PER_PAGE = 12;

const SORT_OPTIONS = [
  { value: "default", label: "Default", description: "Newest first" },
  { value: "price-low", label: "Price: Low to High", description: "Cheapest first" },
  { value: "price-high", label: "Price: High to Low", description: "Most expensive first" },
  { value: "name", label: "Name A–Z", description: "Alphabetical order" },
];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const sortRef = useRef(null);
  const feedbackTimer = useRef(null);
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const navigate = useNavigate();
  const { type } = useParams();

  const activeSort =
    SORT_OPTIONS.find((option) => option.value === sort) || SORT_OPTIONS[0];

  const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PRODUCTS_PER_PAGE + 1;
  const rangeEnd = Math.min(page * PRODUCTS_PER_PAGE, total);

  const showFeedback = (message) => {
    setFeedback(message);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(""), 2200);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const params = {
        page,
        limit: PRODUCTS_PER_PAGE,
        sort,
      };

      if (type) {
        params.medicineType = type;
      }

      const res = await axios.get(`${process.env.REACT_APP_BASEURL}/products`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = res.data;
      if (data && Array.isArray(data.products)) {
        setProducts(data.products);
        setTotal(data.total ?? 0);
      } else if (Array.isArray(data)) {
        setProducts(data);
        setTotal(data.length);
      } else {
        setProducts([]);
        setTotal(0);
      }
    } catch (err) {
      console.error(err);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, sort, type]);

  useEffect(() => {
    setPage(1);
  }, [type]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setSortOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setSortOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

  const handleSortChange = (value) => {
    setSort(value);
    setPage(1);
    setSortOpen(false);
  };

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageTitle = type ? CATEGORY_LABELS[type] || type : "All Products";
  const pageLabel = type ? CATEGORY_LABELS[type] || type : "All Products";

  const visiblePages = (() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }

    return pages;
  })();

  return (
    <div>
    <div className="products-page">
      <SEO
        title={type ? `${pageTitle} Medicines` : "All Medicines"}
        description={
          type
            ? `Browse our ${pageTitle} medicines at Curalynx Pharma. Trusted and affordable healthcare products.`
            : "Browse all trusted medicines and healthcare products at Curalynx Pharma."
        }
        keywords={
          type
            ? `${pageTitle} medicines, pharmacy, buy ${pageTitle}`
            : "buy medicines online, pharmacy products, healthcare"
        }
        url={`https://curalynxpharma.online/products${type ? `/type/${type}` : ""}`}
      />

      <Navbar />

      <section className="banner_area">
        <div className="banner_inner d-flex align-items-center">
          <div className="container">
            <div className="banner_content d-md-flex justify-content-between align-items-center">
              <div className="mb-3 mb-md-0">
                <h2>{pageTitle}</h2>
                <p>
                  Trusted medicines with clear pricing, fast delivery, and
                  verified quality.
                </p>
              </div>

              <div className="page_link">
                <Link to="/">Home</Link>
                <span>{pageLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="products-catalog">
        <div className="container">
          <div className="products-toolbar">
            <div className="products-toolbar__info">
              <p className="products-toolbar__eyebrow mb-0">Catalog</p>
              <p className="products-toolbar__count mb-0" id="resultCount">
                {loading ? (
                  "Loading products..."
                ) : (
                  <>
                    Showing <strong>{rangeStart}–{rangeEnd}</strong> of{" "}
                    <strong>{total}</strong> results
                  </>
                )}
              </p>
            </div>

            <div
              className={`products-sort ${sortOpen ? "is-open" : ""}`}
              ref={sortRef}
            >
              <span className="products-sort__label">Sort by</span>
              <button
                type="button"
                className="products-sort__trigger"
                onClick={() => setSortOpen((open) => !open)}
                aria-haspopup="listbox"
                aria-expanded={sortOpen}
              >
                <FaSortAmountDown className="products-sort__icon" />
                <span className="products-sort__value">{activeSort.label}</span>
                <FaChevronDown className="products-sort__chevron" />
              </button>

              <div
                className="products-sort__menu"
                role="listbox"
                aria-hidden={!sortOpen}
              >
                {SORT_OPTIONS.map((option) => {
                  const isActive = option.value === sort;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      className={`products-sort__option ${isActive ? "is-active" : ""}`}
                      onClick={() => handleSortChange(option.value)}
                    >
                      <span className="products-sort__option-text">
                        <span className="products-sort__option-label">
                          {option.label}
                        </span>
                        <span className="products-sort__option-desc">
                          {option.description}
                        </span>
                      </span>
                      {isActive && (
                        <FaCheck className="products-sort__check" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={`products-grid ${loading ? "is-loading" : ""}`}>
            {loading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="products-skeleton">
                  <div className="products-skeleton__media" />
                  <div className="products-skeleton__line short" />
                  <div className="products-skeleton__line" />
                  <div className="products-skeleton__line mid" />
                </div>
              ))
            ) : products.length > 0 ? (
              products.map((product) => {
                const inStock = Number(product.quantity) > 0;

                return (
                  <article
                    key={product._id}
                    className="shop-product-card products-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/products/${product._id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/products/${product._id}`);
                      }
                    }}
                  >
                    <div className="shop-product-card__media">
                      {product.onSale && (
                        <span className="shop-product-card__badge">Sale</span>
                      )}
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                      />
                    </div>

                    <div className="shop-product-card__body">
                      <p className="shop-product-card__meta">
                        {product.category ||
                          CATEGORY_LABELS[product.medicineType] ||
                          "Medicine"}
                      </p>
                      <h6 className="shop-product-card__name">{product.name}</h6>
                      <div className="shop-product-card__footer">
                        <span className="shop-product-card__price">
                          ${Number(product.price).toFixed(2)}
                        </span>
                        <span
                          className={`shop-product-card__stock ${
                            inStock ? "is-in" : "is-out"
                          }`}
                        >
                          {inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>

                      <div className="products-card__actions">
                        <button
                          type="button"
                          className="products-card__action is-primary"
                          disabled={!inStock}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!inStock) return;
                            addToCart(product);
                            showFeedback("Added to cart");
                          }}
                        >
                          <FaShoppingCart />
                          <span>Add to Cart</span>
                        </button>
                        <button
                          type="button"
                          className="products-card__action"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToWishlist(product);
                            showFeedback("Added to wishlist");
                          }}
                        >
                          <FaHeart />
                          <span>Wishlist</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="products-empty">
                <div className="products-empty__icon">
                  <FaBoxOpen />
                </div>
                <h4>No products found</h4>
                <p>
                  There are no medicines available in this category right now.
                  Try another category or check back later.
                </p>
                <Link to="/products" className="main_btn">
                  Browse All Products
                </Link>
              </div>
            )}
          </div>

          {!loading && totalPages > 1 && (
            <nav className="products-pagination" aria-label="Product pages">
              <button
                type="button"
                className="products-pagination__btn"
                disabled={page === 1}
                onClick={() => goToPage(page - 1)}
                aria-label="Previous page"
              >
                <FaChevronLeft />
              </button>

              {visiblePages[0] > 1 && (
                <>
                  <button
                    type="button"
                    className="products-pagination__btn"
                    onClick={() => goToPage(1)}
                  >
                    1
                  </button>
                  {visiblePages[0] > 2 && (
                    <span className="products-pagination__ellipsis">…</span>
                  )}
                </>
              )}

              {visiblePages.map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  className={`products-pagination__btn ${
                    pageNum === page ? "is-active" : ""
                  }`}
                  onClick={() => goToPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}

              {visiblePages[visiblePages.length - 1] < totalPages && (
                <>
                  {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                    <span className="products-pagination__ellipsis">…</span>
                  )}
                  <button
                    type="button"
                    className="products-pagination__btn"
                    onClick={() => goToPage(totalPages)}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                type="button"
                className="products-pagination__btn"
                disabled={page === totalPages}
                onClick={() => goToPage(page + 1)}
                aria-label="Next page"
              >
                <FaChevronRight />
              </button>
            </nav>
          )}
        </div>
      </section>

      {feedback && (
        <div className="products-toast" role="status">
          {feedback}
        </div>
      )}
    </div>
   <Footer />
   </div>
  );
};

export default Products;

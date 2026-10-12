import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useCart } from "../Context/CartContext";
import SEO from "../Components/Seo";
import { sanitizeProductHtml } from "../utils/sanitizeProductHtml";
import { CATEGORY_LABELS } from "../constants/medicineTypes";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const { addToCart } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [packSize, setPackSize] = useState();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    comment: "",
    rating: 5,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get(`${process.env.REACT_APP_BASEURL}/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then((res) => setProduct(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}/reviews/${id}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch reviews");
      }

      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };


  useEffect(() => {
    if (id) {
      fetchReviews();
    }
  }, [id]);

  const openReviewModal = () => {
    setReviewError("");
    setReviewSuccess("");
    setHoverRating(0);
    setShowModal(true);
  };

  const closeReviewModal = () => {
    if (reviewSubmitting) return;
    setShowModal(false);
    setReviewError("");
    setHoverRating(0);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess("");

    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) {
      setReviewError("Please fill in your name and review.");
      return;
    }

    try {
      setReviewSubmitting(true);
      const res = await fetch(`${process.env.REACT_APP_BASEURL}/reviews/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: reviewForm.name.trim(),
          comment: reviewForm.comment.trim(),
          rating: Number(reviewForm.rating),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit review");

      setReviewSuccess("Thank you! Your review has been submitted.");
      setReviewForm({ name: "", comment: "", rating: 5 });
      await fetchReviews();
      setTimeout(() => {
        setShowModal(false);
        setReviewSuccess("");
      }, 900);
    } catch (error) {
      setReviewError(error.message || "Could not submit review. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASEURL}/products`
        );

        const filtered = res.data
          .filter((p) => p._id !== id)
          .slice(0, 4);

        setRelatedProducts(filtered);
      } catch (error) {
        console.error("Error fetching related products:", error);
      }
    };

    if (id) {
      fetchRelatedProducts();
    }
  }, [id]);


  const getSection = (type) =>
    product.sections?.find((section) => section.type === type);

  if (!product) return <p className="text-center mt-5">Loading...</p>;

  return (
    <>
      <Navbar />
      <SEO
        title="Buy Medicines Online | Curalynx Pharma"
        description="Shop trusted medicines and healthcare products online with fast delivery."
      />
      <section className="product-details bg-light py-5">
        <div className="container mt-5">
          {/* ===== Top Section ===== */}
          <div className="container py-5">
            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="card border-0">
                  <img
                    src={product.image}
                    className="card-img-top rounded"
                    alt={product.name}
                    style={{ maxHeight: "420px", objectFit: "cover" }}
                  />

                  {/* Thumbnails (optional – reuse same image for now) */}
                  <div className="card-body">
                    <div className="row g-2">
                      {[1, 2, 3, 4].map((_, i) => (
                        <div className="col-3" key={i}>
                          <img
                            src={product.image}
                            className="img-thumbnail"
                            alt="Thumbnail"
                            style={{ cursor: "pointer" }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ===== RIGHT : PRODUCT INFO ===== */}
              <div className="col-md-6">

                <h1 className="h3 mb-2 fw-bold">{product.name}</h1>

                <p className="text-muted mb-1">
                  <strong>Category:</strong> {product.category}
                </p>

                <p className="text-muted mb-3">
                  <strong>Type:</strong>{" "}
                  {CATEGORY_LABELS[product.medicineType] || product.medicineType}
                </p>

                <div className="mb-3">
                  <span className="h4 text-primary fw-bold me-2">
                    $
                    {packSize
                      ? (product.price * packSize).toFixed(2)
                      : product.price.toFixed(2)}
                  </span>

                  <small className="text-muted d-block">
                    {packSize
                      ? `${product.price} per unit × ${packSize}`
                      : "Price per unit"}
                  </small>
                </div>

                {product.description && (
                  <ul className="mb-4 ps-3">
                    {product.description
                      .split(".")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((s, i) => (
                        <li key={i}>{s}.</li>
                      ))}
                  </ul>
                )}

                {/* ===== QUANTITY ===== */}
                <div className="mb-4">
                  <label className="fw-semibold d-block mb-2">Select Quantity:</label>

                  <div className="d-flex gap-3 flex-wrap">
                    {[30, 60, 90, 180, 360].map((pack) => (
                      <div
                        key={pack}
                        onClick={() => setPackSize(pack)}
                        className="border rounded text-center px-2 py-2 fw-semibold"
                        style={{
                          cursor: "pointer",
                          minWidth: "60px",
                          backgroundColor: packSize === pack ? "#000" : "#fff",
                          color: packSize === pack ? "#fff" : "#000",
                          transition: "0.3s",
                        }}
                      >
                        {pack}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ===== ADD TO CART ===== */}
                <div className="d-grid gap-2 mb-4">
                  <button
                    className="btn btn-dark"
                    disabled={!packSize}
                    onClick={() =>
                      addToCart({
                        ...product,
                        packSize,
                        price: product.price,
                        qty: packSize,
                      })
                    }
                  >
                    {packSize
                      ? `Add to Cart (${packSize} units)`
                      : "Select quantity first"}
                  </button>
                </div>

                {/* ===== TRUST INFO ===== */}
                <div className="mt-4">
                  <div className="d-flex align-items-center mb-2">
                    <i className="fas fa-truck text-primary me-2"></i>
                    <span>Fast & secure delivery</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <i className="fas fa-shield-alt text-primary me-2"></i>
                    <span>Verified medicines only</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="fas fa-check-circle text-primary me-2"></i>
                    <span>Prescription checked where required</span>
                  </div>
                </div>

              </div>
            </div>
          </div>


          {/* ===== Tabs ===== */}
          <div className="row">
            <div className="col-12">
              <ul className="nav nav-tabs product-detail-tabs mb-4">
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${activeTab === "description" ? "active" : ""}`}
                    onClick={() => setActiveTab("description")}
                  >
                    Description
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${activeTab === "info" ? "active" : ""}`}
                    onClick={() => setActiveTab("info")}
                  >
                    Additional Info
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${activeTab === "specs" ? "active" : ""}`}
                    onClick={() => setActiveTab("specs")}
                  >
                    Specs
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${activeTab === "reviews" ? "active" : ""}`}
                    onClick={() => setActiveTab("reviews")}
                  >
                    Reviews
                  </button>
                </li>
              </ul>

              <div className="tab-content p-4 border rounded bg-white product-detail-panel">
                {activeTab === "description" && (
                  <div
                    className="product-rich-content"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeProductHtml(
                        getSection("description")?.content ||
                          product.description ||
                          "<p>No description available.</p>"
                      ),
                    }}
                  />
                )}

                {activeTab === "info" && (
                  <div className="product-rich-content">
                    {getSection("additional_info")?.content ? (
                      typeof getSection("additional_info").content === "string" ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: sanitizeProductHtml(
                              getSection("additional_info").content
                            ),
                          }}
                        />
                      ) : (
                        <pre className="mb-0">
                          {JSON.stringify(getSection("additional_info").content, null, 2)}
                        </pre>
                      )
                    ) : (
                      <p className="text-muted mb-0">No additional information available.</p>
                    )}
                  </div>
                )}

                {activeTab === "specs" && (
                  <div>
                    {getSection("table")?.content &&
                    typeof getSection("table").content === "object" ? (
                      <div className="table-responsive">
                        <table className="table table-bordered mb-0">
                          <tbody>
                            {Object.entries(getSection("table").content)
                              .filter(([, value]) => value !== "" && value != null)
                              .map(([key, value]) => (
                                <tr key={key}>
                                  <th className="bg-light text-capitalize" style={{ width: "40%" }}>
                                    {key.replace(/([A-Z])/g, " $1").trim()}
                                  </th>
                                  <td>{String(value)}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted mb-0">No specification data available.</p>
                    )}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div>
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                      <div>
                        <h5 className="mb-1 fw-bold">Customer Reviews</h5>
                        <p className="text-muted mb-0 small">
                          {reviews.length === 0
                            ? "Be the first to share your experience"
                            : `${reviews.length} review${reviews.length === 1 ? "" : "s"}`}
                          {product.rating
                            ? ` · ${Number(product.rating).toFixed(1)} average`
                            : ""}
                        </p>
                      </div>
                      <button
                        className="btn btn-dark"
                        type="button"
                        onClick={openReviewModal}
                      >
                        Write a Review
                      </button>
                    </div>

                    {reviews.length === 0 ? (
                      <div className="text-center py-4 border rounded bg-light">
                        <p className="text-muted mb-3">No reviews yet for this medicine.</p>
                        <button
                          className="btn btn-outline-dark btn-sm"
                          type="button"
                          onClick={openReviewModal}
                        >
                          Add the first review
                        </button>
                      </div>
                    ) : (
                      <div className="row g-3">
                        {reviews.map((rev) => (
                          <div className="col-12" key={rev._id || rev.createdAt}>
                            <div className="card border-0 shadow-sm">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div>
                                    <h6 className="mb-1 fw-semibold">{rev.name}</h6>
                                    <div className="text-warning small" aria-label={`${rev.rating} stars`}>
                                      {"★".repeat(rev.rating)}
                                      <span className="text-muted">
                                        {"★".repeat(Math.max(0, 5 - rev.rating))}
                                      </span>
                                    </div>
                                  </div>
                                  {rev.createdAt && (
                                    <small className="text-muted">
                                      {new Date(rev.createdAt).toLocaleDateString()}
                                    </small>
                                  )}
                                </div>
                                <p className="mb-0 text-secondary">{rev.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>

            </div>
          </div>
          {/* ===== Related Products ===== */}
<section className="container my-5">
  <div className="d-flex justify-content-between align-items-center mb-4">
    <h4 className="fw-bold mb-0">Related Products</h4>
  </div>

  <div className="row g-4">
    {relatedProducts.map((item) => (
      <div key={item._id} className="col-6 col-md-4 col-lg-3">
        <div className="card h-100 border-0 shadow-sm position-relative product-card">

          {/* Image */}
          <div className="overflow-hidden rounded-top">
            <img
              src={item.image}
              alt={item.name}
              className="card-img-top img-fluid product-img"
              style={{ height: "220px", objectFit: "cover", transition: "0.4s" }}
            />
          </div>

          {/* Body */}
          <div className="card-body d-flex flex-column text-center">
            <h6 className="fw-semibold mb-2">{item.name}</h6>

            <p className="text-primary fw-bold fs-5 mb-3">
              ${item.price}
            </p>

            <button
              className="btn btn-dark mt-auto "
              onClick={() =>
                (window.location.href = `/products/${item._id}`)
              }
            >
              View Details
            </button>
          </div>

        </div>
      </div>
    ))}
  </div>
</section>

        </div>
      </section>
      {showModal && (
        <div
          className="review-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
          onClick={closeReviewModal}
        >
          <div
            className="review-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="review-modal__close"
              aria-label="Close"
              onClick={closeReviewModal}
            >
              ×
            </button>

            <div className="review-modal__header">
              <h3 id="review-modal-title">Write a Review</h3>
              <p>
                Share your experience with{" "}
                <strong>{product.name}</strong>
              </p>
            </div>

            {reviewError && (
              <div className="alert alert-danger py-2">{reviewError}</div>
            )}
            {reviewSuccess && (
              <div className="alert alert-success py-2">{reviewSuccess}</div>
            )}

            <form onSubmit={handleReviewSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Your rating</label>
                <div className="review-star-picker" role="radiogroup" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || reviewForm.rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        className={`review-star ${active ? "is-active" : ""}`}
                        aria-label={`${star} star${star > 1 ? "s" : ""}`}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() =>
                          setReviewForm((prev) => ({ ...prev, rating: star }))
                        }
                      >
                        ★
                      </button>
                    );
                  })}
                  <span className="review-star-label">
                    {reviewForm.rating}/5
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold" htmlFor="review-name">
                  Your name
                </label>
                <input
                  id="review-name"
                  type="text"
                  className="form-control"
                  required
                  placeholder="Enter your name"
                  value={reviewForm.name}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, name: e.target.value })
                  }
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold" htmlFor="review-comment">
                  Your review
                </label>
                <textarea
                  id="review-comment"
                  className="form-control"
                  required
                  rows={4}
                  placeholder="What did you like or dislike about this medicine?"
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closeReviewModal}
                  disabled={reviewSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-dark px-4"
                  disabled={reviewSubmitting}
                >
                  {reviewSubmitting ? "Submitting…" : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default ProductDetails;

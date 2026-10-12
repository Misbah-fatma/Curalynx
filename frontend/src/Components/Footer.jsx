import { useEffect, useState } from "react";
import axios from "axios";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    if (!showSuccessPopup) return undefined;

    const timer = setTimeout(() => setShowSuccessPopup(false), 4000);
    return () => clearTimeout(timer);
  }, [showSuccessPopup]);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", text: "" });
    setSubmitting(true);

    try {
      await axios.post(`${process.env.REACT_APP_BASEURL}/contact/newsletter`, {
        email,
      });
      setEmail("");
      setStatus({ type: "", text: "" });
      setShowSuccessPopup(true);
    } catch (err) {
      setStatus({
        type: "error",
        text:
          err.response?.data?.message ||
          "Failed to subscribe. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <footer className="footer-area area-padding-top">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-sm-6 single-footer-widget">
              <h2>
                About <br /> CuralynxPharma
              </h2>
              <ul className="mt-4">
                <li>
                  Promoting well-being with trusted information and premium
                  healthcare products for a healthier lifestyle.
                </li>
              </ul>
            </div>
            <div className="col-lg-2 col-sm-6 single-footer-widget">
              <h4>Essential Links</h4>
              <ul>
                <li>
                  <a href="/">Home</a>
                </li>
                <li>
                  <a href="/">About Us</a>
                </li>
                <li>
                  <a href="/">Shop Medicines</a>
                </li>
                <li>
                  <a href="/">Track Order</a>
                </li>
              </ul>
            </div>
            <div className="col-lg-2 col-sm-6 single-footer-widget">
              <h4>Our Policy</h4>
              <ul>
                <li>
                  <a href="/">Privacy Policy</a>
                </li>
                <li>
                  <a href="/">Terms & Conditons</a>
                </li>
                <li>
                  <a href="/">Refund</a>
                </li>
                <li>
                  <a href="/">Return Policies</a>
                </li>
              </ul>
            </div>
            <div className="col-lg-4 col-md-6 single-footer-widget">
              <h4>Newsletter</h4>
              <p>You can trust us. We only send promo offers,</p>
              <div className="form-wrap" id="mc_embed_signup">
                <form className="form-inline" onSubmit={handleNewsletterSubmit}>
                  <input
                    className="form-control"
                    name="EMAIL"
                    placeholder="Your Email Address"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                  />
                  <button
                    className="click-btn btn btn-default"
                    type="submit"
                    disabled={submitting}
                    aria-label="Subscribe to newsletter"
                  >
                    <i className="ti-arrow-right"></i>
                  </button>
                  <div className="info">
                    {status.text && (
                      <span
                        className={
                          status.type === "success"
                            ? "text-success"
                            : "text-danger"
                        }
                      >
                        {status.text}
                      </span>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="row footer-bottom d-flex justify-content-between">
            <p className="col-lg-8 col-sm-12 footer-text m-0">
              Copyright © 2025 CuralynxPharma. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {showSuccessPopup && (
        <div
          className="newsletter-popup-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="newsletter-popup-title"
          onClick={() => setShowSuccessPopup(false)}
        >
          <div
            className="newsletter-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="newsletter-popup__close"
              aria-label="Close"
              onClick={() => setShowSuccessPopup(false)}
            >
              ×
            </button>
            <div className="newsletter-popup__icon" aria-hidden="true">
              ✓
            </div>
            <h3 id="newsletter-popup-title">You're subscribed!</h3>
            <p>
              A confirmation email has been sent. Thanks for joining Curalynx
              Pharma.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;

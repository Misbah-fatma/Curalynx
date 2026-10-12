import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import SEO from "../Components/Seo";
import FaqAccordion from "../Components/FaqAccordion";
import {
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
} from "../constants/medicineTypes";

const About = () => {
  const navigate = useNavigate();
  const [groupedProducts, setGroupedProducts] = useState({});
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${process.env.REACT_APP_BASEURL}/products`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => {
        const groups = {};
        const picks = [];

        res.data.forEach((product) => {
          const type = product.medicineType;
          if (!groups[type]) groups[type] = [];
          groups[type].push(product);
        });

        CATEGORY_ORDER.forEach((cat) => {
          (groups[cat] || []).slice(0, 1).forEach((p) => {
            if (picks.length < 8) picks.push(p);
          });
        });

        if (picks.length < 8) {
          res.data.forEach((p) => {
            if (picks.length >= 8) return;
            if (!picks.find((x) => x._id === p._id)) picks.push(p);
          });
        }

        setGroupedProducts(groups);
        setFeatured(picks);
      })
      .catch((err) => console.error(err));
  }, []);

  const availableCategories = CATEGORY_ORDER;

  return (
    <div>
      <SEO
        title="Buy Medicines Online | Curalynx Pharma"
        description="Shop trusted medicines and healthcare products online with fast delivery."
      />

      <Navbar />
      <section className="banner_area">
        <div className="banner_inner d-flex align-items-center">
          <div className="container">
            <div className="banner_content d-md-flex justify-content-between align-items-center">
              <div className="mb-3 mb-md-0">
                <h2>About Us</h2>
                <p>Trusted care, genuine medicines, and support you can rely on</p>
              </div>
              <div className="page_link">
                <Link to="/">Home</Link>
                <Link to="/about">About Us</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-area mb-4">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-10 offset-md-1 col-lg-6 offset-lg-6 offset-xl-7 col-xl-5">
              <div className="about-content">
                <h4>
                  Our Commitment
                  <br />
                  Goes Beyond
                  <br />
                  Medicines
                </h4>

                <h6>
                  We believe healthcare is built on confidence, care, and meaningful support
                  tailored to every individual.
                </h6>

                <p>
                  At Curalynx, our approach focuses on more than supplying medications. We aim
                  to guide, inform, and stand by you throughout your wellness journey. From
                  reliable products to expert advice, we are dedicated to helping you make
                  informed decisions and feel supported at every stage of your health.
                </p>

                <Link className="link_one" to="/products">
                  Browse Medicines
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="service-area area-padding-top">
        <div className="container">
          <div className="area-heading row">
            <div className="col-md-5 col-xl-4">
              <h3>
                Our Purpose
                <br />& Care Promise
              </h3>
            </div>
            <div className="col-md-7 col-xl-8">
              <p>
                We are dedicated to delivering trusted pharmaceutical services that put people
                first. By combining expert care, ethical practices, and modern solutions, we
                support individuals in making confident health decisions while strengthening a
                healthier, connected community.
              </p>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 col-lg-4 d-flex">
              <div className="card-service text-center text-lg-left mb-4 mb-lg-0 h-100 w-100 d-flex flex-column">
                <span className="card-service__icon">
                  <i className="flaticon-brain"></i>
                </span>
                <h3 className="card-service__title">Dedicated Care Support</h3>
                <p className="card-service__subtitle flex-grow-1">
                  Work closely with a qualified pharmacist who understands your health needs.
                  From medication guidance to lifestyle advice, we help keep your treatment
                  aligned and effective.
                </p>
                <Link className="card-service__link mt-auto" to="/faq">
                  Explore Care
                </Link>
              </div>
            </div>

            <div className="col-md-6 col-lg-4 d-flex">
              <div className="card-service text-center text-lg-left mb-4 mb-lg-0 h-100 w-100 d-flex flex-column">
                <span className="card-service__icon">
                  <i className="flaticon-tooth"></i>
                </span>
                <h3 className="card-service__title">Smart Health Management</h3>
                <p className="card-service__subtitle flex-grow-1">
                  Stay consistent with your medications through proactive refill alerts and
                  structured support. Our system is designed to make ongoing care simpler,
                  reliable, and stress-free.
                </p>
                <Link className="card-service__link mt-auto" to="/products">
                  Stay On Track
                </Link>
              </div>
            </div>

            <div className="col-md-6 col-lg-4 d-flex">
              <div className="card-service text-center text-lg-left mb-4 mb-lg-0 h-100 w-100 d-flex flex-column">
                <span className="card-service__icon">
                  <i className="flaticon-face"></i>
                </span>
                <h3 className="card-service__title">Always-On Care Concierge</h3>
                <p className="card-service__subtitle flex-grow-1">
                  Access professional assistance whenever you need it. Our care concierge is
                  available around the clock to answer questions, support orders, and ensure
                  peace of mind—day or night.
                </p>
                <Link className="card-service__link mt-auto" to="/contact">
                  We’re Available
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="about-medicines area-padding">
        <div className="container">
          <div className="area-heading row">
            <div className="col-md-5 col-xl-4">
              <h3>
                Medicines
                <br />
                We Offer
              </h3>
            </div>
            <div className="col-md-7 col-xl-8">
              <p>
                From everyday essentials to specialized treatments, our catalog is organized
                by care needs so you can find trusted medications quickly and confidently.
              </p>
            </div>
          </div>

          <div className="row g-3 mb-5">
            {availableCategories.map((cat) => {
              const count = (groupedProducts[cat] || []).length;
              return (
                <div key={cat} className="col-6 col-md-4 col-lg-3">
                  <Link to={`/products/type/${cat}`} className="about-med-cat">
                    <span className="about-med-cat__icon">
                      <i className={CATEGORY_ICONS[cat] || "ti-package"}></i>
                    </span>
                    <span className="about-med-cat__label">{CATEGORY_LABELS[cat]}</span>
                    <span className="about-med-cat__count">
                      {count} item{count === 1 ? "" : "s"}
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>

          {featured.length > 0 ? (
            <>
              <div className="about-medicines__subhead">
                <h4>Featured medicines</h4>
                <p>A quick look at products from our most requested categories.</p>
              </div>

              <div className="row g-4">
                {featured.map((product) => (
                  <div key={product._id} className="col-12 col-sm-6 col-lg-3 d-flex">
                    <article
                      className="shop-product-card h-100 w-100"
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
                        <img src={product.image} alt={product.name} loading="lazy" />
                      </div>
                      <div className="shop-product-card__body">
                        <p className="shop-product-card__meta">
                          {CATEGORY_LABELS[product.medicineType] ||
                            product.category ||
                            "Medicine"}
                        </p>
                        <h6 className="shop-product-card__name">{product.name}</h6>
                        <div className="shop-product-card__footer">
                          <span className="shop-product-card__price">
                            ${Number(product.price).toFixed(2)}
                          </span>
                          <span
                            className={`shop-product-card__stock ${
                              product.quantity > 0 ? "is-in" : "is-out"
                            }`}
                          >
                            {product.quantity > 0 ? "In Stock" : "Out of Stock"}
                          </span>
                        </div>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="shop-category__empty text-center py-4">
              <p className="mb-0">Medicines are loading or unavailable right now.</p>
            </div>
          )}
        </div>
      </section>

      <section className="appointment-area area-padding-top">
        <div className="container">
          <div className="appointment-inner">
            <div className="row">
              <div className="col-sm-12 col-lg-10 offset-lg-1">
                <FaqAccordion />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonial">
        <div className="container">
          <div className="testi_slider owl-carousel owl-theme">
            <div className="item">
              <div className="testi_item">
                <div className="testimonial_image">
                  <img src="img/elements/tes1.jpg" alt="" />
                </div>
                <div className="testi_item_content">
                  <p>
                    “ Saw kind fruitful itself in man. All in life good wherein beginning their
                    he air That, the saw very years created for seed have without. Can&apos;t
                    him fowl his can not ready for game”
                  </p>
                  <h4>- Dr. Suzanne Holroyd -</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;

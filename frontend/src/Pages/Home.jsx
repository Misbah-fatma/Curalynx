import Footer from "../Components/Footer";
import Navbar from "../Components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import SEO from "../Components/Seo";
import { useEffect, useState } from "react";
import axios from "axios";
import FaqAccordion from "../Components/FaqAccordion";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "../constants/medicineTypes";

export default function HomePage() {
  const [groupedProducts, setGroupedProducts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${process.env.REACT_APP_BASEURL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const groups = {};
        res.data.forEach((product) => {
          const type = product.medicineType;
          if (!groups[type]) groups[type] = [];
          if (groups[type].length < 4) groups[type].push(product);
        });
        setGroupedProducts(groups);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
     <div>
      <SEO
  title="Buy Medicines Online | Curalynx Pharma"
  description="Shop trusted medicines and healthcare products online with fast delivery."
/>

<Navbar/>
    <section className="banner-area d-flex align-items-center">
        <div className="container">
          <div className="row">
            <div className="col-md-8 col-lg-6 col-xl-5">
              <h1>Your Trusted<br/>
                Pharmacy Partner</h1>

              <p>
                We provide genuine medicines, healthcare essentials, and expert guidance to
                support your well-being every day. From prescriptions to wellness products,
                our pharmacy is committed to safe, reliable, and affordable healthcare for you
                and your family.
              </p>

              <Link className="main_btn" to="/products/type/Painkiller">Order Medicines</Link>
              <a href="/cart" className="main_btn_light">Your Products</a>
            </div>
          </div>
        </div>
      </section>
      <section className="feature-section">
        <div className="container">
          <div className="row">

            <div className="col-md-4 d-flex">
              <div className="card card-feature text-center text-lg-left h-100 w-100">
                <h3 className="card-feature__title">
                  <span className="card-feature__icon">
                    <i className="ti-layers"></i>
                  </span>
                  Premium Medications
                </h3>
                <p className="card-feature__subtitle mb-0">
                  Access a wide range of high-quality medicines designed to support both
                  mental and physical wellness, including treatments for anxiety, depression,
                  and pain relief.
                </p>
              </div>
            </div>

            <div className="col-md-4 d-flex">
              <div className="card card-feature text-center text-lg-left h-100 w-100">
                <h3 className="card-feature__title">
                  <span className="card-feature__icon">
                    <i className="ti-heart-broken"></i>
                  </span>
                  Trusted Health Solutions
                </h3>
                <p className="card-feature__subtitle mb-0">
                  Shop with confidence knowing every product is carefully selected,
                  authentic, and backed by expert guidance to ensure safe and effective care.
                </p>
              </div>
            </div>

            <div className="col-md-4 d-flex">
              <div className="card card-feature text-center text-lg-left h-100 w-100">
                <h3 className="card-feature__title">
                  <span className="card-feature__icon">
                    <i className="ti-headphone-alt"></i>
                  </span>
                  Doorstep Delivery
                </h3>
                <p className="card-feature__subtitle mb-0">
                  Enjoy fast, secure, and discreet delivery straight to your doorstep,
                  making it easy and convenient to manage your health from anywhere.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
      <div className="service-area area-padding-top">
        <div className="container">

          <div className="area-heading row">
            <div className="col-md-5 col-xl-4">
              <h3>Professional<br/>
                Health Services</h3>
            </div>
            <div className="col-md-7 col-xl-8">
              <p>
                We provide expert-led healthcare solutions designed around your needs.
                From professional consultations to real-time assistance and easy online
                ordering, our services ensure safe, personalized, and convenient care
                at every step of your health journey.
              </p>
            </div>
          </div>

          <div className="row">

            <div className="col-md-6 col-lg-4 d-flex">
              <div className="card-service text-center text-lg-left mb-4 mb-lg-0 h-100 w-100 d-flex flex-column">
                <span className="card-service__icon">
                  <i className="flaticon-brain"></i>
                </span>
                <h3 className="card-service__title">Professional Consultation</h3>
                <p className="card-service__subtitle flex-grow-1">
                  Our experts provide personalized consultations to understand your
                  health needs and recommend suitable medications, guiding you
                  through your treatment journey with ongoing support.
                </p>
                <a className="card-service__link mt-auto" href="/about">Learn More</a>
              </div>
            </div>

            <div className="col-md-6 col-lg-4 d-flex">
              <div className="card-service text-center text-lg-left mb-4 mb-lg-0 h-100 w-100 d-flex flex-column">
                <span className="card-service__icon">
                  <i className="flaticon-tooth"></i>
                </span>
                <h3 className="card-service__title">Customized Care Plan</h3>
                <p className="card-service__subtitle flex-grow-1">
                  We create personalized care plans tailored to your unique health
                  requirements, ensuring effective treatment and long-term
                  well-being with expert guidance at every stage.
                </p>
                <a className="card-service__link mt-auto" href="/about">Learn More</a>
              </div>
            </div>

            <div className="col-md-6 col-lg-4 d-flex">
              <div className="card-service text-center text-lg-left mb-4 mb-lg-0 h-100 w-100 d-flex flex-column">
                <span className="card-service__icon">
                  <i className="flaticon-face"></i>
                </span>
                <h3 className="card-service__title">Real-Time Assistance</h3>
                <p className="card-service__subtitle flex-grow-1">
                  Get immediate support for your questions or orders through our
                  live chat. Enjoy a seamless online ordering experience with
                  reliable doorstep delivery designed for your comfort and care.
                </p>
                <a className="card-service__link mt-auto" href="/contact">We Are Here</a>
              </div>
            </div>

          </div>
        </div>
      </div>
      {/* ===== Shop Categories Section ===== */}
      <section className="shop-category area-padding">
        <div className="container">
          <div className="area-heading row">
            <div className="col-md-5 col-xl-4">
              <h3>Shop by<br/>Category</h3>
            </div>
            <div className="col-md-7 col-xl-8">
              <p>
                Explore our range of trusted medications organized by health category.
                Find exactly what you need and browse the full selection in each area.
              </p>
            </div>
          </div>

          {CATEGORY_ORDER.filter((cat) => groupedProducts[cat]?.length > 0).length === 0 && (
            <div className="shop-category__empty text-center py-5">
              <p className="mb-0">Products are loading or unavailable right now.</p>
            </div>
          )}

          {CATEGORY_ORDER.filter((cat) => groupedProducts[cat]?.length > 0).map((cat) => (
            <div key={cat} className="shop-category__block">
              <div className="shop-category__header">
                <div>
                  <span className="shop-category__eyebrow">Category</span>
                  <h4 className="shop-category__title">{CATEGORY_LABELS[cat]}</h4>
                </div>
              </div>

              <div className="row g-4">
                {groupedProducts[cat].map((product) => (
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
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                        />
                      </div>
                      <div className="shop-product-card__body">
                        <p className="shop-product-card__meta">
                          {product.category || CATEGORY_LABELS[cat]}
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

              <div className="shop-category__cta">
                <Link to={`/products/type/${cat}`} className="main_btn">
                  View All {CATEGORY_LABELS[cat]}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="about-area">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-10 offset-md-1 col-lg-6 offset-lg-6 offset-xl-7 col-xl-5">
              <div className="about-content">

                <h4>Top Health Solutions<br/>
                  Designed Just for You
     </h4>

                <h6>
                  Trusted medications, expert guidance, and personalized care
                  to support your mental and physical well-being.
                </h6>

                <p>
                  We provide a wide range of premium health solutions tailored to
                  your unique needs. From expert consultations to safe, reliable
                  medications and convenient doorstep delivery, our goal is to
                  make quality healthcare accessible, simple, and stress-free
                  for you every day.
                </p>

                <a className="link_one" href="/about">Learn More</a>

              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="team-area area-padding">
        <div className="container">

          <div className="area-heading row">
            <div className="col-md-5 col-xl-4">
              <h3>What Our<br/>
                Customers Say</h3>
            </div>
            <div className="col-md-7 col-xl-8">
              <p>
                Real experiences from customers who trust us for their health needs.
                From expert guidance to fast delivery, discover how we make healthcare
                simple, safe, and reliable every day.
              </p>
            </div>
          </div>

          <div className="row">

            <div className="col-12 col-md-6 col-lg-4 d-flex">
              <div className="card card-team card-team--compact h-100 w-100 d-flex flex-column">
                <img className="card-img rounded-0" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8KUTCvpajEUZ_arWsbA9GUD6OwfhmzUCXZw&s" alt="Customer" style={{ height: 130, objectFit: "cover" }}/>
                  <div className="card-team__body text-center d-flex flex-column flex-grow-1">
                    <h3><a href="/">Sarah M.</a></h3>
                    <p className="mb-0">Verified Customer</p>

                    <p className="mt-2 mb-2 flex-grow-1">
                      “The consultation was professional and very helpful. I received
                      the right guidance and my medicines were delivered quickly and
                      discreetly. Highly recommended!”
                    </p>

                    <div className="team-footer d-flex justify-content-center mt-auto">
                      <ul className="card-team__social">
                        <li><i className="ti-star"></i></li>
                        <li><i className="ti-star"></i></li>
                        <li><i className="ti-star"></i></li>
                        <li><i className="ti-star"></i></li>
                        <li><i className="ti-star"></i></li>
                      </ul>
                    </div>
                  </div>
                </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4 d-flex">
              <div className="card card-team card-team--compact h-100 w-100 d-flex flex-column">
                <img className="card-img rounded-0" src="https://www.svgrepo.com/show/192244/man-user.svg" alt="Customer" style={{ height: 130, objectFit: "cover" }}/>
                  <div className="card-team__body text-center d-flex flex-column flex-grow-1">
                    <h3><a href="/">James R.</a></h3>
                    <p className="mb-0">Verified Customer</p>

                    <p className="mt-2 mb-2 flex-grow-1">
                      “Ordering online was incredibly easy, and the support team
                      answered my questions instantly. Reliable service and genuine
                      medicines delivered on time.”
                    </p>

                    <div className="team-footer d-flex justify-content-center mt-auto">
                      <ul className="card-team__social">
                        <li><i className="ti-star"></i></li>
                        <li><i className="ti-star"></i></li>
                        <li><i className="ti-star"></i></li>
                        <li><i className="ti-star"></i></li>
                        <li><i className="ti-star"></i></li>
                      </ul>
                    </div>
                  </div>
                </div>
            </div>

 
            <div className="col-12 col-md-6 col-lg-4 d-flex">
              <div className="card card-team card-team--compact h-100 w-100 d-flex flex-column">
                <img className="card-img rounded-0" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJaBE1zGqFHvIzpdYXTr1d8jsfO2ywxZceFw&s" alt="Customer" style={{ height: 130, objectFit: "cover" }}/>
                  <div className="card-team__body text-center d-flex flex-column flex-grow-1">
                    <h3><a href="/">Emily K.</a></h3>
                    <p className="mb-0">Verified Customer</p>

                    <p className="mt-2 mb-2 flex-grow-1">
                      “Excellent service and great care. The personalized recommendations
                      really helped me, and the delivery was fast and secure. I’ll
                      definitely order again.”
                    </p>

                    <div className="team-footer d-flex justify-content-center mt-auto">
                      <ul className="card-team__social">
                        <li><i className="ti-star"></i></li>
                        <li><i className="ti-star"></i></li>
                        <li><i className="ti-star"></i></li>
                        <li><i className="ti-star"></i></li>
                        <li><i className="ti-star"></i></li>
                      </ul>
                    </div>
                  </div>
                </div>
            </div>

          </div>
        </div>
      </section>
      <section className="appointment-area">
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
                  <img src="img/elements/tes1.jpg" alt=""/>
                  </div>
                <div className="testi_item_content">
                  <p>
                    “ Saw kind fruitful itself in man. All in life good wherein beginning their he air That, the saw very years created for seed have without. Can't him fowl his can not ready for game”
                  </p>
                  <h4>- Dr. Suzanne Holroyd -</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="hotline-area text-center area-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <h2>Pharmacy Support Hotline</h2>
              <span>+1 206 354 9780</span>
              <p className="pt-3">
                We provide 24/7 customer and medication support.<br/>
                  Contact us anytime for orders, consultations, or urgent assistance.
                </p>
            </div>
          </div>
        </div>
      </section>
<section className="brands-area background_one py-5">
  <div className="container">

    {/* Heading */}
    <div className="row mb-5 align-items-center">
      <div className="col-md-5 col-xl-4 mb-3 mb-md-0">
        <h3 className="fw-bold">
          Latest Health <br />
          & Pharmacy Updates
        </h3>
      </div>
      <div className="col-md-7 col-xl-8">
        <p className="text-muted mb-0">
          Stay informed with expert insights, medication guides, and wellness tips
          to help you make better health decisions every day.
        </p>
      </div>
    </div>

    {/* Cards */}
    <div className="row g-4">

      {/* Card 1 */}
      <div className="col-md-6 col-lg-4 d-flex">
        <div className="card h-100 w-100 shadow-sm border-0">
          <img
            src="img/blog/1.jpg"
            className="card-img-top"
            alt="blog"
            style={{ height: 200, objectFit: "cover" }}
          />
          <div className="card-body d-flex flex-column">
            <div className="mb-2">
              <small className="text-muted">
                pharmacy, medication, health
              </small>
            </div>

            <h5 className="card-title flex-grow-1">
              How to Safely Use Prescription Medications
            </h5>

            <div className="mt-auto d-flex justify-content-between">
              <small className="text-muted">
                <i className="ti-comments me-1"></i>12 comments
              </small>
              <small className="text-muted">
                <i className="ti-heart me-1"></i>24 likes
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2 */}
      <div className="col-md-6 col-lg-4 d-flex">
        <div className="card h-100 w-100 shadow-sm border-0">
          <img
            src="img/blog/2.jpg"
            className="card-img-top"
            alt="blog"
            style={{ height: 200, objectFit: "cover" }}
          />
          <div className="card-body d-flex flex-column">
            <div className="mb-2">
              <small className="text-muted">
                wellness, mental health
              </small>
            </div>

            <h5 className="card-title flex-grow-1">
              Managing Anxiety & Sleep Disorders Effectively
            </h5>

            <div className="mt-auto d-flex justify-content-between">
              <small className="text-muted">
                <i className="ti-comments me-1"></i>8 comments
              </small>
              <small className="text-muted">
                <i className="ti-heart me-1"></i>19 likes
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3 */}
      <div className="col-md-6 col-lg-4 d-flex">
        <div className="card h-100 w-100 shadow-sm border-0">
          <img
            src="img/blog/3.jpg"
            className="card-img-top"
            alt="blog"
            style={{ height: 200, objectFit: "cover" }}
          />
          <div className="card-body d-flex flex-column">
            <div className="mb-2">
              <small className="text-muted">
                pain relief, care
              </small>
            </div>

            <h5 className="card-title flex-grow-1">
              Understanding Pain Management Treatments
            </h5>

            <div className="mt-auto d-flex justify-content-between">
              <small className="text-muted">
                <i className="ti-comments me-1"></i>6 comments
              </small>
              <small className="text-muted">
                <i className="ti-heart me-1"></i>15 likes
              </small>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

<Footer/>
      </div>
  );
}

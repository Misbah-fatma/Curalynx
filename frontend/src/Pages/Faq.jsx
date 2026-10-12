import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { FaShippingFast, FaClock, FaPhoneAlt, FaQuestion } from "react-icons/fa";
import SEO from "../Components/Seo";
import FaqAccordion from "../Components/FaqAccordion";

const Faq = () => {
  const faqs = [
    {
      question: "What are your pharmacy hours?",
      answer:
        "Our pharmacy is open Monday to Saturday from 9:00 AM to 8:00 PM and closed on Sundays.",
      contact: "+1 234 567 890",
    },
    {
      question: "Do you provide home delivery?",
      answer:
        "Yes, we provide home delivery for prescriptions within our local area. Free shipping for orders above $50.",
      contact: "+1 234 567 891",
    },
    {
      question: "Can I refill my prescription online?",
      answer:
        "Absolutely! Upload your prescription on our website or mobile app to request a refill.",
      contact: "+1 234 567 892",
    },
  ];

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
                <h2>Faq</h2>
                <p>Belding years moveth earth green behold wherein</p>
              </div>
              <div className="page_link">
                <a href="/">Home</a>
                <a href="/faq">Faq</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="team-area area-padding">
        <div className="container">
          <div className="area-heading row mb-4">
            <div className="col-md-5 col-xl-4">
              <h3>
                Pharmacy
                <br />
                Frequently Asked Questions
              </h3>
            </div>
            <div className="col-md-7 col-xl-8">
              <p>
                Have questions about our pharmacy services? Find answers to the most common
                queries below.
              </p>
            </div>
          </div>

          <div className="row">
            {faqs.map((faq, index) => (
              <div key={index} className="col-12 col-md-6 col-lg-4 mb-4">
                <div className="card card-team shadow-sm position-relative">
                  <div
                    className="faq-icon d-flex justify-content-center align-items-center bg-primary text-white"
                    style={{
                      height: "80px",
                      width: "80px",
                      borderRadius: "50%",
                      fontSize: "2rem",
                      position: "absolute",
                      top: "-40px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                      zIndex: 1,
                    }}
                  >
                    <FaQuestion />
                  </div>

                  <div className="card-team__body text-center p-4 pt-5 mt-4">
                    <h5>
                      <a href="/faq">{faq.question}</a>
                    </h5>
                    <p className="text-muted">{faq.answer}</p>
                    <div className="team-footer d-flex justify-content-between mt-3">
                      <span>
                        <FaShippingFast className="me-1" /> Delivery Info
                      </span>
                      <span>
                        <FaClock className="me-1" /> Hours
                      </span>
                      <span>
                        <FaPhoneAlt className="me-1" /> {faq.contact}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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

      <section className="hotline-area text-center area-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <h2>Emergency hotline</h2>
              <span>(+01) – 256 567 550</span>
              <p className="pt-3">
                We provide 24/7 customer support. Please feel free to contact us <br />
                for emergency case.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Faq;

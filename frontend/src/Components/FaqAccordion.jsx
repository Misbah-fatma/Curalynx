import { useState } from "react";
import PropTypes from "prop-types";

export const DEFAULT_FAQS = [
  {
    question: "Are your medications genuine and safe?",
    answer:
      "Yes. All our medications are sourced from licensed manufacturers and verified suppliers. We strictly follow quality and safety standards to ensure you receive authentic and effective products every time.",
  },
  {
    question: "Do I need a prescription to order medicines?",
    answer:
      "Prescription requirements depend on the medication. For prescription-only medicines, you can upload a valid prescription during checkout or consult with our experts for proper guidance.",
  },
  {
    question: "How long does delivery usually take?",
    answer:
      "Delivery times vary based on your location, but most orders are delivered within 2–5 business days. We ensure fast, secure, and discreet delivery straight to your doorstep.",
  },
  {
    question: "Can I consult a healthcare professional before ordering?",
    answer:
      "Absolutely. Our qualified professionals offer confidential consultations to help assess your health needs and recommend suitable medications, ensuring safe and effective treatment.",
  },
  {
    question: "Is my personal and payment information secure?",
    answer:
      "Yes. We use secure encryption and trusted payment gateways to protect your personal and payment information. Your privacy and data security are our top priorities.",
  },
];

export default function FaqAccordion({ items = DEFAULT_FAQS, title = "Have Some Questions?" }) {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index) => {
    setOpenIndex((current) => (current === index ? -1 : index));
  };

  return (
    <div className="faq-accordion">
      {title ? <h3>{title}</h3> : null}
      <div className="accordion">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div className="card" key={item.question}>
              <div className="card-header">
                <h5 className="mb-0">
                  <button
                    type="button"
                    className={`btn btn-link ${isOpen ? "" : "collapsed"}`}
                    aria-expanded={isOpen}
                    onClick={() => toggle(index)}
                  >
                    {item.question}
                  </button>
                </h5>
              </div>
              {isOpen && (
                <div className="collapse show">
                  <div className="card-body">{item.answer}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

FaqAccordion.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      question: PropTypes.string.isRequired,
      answer: PropTypes.string.isRequired,
    })
  ),
  title: PropTypes.string,
};

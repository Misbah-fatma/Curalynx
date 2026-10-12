import { FaWhatsapp, FaComments } from "react-icons/fa";

const FloatingActions = () => {
  const openZohoChat = () => {
    if (window.$zoho && window.$zoho.salesiq) {
      window.$zoho.salesiq.floatwindow.visible("show");
    }
  };

  return (
    <div style={styles.container}>
      <a
        href="https://wa.me/12063549780"
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...styles.button, backgroundColor: "#25D366" }}
        title="Chat on WhatsApp"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp size={28} />
      </a>

      <button
        type="button"
        onClick={openZohoChat}
        style={{ ...styles.button, backgroundColor: "#2563eb" }}
        title="Chat with Bot"
        aria-label="Chat with Bot"
      >
        <FaComments size={24} />
      </button>
    </div>
  );
};

const styles = {
  container: {
    position: "fixed",
    bottom: "20px",
    left: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    zIndex: 1000,
  },
  button: {
    width: "58px",
    height: "58px",
    minWidth: "58px",
    minHeight: "58px",
    flexShrink: 0,
    borderRadius: "50%",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    border: "none",
    textDecoration: "none",
    padding: 0,
  },
};

export default FloatingActions;

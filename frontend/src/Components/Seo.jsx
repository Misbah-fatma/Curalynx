import { Helmet } from "react-helmet-async";

const SEO = ({
  title = "Curalynx Pharma | Buy Medicines Online",
  description = "Curalynx Pharma provides high-quality pharmaceutical products and trusted healthcare solutions.",
  keywords = "pharmacy, buy medicines online, healthcare products",
  image = "https://curalynxpharma.online/logo192.png",
  url = window.location.href,
  type = "website"
}) => {
  return (
    <Helmet>
      {/* Title */}
      <title>{title}</title>

      {/* Basic Meta */}
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />

      {/* Canonical */}
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;

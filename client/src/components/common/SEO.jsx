import { Helmet } from "react-helmet-async";

export default function SEO({
  title = "AKM | Comfort You Can Feel",
  description = "AKM creates clean everyday essentials designed for comfort, easy styling, and premium movement.",
  image = "",
  url = "",
  type = "website",
}) {
  const siteName = "AKM";

  return (
    <Helmet>
      <title>{title}</title>

      <meta name="description" content={description} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />

      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
}
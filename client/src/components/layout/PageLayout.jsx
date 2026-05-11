import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PageLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
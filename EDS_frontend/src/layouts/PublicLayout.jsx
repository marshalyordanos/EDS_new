import Navbar from "../Components/landing/Navbar";
import Footer from "../Components/landing/Footer";

const PublicLayout = ({ children, bgColor }) => (
  <div style={{
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: bgColor || "var(--theme-bg-primary)",
    transition: "background-color 0.3s ease"
  }}>
    <Navbar />
    {children}
    <Footer />
  </div>
);

export default PublicLayout;

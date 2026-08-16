import { useState } from "react";
import ForgotPasswordForm from "../../Components/auth/ForgotPasswordForm";
import LoginForm from "../../Components/auth/LoginForm";
import Navbar from "../../Components/landing/Navbar";
import Footer from "../../Components/landing/Footer";
import { useTheme } from "../../context/ThemeContext";
import fullLogoRed from "../../assets/full-logo-red.svg";
import fullLogoWhite from "../../assets/full-logo-white.svg";
import "../../styles/auth.css";

const Login = ({ setRole2, setToken }) => {
  const [view, setView] = useState("login");
  const { resolvedTheme } = useTheme();
  const logoSrc = resolvedTheme === "dark" ? fullLogoWhite : fullLogoRed;

  return (
    <div className="auth-screen">
      <Navbar />
      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-mark">
            <img src={logoSrc} alt="AfriDATAi" />
          </div>

          <div className="auth-panel">
            {view === "login" && (
              <LoginForm
                setToken={setToken}
                setRole2={setRole2}
                onForgotPasswordClick={() => setView("forgot")}
              />
            )}
            {view === "forgot" && (
              <ForgotPasswordForm
                onBackToLoginClick={() => setView("login")}
                onCodeSent={() => setView("login")}
              />
            )}
          </div>

          <p className="auth-footnote">
            Need help? Contact{" "}
            <a href="mailto:support@afridatai.com">support@afridatai.com</a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;

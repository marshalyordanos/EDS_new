import { useState } from "react";
import ForgotPasswordForm from "../../Components/auth/ForgotPasswordForm";
import LoginForm from "../../Components/auth/LoginForm";
import InfoSection from "../../Components/auth/InfoSection";
import PublicLayout from "../../layouts/PublicLayout";
import "../../styles/homepage.css";

const Login = ({ setRole2, setToken }) => {
  const [view, setView] = useState("login");

  return (
    <PublicLayout bgColor="var(--theme-bg-secondary)">
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 24px",
        }}
      >
        {/* Combined card */}
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            width: "100%",
            maxWidth: "920px",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          {/* Left — InfoSection panel */}
          <InfoSection />

          {/* Divider */}
          <div
            style={{
              width: "1px",
              background: "rgba(255,255,255,0.2)",
              flexShrink: 0,
            }}
          />

          {/* Right — form */}
          <div
            style={{
              flex: 1,
              backgroundColor: "var(--theme-bg-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              // padding: "48px 40px",
              transition: "background-color 0.3s ease",
            }}
          >
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
        </div>
      </main>
    </PublicLayout>
  );
};

export default Login;

import { useParams, useNavigate } from "react-router-dom";
import ResetPasswordForm from "../../Components/auth/ResetPasswordForm";
import InfoSection from "../../Components/auth/InfoSection";
import backgroundImage from "../../assets/backgroundImage.svg";
import { useTheme } from "../../context/ThemeContext";
import logomarkWhite from "../../assets/logomark-white.svg";
import logomarkRed from "../../assets/logomark-red.svg";

const ResetPasswordPage = () => {
  const { resolvedTheme } = useTheme();
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const logoSrc = resolvedTheme === "dark" ? logomarkRed : logomarkWhite;

  const handleSuccess = () => {
    navigate("/login");
  };

  return (
    <div
      className="relative min-h-screen bg-[var(--theme-bg-secondary)] flex items-center justify-center p-4"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <img
        src={logoSrc}
        alt="AfriDATAi"
        className="absolute top-8 left-8 h-16 w-16 z-10"
      />

      <div className="grid md:grid-cols-2 h-screen">
        <InfoSection />
        <ResetPasswordForm
          uid={uid}
          token={token}
          onPasswordResetSuccess={handleSuccess}
          onBackToLoginClick={() => navigate("/login")}
        />
      </div>
    </div>
  );
};

export default ResetPasswordPage;

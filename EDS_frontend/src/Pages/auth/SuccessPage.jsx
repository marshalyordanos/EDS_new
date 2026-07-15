import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import fullLogoWhite from '../../assets/full-logo-white.svg'

const SuccessPage = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    console.log("Logout clicked!");
    navigate('/login');
  };

  return (
    <div className="bg-[var(--theme-bg-secondary)] min-h-screen">
      <header className="!bg-[var(--color-primary)] shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center">
            <img src={fullLogoWhite} alt="AfriDATAi" className="h-10 w-auto" />
        </div>
        <div>
          <Button type="default" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center pt-24">
        <div className="bg-[var(--theme-bg-primary)] border border-[var(--theme-border-medium)] rounded-lg shadow-lg p-20 text-center w-full max-w-3xl mb-12">
          <p className="text-3xl font-semibold text-[var(--color-primary)]">
            You have successfully registered an Expert !
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          className="mt-12" 
          onClick={() => navigate('/dashboard/')} 
        >
          Go Back
        </Button>
      </main>
    </div>
  );
};

export default SuccessPage;
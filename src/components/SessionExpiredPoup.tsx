import Popup from "./Popup";
import { useTheme } from "@/contexts/ThemeContext";
import CapxUnderConstruction from "@/public/static/images/capx_under_construction.svg";
import { handleLogin, handleLogout } from "@/lib/utils/loginUtils";
import { useAuth } from "@/contexts/AuthContext";

const SessionExpiredPopup = () => {
  const { darkMode } = useTheme();
  const { setShowSessionExpiredPopup } = useAuth();

  const handleClose = () => {
    setShowSessionExpiredPopup(false);
    handleLogout();
  };

  const handleContinue = () => {
    handleLogin();
    setShowSessionExpiredPopup(false);
  };

  return (
    <Popup
      title="Session Expired"
      closeButtonLabel="Close"
      continueButtonLabel="Login"
      onClose={handleClose}
      onContinue={handleContinue}
      customClass={`${darkMode ? "bg-[#005B3F]" : "bg-white"}`}
      image={CapxUnderConstruction}
    >
      <p className="text-center text-lg mb-4 dark:text-white text-[#053749]">
        Your session has expired. Please log in again to continue.
      </p>
      <p className="text-center text-lg mb-4 dark:text-white text-[#053749]">
        You will be redirected to the login page.
      </p>
    </Popup>
  );
};

export default SessionExpiredPopup;

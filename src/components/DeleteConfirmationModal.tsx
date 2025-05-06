import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import WarningIcon from "@/public/static/images/warning.svg";
import Popup from "./Popup";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = "item",
}) => {
  const { pageContent } = useApp();

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Popup
      onClose={onClose}
      onContinue={handleConfirm}
      image={WarningIcon}
      title={pageContent["delete-confirmation-title"] || `Delete ${itemType}`}
      closeButtonLabel={pageContent["delete-confirmation-cancel"] || "Cancel"}
      continueButtonLabel={
        pageContent["delete-confirmation-confirm"] || "Delete"
      }
      customClass="delete-confirmation-modal"
    >
      <p>
        {pageContent["delete-confirmation-first-message"]}
        <span className="font-bold"> {itemName}</span>
        {pageContent["delete-confirmation-second-message"]}
      </p>
    </Popup>
  );
};

export default DeleteConfirmationModal;

import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import Image from "next/image";
import WarningIcon from "@/public/static/images/warning.svg";

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
  const { darkMode } = useTheme();
  const { pageContent } = useApp();

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`w-full max-w-md p-6 rounded-lg shadow-lg ${
          darkMode
            ? "bg-capx-dark-box-bg text-white"
            : "bg-white text-[#053749]"
        }`}
      >
        <div className="flex items-center justify-center mb-4">
          <div className="bg-red-100 p-2 rounded-full">
            <Image src={WarningIcon} alt="Warning" width={24} height={24} />
          </div>
        </div>

        <h3 className="text-xl font-bold text-center mb-4">
          {pageContent["delete-confirmation-title"] || `Delete ${itemType}`}
        </h3>

        <p className="text-center mb-6">
          {pageContent["delete-confirmation-message"] ||
            `Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md font-medium ${
              darkMode
                ? "bg-gray-600 text-white hover:bg-gray-700"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {pageContent["delete-confirmation-cancel"] || "Cancel"}
          </button>

          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-md font-medium bg-capx-primary-orange text-white hover:opacity-90"
          >
            {pageContent["delete-confirmation-confirm"] || "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;

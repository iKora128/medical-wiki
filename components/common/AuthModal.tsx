"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AuthModal as LoginModal } from "@/components/auth/AuthModal";
import { useState } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  title = "ログインが必要です",
  message = "この機能を使用するにはログインが必要です。",
}: AuthModalProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLoginClick = () => {
    onClose();
    setShowLoginModal(true);
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-sm rounded bg-white p-6">
            <DialogTitle className="text-lg font-medium mb-4">
              {title}
            </DialogTitle>
            <p className="mb-4">{message}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                キャンセル
              </button>
              <button
                onClick={handleLoginClick}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                ログインする
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
} 
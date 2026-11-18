'use client';

import { useEffect } from 'react';

export default function AdminAlert({ message, onClose, autoCloseMs = 3000 }) {
  useEffect(() => {
    if (!message || !onClose) return;

    if (message.type === 'success' && autoCloseMs > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [message, onClose, autoCloseMs]);

  if (!message) return null;

  const isSuccess = message.type === 'success';

  return (
    <div
      role="alert"
      className={`fixed top-4 container mx-auto px-4 sm:px-6  left-0 right-0 z-50 w-full p-4 font-bold text-sm uppercase tracking-wide border-2 backdrop-blur-md  transition-all duration-200 ${
        isSuccess
          ? 'bg-yellow/85 border-yellow text-gray'
          : 'bg-red/10 border-red text-red'
      }`}
      style={{
        backgroundColor: isSuccess
          ? 'rgba(224, 236, 89, 0.85)'
          : 'rgba(255, 241, 240, 0.9)',
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <span>{message.text}</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-base font-bold px-2 py-0.5 hover:opacity-70 transition-opacity cursor-pointer select-none"
            aria-label="Закрити повідомлення"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

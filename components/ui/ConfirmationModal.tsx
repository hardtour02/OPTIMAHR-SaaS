
import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog" onClick={onClose}>
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-md border border-neutral-border" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-lg font-bold text-on-surface">{title}</h3>
          <p className="mt-2 text-sm text-on-surface-variant">{message}</p>
        </div>
        <div className="flex justify-end items-center p-4 border-t border-neutral-border space-x-4">
          <button onClick={onClose} className="py-2 px-4 rounded-lg bg-surface border border-neutral-border hover:bg-primary-light-hover transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} className="py-2 px-4 rounded-lg bg-error text-white hover:opacity-90 transition-opacity font-semibold">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="bg-surface p-4 rounded-lg shadow-lg border border-slate-700 flex items-center justify-between animate-fade-in-right max-w-sm">
      <p className="text-sm text-on-surface">{message}</p>
      <button onClick={onDismiss} className="ml-4 p-1 rounded-full hover:bg-slate-700 text-on-surface-variant flex-shrink-0">&times;</button>
      <style>{`
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-right { animation: fade-in-right 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Toast;

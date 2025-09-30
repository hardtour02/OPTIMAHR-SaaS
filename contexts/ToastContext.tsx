import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

interface ToastMessage {
  id: number;
  message: string;
}

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (message: string) => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [nextId, setNextId] = useState(0);

  const showToast = useCallback((message: string) => {
    setToasts(currentToasts => [...currentToasts, { id: nextId, message }]);
    setNextId(prevId => prevId + 1);
  }, [nextId]);

  const removeToast = useCallback((id: number) => {
    setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

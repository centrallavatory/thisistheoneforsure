import { createContext, useContext, useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon, CheckCircleIcon, AlertTriangleIcon, XCircleIcon, InfoIcon } from 'lucide-react';

type ToastType = 'info' | 'success' | 'warning' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).slice(2, 11);
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter(toast => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter(toast => toast.id !== id));
  };

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-success-400" />;
      case 'warning':
        return <AlertTriangleIcon className="h-5 w-5 text-warning-400" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-error-400" />;
      default:
        return <InfoIcon className="h-5 w-5 text-secondary-400" />;
    }
  };

  const getToastClasses = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-success-500 bg-success-900/20';
      case 'warning':
        return 'border-l-4 border-warning-500 bg-warning-900/20';
      case 'error':
        return 'border-l-4 border-error-500 bg-error-900/20';
      default:
        return 'border-l-4 border-secondary-500 bg-secondary-900/20';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              className={`min-w-72 max-w-md rounded-md px-4 py-3 shadow-lg ${getToastClasses(toast.type)}`}
            >
              <div className="flex items-start gap-3">
                {getToastIcon(toast.type)}
                <p className="flex-1 text-sm text-gray-100">{toast.message}</p>
                <button 
                  onClick={() => removeToast(toast.id)}
                  className="rounded-full p-1 hover:bg-background-light"
                >
                  <XIcon className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
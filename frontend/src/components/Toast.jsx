// Toast notification component for real-time updates
import { useState, useEffect } from 'react';

function Toast({ message, type = 'info', duration = 5000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        setTimeout(onClose, 300); // Wait for fade-out animation
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 border-green-600';
      case 'error':
        return 'bg-red-500 border-red-600';
      case 'warning':
        return 'bg-yellow-500 border-yellow-600';
      case 'info':
      default:
        return 'bg-blue-500 border-blue-600';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50
        flex items-center gap-3 p-4 rounded-lg shadow-lg border-l-4
        text-white min-w-[300px] max-w-md
        transform transition-all duration-300
        ${getTypeStyles()}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <span className="text-xl">{getIcon()}</span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={() => {
          setIsVisible(false);
          if (onClose) setTimeout(onClose, 300);
        }}
        className="text-white hover:text-gray-200 transition-colors text-xl leading-none"
        aria-label="Fechar notificação"
      >
        ×
      </button>
    </div>
  );
}

// Toast container to manage multiple toasts
function ToastContainer({ toasts, onRemoveToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemoveToast(toast.id)}
        />
      ))}
    </div>
  );
}

export { Toast, ToastContainer };
export default Toast;

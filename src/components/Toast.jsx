import { useEffect } from 'react';
import PropTypes from 'prop-types';
import './Toast.css';

const Toast = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={`toast toast-${toast.type}`}>
      <div className="toast-content">
        <span className="toast-icon">{getIcon(toast.type)}</span>
        <span className="toast-message">{toast.message}</span>
        <button
          className="toast-close"
          onClick={() => onRemove(toast.id)}
          aria-label="Fechar notificação"
        >
          ×
        </button>
      </div>
      <div className="toast-progress" style={{ animationDuration: `${toast.duration}ms` }} />
    </div>
  );
};

Toast.propTypes = {
  toast: PropTypes.shape({
    id: PropTypes.number.isRequired,
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
    duration: PropTypes.number.isRequired
  }).isRequired,
  onRemove: PropTypes.func.isRequired
};

export default Toast;

import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'error', duration = 5000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
      }, duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showError = useCallback((message, duration = 5000) => {
    return addToast(message, 'error', duration)
  }, [addToast])

  const showSuccess = useCallback((message, duration = 3000) => {
    return addToast(message, 'success', duration)
  }, [addToast])

  const showInfo = useCallback((message, duration = 4000) => {
    return addToast(message, 'info', duration)
  }, [addToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, showError, showSuccess, showInfo }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null

  return (
    <div style={containerStyle}>
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

function Toast({ toast, onRemove }) {
  const { id, message, type } = toast

  const getBackgroundColor = () => {
    switch (type) {
      case 'error': return 'rgba(220, 53, 69, 0.95)'
      case 'success': return 'rgba(40, 167, 69, 0.95)'
      case 'info': return 'rgba(23, 162, 184, 0.95)'
      default: return 'rgba(0, 0, 0, 0.9)'
    }
  }

  return (
    <div style={{ ...toastStyle, backgroundColor: getBackgroundColor() }}>
      <span style={messageStyle}>{message}</span>
      <button
        onClick={() => onRemove(id)}
        style={closeButtonStyle}
        aria-label="Close"
      >
        x
      </button>
    </div>
  )
}

const containerStyle = {
  position: 'fixed',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 10000,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  pointerEvents: 'none',
}

const toastStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  minWidth: '280px',
  maxWidth: '500px',
  pointerEvents: 'auto',
  animation: 'slideIn 0.3s ease-out',
}

const messageStyle = {
  color: 'white',
  fontSize: '14px',
  fontFamily: 'sans-serif',
  marginRight: '12px',
  wordBreak: 'break-word',
}

const closeButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '18px',
  cursor: 'pointer',
  padding: '0 4px',
  lineHeight: 1,
  flexShrink: 0,
}

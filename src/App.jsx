import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthScreen from './components/AuthScreen'
import Game from './components/Game'

function AppContent() {
  const { currentUser, logout } = useAuth()

  if (!currentUser) {
    return <AuthScreen />
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div style={logoutContainerStyle}>
        <span style={userEmailStyle}>{currentUser.email}</span>
        <button onClick={logout} style={logoutButtonStyle}>
          Sign Out
        </button>
      </div>
      <Game />
    </div>
  )
}

const logoutContainerStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  padding: '8px 16px',
  borderRadius: '8px',
}

const userEmailStyle = {
  color: 'white',
  fontSize: '14px',
}

const logoutButtonStyle = {
  padding: '6px 12px',
  fontSize: '14px',
  color: 'white',
  backgroundColor: '#c62828',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

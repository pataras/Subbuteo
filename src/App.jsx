import { useState, useRef, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { GameProvider } from './contexts/GameContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { MatchProvider, useMatch } from './contexts/MatchContext'
import AuthScreen from './components/AuthScreen'
import Game from './components/Game'
import MatchLobby from './components/MatchLobby'
import WaitingRoom from './components/WaitingRoom'

function ProfileDropdown() {
  const { currentUser, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get initials from email
  const getInitials = (email) => {
    if (!email) return '?'
    const name = email.split('@')[0]
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div ref={dropdownRef} style={profileContainerStyle}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={profileButtonStyle}
        title={currentUser.email}
      >
        {currentUser.photoURL ? (
          <img
            src={currentUser.photoURL}
            alt="Profile"
            style={profileImageStyle}
          />
        ) : (
          <div style={profileInitialsStyle}>
            {getInitials(currentUser.email)}
          </div>
        )}
      </button>

      {isOpen && (
        <div style={dropdownMenuStyle}>
          <div style={dropdownEmailStyle}>{currentUser.email}</div>
          <button onClick={logout} style={signOutButtonStyle}>
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

// Screen states: 'lobby' | 'waiting' | 'game'
function AppContent() {
  const { currentUser } = useAuth()
  const [screen, setScreen] = useState('lobby')
  const [currentMatchId, setCurrentMatchId] = useState(null)
  const [currentMatchData, setCurrentMatchData] = useState(null)
  const [isHomePlayer, setIsHomePlayer] = useState(true)
  const [isPracticeMode, setIsPracticeMode] = useState(false)

  if (!currentUser) {
    return <AuthScreen />
  }

  const handleMatchCreated = (matchId, matchData) => {
    setCurrentMatchId(matchId)
    setCurrentMatchData(matchData)
    setIsHomePlayer(true)
    setScreen('waiting')
  }

  const handleMatchAccepted = (matchId, matchData) => {
    setCurrentMatchId(matchId)
    setCurrentMatchData(matchData)
    setIsHomePlayer(false)
    setScreen('waiting')
  }

  const handleStartGame = (matchData) => {
    setCurrentMatchData(matchData)
    setScreen('game')
  }

  const handleCancelMatch = () => {
    setCurrentMatchId(null)
    setCurrentMatchData(null)
    setScreen('lobby')
  }

  const handleBackToLobby = () => {
    setCurrentMatchId(null)
    setCurrentMatchData(null)
    setIsPracticeMode(false)
    setScreen('lobby')
  }

  const handlePracticeMatch = () => {
    setCurrentMatchId(null)
    setCurrentMatchData(null)
    setIsHomePlayer(true)
    setIsPracticeMode(true)
    setScreen('game')
  }

  return (
    <SettingsProvider>
      <MatchProvider>
        <GameProvider>
          <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <ProfileDropdown />

            {screen === 'lobby' && (
              <MatchLobby
                onMatchCreated={handleMatchCreated}
                onMatchAccepted={handleMatchAccepted}
                onPracticeMatch={handlePracticeMatch}
              />
            )}

            {screen === 'waiting' && (
              <WaitingRoom
                matchId={currentMatchId}
                matchData={currentMatchData}
                isHomePlayer={isHomePlayer}
                onStartGame={handleStartGame}
                onCancel={handleCancelMatch}
              />
            )}

            {screen === 'game' && (
              <GameWrapper
                matchId={currentMatchId}
                matchData={currentMatchData}
                isHomePlayer={isHomePlayer}
                isPractice={isPracticeMode}
                onBackToLobby={handleBackToLobby}
              />
            )}
          </div>
        </GameProvider>
      </MatchProvider>
    </SettingsProvider>
  )
}

// Wrapper to pass multiplayer props to Game
function GameWrapper({ matchId, matchData, isHomePlayer, isPractice, onBackToLobby }) {
  const { startMultiplayerMatch } = useMatch()

  useEffect(() => {
    if (matchId && matchData) {
      startMultiplayerMatch(matchId, matchData, isHomePlayer)
    }
  }, [matchId, matchData, isHomePlayer, startMultiplayerMatch])

  return (
    <Game
      matchId={matchId}
      matchData={matchData}
      isHomePlayer={isHomePlayer}
      isPractice={isPractice}
      onBackToLobby={onBackToLobby}
    />
  )
}

const profileContainerStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  zIndex: 1000,
}

const profileButtonStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  background: 'transparent',
  padding: 0,
  cursor: 'pointer',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const profileImageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: '50%',
}

const profileInitialsStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#4a5568',
  color: 'white',
  fontSize: '14px',
  fontWeight: 'bold',
  fontFamily: 'sans-serif',
}

const dropdownMenuStyle = {
  position: 'absolute',
  top: '44px',
  right: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  borderRadius: '8px',
  padding: '8px',
  minWidth: '160px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  border: '1px solid #333',
}

const dropdownEmailStyle = {
  color: '#aaa',
  fontSize: '12px',
  padding: '8px 12px',
  borderBottom: '1px solid #333',
  marginBottom: '4px',
  wordBreak: 'break-all',
  fontFamily: 'sans-serif',
}

const signOutButtonStyle = {
  width: '100%',
  padding: '8px 12px',
  fontSize: '14px',
  color: 'white',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  textAlign: 'left',
  fontFamily: 'sans-serif',
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

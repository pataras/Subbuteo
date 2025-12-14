import { useState, useRef, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { GameProvider } from './contexts/GameContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { MatchProvider, useMatch } from './contexts/MatchContext'
import { ToastProvider } from './contexts/ToastContext'
import AuthScreen from './components/AuthScreen'
import Game from './components/Game'
import MatchLobby from './components/MatchLobby'
import WaitingRoom from './components/WaitingRoom'
import TeamSelection from './components/TeamSelection'
import PlayerSelection from './components/PlayerSelection'
import AdminPanel from './components/admin/AdminPanel'

function ProfileDropdown({ onAdminClick }) {
  const { currentUser, logout, canAccessAdmin, userProfile } = useAuth()
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

  const handleAdminClick = () => {
    setIsOpen(false)
    onAdminClick()
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
          <div style={dropdownEmailStyle}>
            {userProfile?.name || currentUser.email}
            {userProfile?.roles?.includes('admin') && (
              <span style={adminBadgeStyle}>Admin</span>
            )}
            {userProfile?.roles?.includes('group_organiser') && !userProfile?.roles?.includes('admin') && (
              <span style={organiserBadgeStyle}>Organiser</span>
            )}
          </div>
          {canAccessAdmin() && (
            <button onClick={handleAdminClick} style={adminButtonStyle}>
              Admin Panel
            </button>
          )}
          <button onClick={logout} style={signOutButtonStyle}>
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

// Screen states: 'lobby' | 'team-select' | 'player-select' | 'waiting' | 'game' | 'admin'
function AppContent() {
  const { currentUser } = useAuth()
  const [screen, setScreen] = useState('lobby')
  const [currentMatchId, setCurrentMatchId] = useState(null)
  const [currentMatchData, setCurrentMatchData] = useState(null)
  const [isHomePlayer, setIsHomePlayer] = useState(true)
  const [isPracticeMode, setIsPracticeMode] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [selectedPlayers, setSelectedPlayers] = useState([])

  if (!currentUser) {
    return <AuthScreen />
  }

  const handleAdminClick = () => {
    setScreen('admin')
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
    if (!selectedTeam) return
    setCurrentMatchId(null)
    setCurrentMatchData(null)
    setIsHomePlayer(true)
    setIsPracticeMode(true)
    setScreen('game')
  }

  const handleEditTeam = () => {
    setScreen('team-select')
  }

  const handleTeamSelected = (team) => {
    setSelectedTeam(team)
    setScreen('player-select')
  }

  const handlePlayersSelected = (team, players) => {
    setSelectedTeam({ ...team, selectedPlayers: players })
    setSelectedPlayers(players)
    setScreen('lobby')
  }

  const handleBackToTeamSelect = () => {
    setScreen('team-select')
  }

  const handleBackFromTeamSelect = () => {
    setScreen('lobby')
  }

  return (
    <SettingsProvider>
      <MatchProvider>
        <GameProvider>
          <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            {screen !== 'admin' && <ProfileDropdown onAdminClick={handleAdminClick} />}

            {screen === 'lobby' && (
              <MatchLobby
                onMatchCreated={handleMatchCreated}
                onMatchAccepted={handleMatchAccepted}
                onPracticeMatch={handlePracticeMatch}
                onEditTeam={handleEditTeam}
                selectedTeam={selectedTeam}
              />
            )}

            {screen === 'team-select' && (
              <TeamSelection
                onTeamSelected={handleTeamSelected}
                onBack={handleBackFromTeamSelect}
              />
            )}

            {screen === 'player-select' && (
              <PlayerSelection
                team={selectedTeam}
                onPlayersSelected={handlePlayersSelected}
                onBack={handleBackToTeamSelect}
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
                selectedTeam={selectedTeam}
                selectedPlayers={selectedPlayers}
                onBackToLobby={handleBackToLobby}
              />
            )}

            {screen === 'admin' && (
              <AdminPanel onBack={handleBackToLobby} />
            )}
          </div>
        </GameProvider>
      </MatchProvider>
    </SettingsProvider>
  )
}

// Wrapper to pass multiplayer props to Game
function GameWrapper({ matchId, matchData, isHomePlayer, isPractice, selectedTeam, selectedPlayers, onBackToLobby }) {
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
      selectedTeam={selectedTeam}
      selectedPlayers={selectedPlayers}
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

const adminButtonStyle = {
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

const adminBadgeStyle = {
  display: 'inline-block',
  marginLeft: '8px',
  padding: '2px 6px',
  fontSize: '10px',
  fontWeight: 'bold',
  backgroundColor: '#e74c3c',
  color: 'white',
  borderRadius: '4px',
  textTransform: 'uppercase',
}

const organiserBadgeStyle = {
  display: 'inline-block',
  marginLeft: '8px',
  padding: '2px 6px',
  fontSize: '10px',
  fontWeight: 'bold',
  backgroundColor: '#3498db',
  color: 'white',
  borderRadius: '4px',
  textTransform: 'uppercase',
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  )
}

export default App

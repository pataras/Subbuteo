import { useState, useRef, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { GameProvider } from './contexts/GameContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { MatchProvider, useMatch } from './contexts/MatchContext'
import { ToastProvider, useToast } from './contexts/ToastContext'
import AuthScreen from './components/AuthScreen'
import Game from './components/Game'
import MatchLobby from './components/MatchLobby'
import WaitingRoom from './components/WaitingRoom'
import TeamSelection from './components/TeamSelection'
import PlayerSelection from './components/PlayerSelection'
import AdminPanel from './components/admin/AdminPanel'
import { getTeamById } from './data/teams'

// LocalStorage keys for persisting team selection
const STORAGE_KEYS = {
  SELECTED_TEAM_ID: 'subbuteo_selected_team_id',
  SELECTED_PLAYER_NUMBERS: 'subbuteo_selected_player_numbers',
}

function ErrorLogModal({ onClose }) {
  const { errorLog, clearErrorLog } = useToast()
  const modalRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleString()
  }

  const handleClear = () => {
    clearErrorLog()
  }

  return (
    <div style={errorLogOverlayStyle}>
      <div ref={modalRef} style={errorLogModalStyle}>
        <div style={errorLogHeaderStyle}>
          <h2 style={errorLogTitleStyle}>Error Log</h2>
          <button onClick={onClose} style={errorLogCloseButtonStyle}>✕</button>
        </div>

        {errorLog.length === 0 ? (
          <div style={errorLogEmptyStyle}>No errors logged</div>
        ) : (
          <>
            <div style={errorLogListStyle}>
              {errorLog.map((entry) => (
                <div key={entry.id} style={errorLogEntryStyle}>
                  <div style={errorLogTimestampStyle}>{formatTimestamp(entry.timestamp)}</div>
                  <div style={errorLogMessageStyle}>{entry.message}</div>
                </div>
              ))}
            </div>
            <div style={errorLogFooterStyle}>
              <button onClick={handleClear} style={errorLogClearButtonStyle}>
                Clear Log
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ProfileDropdown({ onAdminClick, onErrorLogClick }) {
  const { currentUser, logout, canAccessAdmin, userProfile } = useAuth()
  const { errorLog } = useToast()
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

  const handleErrorLogClick = () => {
    setIsOpen(false)
    onErrorLogClick()
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
          <button onClick={handleErrorLogClick} style={errorLogButtonStyle}>
            Error Log {errorLog.length > 0 && <span style={errorCountBadgeStyle}>{errorLog.length}</span>}
          </button>
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
  const [showErrorLog, setShowErrorLog] = useState(false)

  // Load saved team and squad selection from localStorage on mount
  useEffect(() => {
    try {
      const savedTeamId = localStorage.getItem(STORAGE_KEYS.SELECTED_TEAM_ID)
      const savedPlayerNumbers = localStorage.getItem(STORAGE_KEYS.SELECTED_PLAYER_NUMBERS)

      if (savedTeamId) {
        const team = getTeamById(savedTeamId)
        if (team) {
          if (savedPlayerNumbers) {
            const playerNumbers = JSON.parse(savedPlayerNumbers)
            const players = playerNumbers
              .map(num => team.players.find(p => p.number === num))
              .filter(Boolean)

            if (players.length === 6) {
              setSelectedTeam({ ...team, selectedPlayers: players })
              setSelectedPlayers(players)
            } else {
              // Invalid saved players, just set the team
              setSelectedTeam(team)
            }
          } else {
            setSelectedTeam(team)
          }
        }
      }
    } catch (error) {
      console.error('Error loading saved team selection:', error)
    }
  }, [])

  if (!currentUser) {
    return <AuthScreen />
  }

  const handleAdminClick = () => {
    setScreen('admin')
  }

  const handleErrorLogClick = () => {
    setShowErrorLog(true)
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
    // Save team ID to localStorage
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_TEAM_ID, team.id)
      // Clear previous player selection when changing teams
      localStorage.removeItem(STORAGE_KEYS.SELECTED_PLAYER_NUMBERS)
    } catch (error) {
      console.error('Error saving team selection:', error)
    }
    setScreen('player-select')
  }

  const handlePlayersSelected = (team, players) => {
    setSelectedTeam({ ...team, selectedPlayers: players })
    setSelectedPlayers(players)
    // Save player numbers to localStorage
    try {
      const playerNumbers = players.map(p => p.number)
      localStorage.setItem(STORAGE_KEYS.SELECTED_PLAYER_NUMBERS, JSON.stringify(playerNumbers))
    } catch (error) {
      console.error('Error saving player selection:', error)
    }
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
            {screen !== 'admin' && <ProfileDropdown onAdminClick={handleAdminClick} onErrorLogClick={handleErrorLogClick} />}
            {showErrorLog && <ErrorLogModal onClose={() => setShowErrorLog(false)} />}

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

const errorLogButtonStyle = {
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
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}

const errorCountBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '18px',
  height: '18px',
  padding: '0 5px',
  fontSize: '11px',
  fontWeight: 'bold',
  backgroundColor: '#e74c3c',
  color: 'white',
  borderRadius: '9px',
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

const errorLogOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
}

const errorLogModalStyle = {
  backgroundColor: '#1a1a2e',
  borderRadius: '12px',
  width: '90%',
  maxWidth: '600px',
  maxHeight: '80vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  border: '1px solid #333',
}

const errorLogHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 20px',
  borderBottom: '1px solid #333',
}

const errorLogTitleStyle = {
  margin: 0,
  color: 'white',
  fontSize: '18px',
  fontWeight: 'bold',
  fontFamily: 'sans-serif',
}

const errorLogCloseButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: '#aaa',
  fontSize: '20px',
  cursor: 'pointer',
  padding: '4px 8px',
}

const errorLogEmptyStyle = {
  padding: '40px 20px',
  textAlign: 'center',
  color: '#888',
  fontSize: '14px',
  fontFamily: 'sans-serif',
}

const errorLogListStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: '12px 20px',
}

const errorLogEntryStyle = {
  padding: '12px',
  backgroundColor: 'rgba(220, 53, 69, 0.1)',
  borderRadius: '8px',
  marginBottom: '8px',
  borderLeft: '3px solid #e74c3c',
}

const errorLogTimestampStyle = {
  fontSize: '11px',
  color: '#888',
  marginBottom: '4px',
  fontFamily: 'sans-serif',
}

const errorLogMessageStyle = {
  fontSize: '13px',
  color: '#eee',
  fontFamily: 'sans-serif',
  wordBreak: 'break-word',
}

const errorLogFooterStyle = {
  padding: '12px 20px',
  borderTop: '1px solid #333',
  display: 'flex',
  justifyContent: 'flex-end',
}

const errorLogClearButtonStyle = {
  padding: '8px 16px',
  fontSize: '13px',
  color: 'white',
  backgroundColor: '#e74c3c',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontFamily: 'sans-serif',
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

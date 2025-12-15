import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import MatchService from '../services/MatchService'

function WaitingRoom({ matchId, matchData: initialMatchData, isHomePlayer, onStartGame, onCancel }) {
  const { currentUser } = useAuth()
  const { showError, showSuccess } = useToast()
  const [matchData, setMatchData] = useState(initialMatchData)
  const [isStarting, setIsStarting] = useState(false)

  // Subscribe to match updates in real-time
  useEffect(() => {
    if (!matchId) return

    const unsubscribe = MatchService.subscribeToMatch(matchId, (result) => {
      if (result.success) {
        setMatchData(result.data)

        // If match is accepted and we're the away player, we can now see this
        // If match transitions to positioning or in_progress, both players should start the game
        if (result.data.status === 'positioning' || result.data.status === 'in_progress') {
          onStartGame(result.data)
        }

        // Show toast when opponent joins
        if (result.data.status === 'accepted' && isHomePlayer) {
          showSuccess('Opponent has joined the match!')
        }
      } else {
        showError('Error loading match: ' + (result.error || 'Unknown error'))
      }
    })

    return () => unsubscribe()
  }, [matchId, onStartGame, isHomePlayer, showError, showSuccess])

  const handleStartGame = async () => {
    setIsStarting(true)

    try {
      // Update match status to positioning
      const result = await MatchService.updateMatchStatus(matchId, 'positioning')

      if (result.success) {
        showSuccess('Starting game!')
        onStartGame(matchData)
      } else {
        showError('Failed to start game: ' + (result.error || 'Unknown error'))
        setIsStarting(false)
      }
    } catch (error) {
      showError('Error starting game: ' + error.message)
      setIsStarting(false)
    }
  }

  const handleCancel = async () => {
    try {
      await MatchService.updateMatchStatus(matchId, 'cancelled')
      onCancel()
    } catch (error) {
      showError('Error cancelling match: ' + error.message)
    }
  }

  const isAccepted = matchData?.status === 'accepted'
  const isWaiting = matchData?.status === 'waiting'

  return (
    <div style={containerStyle}>
      <div style={panelStyle}>
        <h1 style={titleStyle}>
          {isWaiting ? 'Waiting for Opponent' : 'Match Ready'}
        </h1>

        <div style={matchInfoStyle}>
          <div style={playerRowStyle}>
            <div style={playerLabelStyle}>Home Player</div>
            <div style={playerEmailStyle}>
              {matchData?.homePlayer?.email}
              {isHomePlayer && <span style={youBadgeStyle}>(You)</span>}
            </div>
            <div style={readyBadgeStyle(true)}>Ready</div>
          </div>

          <div style={vsStyle}>VS</div>

          <div style={playerRowStyle}>
            <div style={playerLabelStyle}>Away Player</div>
            <div style={playerEmailStyle}>
              {isAccepted
                ? matchData?.awayPlayer?.email
                : matchData?.invitedEmail}
              {!isHomePlayer && isAccepted && <span style={youBadgeStyle}>(You)</span>}
            </div>
            <div style={readyBadgeStyle(isAccepted)}>
              {isAccepted ? 'Ready' : 'Waiting...'}
            </div>
          </div>
        </div>

        {isWaiting && isHomePlayer && (
          <div style={waitingMessageStyle}>
            <div style={spinnerStyle}></div>
            <p>Waiting for {matchData?.invitedEmail} to accept...</p>
            <p style={hintStyle}>
              Send them a message to let them know you've invited them!
            </p>
          </div>
        )}

        {isAccepted && isHomePlayer && (
          <div style={readyMessageStyle}>
            <p style={readyTextStyle}>{matchData?.awayPlayer?.email} has joined!</p>
            <button
              onClick={handleStartGame}
              disabled={isStarting}
              style={startButtonStyle}
            >
              {isStarting ? 'Starting...' : 'Start Game'}
            </button>
          </div>
        )}

        {isAccepted && !isHomePlayer && (
          <div style={waitingMessageStyle}>
            <div style={spinnerStyle}></div>
            <p>Waiting for host to start the game...</p>
          </div>
        )}

        <button onClick={handleCancel} style={cancelButtonStyle}>
          {isHomePlayer ? 'Cancel Match' : 'Leave Match'}
        </button>
      </div>
    </div>
  )
}

// Styles
const containerStyle = {
  width: '100vw',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
}

const panelStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  borderRadius: '16px',
  padding: '32px',
  width: '100%',
  maxWidth: '450px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
}

const titleStyle = {
  color: 'white',
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '24px',
  textAlign: 'center',
  fontFamily: 'sans-serif',
}

const matchInfoStyle = {
  backgroundColor: '#1a1a1a',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '24px',
}

const playerRowStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '12px 0',
}

const playerLabelStyle = {
  color: '#666',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  marginBottom: '4px',
  fontFamily: 'sans-serif',
}

const playerEmailStyle = {
  color: 'white',
  fontSize: '16px',
  fontWeight: 'bold',
  marginBottom: '8px',
  fontFamily: 'sans-serif',
}

const youBadgeStyle = {
  color: '#4CAF50',
  fontSize: '12px',
  marginLeft: '8px',
  fontFamily: 'sans-serif',
}

const readyBadgeStyle = (isReady) => ({
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 'bold',
  backgroundColor: isReady ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 193, 7, 0.2)',
  color: isReady ? '#4CAF50' : '#ffc107',
  fontFamily: 'sans-serif',
})

const vsStyle = {
  color: '#666',
  fontSize: '18px',
  fontWeight: 'bold',
  textAlign: 'center',
  padding: '8px 0',
  fontFamily: 'sans-serif',
}

const waitingMessageStyle = {
  textAlign: 'center',
  marginBottom: '24px',
  color: '#aaa',
  fontFamily: 'sans-serif',
}

const spinnerStyle = {
  width: '32px',
  height: '32px',
  border: '3px solid #333',
  borderTopColor: '#4CAF50',
  borderRadius: '50%',
  margin: '0 auto 16px',
  animation: 'spin 1s linear infinite',
}

const hintStyle = {
  fontSize: '12px',
  color: '#666',
  marginTop: '8px',
  fontFamily: 'sans-serif',
}

const readyMessageStyle = {
  textAlign: 'center',
  marginBottom: '24px',
}

const readyTextStyle = {
  color: '#4CAF50',
  fontSize: '16px',
  marginBottom: '16px',
  fontFamily: 'sans-serif',
}

const startButtonStyle = {
  width: '100%',
  padding: '16px',
  fontSize: '18px',
  fontWeight: 'bold',
  color: 'white',
  backgroundColor: '#4CAF50',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontFamily: 'sans-serif',
}

const cancelButtonStyle = {
  width: '100%',
  padding: '12px',
  fontSize: '14px',
  color: '#aaa',
  backgroundColor: 'transparent',
  border: '1px solid #333',
  borderRadius: '8px',
  cursor: 'pointer',
  marginTop: '12px',
  fontFamily: 'sans-serif',
}

// Add keyframes for spinner animation
const styleSheet = document.createElement('style')
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`
document.head.appendChild(styleSheet)

export default WaitingRoom

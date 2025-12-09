import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import MatchService from '../services/MatchService'

const DEFAULT_INVITE_EMAIL = 'Oli@taras.co.uk'

function MatchLobby({ onMatchCreated, onMatchAccepted, onPracticeMatch, onBack }) {
  const { currentUser } = useAuth()
  const [inviteEmail, setInviteEmail] = useState(DEFAULT_INVITE_EMAIL)
  const [isCreating, setIsCreating] = useState(false)
  const [pendingInvites, setPendingInvites] = useState([])
  const [myMatches, setMyMatches] = useState([])
  const [error, setError] = useState('')

  // Fetch pending invites and my matches on mount
  useEffect(() => {
    if (currentUser?.email) {
      loadData()

      // Subscribe to real-time invite updates
      const unsubscribe = MatchService.subscribeToPendingInvites(
        currentUser.email,
        (result) => {
          if (result.success) {
            setPendingInvites(result.data)
          }
        }
      )

      return () => unsubscribe()
    }
  }, [currentUser])

  const loadData = async () => {
    // Get pending invites
    const invitesResult = await MatchService.getPendingInvites(currentUser.email)
    if (invitesResult.success) {
      setPendingInvites(invitesResult.data)
    }

    // Get my created matches
    const matchesResult = await MatchService.getMyMatches(currentUser.uid)
    if (matchesResult.success) {
      setMyMatches(matchesResult.data)
    }
  }

  const handleCreateMatch = async () => {
    if (!inviteEmail.trim()) {
      setError('Please enter an email address')
      return
    }

    setIsCreating(true)
    setError('')

    const result = await MatchService.createMatch(
      currentUser.uid,
      currentUser.email,
      inviteEmail.trim()
    )

    setIsCreating(false)

    if (result.success) {
      onMatchCreated(result.matchId, result.matchData)
    } else {
      setError(result.error || 'Failed to create match')
    }
  }

  const handleAcceptInvite = async (match) => {
    const result = await MatchService.acceptMatch(
      match.id,
      currentUser.uid,
      currentUser.email
    )

    if (result.success) {
      onMatchAccepted(match.id, match)
    } else {
      setError(result.error || 'Failed to accept invite')
    }
  }

  const handleDeclineInvite = async (matchId) => {
    await MatchService.declineMatch(matchId)
    loadData()
  }

  const handleResumeMatch = (match) => {
    if (match.status === 'waiting') {
      onMatchCreated(match.id, match)
    } else if (match.status === 'accepted' || match.status === 'positioning' || match.status === 'in_progress') {
      onMatchAccepted(match.id, match)
    }
  }

  return (
    <div style={containerStyle}>
      <div style={panelStyle}>
        <h1 style={titleStyle}>Subbuteo</h1>

        {/* Practice match section */}
        <div style={sectionStyle}>
          <button
            onClick={onPracticeMatch}
            style={practiceButtonStyle}
          >
            Practice Match
          </button>
          <p style={practiceHintStyle}>Solo practice with one team, no time limit</p>
        </div>

        {/* Divider */}
        <div style={dividerStyle}>
          <span style={dividerTextStyle}>or</span>
        </div>

        {/* Create new match section */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Invite Player</h2>
          <p style={hintStyle}>Default: {DEFAULT_INVITE_EMAIL}</p>

          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Enter opponent's email"
            style={inputStyle}
          />

          <button
            onClick={handleCreateMatch}
            disabled={isCreating}
            style={primaryButtonStyle}
          >
            {isCreating ? 'Creating...' : 'Start Match'}
          </button>

          {error && <p style={errorStyle}>{error}</p>}
        </div>

        {/* Pending invites section */}
        {pendingInvites.length > 0 && (
          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Match Invites</h2>
            {pendingInvites.map((invite) => (
              <div key={invite.id} style={inviteCardStyle}>
                <div style={inviteInfoStyle}>
                  <span style={inviteFromStyle}>From: {invite.homePlayer.email}</span>
                </div>
                <div style={inviteActionsStyle}>
                  <button
                    onClick={() => handleAcceptInvite(invite)}
                    style={acceptButtonStyle}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineInvite(invite.id)}
                    style={declineButtonStyle}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* My matches section */}
        {myMatches.length > 0 && (
          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>My Matches</h2>
            {myMatches.filter(m => m.status !== 'cancelled' && m.status !== 'completed').map((match) => (
              <div key={match.id} style={matchCardStyle}>
                <div style={matchInfoStyle}>
                  <span>vs {match.invitedEmail}</span>
                  <span style={statusBadgeStyle(match.status)}>{match.status}</span>
                </div>
                <button
                  onClick={() => handleResumeMatch(match)}
                  style={resumeButtonStyle}
                >
                  {match.status === 'waiting' ? 'Waiting...' : 'Resume'}
                </button>
              </div>
            ))}
          </div>
        )}

        {onBack && (
          <button onClick={onBack} style={backButtonStyle}>
            Back
          </button>
        )}
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
  maxWidth: '400px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
}

const titleStyle = {
  color: 'white',
  fontSize: '28px',
  fontWeight: 'bold',
  marginBottom: '24px',
  textAlign: 'center',
  fontFamily: 'sans-serif',
}

const sectionStyle = {
  marginBottom: '24px',
}

const sectionTitleStyle = {
  color: '#aaa',
  fontSize: '14px',
  fontWeight: 'bold',
  marginBottom: '12px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  fontFamily: 'sans-serif',
}

const hintStyle = {
  color: '#666',
  fontSize: '12px',
  marginBottom: '8px',
  fontFamily: 'sans-serif',
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  fontSize: '16px',
  borderRadius: '8px',
  border: '1px solid #333',
  backgroundColor: '#1a1a1a',
  color: 'white',
  marginBottom: '12px',
  boxSizing: 'border-box',
  fontFamily: 'sans-serif',
}

const primaryButtonStyle = {
  width: '100%',
  padding: '14px',
  fontSize: '16px',
  fontWeight: 'bold',
  color: 'white',
  backgroundColor: '#4CAF50',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontFamily: 'sans-serif',
}

const practiceButtonStyle = {
  width: '100%',
  padding: '16px',
  fontSize: '18px',
  fontWeight: 'bold',
  color: 'white',
  backgroundColor: '#2196F3',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontFamily: 'sans-serif',
}

const practiceHintStyle = {
  color: '#888',
  fontSize: '12px',
  marginTop: '8px',
  textAlign: 'center',
  fontFamily: 'sans-serif',
}

const dividerStyle = {
  display: 'flex',
  alignItems: 'center',
  margin: '20px 0',
}

const dividerTextStyle = {
  flex: 1,
  textAlign: 'center',
  color: '#666',
  fontSize: '14px',
  fontFamily: 'sans-serif',
  position: 'relative',
}

const errorStyle = {
  color: '#ff6b6b',
  fontSize: '14px',
  marginTop: '8px',
  fontFamily: 'sans-serif',
}

const inviteCardStyle = {
  backgroundColor: '#1a1a1a',
  borderRadius: '8px',
  padding: '12px',
  marginBottom: '8px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const inviteInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
}

const inviteFromStyle = {
  color: 'white',
  fontSize: '14px',
  fontFamily: 'sans-serif',
}

const inviteActionsStyle = {
  display: 'flex',
  gap: '8px',
}

const acceptButtonStyle = {
  padding: '8px 16px',
  fontSize: '14px',
  color: 'white',
  backgroundColor: '#4CAF50',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontFamily: 'sans-serif',
}

const declineButtonStyle = {
  padding: '8px 16px',
  fontSize: '14px',
  color: 'white',
  backgroundColor: '#666',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontFamily: 'sans-serif',
}

const matchCardStyle = {
  backgroundColor: '#1a1a1a',
  borderRadius: '8px',
  padding: '12px',
  marginBottom: '8px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const matchInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  color: 'white',
  fontSize: '14px',
  fontFamily: 'sans-serif',
  gap: '4px',
}

const statusBadgeStyle = (status) => ({
  fontSize: '12px',
  color: status === 'waiting' ? '#ffc107' : status === 'accepted' ? '#4CAF50' : '#aaa',
  fontFamily: 'sans-serif',
})

const resumeButtonStyle = {
  padding: '8px 16px',
  fontSize: '14px',
  color: 'white',
  backgroundColor: '#2196F3',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontFamily: 'sans-serif',
}

const backButtonStyle = {
  width: '100%',
  padding: '12px',
  fontSize: '14px',
  color: '#aaa',
  backgroundColor: 'transparent',
  border: '1px solid #333',
  borderRadius: '8px',
  cursor: 'pointer',
  marginTop: '16px',
  fontFamily: 'sans-serif',
}

export default MatchLobby

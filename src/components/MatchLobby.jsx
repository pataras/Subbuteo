import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import MatchService from '../services/MatchService'

const DEFAULT_INVITE_EMAIL = 'Oli@taras.co.uk'

// Dropdown button for starting games
function StartGameDropdown({ onPracticeMatch, onStartMatch, disabled, isCreating }) {
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

  const handlePracticeClick = () => {
    setIsOpen(false)
    onPracticeMatch()
  }

  const handleStartMatchClick = () => {
    setIsOpen(false)
    onStartMatch()
  }

  return (
    <div ref={dropdownRef} style={dropdownContainerStyle}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          ...startGameDropdownButtonStyle,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <span>Start Game</span>
        <span style={{ marginLeft: '8px', fontSize: '12px' }}>{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && !disabled && (
        <div style={dropdownMenuStyle}>
          <button
            onClick={handlePracticeClick}
            style={dropdownItemStyle}
          >
            <span style={dropdownIconStyle}>🎯</span>
            <div style={dropdownItemTextStyle}>
              <span style={dropdownItemTitleStyle}>Practice Match</span>
              <span style={dropdownItemDescStyle}>Solo practice, no time limit</span>
            </div>
          </button>
          <button
            onClick={handleStartMatchClick}
            disabled={isCreating}
            style={{
              ...dropdownItemStyle,
              opacity: isCreating ? 0.6 : 1,
            }}
          >
            <span style={dropdownIconStyle}>⚔️</span>
            <div style={dropdownItemTextStyle}>
              <span style={dropdownItemTitleStyle}>{isCreating ? 'Creating...' : 'Multiplayer Match'}</span>
              <span style={dropdownItemDescStyle}>Invite opponent via email</span>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}

function MatchLobby({ onMatchCreated, onMatchAccepted, onPracticeMatch, onEditTeam, onBack, selectedTeam }) {
  const { currentUser } = useAuth()
  const { showError, showSuccess, showInfo } = useToast()
  const [inviteEmail, setInviteEmail] = useState(DEFAULT_INVITE_EMAIL)
  const [isCreating, setIsCreating] = useState(false)
  const [isCheckingInvites, setIsCheckingInvites] = useState(false)
  const [pendingInvites, setPendingInvites] = useState([])
  const [myMatches, setMyMatches] = useState([])
  const [showInviteSection, setShowInviteSection] = useState(false)

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
    } else {
      showError('Failed to load invites: ' + (invitesResult.error || 'Unknown error'))
    }

    // Get my created matches
    const matchesResult = await MatchService.getMyMatches(currentUser.uid)
    if (matchesResult.success) {
      setMyMatches(matchesResult.data)
    } else {
      showError('Failed to load matches: ' + (matchesResult.error || 'Unknown error'))
    }
  }

  const handleCheckInvites = async () => {
    setIsCheckingInvites(true)
    try {
      const invitesResult = await MatchService.getPendingInvites(currentUser.email)
      if (invitesResult.success) {
        setPendingInvites(invitesResult.data)
        if (invitesResult.data.length === 0) {
          showInfo('No pending invites found')
        } else {
          showSuccess(`Found ${invitesResult.data.length} invite(s)!`)
        }
      } else {
        showError('Failed to check invites: ' + (invitesResult.error || 'Unknown error'))
      }
    } catch (error) {
      showError('Error checking invites: ' + error.message)
    }
    setIsCheckingInvites(false)
  }

  const handleCreateMatch = async () => {
    if (!inviteEmail.trim()) {
      showError('Please enter an email address')
      return
    }

    setIsCreating(true)

    try {
      const result = await MatchService.createMatch(
        currentUser.uid,
        currentUser.email,
        inviteEmail.trim()
      )

      setIsCreating(false)

      if (result.success) {
        showSuccess('Match created! Waiting for opponent...')
        onMatchCreated(result.matchId, result.matchData)
      } else {
        showError(result.error || 'Failed to create match')
      }
    } catch (error) {
      setIsCreating(false)
      showError('Error creating match: ' + error.message)
    }
  }

  const handleAcceptInvite = async (match) => {
    try {
      const result = await MatchService.acceptMatch(
        match.id,
        currentUser.uid,
        currentUser.email
      )

      if (result.success) {
        showSuccess('Invite accepted! Joining match...')
        // Use the updated match data returned from acceptMatch
        onMatchAccepted(match.id, result.data)
      } else {
        showError(result.error || 'Failed to accept invite')
      }
    } catch (error) {
      showError('Error accepting invite: ' + error.message)
    }
  }

  const handleDeclineInvite = async (matchId) => {
    try {
      const result = await MatchService.declineMatch(matchId)
      if (result.success) {
        showInfo('Invite declined')
        loadData()
      } else {
        showError(result.error || 'Failed to decline invite')
      }
    } catch (error) {
      showError('Error declining invite: ' + error.message)
    }
  }

  const handleResumeMatch = (match) => {
    if (match.status === 'waiting') {
      onMatchCreated(match.id, match)
    } else if (match.status === 'accepted' || match.status === 'positioning' || match.status === 'in_progress') {
      onMatchAccepted(match.id, match)
    }
  }

  const handleCancelMatch = async (matchId) => {
    try {
      const result = await MatchService.cancelMatch(matchId, currentUser.uid)
      if (result.success) {
        showInfo('Match invite cancelled')
        loadData()
      } else {
        showError(result.error || 'Failed to cancel match invite')
      }
    } catch (error) {
      showError('Error cancelling match: ' + error.message)
    }
  }

  return (
    <div style={containerStyle}>
      <div style={panelStyle}>
        <h1 style={titleStyle}>Subbuteo</h1>

        {/* Team selection section */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Your Team</h2>
          {selectedTeam ? (
            <div style={selectedTeamStyle}>
              <div
                style={{
                  ...teamBadgeStyle,
                  backgroundColor: selectedTeam.kit.primary,
                  borderColor: selectedTeam.kit.secondary,
                }}
              />
              <div style={teamInfoContainerStyle}>
                <span style={teamNameDisplayStyle}>{selectedTeam.name}</span>
                <span style={squadInfoStyle}>
                  {selectedTeam.selectedPlayers?.length || 0} players selected
                </span>
              </div>
              <button onClick={onEditTeam} style={editTeamButtonStyle}>
                Edit
              </button>
            </div>
          ) : (
            <button onClick={onEditTeam} style={selectTeamButtonStyle}>
              Select Team
            </button>
          )}
        </div>

        {/* Start Game dropdown */}
        <div style={sectionStyle}>
          <StartGameDropdown
            onPracticeMatch={onPracticeMatch}
            onStartMatch={() => setShowInviteSection(true)}
            disabled={!selectedTeam}
            isCreating={isCreating}
          />
          {!selectedTeam && (
            <p style={practiceHintStyle}>Select a team first</p>
          )}
        </div>

        {/* Invite section - shown when starting multiplayer */}
        {showInviteSection && (
          <div style={sectionStyle}>
            <div style={inviteSectionHeaderStyle}>
              <h2 style={sectionTitleStyle}>Invite Player</h2>
              <button
                onClick={() => setShowInviteSection(false)}
                style={closeSectionButtonStyle}
              >
                ✕
              </button>
            </div>
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
              {isCreating ? 'Creating...' : 'Send Invite'}
            </button>
          </div>
        )}

        {/* Check for invites section - always visible */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Match Invites</h2>
          <button
            onClick={handleCheckInvites}
            disabled={isCheckingInvites}
            style={checkInvitesButtonStyle}
          >
            {isCheckingInvites ? 'Checking...' : 'Check for Invites'}
          </button>

          {pendingInvites.length > 0 ? (
            <div style={invitesListStyle}>
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
          ) : (
            <p style={noInvitesStyle}>No pending invites</p>
          )}
        </div>

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
                <div style={matchActionsStyle}>
                  <button
                    onClick={() => handleResumeMatch(match)}
                    style={resumeButtonStyle}
                  >
                    {match.status === 'waiting' ? 'Waiting...' : 'Resume'}
                  </button>
                  <button
                    onClick={() => handleCancelMatch(match.id)}
                    style={removeButtonStyle}
                  >
                    Remove
                  </button>
                </div>
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

const checkInvitesButtonStyle = {
  width: '100%',
  padding: '12px',
  fontSize: '16px',
  fontWeight: 'bold',
  color: 'white',
  backgroundColor: '#FF9800',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontFamily: 'sans-serif',
  marginBottom: '12px',
}

const invitesListStyle = {
  marginTop: '8px',
}

const noInvitesStyle = {
  color: '#666',
  fontSize: '14px',
  textAlign: 'center',
  fontFamily: 'sans-serif',
  marginTop: '8px',
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

const matchActionsStyle = {
  display: 'flex',
  gap: '8px',
}

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

const removeButtonStyle = {
  padding: '8px 16px',
  fontSize: '14px',
  color: 'white',
  backgroundColor: '#f44336',
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

const selectedTeamStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  backgroundColor: '#1a1a1a',
  borderRadius: '8px',
  padding: '12px',
}

const teamBadgeStyle = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  border: '3px solid',
  flexShrink: 0,
}

const teamInfoContainerStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
}

const teamNameDisplayStyle = {
  color: 'white',
  fontSize: '16px',
  fontWeight: 'bold',
  fontFamily: 'sans-serif',
}

const squadInfoStyle = {
  color: '#888',
  fontSize: '12px',
  fontFamily: 'sans-serif',
}

const editTeamButtonStyle = {
  padding: '8px 16px',
  fontSize: '14px',
  color: 'white',
  backgroundColor: '#2196F3',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontFamily: 'sans-serif',
}

const selectTeamButtonStyle = {
  width: '100%',
  padding: '14px',
  fontSize: '16px',
  fontWeight: 'bold',
  color: 'white',
  backgroundColor: '#FF9800',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontFamily: 'sans-serif',
}

// Dropdown styles
const dropdownContainerStyle = {
  position: 'relative',
  width: '100%',
}

const startGameDropdownButtonStyle = {
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
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const dropdownMenuStyle = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  marginTop: '4px',
  backgroundColor: 'rgba(30, 30, 30, 0.98)',
  borderRadius: '8px',
  padding: '8px',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
  border: '1px solid #444',
  zIndex: 100,
}

const dropdownItemStyle = {
  width: '100%',
  padding: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'background-color 0.15s',
}

const dropdownIconStyle = {
  fontSize: '20px',
  flexShrink: 0,
}

const dropdownItemTextStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
}

const dropdownItemTitleStyle = {
  color: 'white',
  fontSize: '14px',
  fontWeight: 'bold',
  fontFamily: 'sans-serif',
}

const dropdownItemDescStyle = {
  color: '#888',
  fontSize: '12px',
  fontFamily: 'sans-serif',
}

const inviteSectionHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
}

const closeSectionButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: '#888',
  fontSize: '18px',
  cursor: 'pointer',
  padding: '4px 8px',
  borderRadius: '4px',
}

export default MatchLobby

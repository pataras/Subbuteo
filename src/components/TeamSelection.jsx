import { useState } from 'react'
import { TEAMS, getTeamsList } from '../data/teams'

function TeamSelection({ onTeamSelected, onBack }) {
  const [selectedTeam, setSelectedTeam] = useState(null)
  const teams = getTeamsList()

  const handleSelectTeam = (teamId) => {
    setSelectedTeam(teamId)
  }

  const handleConfirm = () => {
    if (selectedTeam) {
      const team = Object.values(TEAMS).find(t => t.id === selectedTeam)
      onTeamSelected(team)
    }
  }

  return (
    <div style={containerStyle}>
      <div style={panelStyle}>
        <h1 style={titleStyle}>Select Your Team</h1>
        <p style={subtitleStyle}>Choose a team to play with</p>

        <div style={teamsGridStyle}>
          {teams.map((team) => (
            <div
              key={team.id}
              onClick={() => handleSelectTeam(team.id)}
              style={{
                ...teamCardStyle,
                ...(selectedTeam === team.id ? selectedCardStyle : {}),
              }}
            >
              {/* Team badge/colors */}
              <div style={teamBadgeStyle}>
                <div
                  style={{
                    ...colorSwatchStyle,
                    backgroundColor: team.primaryColor,
                    borderColor: team.secondaryColor,
                  }}
                />
                <div
                  style={{
                    ...colorSwatchSmallStyle,
                    backgroundColor: team.secondaryColor,
                  }}
                />
              </div>

              {/* Team info */}
              <div style={teamInfoStyle}>
                <span style={teamNameStyle}>{team.name}</span>
                <span style={teamNicknameStyle}>{team.nickname}</span>
              </div>

              {/* Selection indicator */}
              {selectedTeam === team.id && (
                <div style={checkmarkStyle}>✓</div>
              )}
            </div>
          ))}
        </div>

        <div style={buttonContainerStyle}>
          <button
            onClick={onBack}
            style={backButtonStyle}
          >
            Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedTeam}
            style={{
              ...confirmButtonStyle,
              opacity: selectedTeam ? 1 : 0.5,
              cursor: selectedTeam ? 'pointer' : 'not-allowed',
            }}
          >
            Select Squad →
          </button>
        </div>
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
  overflow: 'auto',
  padding: '20px',
  boxSizing: 'border-box',
}

const panelStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  borderRadius: '16px',
  padding: '32px',
  width: '100%',
  maxWidth: '800px',
  maxHeight: '90vh',
  overflow: 'auto',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
}

const titleStyle = {
  color: 'white',
  fontSize: '28px',
  fontWeight: 'bold',
  marginBottom: '8px',
  textAlign: 'center',
  fontFamily: 'sans-serif',
}

const subtitleStyle = {
  color: '#888',
  fontSize: '14px',
  marginBottom: '24px',
  textAlign: 'center',
  fontFamily: 'sans-serif',
}

const teamsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: '12px',
  marginBottom: '24px',
}

const teamCardStyle = {
  backgroundColor: '#1a1a1a',
  borderRadius: '12px',
  padding: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  cursor: 'pointer',
  border: '2px solid transparent',
  transition: 'all 0.2s ease',
  position: 'relative',
}

const selectedCardStyle = {
  borderColor: '#4CAF50',
  backgroundColor: '#1a2a1a',
}

const teamBadgeStyle = {
  position: 'relative',
  width: '48px',
  height: '48px',
  flexShrink: 0,
}

const colorSwatchStyle = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  border: '3px solid',
}

const colorSwatchSmallStyle = {
  position: 'absolute',
  bottom: '0',
  right: '0',
  width: '18px',
  height: '18px',
  borderRadius: '50%',
  border: '2px solid #1a1a1a',
}

const teamInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
}

const teamNameStyle = {
  color: 'white',
  fontSize: '15px',
  fontWeight: 'bold',
  fontFamily: 'sans-serif',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const teamNicknameStyle = {
  color: '#888',
  fontSize: '12px',
  fontFamily: 'sans-serif',
}

const checkmarkStyle = {
  position: 'absolute',
  top: '8px',
  right: '8px',
  width: '24px',
  height: '24px',
  backgroundColor: '#4CAF50',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '14px',
  fontWeight: 'bold',
}

const buttonContainerStyle = {
  display: 'flex',
  gap: '12px',
  marginTop: '16px',
}

const backButtonStyle = {
  flex: 1,
  padding: '14px',
  fontSize: '16px',
  color: '#aaa',
  backgroundColor: 'transparent',
  border: '1px solid #333',
  borderRadius: '8px',
  cursor: 'pointer',
  fontFamily: 'sans-serif',
}

const confirmButtonStyle = {
  flex: 2,
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

export default TeamSelection

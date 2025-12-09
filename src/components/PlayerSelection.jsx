import { useState, useEffect } from 'react'
import { getDefaultStartingSix } from '../data/teams'

function PlayerSelection({ team, onPlayersSelected, onBack }) {
  const [selectedPlayers, setSelectedPlayers] = useState([])
  const [availablePlayers, setAvailablePlayers] = useState([])

  useEffect(() => {
    if (team) {
      setAvailablePlayers(team.players)
      // Pre-select the default starting six
      const defaultSix = getDefaultStartingSix(team.id)
      setSelectedPlayers(defaultSix.map(p => p.number))
    }
  }, [team])

  const togglePlayer = (playerNumber) => {
    if (selectedPlayers.includes(playerNumber)) {
      // Deselect
      setSelectedPlayers(prev => prev.filter(n => n !== playerNumber))
    } else if (selectedPlayers.length < 6) {
      // Select
      setSelectedPlayers(prev => [...prev, playerNumber])
    }
  }

  const handleConfirm = () => {
    if (selectedPlayers.length === 6) {
      const players = selectedPlayers.map(num =>
        team.players.find(p => p.number === num)
      )
      onPlayersSelected(team, players)
    }
  }

  // Group players by position
  const positionGroups = {
    'Goalkeepers': availablePlayers.filter(p => p.position === 'GK'),
    'Defenders': availablePlayers.filter(p => ['CB', 'RB', 'LB'].includes(p.position)),
    'Midfielders': availablePlayers.filter(p => ['CM', 'AM', 'CDM'].includes(p.position)),
    'Forwards': availablePlayers.filter(p => ['ST', 'LW', 'RW'].includes(p.position)),
  }

  const getPositionColor = (position) => {
    switch (position) {
      case 'GK': return '#FFC107'  // Yellow
      case 'CB': case 'RB': case 'LB': return '#2196F3'  // Blue
      case 'CM': case 'AM': case 'CDM': return '#4CAF50'  // Green
      case 'ST': case 'LW': case 'RW': return '#F44336'  // Red
      default: return '#888'
    }
  }

  return (
    <div style={containerStyle}>
      <div style={panelStyle}>
        {/* Header with team info */}
        <div style={headerStyle}>
          <div style={teamHeaderStyle}>
            <div
              style={{
                ...teamBadgeStyle,
                backgroundColor: team?.kit?.primary || '#333',
                borderColor: team?.kit?.secondary || '#666',
              }}
            />
            <div>
              <h1 style={titleStyle}>{team?.name}</h1>
              <p style={subtitleStyle}>Select 6 players for your squad</p>
            </div>
          </div>
          <div style={selectionCountStyle}>
            <span style={countNumberStyle}>{selectedPlayers.length}</span>
            <span style={countLabelStyle}>/ 6</span>
          </div>
        </div>

        {/* Selected players preview */}
        <div style={selectedPreviewStyle}>
          <h3 style={sectionLabelStyle}>Starting Six</h3>
          <div style={selectedGridStyle}>
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const playerNum = selectedPlayers[index]
              const player = playerNum ? team.players.find(p => p.number === playerNum) : null
              return (
                <div
                  key={index}
                  style={{
                    ...selectedSlotStyle,
                    backgroundColor: player ? team.kit.primary : '#1a1a1a',
                    borderColor: player ? team.kit.secondary : '#333',
                  }}
                  onClick={() => player && togglePlayer(player.number)}
                >
                  {player ? (
                    <>
                      <span style={slotNumberStyle}>{player.number}</span>
                      <span style={slotNameStyle}>{player.name}</span>
                      <span style={{
                        ...slotPositionStyle,
                        backgroundColor: getPositionColor(player.position),
                      }}>{player.position}</span>
                    </>
                  ) : (
                    <span style={emptySlotStyle}>+</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Available players by position */}
        <div style={playersContainerStyle}>
          {Object.entries(positionGroups).map(([groupName, players]) => (
            players.length > 0 && (
              <div key={groupName} style={positionGroupStyle}>
                <h3 style={groupTitleStyle}>{groupName}</h3>
                <div style={playersGridStyle}>
                  {players.map((player) => {
                    const isSelected = selectedPlayers.includes(player.number)
                    const isDisabled = !isSelected && selectedPlayers.length >= 6
                    return (
                      <div
                        key={player.number}
                        onClick={() => !isDisabled && togglePlayer(player.number)}
                        style={{
                          ...playerCardStyle,
                          ...(isSelected ? selectedPlayerStyle : {}),
                          ...(isDisabled ? disabledPlayerStyle : {}),
                        }}
                      >
                        <div style={playerNumberBadgeStyle}>
                          {player.number}
                        </div>
                        <div style={playerInfoStyle}>
                          <span style={playerNameStyle}>{player.name}</span>
                          <div style={playerMetaStyle}>
                            <span style={{
                              ...positionBadgeStyle,
                              backgroundColor: getPositionColor(player.position),
                            }}>{player.position}</span>
                            <span style={ratingStyle}>{player.rating}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <div style={selectedIndicatorStyle}>✓</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          ))}
        </div>

        {/* Action buttons */}
        <div style={buttonContainerStyle}>
          <button onClick={onBack} style={backButtonStyle}>
            ← Change Team
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedPlayers.length !== 6}
            style={{
              ...confirmButtonStyle,
              opacity: selectedPlayers.length === 6 ? 1 : 0.5,
              cursor: selectedPlayers.length === 6 ? 'pointer' : 'not-allowed',
            }}
          >
            Start Match →
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
  alignItems: 'flex-start',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  overflow: 'auto',
  padding: '20px',
  boxSizing: 'border-box',
}

const panelStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  borderRadius: '16px',
  padding: '24px',
  width: '100%',
  maxWidth: '900px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
}

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  paddingBottom: '16px',
  borderBottom: '1px solid #333',
}

const teamHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
}

const teamBadgeStyle = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  border: '3px solid',
}

const titleStyle = {
  color: 'white',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: 0,
  fontFamily: 'sans-serif',
}

const subtitleStyle = {
  color: '#888',
  fontSize: '14px',
  margin: '4px 0 0 0',
  fontFamily: 'sans-serif',
}

const selectionCountStyle = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '4px',
}

const countNumberStyle = {
  fontSize: '36px',
  fontWeight: 'bold',
  color: '#4CAF50',
  fontFamily: 'sans-serif',
}

const countLabelStyle = {
  fontSize: '18px',
  color: '#888',
  fontFamily: 'sans-serif',
}

const selectedPreviewStyle = {
  marginBottom: '20px',
}

const sectionLabelStyle = {
  color: '#aaa',
  fontSize: '12px',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  marginBottom: '12px',
  fontFamily: 'sans-serif',
}

const selectedGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(6, 1fr)',
  gap: '8px',
}

const selectedSlotStyle = {
  aspectRatio: '1',
  borderRadius: '12px',
  border: '2px solid',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  position: 'relative',
  padding: '8px',
}

const slotNumberStyle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: 'white',
  fontFamily: 'sans-serif',
}

const slotNameStyle = {
  fontSize: '10px',
  color: 'rgba(255,255,255,0.9)',
  fontFamily: 'sans-serif',
  textAlign: 'center',
  marginTop: '4px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  width: '100%',
}

const slotPositionStyle = {
  fontSize: '9px',
  color: 'white',
  padding: '2px 6px',
  borderRadius: '4px',
  marginTop: '4px',
  fontFamily: 'sans-serif',
}

const emptySlotStyle = {
  fontSize: '24px',
  color: '#444',
  fontFamily: 'sans-serif',
}

const playersContainerStyle = {
  maxHeight: '400px',
  overflow: 'auto',
  marginBottom: '20px',
}

const positionGroupStyle = {
  marginBottom: '16px',
}

const groupTitleStyle = {
  color: '#aaa',
  fontSize: '12px',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  marginBottom: '8px',
  fontFamily: 'sans-serif',
}

const playersGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '8px',
}

const playerCardStyle = {
  backgroundColor: '#1a1a1a',
  borderRadius: '8px',
  padding: '10px 12px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  cursor: 'pointer',
  border: '2px solid transparent',
  transition: 'all 0.15s ease',
  position: 'relative',
}

const selectedPlayerStyle = {
  borderColor: '#4CAF50',
  backgroundColor: '#1a2a1a',
}

const disabledPlayerStyle = {
  opacity: 0.4,
  cursor: 'not-allowed',
}

const playerNumberBadgeStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: '#333',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '14px',
  fontWeight: 'bold',
  fontFamily: 'sans-serif',
  flexShrink: 0,
}

const playerInfoStyle = {
  flex: 1,
  minWidth: 0,
}

const playerNameStyle = {
  color: 'white',
  fontSize: '14px',
  fontWeight: '500',
  fontFamily: 'sans-serif',
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const playerMetaStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '4px',
}

const positionBadgeStyle = {
  fontSize: '10px',
  color: 'white',
  padding: '2px 6px',
  borderRadius: '4px',
  fontFamily: 'sans-serif',
}

const ratingStyle = {
  fontSize: '12px',
  color: '#888',
  fontFamily: 'sans-serif',
}

const selectedIndicatorStyle = {
  width: '20px',
  height: '20px',
  backgroundColor: '#4CAF50',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '12px',
  fontWeight: 'bold',
  flexShrink: 0,
}

const buttonContainerStyle = {
  display: 'flex',
  gap: '12px',
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

export default PlayerSelection

import { useEffect } from 'react'

function CoinToss({
  isVisible,
  isAnimating,
  result,
  homeTeamName,
  awayTeamName,
  homeTeamColor,
  awayTeamColor,
  onToss,
  onContinue
}) {
  // Auto-toss when component becomes visible
  useEffect(() => {
    if (isVisible && !isAnimating && !result) {
      // Small delay before starting toss
      const timer = setTimeout(() => {
        onToss()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isVisible, isAnimating, result, onToss])

  if (!isVisible) return null

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 400,
      fontFamily: 'sans-serif'
    }}>
      {/* Title */}
      <h2 style={{
        color: 'white',
        fontSize: '28px',
        marginBottom: '30px',
        textTransform: 'uppercase',
        letterSpacing: '3px'
      }}>
        Coin Toss
      </h2>

      {/* Coin */}
      <div style={{
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: isAnimating
          ? 'linear-gradient(135deg, #ffd700, #b8860b, #ffd700)'
          : result === 'home'
            ? homeTeamColor || '#670E36'
            : awayTeamColor || '#FFFFFF',
        border: '4px solid #fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
        color: isAnimating ? '#333' : (result === 'home' ? '#fff' : '#333'),
        animation: isAnimating ? 'coinFlip 0.3s ease-in-out infinite' : 'none',
        boxShadow: '0 4px 20px rgba(255, 215, 0, 0.5)',
        marginBottom: '30px'
      }}>
        {isAnimating ? '' : (result === 'home' ? homeTeamName?.slice(0, 3).toUpperCase() : awayTeamName?.slice(0, 3).toUpperCase())}
      </div>

      {/* Status text */}
      <div style={{
        color: 'white',
        fontSize: '20px',
        marginBottom: '10px',
        minHeight: '30px'
      }}>
        {isAnimating && 'Flipping...'}
        {!isAnimating && result && (
          <>
            <span style={{
              color: result === 'home' ? homeTeamColor : awayTeamColor,
              fontWeight: 'bold'
            }}>
              {result === 'home' ? homeTeamName : awayTeamName}
            </span>
            {' wins the toss!'}
          </>
        )}
      </div>

      {/* Instruction text */}
      <div style={{
        color: '#aaa',
        fontSize: '16px',
        marginBottom: '30px'
      }}>
        {result && 'They will kick off first'}
      </div>

      {/* Continue button */}
      {result && !isAnimating && (
        <button
          onClick={onContinue}
          style={{
            padding: '15px 40px',
            fontSize: '18px',
            fontWeight: 'bold',
            background: '#44cc44',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#55dd55'}
          onMouseOut={(e) => e.target.style.background = '#44cc44'}
        >
          Start Match
        </button>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes coinFlip {
          0% { transform: rotateY(0deg) scale(1); }
          50% { transform: rotateY(180deg) scale(1.1); }
          100% { transform: rotateY(360deg) scale(1); }
        }
      `}</style>
    </div>
  )
}

export default CoinToss

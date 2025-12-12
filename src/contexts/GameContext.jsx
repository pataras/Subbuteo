import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'
import GameStateService from '../services/GameStateService'

const GameContext = createContext()

export function useGame() {
  return useContext(GameContext)
}

// Team configurations
export const TEAMS = {
  ASTON_VILLA: {
    name: 'Aston Villa',
    shortName: 'AV',
    color: '#670E36',
    players: [
      { position: [-1.2, 0.05, 2.5], number: 5, name: 'McGrath' },
      { position: [1.2, 0.05, 2.5], number: 6, name: 'Mortimer' },
      { position: [-1.0, 0.05, 1.2], number: 7, name: 'Grealish' },
      { position: [1.0, 0.05, 1.2], number: 11, name: 'Agbonlahor' },
      { position: [-0.5, 0.05, 0.3], number: 9, name: 'Withe' },
      { position: [0.5, 0.05, 0.3], number: 10, name: 'Yorke' },
    ]
  },
  PRESTON: {
    name: 'Preston North End',
    shortName: 'PNE',
    color: '#FFFFFF',
    players: [
      { position: [-1.2, 0.05, -2.5], number: 5, name: 'Lawrenson' },
      { position: [1.2, 0.05, -2.5], number: 6, name: 'Smith' },
      { position: [-1.0, 0.05, -1.2], number: 7, name: 'Finney' },
      { position: [1.0, 0.05, -1.2], number: 8, name: 'Alexander' },
      { position: [-0.5, 0.05, -0.3], number: 9, name: 'Nugent' },
      { position: [0.5, 0.05, -0.3], number: 10, name: 'Beckham' },
    ]
  }
}

export function GameProvider({ children }) {
  const { currentUser } = useAuth()

  // Game state
  const [gameId, setGameId] = useState(null)
  const [score, setScore] = useState({ home: 0, away: 0 })
  const [goals, setGoals] = useState([])
  const [matchStartTime, setMatchStartTime] = useState(null)
  const [matchDuration, setMatchDuration] = useState(0)
  const [currentTurn, setCurrentTurn] = useState('home')
  const [gameStatus, setGameStatus] = useState('not_started') // not_started, positioning, coin_toss, kick_off, in_progress, paused, completed
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSaveTime, setLastSaveTime] = useState(null)
  const [savedGames, setSavedGames] = useState([])
  const [isPracticeMode, setIsPracticeMode] = useState(false)

  // Game rules state
  const [hitCount, setHitCount] = useState(0) // Number of consecutive hits by current team (max 3)
  const [lastPlayerToHit, setLastPlayerToHit] = useState(null) // { team, playerIndex }
  const [isKickOff, setIsKickOff] = useState(true) // True at start and after goals
  const [coinTossResult, setCoinTossResult] = useState(null) // 'home' or 'away'
  const [coinTossAnimating, setCoinTossAnimating] = useState(false)

  // Track last known scorer for goal detection
  const lastScorerRef = useRef(null)

  // Match duration limit (1 minute = 60 seconds)
  const MATCH_DURATION_LIMIT = 60

  // Timer for match duration - ends game after 1 minute (unless in practice mode)
  useEffect(() => {
    let interval
    if ((gameStatus === 'in_progress' || gameStatus === 'kick_off') && matchStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - matchStartTime) / 1000)
        setMatchDuration(elapsed)

        // End game after 1 minute (but not in practice mode)
        if (!isPracticeMode && elapsed >= MATCH_DURATION_LIMIT) {
          setGameStatus('completed')
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameStatus, matchStartTime, isPracticeMode])

  // Start positioning mode (for setting up players)
  const startPositioning = useCallback(() => {
    setGameId(null)
    setScore({ home: 0, away: 0 })
    setGoals([])
    setMatchDuration(0)
    setCurrentTurn('home')
    setGameStatus('positioning')
    setHitCount(0)
    setLastPlayerToHit(null)
    setIsKickOff(true)
    setCoinTossResult(null)
    setCoinTossAnimating(false)
    lastScorerRef.current = null
  }, [])

  // Finish positioning and go to coin toss
  const finishPositioning = useCallback(() => {
    setGameStatus('coin_toss')
  }, [])

  // Perform the coin toss
  const performCoinToss = useCallback(() => {
    setCoinTossAnimating(true)
    // Simulate coin flip animation (result after delay)
    setTimeout(() => {
      const result = Math.random() < 0.5 ? 'home' : 'away'
      setCoinTossResult(result)
      setCurrentTurn(result)
      setCoinTossAnimating(false)
    }, 1500) // 1.5 second animation
  }, [])

  // Start kick-off after coin toss
  const startKickOff = useCallback(() => {
    setMatchStartTime(Date.now())
    setIsKickOff(true)
    setHitCount(0)
    setLastPlayerToHit(null)
    setGameStatus('kick_off')
  }, [])

  // Record a ball hit by a player
  const recordBallHit = useCallback((team, playerIndex) => {
    // During kick-off, the hitting player can't hit again immediately
    if (isKickOff) {
      setLastPlayerToHit({ team, playerIndex })
      setIsKickOff(false)
      setHitCount(1)
      setGameStatus('in_progress')
      return { success: true, turnChanged: false }
    }

    // Check if the same player is trying to hit again during kick-off follow-up
    // After kick-off, a different player must hit the ball
    if (lastPlayerToHit &&
        lastPlayerToHit.team === team &&
        lastPlayerToHit.playerIndex === playerIndex &&
        hitCount === 1) {
      // Same player can't hit twice in a row right after kick-off
      return { success: false, reason: 'different_player_required' }
    }

    // If it's the current team hitting
    if (team === currentTurn) {
      const newHitCount = hitCount + 1
      setLastPlayerToHit({ team, playerIndex })

      if (newHitCount >= 3) {
        // Max hits reached, switch turn
        setHitCount(0)
        setCurrentTurn(team === 'home' ? 'away' : 'home')
        return { success: true, turnChanged: true, reason: 'max_hits_reached' }
      } else {
        setHitCount(newHitCount)
        return { success: true, turnChanged: false }
      }
    } else {
      // Other team hit the ball, switch turn to them
      setCurrentTurn(team)
      setHitCount(1)
      setLastPlayerToHit({ team, playerIndex })
      return { success: true, turnChanged: true }
    }
  }, [currentTurn, hitCount, isKickOff, lastPlayerToHit])

  // Switch turn manually (if needed)
  const switchTurn = useCallback(() => {
    setCurrentTurn(prev => prev === 'home' ? 'away' : 'home')
    setHitCount(0)
  }, [])

  // Start a new game (skips positioning, starts immediately)
  const startNewGame = useCallback(() => {
    setGameId(null)
    setScore({ home: 0, away: 0 })
    setGoals([])
    setMatchStartTime(Date.now())
    setMatchDuration(0)
    setCurrentTurn('home')
    setGameStatus('in_progress')
    setHitCount(0)
    setLastPlayerToHit(null)
    setIsKickOff(false)
    setCoinTossResult(null)
    setCoinTossAnimating(false)
    lastScorerRef.current = null
  }, [])

  // Record a goal
  const recordGoal = useCallback((team, scorerName, scorerNumber) => {
    const goalTime = matchDuration
    const newGoal = {
      team,
      scorer: scorerName,
      scorerNumber,
      time: goalTime,
      formattedTime: `${Math.floor(goalTime / 60)}:${(goalTime % 60).toString().padStart(2, '0')}`
    }

    setGoals(prev => [...prev, newGoal])
    setScore(prev => ({
      ...prev,
      [team]: prev[team] + 1
    }))

    // Set up for kick-off: the team that conceded takes the kick-off
    const kickOffTeam = team === 'home' ? 'away' : 'home'
    setCurrentTurn(kickOffTeam)
    setIsKickOff(true)
    setHitCount(0)
    setLastPlayerToHit(null)
    setGameStatus('kick_off')

    return newGoal
  }, [matchDuration])

  // Set the last player who touched the ball (for goal attribution)
  const setLastScorer = useCallback((team, playerName, playerNumber) => {
    lastScorerRef.current = { team, name: playerName, number: playerNumber }
  }, [])

  // Get the last scorer
  const getLastScorer = useCallback(() => {
    return lastScorerRef.current
  }, [])

  // Save game state to Firebase
  const saveGame = useCallback(async (playerRefs, ballRef, prestonRefs) => {
    if (!currentUser) {
      return { success: false, error: 'Must be logged in to save' }
    }

    setIsSaving(true)

    try {
      const { homePlayers, awayPlayers, ballPosition } = GameStateService.extractCurrentPositions(
        playerRefs,
        ballRef,
        prestonRefs
      )

      const gameData = {
        id: gameId,
        playerEmails: {
          home: currentUser.email,
          away: ''
        },
        teams: {
          home: { name: TEAMS.ASTON_VILLA.name, color: TEAMS.ASTON_VILLA.color },
          away: { name: TEAMS.PRESTON.name, color: TEAMS.PRESTON.color }
        },
        players: {
          home: TEAMS.ASTON_VILLA.players.map((p, i) => ({
            ...p,
            position: homePlayers[i]?.position || { x: p.position[0], y: p.position[1], z: p.position[2] },
            rotation: homePlayers[i]?.rotation || 0
          })),
          away: TEAMS.PRESTON.players.map((p, i) => ({
            ...p,
            position: awayPlayers[i]?.position || { x: p.position[0], y: p.position[1], z: p.position[2] },
            rotation: awayPlayers[i]?.rotation || 0
          }))
        },
        ball: { position: ballPosition },
        score,
        goals,
        matchStartTime,
        matchDuration,
        currentTurn,
        status: gameStatus === 'not_started' ? 'in_progress' : gameStatus
      }

      const result = await GameStateService.saveGameState(currentUser.uid, gameData)

      if (result.success) {
        setGameId(result.gameId)
        setLastSaveTime(Date.now())
        if (gameStatus === 'not_started') {
          setGameStatus('in_progress')
        }
      }

      return result
    } catch (error) {
      console.error('Error saving game:', error)
      return { success: false, error: error.message }
    } finally {
      setIsSaving(false)
    }
  }, [currentUser, gameId, score, goals, matchStartTime, matchDuration, currentTurn, gameStatus])

  // Load a game state from Firebase
  const loadGame = useCallback(async (gameIdToLoad) => {
    if (!currentUser) {
      return { success: false, error: 'Must be logged in to load' }
    }

    setIsLoading(true)

    try {
      const result = await GameStateService.loadGameState(gameIdToLoad)

      if (result.success && result.data) {
        const data = result.data
        setGameId(data.id)
        setScore(data.score || { home: 0, away: 0 })
        setGoals(data.goals || [])
        setMatchStartTime(data.matchStartTime || Date.now())
        setMatchDuration(data.matchDuration || 0)
        setCurrentTurn(data.currentTurn || 'home')
        setGameStatus(data.status || 'in_progress')

        return { success: true, data }
      }

      return result
    } catch (error) {
      console.error('Error loading game:', error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }, [currentUser])

  // Fetch user's saved games
  const fetchSavedGames = useCallback(async () => {
    if (!currentUser) {
      return { success: false, error: 'Must be logged in' }
    }

    try {
      const result = await GameStateService.getUserGames(currentUser.uid)
      if (result.success) {
        setSavedGames(result.data)
      }
      return result
    } catch (error) {
      console.error('Error fetching saved games:', error)
      return { success: false, error: error.message }
    }
  }, [currentUser])

  // Pause the game
  const pauseGame = useCallback(() => {
    setGameStatus('paused')
  }, [])

  // Resume the game
  const resumeGame = useCallback(() => {
    setGameStatus('in_progress')
    // Adjust match start time to account for pause
    if (matchStartTime) {
      setMatchStartTime(Date.now() - (matchDuration * 1000))
    }
  }, [matchStartTime, matchDuration])

  // End the game
  const endGame = useCallback(() => {
    setGameStatus('completed')
  }, [])

  // Format match duration for display
  const formattedDuration = `${Math.floor(matchDuration / 60)}:${(matchDuration % 60).toString().padStart(2, '0')}`

  const value = {
    // State
    gameId,
    score,
    goals,
    matchStartTime,
    matchDuration,
    formattedDuration,
    currentTurn,
    gameStatus,
    isSaving,
    isLoading,
    lastSaveTime,
    savedGames,
    isPracticeMode,

    // Game rules state
    hitCount,
    lastPlayerToHit,
    isKickOff,
    coinTossResult,
    coinTossAnimating,

    // Actions
    startNewGame,
    startPositioning,
    finishPositioning,
    recordGoal,
    setLastScorer,
    getLastScorer,
    saveGame,
    loadGame,
    fetchSavedGames,
    pauseGame,
    resumeGame,
    endGame,
    setCurrentTurn,
    setIsPracticeMode,

    // Game rules actions
    performCoinToss,
    startKickOff,
    recordBallHit,
    switchTurn,

    // Team configurations
    TEAMS
  }

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}

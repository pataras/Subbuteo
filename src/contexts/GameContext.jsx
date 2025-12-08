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
      { position: [-1.2, 0, 2.5], number: 5, name: 'McGrath' },
      { position: [1.2, 0, 2.5], number: 6, name: 'Mortimer' },
      { position: [-1.0, 0, 1.2], number: 7, name: 'Grealish' },
      { position: [1.0, 0, 1.2], number: 11, name: 'Agbonlahor' },
      { position: [-0.5, 0, 0.3], number: 9, name: 'Withe' },
      { position: [0.5, 0, 0.3], number: 10, name: 'Yorke' },
    ]
  },
  PRESTON: {
    name: 'Preston North End',
    shortName: 'PNE',
    color: '#FFFFFF',
    players: [
      { position: [-1.2, 0, -2.5], number: 5, name: 'Lawrenson' },
      { position: [1.2, 0, -2.5], number: 6, name: 'Smith' },
      { position: [-1.0, 0, -1.2], number: 7, name: 'Finney' },
      { position: [1.0, 0, -1.2], number: 8, name: 'Alexander' },
      { position: [-0.5, 0, -0.3], number: 9, name: 'Nugent' },
      { position: [0.5, 0, -0.3], number: 10, name: 'Beckham' },
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
  const [gameStatus, setGameStatus] = useState('not_started') // not_started, positioning, in_progress, paused, completed
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSaveTime, setLastSaveTime] = useState(null)
  const [savedGames, setSavedGames] = useState([])

  // Track last known scorer for goal detection
  const lastScorerRef = useRef(null)

  // Match duration limit (1 minute = 60 seconds)
  const MATCH_DURATION_LIMIT = 60

  // Timer for match duration - ends game after 1 minute
  useEffect(() => {
    let interval
    if (gameStatus === 'in_progress' && matchStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - matchStartTime) / 1000)
        setMatchDuration(elapsed)

        // End game after 1 minute
        if (elapsed >= MATCH_DURATION_LIMIT) {
          setGameStatus('completed')
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameStatus, matchStartTime])

  // Start positioning mode (for setting up players)
  const startPositioning = useCallback(() => {
    setGameId(null)
    setScore({ home: 0, away: 0 })
    setGoals([])
    setMatchDuration(0)
    setCurrentTurn('home')
    setGameStatus('positioning')
    lastScorerRef.current = null
  }, [])

  // Finish positioning and start the game
  const finishPositioning = useCallback(() => {
    setMatchStartTime(Date.now())
    setGameStatus('in_progress')
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

    // Team configurations
    TEAMS
  }

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}

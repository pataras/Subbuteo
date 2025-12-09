import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'
import MatchService from '../services/MatchService'
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const MatchContext = createContext()

export function useMatch() {
  return useContext(MatchContext)
}

export function MatchProvider({ children }) {
  const { currentUser } = useAuth()

  // Match state
  const [matchId, setMatchId] = useState(null)
  const [matchData, setMatchData] = useState(null)
  const [isHomePlayer, setIsHomePlayer] = useState(true)
  const [isMultiplayer, setIsMultiplayer] = useState(false)

  // Game state sync for multiplayer
  const [remoteGameState, setRemoteGameState] = useState(null)
  const [lastSyncTime, setLastSyncTime] = useState(null)
  const syncIntervalRef = useRef(null)
  const unsubscribeRef = useRef(null)

  // Start a new multiplayer match
  const startMultiplayerMatch = useCallback((newMatchId, newMatchData, isHome) => {
    setMatchId(newMatchId)
    setMatchData(newMatchData)
    setIsHomePlayer(isHome)
    setIsMultiplayer(true)
    setRemoteGameState(null)
  }, [])

  // Clear match state
  const clearMatch = useCallback(() => {
    setMatchId(null)
    setMatchData(null)
    setIsHomePlayer(true)
    setIsMultiplayer(false)
    setRemoteGameState(null)
    setLastSyncTime(null)

    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current)
      syncIntervalRef.current = null
    }

    if (unsubscribeRef.current) {
      unsubscribeRef.current()
      unsubscribeRef.current = null
    }
  }, [])

  // Save current game state to Firebase (called after each move)
  const syncGameState = useCallback(async (gameState) => {
    if (!matchId || !isMultiplayer) return

    try {
      const matchRef = doc(db, 'matches', matchId)
      await updateDoc(matchRef, {
        gameState: {
          ...gameState,
          lastUpdatedBy: currentUser.uid,
          lastUpdatedAt: Date.now()
        },
        updatedAt: serverTimestamp()
      })
      setLastSyncTime(Date.now())
    } catch (error) {
      console.error('Error syncing game state:', error)
    }
  }, [matchId, isMultiplayer, currentUser])

  // Poll for game state updates from the other player
  const startPolling = useCallback(() => {
    if (!matchId || !isMultiplayer) return

    // Clear any existing interval
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current)
    }

    // Poll every 2 seconds
    syncIntervalRef.current = setInterval(async () => {
      try {
        const result = await MatchService.getMatch(matchId)
        if (result.success && result.data.gameState) {
          const gameState = result.data.gameState

          // Only update if it's from the other player
          if (gameState.lastUpdatedBy !== currentUser.uid) {
            setRemoteGameState(gameState)
            setLastSyncTime(Date.now())
          }
        }
      } catch (error) {
        console.error('Error polling game state:', error)
      }
    }, 2000)

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
        syncIntervalRef.current = null
      }
    }
  }, [matchId, isMultiplayer, currentUser])

  // Subscribe to match updates in real-time (for waiting room)
  const subscribeToMatch = useCallback((callback) => {
    if (!matchId) return

    unsubscribeRef.current = MatchService.subscribeToMatch(matchId, (result) => {
      if (result.success) {
        setMatchData(result.data)
        if (callback) callback(result.data)
      }
    })

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [matchId])

  // Update match status
  const updateMatchStatus = useCallback(async (status) => {
    if (!matchId) return { success: false, error: 'No match ID' }
    return await MatchService.updateMatchStatus(matchId, status)
  }, [matchId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [])

  const value = {
    // State
    matchId,
    matchData,
    isHomePlayer,
    isMultiplayer,
    remoteGameState,
    lastSyncTime,

    // Actions
    startMultiplayerMatch,
    clearMatch,
    syncGameState,
    startPolling,
    subscribeToMatch,
    updateMatchStatus,
  }

  return (
    <MatchContext.Provider value={value}>
      {children}
    </MatchContext.Provider>
  )
}

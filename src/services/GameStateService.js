import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore'
import { db } from '../firebase'

const COLLECTION_NAME = 'gameState'

/**
 * Game state document schema:
 * {
 *   id: string,
 *   userId: string,
 *   playerEmails: { home: string, away: string },
 *   teams: {
 *     home: { name: string, color: string, players: [...] },
 *     away: { name: string, color: string, players: [...] }
 *   },
 *   players: {
 *     home: [{ position: {x, y, z}, rotation: number, number: number, name: string }, ...],
 *     away: [{ position: {x, y, z}, rotation: number, number: number, name: string }, ...]
 *   },
 *   ball: { position: {x, y, z} },
 *   score: { home: number, away: number },
 *   goals: [{ team: string, scorer: string, time: number }, ...],
 *   matchStartTime: timestamp,
 *   matchDuration: number (seconds),
 *   currentTurn: 'home' | 'away',
 *   status: 'in_progress' | 'paused' | 'completed',
 *   createdAt: timestamp,
 *   updatedAt: timestamp
 * }
 */

export const GameStateService = {
  /**
   * Save a new game state or update existing one
   */
  async saveGameState(userId, gameData) {
    try {
      const gameId = gameData.id || doc(collection(db, COLLECTION_NAME)).id
      const gameRef = doc(db, COLLECTION_NAME, gameId)

      const dataToSave = {
        ...gameData,
        id: gameId,
        userId,
        updatedAt: serverTimestamp()
      }

      // If it's a new game, add createdAt
      if (!gameData.id) {
        dataToSave.createdAt = serverTimestamp()
      }

      await setDoc(gameRef, dataToSave, { merge: true })

      return { success: true, gameId }
    } catch (error) {
      console.error('Error saving game state:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Load a specific game state by ID
   */
  async loadGameState(gameId) {
    try {
      const gameRef = doc(db, COLLECTION_NAME, gameId)
      const gameSnap = await getDoc(gameRef)

      if (gameSnap.exists()) {
        return { success: true, data: gameSnap.data() }
      } else {
        return { success: false, error: 'Game not found' }
      }
    } catch (error) {
      console.error('Error loading game state:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get all games for a user
   */
  async getUserGames(userId, limitCount = 10) {
    try {
      const gamesQuery = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      )

      const querySnapshot = await getDocs(gamesQuery)
      const games = []

      querySnapshot.forEach((doc) => {
        games.push({ id: doc.id, ...doc.data() })
      })

      return { success: true, data: games }
    } catch (error) {
      console.error('Error getting user games:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get the most recent in-progress game for a user
   */
  async getActiveGame(userId) {
    try {
      const gamesQuery = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        where('status', '==', 'in_progress'),
        orderBy('updatedAt', 'desc'),
        limit(1)
      )

      const querySnapshot = await getDocs(gamesQuery)

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        return { success: true, data: { id: doc.id, ...doc.data() } }
      }

      return { success: true, data: null }
    } catch (error) {
      console.error('Error getting active game:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Update game status (pause, resume, complete)
   */
  async updateGameStatus(gameId, status) {
    try {
      const gameRef = doc(db, COLLECTION_NAME, gameId)
      await updateDoc(gameRef, {
        status,
        updatedAt: serverTimestamp()
      })

      return { success: true }
    } catch (error) {
      console.error('Error updating game status:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Create the initial game state structure
   */
  createInitialGameState(userId, userEmail, homeTeam, awayTeam, homePlayers, awayPlayers) {
    return {
      userId,
      playerEmails: {
        home: userEmail,
        away: '' // For future multiplayer
      },
      teams: {
        home: {
          name: homeTeam.name,
          color: homeTeam.color
        },
        away: {
          name: awayTeam.name,
          color: awayTeam.color
        }
      },
      players: {
        home: homePlayers.map(p => ({
          position: { x: p.position[0], y: p.position[1], z: p.position[2] },
          rotation: 0,
          number: p.number,
          name: p.name
        })),
        away: awayPlayers.map(p => ({
          position: { x: p.position[0], y: p.position[1], z: p.position[2] },
          rotation: 0,
          number: p.number,
          name: p.name
        }))
      },
      ball: {
        position: { x: 0, y: 0.1, z: 0 }
      },
      score: {
        home: 0,
        away: 0
      },
      goals: [],
      matchStartTime: Date.now(),
      matchDuration: 0,
      currentTurn: 'home',
      status: 'in_progress'
    }
  },

  /**
   * Extract current positions from physics refs
   */
  extractCurrentPositions(playerRefs, ballRef, prestonRefs = null) {
    const homePlayers = playerRefs.current.map((ref, index) => {
      if (!ref.current) {
        return { position: { x: 0, y: 0.05, z: 0 }, rotation: 0 }
      }
      const pos = ref.current.translation()
      const rot = ref.current.rotation()
      return {
        position: { x: pos.x, y: pos.y, z: pos.z },
        rotation: rot.y // Y-axis rotation
      }
    })

    const awayPlayers = prestonRefs ? prestonRefs.current.map((ref, index) => {
      if (!ref.current) {
        return { position: { x: 0, y: 0.05, z: 0 }, rotation: 0 }
      }
      const pos = ref.current.translation()
      const rot = ref.current.rotation()
      return {
        position: { x: pos.x, y: pos.y, z: pos.z },
        rotation: rot.y
      }
    }) : []

    let ballPosition = { x: 0, y: 0.1, z: 0 }
    if (ballRef.current) {
      const ballPos = ballRef.current.translation()
      ballPosition = { x: ballPos.x, y: ballPos.y, z: ballPos.z }
    }

    return {
      homePlayers,
      awayPlayers,
      ballPosition
    }
  }
}

export default GameStateService

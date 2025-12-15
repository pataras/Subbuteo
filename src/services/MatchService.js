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
  updateDoc,
  onSnapshot
} from 'firebase/firestore'
import { db } from '../firebase'

const MATCHES_COLLECTION = 'matches'

/**
 * Match document schema:
 * {
 *   id: string,
 *   homePlayer: { uid: string, email: string },
 *   awayPlayer: { uid: string, email: string },
 *   invitedEmail: string,
 *   status: 'waiting' | 'accepted' | 'positioning' | 'in_progress' | 'completed' | 'cancelled',
 *   createdAt: timestamp,
 *   updatedAt: timestamp
 * }
 */

export const MatchService = {
  /**
   * Create a new match and invite a player by email
   */
  async createMatch(homePlayerUid, homePlayerEmail, invitedEmail) {
    try {
      const matchId = doc(collection(db, MATCHES_COLLECTION)).id
      const matchRef = doc(db, MATCHES_COLLECTION, matchId)

      const matchData = {
        id: matchId,
        homePlayer: {
          uid: homePlayerUid,
          email: homePlayerEmail
        },
        awayPlayer: {
          uid: null,
          email: null
        },
        invitedEmail: invitedEmail.toLowerCase(),
        status: 'waiting',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await setDoc(matchRef, matchData)

      return { success: true, matchId, matchData }
    } catch (error) {
      console.error('Error creating match:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get pending invites for a user (by email)
   */
  async getPendingInvites(userEmail) {
    try {
      const invitesQuery = query(
        collection(db, MATCHES_COLLECTION),
        where('invitedEmail', '==', userEmail.toLowerCase()),
        where('status', '==', 'waiting'),
        orderBy('createdAt', 'desc'),
        limit(10)
      )

      const querySnapshot = await getDocs(invitesQuery)
      const invites = []

      querySnapshot.forEach((doc) => {
        invites.push({ id: doc.id, ...doc.data() })
      })

      return { success: true, data: invites }
    } catch (error) {
      console.error('Error getting pending invites:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Accept a match invite
   */
  async acceptMatch(matchId, awayPlayerUid, awayPlayerEmail) {
    try {
      const matchRef = doc(db, MATCHES_COLLECTION, matchId)

      // First fetch the match to validate it exists and user is authorized
      const matchSnap = await getDoc(matchRef)
      if (!matchSnap.exists()) {
        return { success: false, error: 'Match not found' }
      }

      const matchData = matchSnap.data()

      // Validate match is in waiting status
      if (matchData.status !== 'waiting') {
        return { success: false, error: 'Match is no longer waiting for acceptance' }
      }

      // Validate user is the invited player
      if (awayPlayerEmail.toLowerCase() !== matchData.invitedEmail.toLowerCase()) {
        return { success: false, error: 'You are not invited to this match' }
      }

      await updateDoc(matchRef, {
        awayPlayer: {
          uid: awayPlayerUid,
          email: awayPlayerEmail
        },
        status: 'accepted',
        updatedAt: serverTimestamp()
      })

      // Return updated match data
      return {
        success: true,
        data: {
          ...matchData,
          awayPlayer: {
            uid: awayPlayerUid,
            email: awayPlayerEmail
          },
          status: 'accepted'
        }
      }
    } catch (error) {
      console.error('Error accepting match:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Decline a match invite
   */
  async declineMatch(matchId) {
    try {
      const matchRef = doc(db, MATCHES_COLLECTION, matchId)

      await updateDoc(matchRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      })

      return { success: true }
    } catch (error) {
      console.error('Error declining match:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Cancel a match invite (for the match creator/home player)
   */
  async cancelMatch(matchId, userUid) {
    try {
      const matchRef = doc(db, MATCHES_COLLECTION, matchId)

      // First fetch the match to validate it exists and user is the creator
      const matchSnap = await getDoc(matchRef)
      if (!matchSnap.exists()) {
        return { success: false, error: 'Match not found' }
      }

      const matchData = matchSnap.data()

      // Validate user is the home player (creator)
      if (matchData.homePlayer.uid !== userUid) {
        return { success: false, error: 'Only the match creator can cancel this invite' }
      }

      // Validate match is in a cancellable state (not already completed or cancelled)
      if (matchData.status === 'completed' || matchData.status === 'cancelled') {
        return { success: false, error: 'Cannot cancel a match that is already completed or cancelled' }
      }

      await updateDoc(matchRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      })

      return { success: true }
    } catch (error) {
      console.error('Error cancelling match:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get a specific match by ID
   */
  async getMatch(matchId) {
    try {
      const matchRef = doc(db, MATCHES_COLLECTION, matchId)
      const matchSnap = await getDoc(matchRef)

      if (matchSnap.exists()) {
        return { success: true, data: matchSnap.data() }
      } else {
        return { success: false, error: 'Match not found' }
      }
    } catch (error) {
      console.error('Error getting match:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Update match status
   */
  async updateMatchStatus(matchId, status) {
    try {
      const matchRef = doc(db, MATCHES_COLLECTION, matchId)
      await updateDoc(matchRef, {
        status,
        updatedAt: serverTimestamp()
      })

      return { success: true }
    } catch (error) {
      console.error('Error updating match status:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get matches created by a user (as home player)
   */
  async getMyMatches(userUid) {
    try {
      const matchesQuery = query(
        collection(db, MATCHES_COLLECTION),
        where('homePlayer.uid', '==', userUid),
        orderBy('createdAt', 'desc'),
        limit(10)
      )

      const querySnapshot = await getDocs(matchesQuery)
      const matches = []

      querySnapshot.forEach((doc) => {
        matches.push({ id: doc.id, ...doc.data() })
      })

      return { success: true, data: matches }
    } catch (error) {
      console.error('Error getting user matches:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Listen to a match in real-time (for waiting room)
   */
  subscribeToMatch(matchId, callback) {
    const matchRef = doc(db, MATCHES_COLLECTION, matchId)

    return onSnapshot(matchRef, (doc) => {
      if (doc.exists()) {
        callback({ success: true, data: doc.data() })
      } else {
        callback({ success: false, error: 'Match not found' })
      }
    }, (error) => {
      console.error('Error listening to match:', error)
      callback({ success: false, error: error.message })
    })
  },

  /**
   * Listen to pending invites in real-time
   */
  subscribeToPendingInvites(userEmail, callback) {
    const invitesQuery = query(
      collection(db, MATCHES_COLLECTION),
      where('invitedEmail', '==', userEmail.toLowerCase()),
      where('status', '==', 'waiting'),
      orderBy('createdAt', 'desc'),
      limit(10)
    )

    return onSnapshot(invitesQuery, (querySnapshot) => {
      const invites = []
      querySnapshot.forEach((doc) => {
        invites.push({ id: doc.id, ...doc.data() })
      })
      callback({ success: true, data: invites })
    }, (error) => {
      console.error('Error listening to invites:', error)
      callback({ success: false, error: error.message })
    })
  }
}

export default MatchService

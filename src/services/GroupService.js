import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore'
import { db } from '../firebase'

const GROUPS_COLLECTION = 'groups'

/**
 * Group document schema:
 * {
 *   id: string,
 *   name: string,
 *   description: string,
 *   organisers: string[] - array of user IDs who are organisers of this group,
 *   createdAt: timestamp,
 *   updatedAt: timestamp,
 *   createdBy: string - UID of admin who created this group
 * }
 */

export const GroupService = {
  /**
   * Create a new group
   */
  async createGroup(groupData, createdByUid) {
    try {
      const groupId = doc(collection(db, GROUPS_COLLECTION)).id
      const groupRef = doc(db, GROUPS_COLLECTION, groupId)

      const groupDoc = {
        id: groupId,
        name: groupData.name,
        description: groupData.description || '',
        organisers: groupData.organisers || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: createdByUid
      }

      await setDoc(groupRef, groupDoc)

      return { success: true, groupId, groupData: groupDoc }
    } catch (error) {
      console.error('Error creating group:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get a group by ID
   */
  async getGroup(groupId) {
    try {
      const groupRef = doc(db, GROUPS_COLLECTION, groupId)
      const groupSnap = await getDoc(groupRef)

      if (groupSnap.exists()) {
        return { success: true, data: groupSnap.data() }
      } else {
        return { success: false, error: 'Group not found' }
      }
    } catch (error) {
      console.error('Error getting group:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get all groups
   */
  async getAllGroups() {
    try {
      const groupsQuery = query(
        collection(db, GROUPS_COLLECTION),
        orderBy('name', 'asc')
      )

      const querySnapshot = await getDocs(groupsQuery)
      const groups = []

      querySnapshot.forEach((doc) => {
        groups.push({ id: doc.id, ...doc.data() })
      })

      return { success: true, data: groups }
    } catch (error) {
      console.error('Error getting all groups:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Update group
   */
  async updateGroup(groupId, updates) {
    try {
      const groupRef = doc(db, GROUPS_COLLECTION, groupId)

      await updateDoc(groupRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })

      return { success: true }
    } catch (error) {
      console.error('Error updating group:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Delete group
   */
  async deleteGroup(groupId) {
    try {
      const groupRef = doc(db, GROUPS_COLLECTION, groupId)
      await deleteDoc(groupRef)

      return { success: true }
    } catch (error) {
      console.error('Error deleting group:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Add organiser to group
   */
  async addOrganiser(groupId, userId) {
    try {
      const groupResult = await this.getGroup(groupId)
      if (!groupResult.success) {
        return groupResult
      }

      const currentOrganisers = groupResult.data.organisers || []
      if (currentOrganisers.includes(userId)) {
        return { success: true, message: 'User is already an organiser' }
      }

      const updatedOrganisers = [...currentOrganisers, userId]
      return await this.updateGroup(groupId, { organisers: updatedOrganisers })
    } catch (error) {
      console.error('Error adding organiser:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Remove organiser from group
   */
  async removeOrganiser(groupId, userId) {
    try {
      const groupResult = await this.getGroup(groupId)
      if (!groupResult.success) {
        return groupResult
      }

      const currentOrganisers = groupResult.data.organisers || []
      const updatedOrganisers = currentOrganisers.filter(o => o !== userId)

      return await this.updateGroup(groupId, { organisers: updatedOrganisers })
    } catch (error) {
      console.error('Error removing organiser:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get groups where user is an organiser
   */
  async getGroupsByOrganiser(userId) {
    try {
      const groupsQuery = query(
        collection(db, GROUPS_COLLECTION),
        where('organisers', 'array-contains', userId)
      )

      const querySnapshot = await getDocs(groupsQuery)
      const groups = []

      querySnapshot.forEach((doc) => {
        groups.push({ id: doc.id, ...doc.data() })
      })

      return { success: true, data: groups }
    } catch (error) {
      console.error('Error getting groups by organiser:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Subscribe to all groups (real-time)
   */
  subscribeToGroups(callback) {
    const groupsQuery = query(
      collection(db, GROUPS_COLLECTION),
      orderBy('name', 'asc')
    )

    return onSnapshot(groupsQuery, (querySnapshot) => {
      const groups = []
      querySnapshot.forEach((doc) => {
        groups.push({ id: doc.id, ...doc.data() })
      })
      callback({ success: true, data: groups })
    }, (error) => {
      console.error('Error listening to groups:', error)
      callback({ success: false, error: error.message })
    })
  },

  /**
   * Check if user is organiser of a group
   */
  isOrganiser(group, userId) {
    return group?.organisers?.includes(userId) || false
  }
}

export default GroupService

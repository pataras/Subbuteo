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

const USERS_COLLECTION = 'users'

/**
 * User document schema:
 * {
 *   id: string (Firebase Auth UID or generated),
 *   email: string,
 *   name: string,
 *   roles: string[] - ['user'] by default, can include 'admin', 'group_organiser',
 *   groups: string[] - array of group IDs the user belongs to,
 *   createdAt: timestamp,
 *   updatedAt: timestamp,
 *   createdBy: string - UID of admin who created this user
 * }
 */

export const UserService = {
  /**
   * Create or update a user profile
   */
  async createUser(userData, createdByUid = null) {
    try {
      const userId = userData.id || doc(collection(db, USERS_COLLECTION)).id
      const userRef = doc(db, USERS_COLLECTION, userId)

      const userDoc = {
        id: userId,
        email: userData.email.toLowerCase(),
        name: userData.name || '',
        roles: userData.roles || ['user'],
        groups: userData.groups || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: createdByUid
      }

      await setDoc(userRef, userDoc)

      return { success: true, userId, userData: userDoc }
    } catch (error) {
      console.error('Error creating user:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get a user by ID
   */
  async getUser(userId) {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        return { success: true, data: userSnap.data() }
      } else {
        return { success: false, error: 'User not found' }
      }
    } catch (error) {
      console.error('Error getting user:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get a user by email
   */
  async getUserByEmail(email) {
    try {
      const usersQuery = query(
        collection(db, USERS_COLLECTION),
        where('email', '==', email.toLowerCase())
      )

      const querySnapshot = await getDocs(usersQuery)

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        return { success: true, data: { id: doc.id, ...doc.data() } }
      } else {
        return { success: false, error: 'User not found' }
      }
    } catch (error) {
      console.error('Error getting user by email:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get all users
   */
  async getAllUsers() {
    try {
      const usersQuery = query(
        collection(db, USERS_COLLECTION),
        orderBy('createdAt', 'desc')
      )

      const querySnapshot = await getDocs(usersQuery)
      const users = []

      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() })
      })

      return { success: true, data: users }
    } catch (error) {
      console.error('Error getting all users:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Update user
   */
  async updateUser(userId, updates) {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId)

      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })

      return { success: true }
    } catch (error) {
      console.error('Error updating user:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Delete user
   */
  async deleteUser(userId) {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId)
      await deleteDoc(userRef)

      return { success: true }
    } catch (error) {
      console.error('Error deleting user:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Add role to user
   */
  async addRole(userId, role) {
    try {
      const userResult = await this.getUser(userId)
      if (!userResult.success) {
        return userResult
      }

      const currentRoles = userResult.data.roles || ['user']
      if (currentRoles.includes(role)) {
        return { success: true, message: 'Role already exists' }
      }

      const updatedRoles = [...currentRoles, role]
      return await this.updateUser(userId, { roles: updatedRoles })
    } catch (error) {
      console.error('Error adding role:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Remove role from user
   */
  async removeRole(userId, role) {
    try {
      if (role === 'user') {
        return { success: false, error: 'Cannot remove base user role' }
      }

      const userResult = await this.getUser(userId)
      if (!userResult.success) {
        return userResult
      }

      const currentRoles = userResult.data.roles || ['user']
      const updatedRoles = currentRoles.filter(r => r !== role)

      return await this.updateUser(userId, { roles: updatedRoles })
    } catch (error) {
      console.error('Error removing role:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Add user to group
   */
  async addToGroup(userId, groupId) {
    try {
      const userResult = await this.getUser(userId)
      if (!userResult.success) {
        return userResult
      }

      const currentGroups = userResult.data.groups || []
      if (currentGroups.includes(groupId)) {
        return { success: true, message: 'User already in group' }
      }

      const updatedGroups = [...currentGroups, groupId]
      return await this.updateUser(userId, { groups: updatedGroups })
    } catch (error) {
      console.error('Error adding user to group:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Remove user from group
   */
  async removeFromGroup(userId, groupId) {
    try {
      const userResult = await this.getUser(userId)
      if (!userResult.success) {
        return userResult
      }

      const currentGroups = userResult.data.groups || []
      const updatedGroups = currentGroups.filter(g => g !== groupId)

      return await this.updateUser(userId, { groups: updatedGroups })
    } catch (error) {
      console.error('Error removing user from group:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get users by group
   */
  async getUsersByGroup(groupId) {
    try {
      const usersQuery = query(
        collection(db, USERS_COLLECTION),
        where('groups', 'array-contains', groupId)
      )

      const querySnapshot = await getDocs(usersQuery)
      const users = []

      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() })
      })

      return { success: true, data: users }
    } catch (error) {
      console.error('Error getting users by group:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get users by role
   */
  async getUsersByRole(role) {
    try {
      const usersQuery = query(
        collection(db, USERS_COLLECTION),
        where('roles', 'array-contains', role)
      )

      const querySnapshot = await getDocs(usersQuery)
      const users = []

      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() })
      })

      return { success: true, data: users }
    } catch (error) {
      console.error('Error getting users by role:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Subscribe to all users (real-time)
   */
  subscribeToUsers(callback) {
    const usersQuery = query(
      collection(db, USERS_COLLECTION),
      orderBy('createdAt', 'desc')
    )

    return onSnapshot(usersQuery, (querySnapshot) => {
      const users = []
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() })
      })
      callback({ success: true, data: users })
    }, (error) => {
      console.error('Error listening to users:', error)
      callback({ success: false, error: error.message })
    })
  },

  /**
   * Check if user has a specific role
   */
  hasRole(user, role) {
    return user?.roles?.includes(role) || false
  },

  /**
   * Check if user is admin
   */
  isAdmin(user) {
    return this.hasRole(user, 'admin')
  },

  /**
   * Check if user is group organiser
   */
  isGroupOrganiser(user) {
    return this.hasRole(user, 'group_organiser')
  }
}

export default UserService

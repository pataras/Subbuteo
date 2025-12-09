import { createContext, useContext, useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { auth } from '../firebase'
import { UserService } from '../services/UserService'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchUserProfile(user) {
    if (!user) {
      setUserProfile(null)
      return null
    }

    // Try to get user profile by email
    const result = await UserService.getUserByEmail(user.email)
    if (result.success) {
      setUserProfile(result.data)
      return result.data
    }

    setUserProfile(null)
    return null
  }

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  function logout() {
    setUserProfile(null)
    return signOut(auth)
  }

  function loginWithGoogle() {
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  }

  // Role checking helpers
  function hasRole(role) {
    return userProfile?.roles?.includes(role) || false
  }

  function isAdmin() {
    return hasRole('admin')
  }

  function isGroupOrganiser() {
    return hasRole('group_organiser')
  }

  function canAccessAdmin() {
    return isAdmin() || isGroupOrganiser()
  }

  // Refresh user profile
  async function refreshUserProfile() {
    if (currentUser) {
      return await fetchUserProfile(currentUser)
    }
    return null
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        await fetchUserProfile(user)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    loginWithGoogle,
    hasRole,
    isAdmin,
    isGroupOrganiser,
    canAccessAdmin,
    refreshUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

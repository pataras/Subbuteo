import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, signup, loginWithGoogle } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!isLogin && password !== confirmPassword) {
      return setError('Passwords do not match')
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters')
    }

    try {
      setLoading(true)
      if (isLogin) {
        await login(email, password)
      } else {
        await signup(email, password)
      }
    } catch (err) {
      setError(getErrorMessage(err.code))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    try {
      setError('')
      setLoading(true)
      await loginWithGoogle()
    } catch (err) {
      setError(getErrorMessage(err.code))
    } finally {
      setLoading(false)
    }
  }

  function getErrorMessage(code) {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists'
      case 'auth/invalid-email':
        return 'Invalid email address'
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password'
      case 'auth/weak-password':
        return 'Password is too weak'
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed'
      default:
        return 'An error occurred. Please try again.'
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Subbuteo</h1>
        <h2 style={styles.subtitle}>
          {isLogin ? 'Welcome Back!' : 'Create Account'}
        </h2>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
              required
            />
          )}
          <button
            type="submit"
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>or</span>
        </div>

        <button
          onClick={handleGoogleLogin}
          style={styles.googleButton}
          disabled={loading}
        >
          <svg style={styles.googleIcon} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p style={styles.toggleText}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
            }}
            style={styles.toggleButton}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a472a 0%, #2d5016 50%, #1a472a 100%)',
    padding: '20px',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1a472a',
    marginBottom: '8px',
    fontFamily: 'Georgia, serif',
  },
  subtitle: {
    fontSize: '18px',
    textAlign: 'center',
    color: '#666',
    marginBottom: '24px',
    fontWeight: 'normal',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  input: {
    padding: '14px 16px',
    fontSize: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '14px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#1a472a',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0',
  },
  dividerText: {
    flex: 1,
    textAlign: 'center',
    color: '#999',
    fontSize: '14px',
    position: 'relative',
  },
  googleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    color: '#333',
    backgroundColor: 'white',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  googleIcon: {
    width: '20px',
    height: '20px',
  },
  toggleText: {
    textAlign: 'center',
    marginTop: '24px',
    color: '#666',
    fontSize: '14px',
  },
  toggleButton: {
    background: 'none',
    border: 'none',
    color: '#1a472a',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
  },
  error: {
    backgroundColor: '#fee',
    color: '#c00',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
    textAlign: 'center',
  },
}

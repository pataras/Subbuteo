import { createContext, useContext, useState, useCallback } from 'react'

const SettingsContext = createContext()

export function useSettings() {
  return useContext(SettingsContext)
}

// Default settings - these can be overridden by copying settings and pasting them back
export const DEFAULT_SETTINGS = {
  // Ball physics
  ball: {
    mass: 0.025,
    restitution: 0.2,
    friction: 0.6,
    linearDamping: 1.21,
    angularDamping: 0.7
  },
  // Player physics
  player: {
    mass: 1.0,
    restitution: 0.1,
    friction: 1.5,
    linearDamping: 2.4,
    angularDamping: 3.0
  },
  // Pitch settings
  pitch: {
    width: 6,
    length: 9,
    friction: 3.0,
    restitution: 0.1
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [settingsVersion, setSettingsVersion] = useState(0) // Used to trigger physics reset

  // Update a specific setting category
  const updateSettings = useCallback((category, newValues) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...newValues
      }
    }))
  }, [])

  // Replace all settings (used when pasting settings)
  const replaceAllSettings = useCallback((newSettings) => {
    setSettings(newSettings)
    setSettingsVersion(v => v + 1)
  }, [])

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    setSettingsVersion(v => v + 1)
  }, [])

  // Copy settings to clipboard as JSON
  const copySettings = useCallback(async () => {
    const settingsJson = JSON.stringify(settings, null, 2)
    try {
      await navigator.clipboard.writeText(settingsJson)
      return { success: true }
    } catch (error) {
      console.error('Failed to copy settings:', error)
      return { success: false, error: error.message }
    }
  }, [settings])

  // Import settings from JSON string
  const importSettings = useCallback((jsonString) => {
    try {
      const parsed = JSON.parse(jsonString)
      // Validate structure
      if (parsed.ball && parsed.player && parsed.pitch) {
        replaceAllSettings(parsed)
        return { success: true }
      }
      return { success: false, error: 'Invalid settings structure' }
    } catch (error) {
      return { success: false, error: 'Invalid JSON: ' + error.message }
    }
  }, [replaceAllSettings])

  // Increment settings version (triggers physics reset)
  const triggerReset = useCallback(() => {
    setSettingsVersion(v => v + 1)
  }, [])

  const value = {
    settings,
    settingsVersion,
    updateSettings,
    replaceAllSettings,
    resetToDefaults,
    copySettings,
    importSettings,
    triggerReset
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

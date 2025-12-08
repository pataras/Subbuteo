import { useState } from 'react'
import { useSettings, DEFAULT_SETTINGS } from '../contexts/SettingsContext'

function SettingsPanel({ isOpen, onClose, onApply }) {
  const { settings, updateSettings, copySettings, importSettings, resetToDefaults } = useSettings()
  const [copyStatus, setCopyStatus] = useState(null)
  const [importText, setImportText] = useState('')
  const [showImport, setShowImport] = useState(false)

  if (!isOpen) return null

  const handleCopy = async () => {
    const result = await copySettings()
    if (result.success) {
      setCopyStatus('Copied!')
      setTimeout(() => setCopyStatus(null), 2000)
    } else {
      setCopyStatus('Failed to copy')
      setTimeout(() => setCopyStatus(null), 2000)
    }
  }

  const handleImport = () => {
    const result = importSettings(importText)
    if (result.success) {
      setShowImport(false)
      setImportText('')
      setCopyStatus('Imported!')
      setTimeout(() => setCopyStatus(null), 2000)
    } else {
      setCopyStatus(result.error)
      setTimeout(() => setCopyStatus(null), 3000)
    }
  }

  const handleReset = () => {
    resetToDefaults()
    setCopyStatus('Reset to defaults!')
    setTimeout(() => setCopyStatus(null), 2000)
  }

  const handleApply = () => {
    onApply()
  }

  const sliderStyle = {
    width: '100%',
    marginTop: '4px',
    accentColor: '#4488ff'
  }

  const labelStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#ccc',
    fontSize: '13px',
    marginBottom: '2px'
  }

  const valueStyle = {
    color: '#4488ff',
    fontWeight: 'bold',
    minWidth: '50px',
    textAlign: 'right'
  }

  const sectionStyle = {
    marginBottom: '20px',
    padding: '12px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px'
  }

  const sectionTitleStyle = {
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '12px',
    borderBottom: '1px solid #444',
    paddingBottom: '6px'
  }

  const SliderRow = ({ label, value, min, max, step, onChange, unit = '' }) => (
    <div style={{ marginBottom: '10px' }}>
      <div style={labelStyle}>
        <span>{label}</span>
        <span style={valueStyle}>{value.toFixed(step < 1 ? 2 : 1)}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={sliderStyle}
      />
    </div>
  )

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#1a1a2e',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        border: '2px solid #333',
        fontFamily: 'sans-serif'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#fff', margin: 0, fontSize: '22px' }}>Game Settings</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            x
          </button>
        </div>

        {/* Ball Settings */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Ball Physics</div>
          <SliderRow
            label="Mass"
            value={settings.ball.mass}
            min={0.01}
            max={0.2}
            step={0.005}
            onChange={(v) => updateSettings('ball', { mass: v })}
            unit=" kg"
          />
          <SliderRow
            label="Linear Damping"
            value={settings.ball.linearDamping}
            min={0}
            max={5}
            step={0.1}
            onChange={(v) => updateSettings('ball', { linearDamping: v })}
          />
          <SliderRow
            label="Angular Damping"
            value={settings.ball.angularDamping}
            min={0}
            max={3}
            step={0.1}
            onChange={(v) => updateSettings('ball', { angularDamping: v })}
          />
          <SliderRow
            label="Friction"
            value={settings.ball.friction}
            min={0}
            max={2}
            step={0.1}
            onChange={(v) => updateSettings('ball', { friction: v })}
          />
          <SliderRow
            label="Bounciness"
            value={settings.ball.restitution}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => updateSettings('ball', { restitution: v })}
          />
        </div>

        {/* Player Settings */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Player Physics</div>
          <SliderRow
            label="Mass"
            value={settings.player.mass}
            min={0.1}
            max={5}
            step={0.1}
            onChange={(v) => updateSettings('player', { mass: v })}
            unit=" kg"
          />
          <SliderRow
            label="Linear Damping"
            value={settings.player.linearDamping}
            min={0}
            max={10}
            step={0.1}
            onChange={(v) => updateSettings('player', { linearDamping: v })}
          />
          <SliderRow
            label="Angular Damping"
            value={settings.player.angularDamping}
            min={0}
            max={10}
            step={0.1}
            onChange={(v) => updateSettings('player', { angularDamping: v })}
          />
          <SliderRow
            label="Friction"
            value={settings.player.friction}
            min={0}
            max={5}
            step={0.1}
            onChange={(v) => updateSettings('player', { friction: v })}
          />
          <SliderRow
            label="Bounciness"
            value={settings.player.restitution}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => updateSettings('player', { restitution: v })}
          />
        </div>

        {/* Pitch Settings */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Pitch Settings</div>
          <SliderRow
            label="Width"
            value={settings.pitch.width}
            min={4}
            max={10}
            step={0.5}
            onChange={(v) => updateSettings('pitch', { width: v })}
            unit=" units"
          />
          <SliderRow
            label="Length"
            value={settings.pitch.length}
            min={6}
            max={14}
            step={0.5}
            onChange={(v) => updateSettings('pitch', { length: v })}
            unit=" units"
          />
          <SliderRow
            label="Ground Friction"
            value={settings.pitch.friction}
            min={0}
            max={10}
            step={0.1}
            onChange={(v) => updateSettings('pitch', { friction: v })}
          />
          <SliderRow
            label="Ground Bounciness"
            value={settings.pitch.restitution}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => updateSettings('pitch', { restitution: v })}
          />
        </div>

        {/* Import section */}
        {showImport && (
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Import Settings</div>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste settings JSON here..."
              style={{
                width: '100%',
                height: '100px',
                background: '#111',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff',
                padding: '8px',
                fontFamily: 'monospace',
                fontSize: '12px',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                onClick={handleImport}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: '#44cc44',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Import
              </button>
              <button
                onClick={() => { setShowImport(false); setImportText('') }}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: '#666',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Status message */}
        {copyStatus && (
          <div style={{
            textAlign: 'center',
            color: copyStatus.includes('Failed') || copyStatus.includes('Invalid') ? '#ff6b6b' : '#44cc44',
            fontSize: '14px',
            marginBottom: '12px'
          }}>
            {copyStatus}
          </div>
        )}

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginTop: '16px'
        }}>
          <button
            onClick={handleCopy}
            style={{
              flex: '1 1 calc(50% - 4px)',
              padding: '12px',
              background: '#4488ff',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            Copy Settings
          </button>
          <button
            onClick={() => setShowImport(!showImport)}
            style={{
              flex: '1 1 calc(50% - 4px)',
              padding: '12px',
              background: '#884488',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            Import Settings
          </button>
          <button
            onClick={handleReset}
            style={{
              flex: '1 1 calc(50% - 4px)',
              padding: '12px',
              background: '#666',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            Reset Defaults
          </button>
          <button
            onClick={handleApply}
            style={{
              flex: '1 1 calc(50% - 4px)',
              padding: '12px',
              background: '#44cc44',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            Apply & Restart
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel

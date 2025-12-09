import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import UserManagement from './UserManagement'
import GroupManagement from './GroupManagement'

function AdminPanel({ onBack }) {
  const { isAdmin, isGroupOrganiser, userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('users')

  if (!isAdmin() && !isGroupOrganiser()) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2 style={titleStyle}>Access Denied</h2>
          <p style={messageStyle}>You do not have permission to access the admin panel.</p>
          <button onClick={onBack} style={backButtonStyle}>
            Back to Lobby
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={panelStyle}>
        <div style={headerStyle}>
          <button onClick={onBack} style={backButtonStyle}>
            Back
          </button>
          <h1 style={titleStyle}>Admin Panel</h1>
          <div style={userInfoStyle}>
            {userProfile?.name || userProfile?.email}
            <span style={roleBadgeStyle}>
              {isAdmin() ? 'Admin' : 'Group Organiser'}
            </span>
          </div>
        </div>

        <div style={tabsStyle}>
          <button
            style={activeTab === 'users' ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            style={activeTab === 'groups' ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab('groups')}
          >
            Groups
          </button>
        </div>

        <div style={contentStyle}>
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'groups' && <GroupManagement />}
        </div>
      </div>
    </div>
  )
}

const containerStyle = {
  minHeight: '100vh',
  backgroundColor: '#1a1a2e',
  padding: '20px',
  fontFamily: 'sans-serif',
}

const panelStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
}

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  marginBottom: '20px',
  padding: '20px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
}

const backButtonStyle = {
  padding: '10px 20px',
  fontSize: '14px',
  backgroundColor: '#4a5568',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
}

const titleStyle = {
  color: 'white',
  fontSize: '24px',
  margin: 0,
  flex: 1,
}

const userInfoStyle = {
  color: '#aaa',
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
}

const roleBadgeStyle = {
  backgroundColor: '#4CAF50',
  color: 'white',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: 'bold',
}

const tabsStyle = {
  display: 'flex',
  gap: '10px',
  marginBottom: '20px',
}

const tabStyle = {
  padding: '12px 24px',
  fontSize: '14px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  color: '#aaa',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
}

const activeTabStyle = {
  ...tabStyle,
  backgroundColor: '#4CAF50',
  color: 'white',
}

const contentStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  padding: '20px',
  minHeight: '500px',
}

const cardStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  padding: '40px',
  textAlign: 'center',
  maxWidth: '400px',
  margin: '100px auto',
}

const messageStyle = {
  color: '#aaa',
  fontSize: '14px',
  marginBottom: '20px',
}

export default AdminPanel

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { UserService } from '../../services/UserService'
import { GroupService } from '../../services/GroupService'

function UserManagement() {
  const { currentUser, isAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state for adding/editing users
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    roles: ['user'],
    groups: []
  })

  useEffect(() => {
    // Subscribe to users
    const unsubscribeUsers = UserService.subscribeToUsers((result) => {
      if (result.success) {
        setUsers(result.data)
      }
      setLoading(false)
    })

    // Fetch groups for assignment
    GroupService.getAllGroups().then((result) => {
      if (result.success) {
        setGroups(result.data)
      }
    })

    return () => unsubscribeUsers()
  }, [])

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      roles: ['user'],
      groups: []
    })
    setError('')
    setSuccess('')
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.email) {
      setError('Email is required')
      return
    }

    // Check if user already exists
    const existingUser = await UserService.getUserByEmail(formData.email)
    if (existingUser.success) {
      setError('A user with this email already exists')
      return
    }

    const result = await UserService.createUser(formData, currentUser.uid)
    if (result.success) {
      setSuccess('User created successfully')
      setShowAddModal(false)
      resetForm()
    } else {
      setError(result.error)
    }
  }

  const handleEditUser = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedUser) return

    const result = await UserService.updateUser(selectedUser.id, {
      name: formData.name,
      roles: formData.roles,
      groups: formData.groups
    })

    if (result.success) {
      setSuccess('User updated successfully')
      setShowEditModal(false)
      setSelectedUser(null)
      resetForm()
    } else {
      setError(result.error)
    }
  }

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.email}?`)) {
      return
    }

    const result = await UserService.deleteUser(user.id)
    if (result.success) {
      setSuccess('User deleted successfully')
    } else {
      setError(result.error)
    }
  }

  const openEditModal = (user) => {
    setSelectedUser(user)
    setFormData({
      email: user.email,
      name: user.name || '',
      roles: user.roles || ['user'],
      groups: user.groups || []
    })
    setShowEditModal(true)
    setError('')
    setSuccess('')
  }

  const toggleRole = (role) => {
    if (role === 'user') return // Can't remove base user role

    setFormData(prev => {
      const hasRole = prev.roles.includes(role)
      return {
        ...prev,
        roles: hasRole
          ? prev.roles.filter(r => r !== role)
          : [...prev.roles, role]
      }
    })
  }

  const toggleGroup = (groupId) => {
    setFormData(prev => {
      const inGroup = prev.groups.includes(groupId)
      return {
        ...prev,
        groups: inGroup
          ? prev.groups.filter(g => g !== groupId)
          : [...prev.groups, groupId]
      }
    })
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return '#e74c3c'
      case 'group_organiser': return '#3498db'
      default: return '#95a5a6'
    }
  }

  if (loading) {
    return <div style={loadingStyle}>Loading users...</div>
  }

  return (
    <div>
      <div style={headerStyle}>
        <h2 style={sectionTitleStyle}>User Management</h2>
        {isAdmin() && (
          <button
            onClick={() => { setShowAddModal(true); resetForm() }}
            style={addButtonStyle}
          >
            Add User
          </button>
        )}
      </div>

      {success && <div style={successStyle}>{success}</div>}
      {error && <div style={errorStyle}>{error}</div>}

      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Roles</th>
              <th style={thStyle}>Groups</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={trStyle}>
                <td style={tdStyle}>{user.name || '-'}</td>
                <td style={tdStyle}>{user.email}</td>
                <td style={tdStyle}>
                  <div style={badgeContainerStyle}>
                    {user.roles?.map((role) => (
                      <span
                        key={role}
                        style={{
                          ...roleBadgeStyle,
                          backgroundColor: getRoleBadgeColor(role)
                        }}
                      >
                        {role.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={tdStyle}>
                  <div style={badgeContainerStyle}>
                    {user.groups?.map((groupId) => {
                      const group = groups.find(g => g.id === groupId)
                      return group ? (
                        <span key={groupId} style={groupBadgeStyle}>
                          {group.name}
                        </span>
                      ) : null
                    })}
                    {(!user.groups || user.groups.length === 0) && '-'}
                  </div>
                </td>
                <td style={tdStyle}>
                  <div style={actionButtonsStyle}>
                    <button
                      onClick={() => openEditModal(user)}
                      style={editButtonStyle}
                    >
                      Edit
                    </button>
                    {isAdmin() && (
                      <button
                        onClick={() => handleDeleteUser(user)}
                        style={deleteButtonStyle}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" style={emptyStyle}>
                  No users found. Add your first user to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3 style={modalTitleStyle}>Add New User</h3>
            <form onSubmit={handleAddUser}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={inputStyle}
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={inputStyle}
                  placeholder="John Doe"
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Roles</label>
                <div style={checkboxContainerStyle}>
                  <label style={checkboxLabelStyle}>
                    <input
                      type="checkbox"
                      checked={formData.roles.includes('user')}
                      disabled
                      style={checkboxStyle}
                    />
                    User (default)
                  </label>
                  <label style={checkboxLabelStyle}>
                    <input
                      type="checkbox"
                      checked={formData.roles.includes('group_organiser')}
                      onChange={() => toggleRole('group_organiser')}
                      style={checkboxStyle}
                    />
                    Group Organiser
                  </label>
                  <label style={checkboxLabelStyle}>
                    <input
                      type="checkbox"
                      checked={formData.roles.includes('admin')}
                      onChange={() => toggleRole('admin')}
                      style={checkboxStyle}
                    />
                    Admin
                  </label>
                </div>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Groups</label>
                <div style={checkboxContainerStyle}>
                  {groups.map((group) => (
                    <label key={group.id} style={checkboxLabelStyle}>
                      <input
                        type="checkbox"
                        checked={formData.groups.includes(group.id)}
                        onChange={() => toggleGroup(group.id)}
                        style={checkboxStyle}
                      />
                      {group.name}
                    </label>
                  ))}
                  {groups.length === 0 && (
                    <span style={noGroupsStyle}>No groups available</span>
                  )}
                </div>
              </div>

              {error && <div style={errorStyle}>{error}</div>}

              <div style={modalButtonsStyle}>
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); resetForm() }}
                  style={cancelButtonStyle}
                >
                  Cancel
                </button>
                <button type="submit" style={submitButtonStyle}>
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3 style={modalTitleStyle}>Edit User</h3>
            <form onSubmit={handleEditUser}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  style={{ ...inputStyle, backgroundColor: '#2d3748', cursor: 'not-allowed' }}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={inputStyle}
                  placeholder="John Doe"
                />
              </div>

              {isAdmin() && (
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Roles</label>
                  <div style={checkboxContainerStyle}>
                    <label style={checkboxLabelStyle}>
                      <input
                        type="checkbox"
                        checked={formData.roles.includes('user')}
                        disabled
                        style={checkboxStyle}
                      />
                      User (default)
                    </label>
                    <label style={checkboxLabelStyle}>
                      <input
                        type="checkbox"
                        checked={formData.roles.includes('group_organiser')}
                        onChange={() => toggleRole('group_organiser')}
                        style={checkboxStyle}
                      />
                      Group Organiser
                    </label>
                    <label style={checkboxLabelStyle}>
                      <input
                        type="checkbox"
                        checked={formData.roles.includes('admin')}
                        onChange={() => toggleRole('admin')}
                        style={checkboxStyle}
                      />
                      Admin
                    </label>
                  </div>
                </div>
              )}

              <div style={formGroupStyle}>
                <label style={labelStyle}>Groups</label>
                <div style={checkboxContainerStyle}>
                  {groups.map((group) => (
                    <label key={group.id} style={checkboxLabelStyle}>
                      <input
                        type="checkbox"
                        checked={formData.groups.includes(group.id)}
                        onChange={() => toggleGroup(group.id)}
                        style={checkboxStyle}
                      />
                      {group.name}
                    </label>
                  ))}
                  {groups.length === 0 && (
                    <span style={noGroupsStyle}>No groups available</span>
                  )}
                </div>
              </div>

              {error && <div style={errorStyle}>{error}</div>}

              <div style={modalButtonsStyle}>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedUser(null); resetForm() }}
                  style={cancelButtonStyle}
                >
                  Cancel
                </button>
                <button type="submit" style={submitButtonStyle}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Styles
const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
}

const sectionTitleStyle = {
  color: 'white',
  fontSize: '18px',
  margin: 0,
}

const addButtonStyle = {
  padding: '10px 20px',
  fontSize: '14px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
}

const tableContainerStyle = {
  overflowX: 'auto',
}

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  color: 'white',
}

const thStyle = {
  textAlign: 'left',
  padding: '12px',
  borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
  color: '#aaa',
  fontSize: '12px',
  textTransform: 'uppercase',
}

const trStyle = {
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
}

const tdStyle = {
  padding: '12px',
  fontSize: '14px',
}

const badgeContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4px',
}

const roleBadgeStyle = {
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '11px',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  color: 'white',
}

const groupBadgeStyle = {
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '11px',
  backgroundColor: '#6c5ce7',
  color: 'white',
}

const actionButtonsStyle = {
  display: 'flex',
  gap: '8px',
}

const editButtonStyle = {
  padding: '6px 12px',
  fontSize: '12px',
  backgroundColor: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
}

const deleteButtonStyle = {
  padding: '6px 12px',
  fontSize: '12px',
  backgroundColor: '#e74c3c',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
}

const emptyStyle = {
  textAlign: 'center',
  padding: '40px',
  color: '#aaa',
}

const loadingStyle = {
  textAlign: 'center',
  padding: '40px',
  color: '#aaa',
}

const successStyle = {
  backgroundColor: 'rgba(76, 175, 80, 0.2)',
  color: '#4CAF50',
  padding: '12px',
  borderRadius: '8px',
  marginBottom: '16px',
}

const errorStyle = {
  backgroundColor: 'rgba(231, 76, 60, 0.2)',
  color: '#e74c3c',
  padding: '12px',
  borderRadius: '8px',
  marginBottom: '16px',
}

// Modal styles
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
}

const modalStyle = {
  backgroundColor: '#1a1a2e',
  borderRadius: '12px',
  padding: '24px',
  width: '100%',
  maxWidth: '500px',
  maxHeight: '80vh',
  overflowY: 'auto',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}

const modalTitleStyle = {
  color: 'white',
  fontSize: '18px',
  marginTop: 0,
  marginBottom: '20px',
}

const formGroupStyle = {
  marginBottom: '16px',
}

const labelStyle = {
  display: 'block',
  color: '#aaa',
  fontSize: '12px',
  marginBottom: '6px',
  textTransform: 'uppercase',
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '14px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '8px',
  color: 'white',
  boxSizing: 'border-box',
}

const checkboxContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}

const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: 'white',
  fontSize: '14px',
  cursor: 'pointer',
}

const checkboxStyle = {
  width: '16px',
  height: '16px',
  cursor: 'pointer',
}

const noGroupsStyle = {
  color: '#aaa',
  fontSize: '14px',
  fontStyle: 'italic',
}

const modalButtonsStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '24px',
}

const cancelButtonStyle = {
  padding: '10px 20px',
  fontSize: '14px',
  backgroundColor: 'transparent',
  color: '#aaa',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '8px',
  cursor: 'pointer',
}

const submitButtonStyle = {
  padding: '10px 20px',
  fontSize: '14px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
}

export default UserManagement

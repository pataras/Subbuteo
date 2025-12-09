import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { GroupService } from '../../services/GroupService'
import { UserService } from '../../services/UserService'

function GroupManagement() {
  const { currentUser, isAdmin } = useAuth()
  const [groups, setGroups] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [groupMembers, setGroupMembers] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    organisers: []
  })

  useEffect(() => {
    // Subscribe to groups
    const unsubscribeGroups = GroupService.subscribeToGroups((result) => {
      if (result.success) {
        setGroups(result.data)
      }
      setLoading(false)
    })

    // Fetch users for organiser assignment
    UserService.getAllUsers().then((result) => {
      if (result.success) {
        setUsers(result.data)
      }
    })

    return () => unsubscribeGroups()
  }, [])

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      organisers: []
    })
    setError('')
    setSuccess('')
  }

  const handleAddGroup = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.name) {
      setError('Group name is required')
      return
    }

    const result = await GroupService.createGroup(formData, currentUser.uid)
    if (result.success) {
      setSuccess('Group created successfully')
      setShowAddModal(false)
      resetForm()
    } else {
      setError(result.error)
    }
  }

  const handleEditGroup = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedGroup) return

    const result = await GroupService.updateGroup(selectedGroup.id, {
      name: formData.name,
      description: formData.description,
      organisers: formData.organisers
    })

    if (result.success) {
      setSuccess('Group updated successfully')
      setShowEditModal(false)
      setSelectedGroup(null)
      resetForm()
    } else {
      setError(result.error)
    }
  }

  const handleDeleteGroup = async (group) => {
    if (!window.confirm(`Are you sure you want to delete "${group.name}"?`)) {
      return
    }

    const result = await GroupService.deleteGroup(group.id)
    if (result.success) {
      setSuccess('Group deleted successfully')
    } else {
      setError(result.error)
    }
  }

  const openEditModal = (group) => {
    setSelectedGroup(group)
    setFormData({
      name: group.name,
      description: group.description || '',
      organisers: group.organisers || []
    })
    setShowEditModal(true)
    setError('')
    setSuccess('')
  }

  const openMembersModal = async (group) => {
    setSelectedGroup(group)
    setShowMembersModal(true)

    // Fetch members of this group
    const result = await UserService.getUsersByGroup(group.id)
    if (result.success) {
      setGroupMembers(result.data)
    } else {
      setGroupMembers([])
    }
  }

  const toggleOrganiser = (userId) => {
    setFormData(prev => {
      const isOrganiser = prev.organisers.includes(userId)
      return {
        ...prev,
        organisers: isOrganiser
          ? prev.organisers.filter(o => o !== userId)
          : [...prev.organisers, userId]
      }
    })
  }

  const getOrganiserNames = (organiserIds) => {
    return organiserIds
      ?.map(id => {
        const user = users.find(u => u.id === id)
        return user?.name || user?.email || 'Unknown'
      })
      .join(', ') || '-'
  }

  if (loading) {
    return <div style={loadingStyle}>Loading groups...</div>
  }

  return (
    <div>
      <div style={headerStyle}>
        <h2 style={sectionTitleStyle}>Group Management</h2>
        {isAdmin() && (
          <button
            onClick={() => { setShowAddModal(true); resetForm() }}
            style={addButtonStyle}
          >
            Add Group
          </button>
        )}
      </div>

      {success && <div style={successStyle}>{success}</div>}
      {error && <div style={errorStyle}>{error}</div>}

      <div style={groupsGridStyle}>
        {groups.map((group) => (
          <div key={group.id} style={groupCardStyle}>
            <div style={groupHeaderStyle}>
              <h3 style={groupNameStyle}>{group.name}</h3>
              <div style={groupActionsStyle}>
                <button
                  onClick={() => openMembersModal(group)}
                  style={viewButtonStyle}
                >
                  Members
                </button>
                <button
                  onClick={() => openEditModal(group)}
                  style={editButtonStyle}
                >
                  Edit
                </button>
                {isAdmin() && (
                  <button
                    onClick={() => handleDeleteGroup(group)}
                    style={deleteButtonStyle}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            {group.description && (
              <p style={groupDescriptionStyle}>{group.description}</p>
            )}

            <div style={groupInfoStyle}>
              <div style={groupInfoItemStyle}>
                <span style={groupInfoLabelStyle}>Organisers:</span>
                <span>{getOrganiserNames(group.organisers)}</span>
              </div>
            </div>
          </div>
        ))}

        {groups.length === 0 && (
          <div style={emptyStyle}>
            No groups found. Create your first group to get started.
          </div>
        )}
      </div>

      {/* Add Group Modal */}
      {showAddModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3 style={modalTitleStyle}>Add New Group</h3>
            <form onSubmit={handleAddGroup}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Group Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g., Monday Night League"
                  required
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={textareaStyle}
                  placeholder="Optional description for the group"
                  rows={3}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Group Organisers</label>
                <div style={checkboxContainerStyle}>
                  {users.map((user) => (
                    <label key={user.id} style={checkboxLabelStyle}>
                      <input
                        type="checkbox"
                        checked={formData.organisers.includes(user.id)}
                        onChange={() => toggleOrganiser(user.id)}
                        style={checkboxStyle}
                      />
                      {user.name || user.email}
                    </label>
                  ))}
                  {users.length === 0 && (
                    <span style={noUsersStyle}>No users available</span>
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
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {showEditModal && selectedGroup && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3 style={modalTitleStyle}>Edit Group</h3>
            <form onSubmit={handleEditGroup}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Group Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={textareaStyle}
                  rows={3}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Group Organisers</label>
                <div style={checkboxContainerStyle}>
                  {users.map((user) => (
                    <label key={user.id} style={checkboxLabelStyle}>
                      <input
                        type="checkbox"
                        checked={formData.organisers.includes(user.id)}
                        onChange={() => toggleOrganiser(user.id)}
                        style={checkboxStyle}
                      />
                      {user.name || user.email}
                    </label>
                  ))}
                </div>
              </div>

              {error && <div style={errorStyle}>{error}</div>}

              <div style={modalButtonsStyle}>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedGroup(null); resetForm() }}
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

      {/* Members Modal */}
      {showMembersModal && selectedGroup && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3 style={modalTitleStyle}>Members of {selectedGroup.name}</h3>

            <div style={membersListStyle}>
              {groupMembers.length > 0 ? (
                groupMembers.map((member) => (
                  <div key={member.id} style={memberItemStyle}>
                    <div>
                      <div style={memberNameStyle}>{member.name || 'Unnamed'}</div>
                      <div style={memberEmailStyle}>{member.email}</div>
                    </div>
                    <div style={memberRolesStyle}>
                      {member.roles?.map((role) => (
                        <span key={role} style={memberRoleBadgeStyle}>
                          {role.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div style={noMembersStyle}>No members in this group yet</div>
              )}
            </div>

            <div style={modalButtonsStyle}>
              <button
                onClick={() => { setShowMembersModal(false); setSelectedGroup(null); setGroupMembers([]) }}
                style={cancelButtonStyle}
              >
                Close
              </button>
            </div>
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

const groupsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '20px',
}

const groupCardStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  padding: '20px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}

const groupHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '12px',
}

const groupNameStyle = {
  color: 'white',
  fontSize: '16px',
  margin: 0,
}

const groupActionsStyle = {
  display: 'flex',
  gap: '6px',
}

const viewButtonStyle = {
  padding: '4px 10px',
  fontSize: '11px',
  backgroundColor: '#6c5ce7',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
}

const editButtonStyle = {
  padding: '4px 10px',
  fontSize: '11px',
  backgroundColor: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
}

const deleteButtonStyle = {
  padding: '4px 10px',
  fontSize: '11px',
  backgroundColor: '#e74c3c',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
}

const groupDescriptionStyle = {
  color: '#aaa',
  fontSize: '13px',
  margin: '0 0 12px 0',
}

const groupInfoStyle = {
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  paddingTop: '12px',
}

const groupInfoItemStyle = {
  color: 'white',
  fontSize: '13px',
}

const groupInfoLabelStyle = {
  color: '#aaa',
  marginRight: '8px',
}

const emptyStyle = {
  gridColumn: '1 / -1',
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

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical',
  fontFamily: 'inherit',
}

const checkboxContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  maxHeight: '200px',
  overflowY: 'auto',
  padding: '8px',
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  borderRadius: '8px',
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

const noUsersStyle = {
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

// Members modal styles
const membersListStyle = {
  maxHeight: '300px',
  overflowY: 'auto',
}

const memberItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
}

const memberNameStyle = {
  color: 'white',
  fontSize: '14px',
  fontWeight: '500',
}

const memberEmailStyle = {
  color: '#aaa',
  fontSize: '12px',
}

const memberRolesStyle = {
  display: 'flex',
  gap: '4px',
}

const memberRoleBadgeStyle = {
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '10px',
  backgroundColor: '#4a5568',
  color: 'white',
  textTransform: 'uppercase',
}

const noMembersStyle = {
  textAlign: 'center',
  padding: '20px',
  color: '#aaa',
}

export default GroupManagement

import { useState, useEffect } from 'react'
import axios from 'axios'
import moment from 'moment-timezone'
import { Calendar, Clock, Users, Plus, X, Edit, Eye, ChevronDown } from 'lucide-react'
import './App.css'

const API_BASE_URL = 'https://event-management-system-backend-bfnm.onrender.com/api/v1'

// Timezone options
const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
]

function App() {
  const [users, setUsers] = useState([])
  const [events, setEvents] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [newUserName, setNewUserName] = useState('')
  const [showAddUser, setShowAddUser] = useState(false)
  const [showEditEvent, setShowEditEvent] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [showEventLogs, setShowEventLogs] = useState(false)
  const [eventLogs, setEventLogs] = useState([])
  const [viewTimezone, setViewTimezone] = useState('America/New_York')

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    profiles: [],
    timezone: 'America/New_York',
    startDateTime: '',
    endDateTime: ''
  })

  useEffect(() => {
    fetchUsers()
    fetchEvents()
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchEventsForUser(currentUser._id)
    } else {
      fetchEvents()
    }
  }, [currentUser, viewTimezone])

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/all`)
      if (response.data.success) {
        setUsers(response.data.data)
        if (response.data.data.length > 0 && !currentUser) {
          setCurrentUser(response.data.data[0])
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/events/all?timezone=${viewTimezone}`)
      if (response.data.success) {
        setEvents(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const fetchEventsForUser = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/events/user/${userId}?timezone=${viewTimezone}`)
      if (response.data.success) {
        setEvents(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching user events:', error)
    }
  }

  const createUser = async () => {
    if (!newUserName.trim()) return

    try {
      const response = await axios.post(`${API_BASE_URL}/users/create`, {
        name: newUserName.trim(),
        timezone: 'UTC'
      })
      if (response.data.success) {
        setNewUserName('')
        setShowAddUser(false)
        fetchUsers()
      }
    } catch (error) {
      console.error('Error creating user:', error)
    }
  }

  const createEvent = async () => {
    if (!eventForm.title || !eventForm.profiles.length || !eventForm.startDateTime || !eventForm.endDateTime) {
      alert('Please fill all required fields')
      return
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/events/create`, eventForm)
      if (response.data.success) {
        setEventForm({
          title: '',
          profiles: [],
          timezone: 'America/New_York',
          startDateTime: '',
          endDateTime: ''
        })
        if (currentUser) {
          fetchEventsForUser(currentUser._id)
        } else {
          fetchEvents()
        }
      }
    } catch (error) {
      console.error('Error creating event:', error)
      alert(error.response?.data?.message || 'Error creating event')
    }
  }

  const updateEvent = async () => {
    try {
      const response = await axios.put(`${API_BASE_URL}/events/${editingEvent._id}`, eventForm)
      if (response.data.success) {
        setShowEditEvent(false)
        setEditingEvent(null)
        setEventForm({
          title: '',
          profiles: [],
          timezone: 'America/New_York',
          startDateTime: '',
          endDateTime: ''
        })
        if (currentUser) {
          fetchEventsForUser(currentUser._id)
        } else {
          fetchEvents()
        }
      }
    } catch (error) {
      console.error('Error updating event:', error)
      alert(error.response?.data?.message || 'Error updating event')
    }
  }

  const fetchEventLogs = async (eventId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/events/${eventId}/logs?timezone=${viewTimezone}`)
      if (response.data.success) {
        setEventLogs(response.data.data)
        setShowEventLogs(true)
      }
    } catch (error) {
      console.error('Error fetching event logs:', error)
    }
  }

  const handleEditEvent = (event) => {
    setEditingEvent(event)
    setEventForm({
      title: event.title,
      profiles: event.profiles.map(p => p._id),
      timezone: event.timezone,
      startDateTime: moment(event.startDateTime).format('YYYY-MM-DDTHH:mm'),
      endDateTime: moment(event.endDateTime).format('YYYY-MM-DDTHH:mm')
    })
    setShowEditEvent(true)
  }

  const toggleProfileSelection = (profileId) => {
    setEventForm(prev => ({
      ...prev,
      profiles: prev.profiles.includes(profileId)
        ? prev.profiles.filter(id => id !== profileId)
        : [...prev.profiles, profileId]
    }))
  }

  return (
    <div className="app-container">
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div>
            <h1 className="main-title">Event Management</h1>
            <p className="subtitle">Create and manage events across multiple timezones</p>
          </div>
          
          {/* Profile Selector */}
          <div className="profile-selector">
            <select
              value={currentUser?._id || ''}
              onChange={(e) => {
                const user = users.find(u => u._id === e.target.value)
                setCurrentUser(user)
                if (user) {
                  setViewTimezone(user.timezone)
                }
              }}
              className="select-input"
            >
              <option value="">Select current profile...</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
            <ChevronDown className="select-icon" />
          </div>
        </div>

        <div className="grid-container">
          {/* Create Event Section */}
          <div className="card">
            <h2 className="section-title">Create Event</h2>
            
            {/* Event Title */}
            <div className="form-group">
              <label className="form-label">Event Title</label>
              <input
                type="text"
                value={eventForm.title}
                onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                className="form-input"
                placeholder="Enter event title..."
              />
            </div>

            {/* Profiles */}
            <div className="form-group">
              <label className="form-label">Profiles</label>
              <div className="profile-selector-container">
                <div className="profile-display">
                  {eventForm.profiles.length > 0 ? (
                    <div className="profile-tags">
                      {eventForm.profiles.map(profileId => {
                        const user = users.find(u => u._id === profileId)
                        return user ? (
                          <span key={profileId} className="profile-tag">
                            {user.name}
                            <X 
                              className="remove-icon" 
                              onClick={() => toggleProfileSelection(profileId)}
                            />
                          </span>
                        ) : null
                      })}
                    </div>
                  ) : (
                    <span className="placeholder-text">Select profiles...</span>
                  )}
                </div>
                
                {/* Profile dropdown */}
                <div className="profile-dropdown">
                  <div className="search-container">
                    <input
                      type="text"
                      placeholder="Search profiles..."
                      className="search-input"
                    />
                  </div>
                  {users.map(user => (
                    <div
                      key={user._id}
                      className={`profile-option ${
                        eventForm.profiles.includes(user._id) ? 'selected' : ''
                      }`}
                      onClick={() => toggleProfileSelection(user._id)}
                    >
                      <input
                        type="checkbox"
                        checked={eventForm.profiles.includes(user._id)}
                        onChange={() => {}}
                        className="checkbox"
                      />
                      {user.name}
                    </div>
                  ))}
                  <div 
                    className="add-profile-option"
                    onClick={() => setShowAddUser(true)}
                  >
                    <Plus className="icon-small" />
                    Add Profile
                  </div>
                </div>
              </div>
            </div>

            {/* Timezone */}
            <div className="form-group">
              <label className="form-label">Timezone</label>
              <select
                value={eventForm.timezone}
                onChange={(e) => setEventForm(prev => ({ ...prev, timezone: e.target.value }))}
                className="form-select"
              >
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>

            {/* Start Date & Time */}
            <div className="form-group">
              <label className="form-label">Start Date & Time</label>
              <div className="datetime-container">
                <input
                  type="datetime-local"
                  value={eventForm.startDateTime}
                  onChange={(e) => setEventForm(prev => ({ ...prev, startDateTime: e.target.value }))}
                  className="form-input"
                />
              </div>
            </div>

            {/* End Date & Time */}
            <div className="form-group">
              <label className="form-label">End Date & Time</label>
              <div className="datetime-container">
                <input
                  type="datetime-local"
                  value={eventForm.endDateTime}
                  onChange={(e) => setEventForm(prev => ({ ...prev, endDateTime: e.target.value }))}
                  className="form-input"
                />
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={createEvent}
              className="btn-primary btn-full"
            >
              <Plus className="icon-small" />
              Create Event
            </button>
          </div>

          {/* Events Section */}
          <div className="card">
            <div className="events-header">
              <h2 className="section-title">Events</h2>
              <div className="timezone-selector">
                <label className="form-label">View in Timezone</label>
                <select
                  value={viewTimezone}
                  onChange={(e) => setViewTimezone(e.target.value)}
                  className="form-select"
                >
                  {TIMEZONES.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {events.length === 0 ? (
              <div className="no-events">
                No events found
              </div>
            ) : (
              <div className="events-list">
                {events.map(event => (
                  <div key={event._id} className="event-card">
                    <div className="event-header">
                      <h3 className="event-title">{event.title}</h3>
                      <div className="event-actions">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="action-btn edit-btn"
                        >
                          <Edit className="icon-small" />
                        </button>
                        <button
                          onClick={() => fetchEventLogs(event._id)}
                          className="action-btn view-btn"
                        >
                          <Eye className="icon-small" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="event-details">
                      <div className="event-detail">
                        <Users className="icon-small" />
                        {event.profiles.map(p => p.name).join(', ')}
                      </div>
                      <div className="event-detail">
                        <Calendar className="icon-small" />
                        {moment(event.startDateTime).format('MMM DD, YYYY')} - {moment(event.endDateTime).format('MMM DD, YYYY')}
                      </div>
                      <div className="event-detail">
                        <Clock className="icon-small" />
                        {moment(event.startDateTime).format('HH:mm')} - {moment(event.endDateTime).format('HH:mm')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Add New Profile</h3>
              <button onClick={() => setShowAddUser(false)} className="close-btn">
                <X className="icon-small" />
              </button>
            </div>
            <input
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="Enter profile name..."
              className="form-input modal-input"
              onKeyPress={(e) => e.key === 'Enter' && createUser()}
            />
            <div className="modal-actions">
              <button
                onClick={() => setShowAddUser(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={createUser}
                className="btn-primary"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditEvent && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h3 className="modal-title">Edit Event</h3>
              <button onClick={() => setShowEditEvent(false)} className="close-btn">
                <X className="icon-small" />
              </button>
            </div>
            
            <div className="modal-form">
              <div className="form-group">
                <label className="form-label">Event Title</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Profiles</label>
                <div className="profile-list">
                  {users.map(user => (
                    <div key={user._id} className="profile-checkbox">
                      <input
                        type="checkbox"
                        checked={eventForm.profiles.includes(user._id)}
                        onChange={() => toggleProfileSelection(user._id)}
                        className="checkbox"
                      />
                      {user.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Timezone</label>
                <select
                  value={eventForm.timezone}
                  onChange={(e) => setEventForm(prev => ({ ...prev, timezone: e.target.value }))}
                  className="form-select"
                >
                  {TIMEZONES.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={eventForm.startDateTime}
                  onChange={(e) => setEventForm(prev => ({ ...prev, startDateTime: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={eventForm.endDateTime}
                  onChange={(e) => setEventForm(prev => ({ ...prev, endDateTime: e.target.value }))}
                  className="form-input"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setShowEditEvent(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={updateEvent}
                className="btn-primary"
              >
                Update Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Logs Modal */}
      {showEventLogs && (
        <div className="modal-overlay">
          <div className="modal modal-wide">
            <div className="modal-header">
              <h3 className="modal-title">Event Update Logs</h3>
              <button onClick={() => setShowEventLogs(false)} className="close-btn">
                <X className="icon-small" />
              </button>
            </div>
            
            {eventLogs.length === 0 ? (
              <p className="no-logs">No update logs found</p>
            ) : (
              <div className="logs-list">
                {eventLogs.map((log, index) => (
                  <div key={index} className="log-entry">
                    <div className="log-header">
                      <span className="log-field">Field: {log.field}</span>
                      <span className="log-timestamp">
                        {moment(log.updatedAt).format('MMM DD, YYYY HH:mm')}
                      </span>
                    </div>
                    <div className="log-changes">
                      <div className="log-change">
                        <span className="change-label previous">Previous: </span>
                        <span className="change-value">{JSON.stringify(log.previousValue)}</span>
                      </div>
                      <div className="log-change">
                        <span className="change-label new">New: </span>
                        <span className="change-value">{JSON.stringify(log.newValue)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App

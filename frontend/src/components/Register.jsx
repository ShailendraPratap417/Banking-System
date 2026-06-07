import React, { useState } from 'react'
import { User, Lock, Mail, Landmark } from 'lucide-react'

function Register({ onSwitch, showToast }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!fullName || !email || !username || !password) {
      showToast('Please fill in all fields', 'error')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        'https://banking-system-production-c33a.up.railway.app/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fullName,
            email,
            username,
            password
          })
        }
      )

      const data = await response.json()

      setLoading(false)

      if (response.ok) {
        showToast('Account created successfully! Please sign in.')
        onSwitch()
      } else {
        showToast(data.error || 'Registration failed', 'error')
      }
    } catch (err) {
      setLoading(false)
      showToast('Cannot connect to banking server. Ensure backend is running.', 'error')
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-logo">
          <Landmark size={32} style={{ color: 'var(--accent-primary)' }} />
          <span>AuraBank</span>
        </div>
        <p className="auth-subtitle">
          Join us to experience next-gen premium banking
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <div className="form-input-container">
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Jane Smith"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <User className="form-icon" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div className="form-input-container">
            <input
              type="email"
              className="form-input"
              placeholder="e.g. jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Mail className="form-icon" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Username</label>
          <div className="form-input-container">
            <input
              type="text"
              className="form-input"
              placeholder="e.g. janesmith"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <User className="form-icon" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="form-input-container">
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Lock className="form-icon" />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating Account...' : 'Open Account'}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account?
        <span className="auth-link" onClick={onSwitch}>
          Login
        </span>
      </div>
    </div>
  )
}

export default Register
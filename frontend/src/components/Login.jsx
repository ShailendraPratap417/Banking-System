import React, { useState } from 'react'
import { User, Lock, Landmark } from 'lucide-react'

function Login({ onLogin, onSwitch, showToast }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!username || !password) {
      showToast('Please fill in all fields', 'error')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        "https://banking-system-production-c33a.up.railway.app/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ username, password })
        }
      )

      const data = await response.json()
      setLoading(false)

      if (response.ok) {
        onLogin(data, data.token)
      } else {
        showToast(data.error || "Authentication failed", "error")
      }

    } catch (err) {
      setLoading(false)
      showToast("Cannot connect to banking server. Ensure backend is running.", "error")
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-logo">
          <Landmark size={32} style={{ color: 'var(--accent-primary)' }} />
          <span>AuraBank</span>
        </div>
        <p className="auth-subtitle">Login to access your premium digital account</p>
      </div>

      <form onSubmit={handleSubmit}>
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
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      <div className="auth-footer">
        Don't have an account?
        <span className="auth-link" onClick={onSwitch}>Create One</span>
      </div>
    </div>
  )
}

export default Login
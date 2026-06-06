import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import TransactionHistory from './components/TransactionHistory'
import Login from './components/Login'
import Register from './components/Register'

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [view, setView] = useState('dashboard') // 'dashboard' or 'history'
  const [isRegistering, setIsRegistering] = useState(false)
  const [toast, setToast] = useState(null)
  const [accounts, setAccounts] = useState([])

  // Load auth state from localStorage on startup
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
  }, [])

  // Sync user accounts when user changes or transaction occurs
  useEffect(() => {
    if (token) {
      fetchMyAccounts()
    }
  }, [token])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 4000)
  }

  const fetchMyAccounts = async () => {
    try {
      const response = await fetch('/api/accounts/my-accounts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        setAccounts(data)
      } else {
        showToast(data.error || 'Failed to fetch accounts', 'error')
      }
    } catch (err) {
      showToast('Network error fetching accounts', 'error')
    }
  }

  const handleLogin = (userData, tokenData) => {
    localStorage.setItem('token', tokenData)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(tokenData)
    setUser(userData)
    setAccounts(userData.accounts || [])
    showToast(`Welcome back, ${userData.fullName}!`)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setAccounts([])
    setView('dashboard')
    showToast('Logged out successfully')
  }

  if (!token) {
    return (
      <div className="auth-container">
        {isRegistering ? (
          <Register 
            onSwitch={() => setIsRegistering(false)} 
            showToast={showToast} 
          />
        ) : (
          <Login 
            onLogin={handleLogin} 
            onSwitch={() => setIsRegistering(true)} 
            showToast={showToast} 
          />
        )}
        {toast && (
          <div className={`toast ${toast.type}`}>
            <span className="toast-message">{toast.message}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="app-container">
      <Sidebar 
        activeView={view} 
        onViewChange={setView} 
        user={user} 
        onLogout={handleLogout} 
      />
      <main className="main-content">
        {view === 'dashboard' ? (
          <Dashboard 
            user={user} 
            accounts={accounts} 
            fetchAccounts={fetchMyAccounts} 
            showToast={showToast} 
          />
        ) : (
          <TransactionHistory 
            accounts={accounts} 
            showToast={showToast} 
          />
        )}
      </main>
      {toast && (
        <div className={`toast ${toast.type}`}>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}
    </div>
  )
}

export default App

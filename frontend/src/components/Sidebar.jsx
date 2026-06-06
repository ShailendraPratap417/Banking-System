import React from 'react'
import { LayoutDashboard, History, LogOut, Landmark } from 'lucide-react'

function Sidebar({ activeView, onViewChange, user, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Landmark size={28} className="logo-icon" style={{ color: 'var(--accent-primary)' }} />
        <span>AuraBank</span>
      </div>
      
      <ul className="sidebar-menu">
        <li 
          className={`sidebar-item ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onViewChange('dashboard')}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </li>
        <li 
          className={`sidebar-item ${activeView === 'history' ? 'active' : ''}`}
          onClick={() => onViewChange('history')}
        >
          <History size={20} />
          <span>Transactions</span>
        </li>
      </ul>
      
      <div className="sidebar-user">
        <div className="user-info">
          <span className="user-name">{user?.fullName || 'Valued Client'}</span>
          <span className="user-email">{user?.email || 'client@aurabank.com'}</span>
        </div>
        <button className="btn-logout" onClick={onLogout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar

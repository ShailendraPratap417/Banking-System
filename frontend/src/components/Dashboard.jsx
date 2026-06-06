import React, { useState, useEffect } from 'react'
import { Landmark, ArrowUpRight, ArrowDownLeft, Send, Receipt, Sparkles, CreditCard } from 'lucide-react'
import TransferModal from './TransferModal'

function Dashboard({ user, accounts, fetchAccounts, showToast }) {
  const [recentTransactions, setRecentTransactions] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState('deposit')
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const checkingAccount = accounts.find(a => a.accountType === 'CHECKING')
  const savingsAccount = accounts.find(a => a.accountType === 'SAVINGS')

  useEffect(() => {
    if (checkingAccount) {
      fetchRecentTransactions(checkingAccount.accountNumber)
    }
  }, [accounts])

  const fetchRecentTransactions = async (accNum) => {
    try {
      const response = await fetch(`/api/transactions/history/${accNum}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setRecentTransactions(data.slice(0, 5))
      }
    } catch (err) {
      console.error('Failed to load transaction history', err)
    }
  }

  const openActionModal = (action) => {
    setModalAction(action)
    setModalOpen(true)
  }

  const handleTransactionComplete = () => {
    fetchAccounts()
    setModalOpen(false)
  }

  const chartData = [
    { label: 'Mon', amount: 45, value: '$120' },
    { label: 'Tue', amount: 80, value: '$340' },
    { label: 'Wed', amount: 35, value: '$90' },
    { label: 'Thu', amount: 60, value: '$210' },
    { label: 'Fri', amount: 95, value: '$450' },
    { label: 'Sat', amount: 20, value: '$50' },
    { label: 'Sun', amount: 40, value: '$110' }
  ]

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="welcome-title">Welcome, {user?.fullName || 'Client'}</h1>
          <p className="current-date">{currentDate}</p>
        </div>
        <div className="glass-card" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px' }}>
          <Sparkles size={16} style={{ color: 'var(--accent-secondary)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Premium Tier Account</span>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Balance Widget */}
        <div className="glass-card balance-widget">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <CreditCard size={18} style={{ color: 'var(--accent-primary)' }} />
            My Accounts
          </h3>
          <div className="card-container">
            {/* Checking Card */}
            <div className="bank-card checking">
              <div className="card-header">
                <span>CHECKING ACCOUNT</span>
                <Landmark size={18} />
              </div>
              <div>
                <div className="card-balance">
                  ${checkingAccount ? parseFloat(checkingAccount.balance).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                </div>
                <div className="card-number">
                  {checkingAccount ? `•••• •••• ${checkingAccount.accountNumber.slice(-4)}` : '•••• •••• ••••'}
                </div>
              </div>
            </div>

            {/* Savings Card */}
            <div className="bank-card savings">
              <div className="card-header">
                <span>SAVINGS ACCOUNT</span>
                <Landmark size={18} />
              </div>
              <div>
                <div className="card-balance">
                  ${savingsAccount ? parseFloat(savingsAccount.balance).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                </div>
                <div className="card-number">
                  {savingsAccount ? `•••• •••• ${savingsAccount.accountNumber.slice(-4)}` : '•••• •••• ••••'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Widget */}
        <div className="glass-card actions-widget">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '15px' }}>Quick Actions</h3>
          <div className="actions-grid">
            <button className="action-btn" onClick={() => openActionModal('deposit')}>
              <div className="action-icon-wrapper">
                <ArrowDownLeft size={20} />
              </div>
              <span>Deposit</span>
            </button>
            <button className="action-btn" onClick={() => openActionModal('withdraw')}>
              <div className="action-icon-wrapper">
                <ArrowUpRight size={20} />
              </div>
              <span>Withdraw</span>
            </button>
            <button className="action-btn" onClick={() => openActionModal('transfer')}>
              <div className="action-icon-wrapper">
                <Send size={18} />
              </div>
              <span>Transfer</span>
            </button>
            <button className="action-btn" onClick={() => openActionModal('bill')} style={{ gridColumn: 'span 3', marginTop: '5px' }}>
              <div className="action-icon-wrapper" style={{ margin: '0 auto' }}>
                <Receipt size={18} />
              </div>
              <span>Pay Utility Bill</span>
            </button>
          </div>
        </div>

        {/* Weekly Spends / Chart */}
        <div className="glass-card analytics-widget">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Weekly Expenses Analytics</h3>
          <div className="chart-container">
            {chartData.map((d, index) => (
              <div key={index} className="chart-bar-wrapper">
                <div 
                  className="chart-bar" 
                  style={{ height: `${d.amount}%` }}
                >
                  <span className="chart-bar-tooltip">{d.value}</span>
                </div>
                <span className="chart-label">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card transactions-widget">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Recent Activity</h3>
          <div className="history-list">
            {recentTransactions.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginTop: '40px' }}>
                No recent transactions.
              </p>
            ) : (
              recentTransactions.map((tx, idx) => {
                const isDeposit = tx.transactionType === 'DEPOSIT'
                const isIncomingTransfer = tx.transactionType === 'TRANSFER' && tx.destinationAccountNumber === checkingAccount?.accountNumber
                const isIncome = isDeposit || isIncomingTransfer

                return (
                  <div key={idx} className="history-item">
                    <div className="history-details">
                      <div className="history-icon" style={{ 
                        background: isIncome ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: isIncome ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {isIncome ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                      </div>
                      <div className="history-info">
                        <span className="history-title">{tx.description}</span>
                        <span className="history-date">
                          {new Date(tx.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <span className={`history-amount ${isIncome ? 'income' : 'expense'}`}>
                      {isIncome ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <TransferModal 
          action={modalAction} 
          accounts={accounts}
          onClose={() => setModalOpen(false)}
          onSuccess={handleTransactionComplete}
          showToast={showToast}
        />
      )}
    </div>
  )
}

export default Dashboard

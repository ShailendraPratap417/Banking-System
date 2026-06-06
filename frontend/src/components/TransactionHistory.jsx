import React, { useState, useEffect } from 'react'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'

function TransactionHistory({ accounts, showToast }) {
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]?.accountNumber || '')
  const [transactions, setTransactions] = useState([])
  const [filterType, setFilterType] = useState('ALL')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0].accountNumber)
    }
  }, [accounts])

  useEffect(() => {
    if (selectedAccount) {
      fetchHistory(selectedAccount)
    }
  }, [selectedAccount])

  const fetchHistory = async (accNum) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/transactions/history/${accNum}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setLoading(false)
      if (response.ok) {
        setTransactions(data)
      } else {
        showToast(data.error || 'Failed to fetch transaction history', 'error')
      }
    } catch (err) {
      setLoading(false)
      showToast('Network error fetching transaction history', 'error')
    }
  }

  const filteredTransactions = transactions.filter(tx => {
    if (filterType === 'ALL') return true
    return tx.transactionType === filterType
  })

  return (
    <div>
      <div className="history-header">
        <div>
          <h1 className="welcome-title">Transaction History</h1>
          <p className="current-date">Detailed financial logs and records</p>
        </div>
        
        <div className="history-filter-container">
          <select 
            className="history-select"
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
          >
            {accounts.map((acc, index) => (
              <option key={index} value={acc.accountNumber}>
                {acc.accountType} (•••• {acc.accountNumber.slice(-4)})
              </option>
            ))}
          </select>

          <select 
            className="history-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="DEPOSIT">Deposits</option>
            <option value="WITHDRAWAL">Withdrawals</option>
            <option value="TRANSFER">Transfers</option>
            <option value="BILL_PAY">Bill Payments</option>
          </select>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading ledger transaction history...
          </p>
        ) : filteredTransactions.length === 0 ? (
          <p style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            No transaction records found matching your filter rules.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="full-history-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Reference Info</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx, idx) => {
                  const isDeposit = tx.transactionType === 'DEPOSIT'
                  const isIncomingTransfer = tx.transactionType === 'TRANSFER' && tx.destinationAccountNumber === selectedAccount
                  const isIncome = isDeposit || isIncomingTransfer

                  const txDate = new Date(tx.timestamp).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })

                  return (
                    <tr key={idx}>
                      <td>{txDate}</td>
                      <td>
                        <span className={`badge ${tx.transactionType.toLowerCase()}`}>
                          {tx.transactionType.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{tx.description}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {tx.transactionType === 'TRANSFER' && (
                          isIncomingTransfer 
                            ? `Received from Account #••••${tx.sourceAccountNumber.slice(-4)}`
                            : `Sent to Account #••••${tx.destinationAccountNumber.slice(-4)}`
                        )}
                        {tx.transactionType === 'DEPOSIT' && 'Direct Deposit'}
                        {tx.transactionType === 'WITHDRAWAL' && 'ATM Withdrawal'}
                        {tx.transactionType === 'BILL_PAY' && 'Utility Settlement'}
                      </td>
                      <td style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                        <span style={{ color: isIncome ? 'var(--success)' : 'var(--danger)' }}>
                          {isIncome ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionHistory

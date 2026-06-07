import React, { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle } from 'lucide-react'

function TransferModal({ action, accounts, onClose, onSuccess, showToast }) {
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]?.accountNumber || '')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [destAccount, setDestAccount] = useState('')
  const [billerName, setBillerName] = useState('Electricity')
  const [recipientName, setRecipientName] = useState('')
  const [loading, setLoading] = useState(false)
  const [validatingRecipient, setValidatingRecipient] = useState(false)

  const titles = {
    deposit: 'Make a Deposit',
    withdraw: 'Withdraw Funds',
    transfer: 'Transfer Money',
    bill: 'Pay Utility Bill'
  }

  useEffect(() => {
    if (action === 'transfer' && destAccount.length === 10) {
      validateRecipient(destAccount)
    } else {
      setRecipientName('')
    }
  }, [destAccount, action])
const validateRecipient = async (accNum) => {
  setValidatingRecipient(true)

  try {
    const response = await fetch(
      `https://banking-system-production-c33a.up.railway.app/api/accounts/${accNum}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )

    const data = await response.json()
    setValidatingRecipient(false)

    if (response.ok && data.fullName) {
      setRecipientName(data.fullName)
    } else {
      setRecipientName('')
    }
  } catch (err) {
    setValidatingRecipient(false)
    setRecipientName('')
  }
}

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) {
      showToast('Please enter a valid amount', 'error')
      return
    }

    setLoading(true)

    const BASE_URL =
  'https://banking-system-production-c33a.up.railway.app/api'

let url = ''
let bodyObj = {
  accountNumber: selectedAccount,
  amount: parseFloat(amount),
  description
}

if (action === 'deposit') {
  url = `${BASE_URL}/transactions/deposit`
} else if (action === 'withdraw') {
  url = `${BASE_URL}/transactions/withdraw`
} else if (action === 'transfer') {
  url = `${BASE_URL}/transactions/transfer`

  bodyObj = {
    sourceAccountNumber: selectedAccount,
    destinationAccountNumber: destAccount,
    amount: parseFloat(amount),
    description
  }

  if (!recipientName) {
    setLoading(false)
    showToast('Please enter a valid destination account', 'error')
    return
  }
} else if (action === 'bill') {
  url = `${BASE_URL}/transactions/pay-bill`

  bodyObj = {
    sourceAccountNumber: selectedAccount,
    billerName,
    amount: parseFloat(amount)
  }
}
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(bodyObj)
      })
      const data = await response.json()
      setLoading(false)

      if (response.ok) {
        showToast('Transaction completed successfully!')
        onSuccess()
      } else {
        showToast(data.error || 'Transaction failed', 'error')
      }
    } catch (err) {
      setLoading(false)
      showToast('Network error processing transaction', 'error')
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        
        <h2 className="modal-title">{titles[action]}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              {action === 'deposit' || action === 'withdraw' ? 'Select Account' : 'Pay From'}
            </label>
            <select 
              className="form-select"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
            >
              {accounts.map((acc, index) => (
                <option key={index} value={acc.accountNumber}>
                  {acc.accountType} (•••• {acc.accountNumber.slice(-4)}) - ${parseFloat(acc.balance).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {action === 'transfer' && (
            <div className="form-group">
              <label className="form-label">Recipient's Account Number</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="10-digit account number"
                value={destAccount}
                onChange={(e) => setDestAccount(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
                style={{ paddingLeft: '15px' }}
              />
              {validatingRecipient && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '5px' }}>
                  Verifying account...
                </p>
              )}
              {recipientName && (
                <div className="transfer-recipient-info">
                  <CheckCircle size={14} />
                  <span>Recipient: {recipientName}</span>
                </div>
              )}
              {!recipientName && destAccount.length === 10 && !validatingRecipient && (
                <div className="transfer-recipient-info" style={{ background: 'rgba(239, 68, 68, 0.06)', borderColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>
                  <AlertCircle size={14} />
                  <span>Invalid account number</span>
                </div>
              )}
            </div>
          )}

          {action === 'bill' && (
            <div className="form-group">
              <label className="form-label">Biller Name</label>
              <select 
                className="form-select"
                value={billerName}
                onChange={(e) => setBillerName(e.target.value)}
              >
                <option value="Electricity">Electricity Provider</option>
                <option value="Water Utility">Water Board</option>
                <option value="Internet Broadband">Fiber Internet Broadband</option>
                <option value="Mobile Postpaid">Mobile Postpaid Operator</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Amount ($)</label>
            <input 
              type="number" 
              step="0.01"
              min="0.01"
              className="form-input" 
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              style={{ paddingLeft: '15px' }}
            />
          </div>

          {(action === 'deposit' || action === 'withdraw' || action === 'transfer') && (
            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Add a reference note"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ paddingLeft: '15px' }}
              />
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processing transaction...' : 'Confirm Transaction'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default TransferModal

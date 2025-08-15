import React, { useState } from 'react'
import { getAuth } from 'firebase/auth'

export default function AdminPage() {
  const auth = getAuth()
  const [status, setStatus] = useState('Idle')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const callAdmin = async () => {
    try {
      setError('')
      setStatus('Calling…')
      const user = auth.currentUser
      if (!user) throw new Error('Please sign in first.')
      const token = await user.getIdToken()
      const res = await fetch('/api', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`)
      setData(json)
      setStatus('Success')
    } catch (e) {
      setStatus('Error')
      setData(null)
      setError(e?.message || 'Failed')
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Admin</h2>
      <p>Status: {status}</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={callAdmin}>Call Admin API</button>
      {data && (
        <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )
}
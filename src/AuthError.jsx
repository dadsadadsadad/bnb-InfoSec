import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function AuthError() {
    const location = useLocation()
    const navigate = useNavigate()
    const codeFromState = location.state?.code
    const codeFromQuery = new URLSearchParams(location.search).get('code')
    const code = codeFromState || codeFromQuery || ''

    //firebase errors translated
    const messages = {
        'auth/invalid-credential': 'Incorrect email or password',
        'auth/wrong-password': 'Incorrect email or password',
        'auth/user-not-found': 'No account found for this email',
        'auth/too-many-requests': 'Too many attempts, please try again later',
        'auth/email-already-in-use': 'An account with this email already exists',
        'auth/weak-password': 'Password is too weak',
        'auth/invalid-email': 'Invalid email address',
    }
    const message = messages[code] || 'Authentication error, please try again'

    return (
        <div style={{ padding: 24, maxWidth: 520, margin: '40px auto' }}>
            <h2>Sign in error</h2>
            <p style={{ marginTop: 12 }}>{message}</p>
            <button style={{ marginTop: 16 }} onClick={() => navigate('/')}>Back to sign in</button>
            {code && (
                <div style={{ marginTop: 8, color: '#888', fontSize: 12 }}>
                    Code: {code}
                </div>
            )}
        </div>
    )
}
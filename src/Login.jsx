import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from './firebase'
import './assets/Login.css'

export default function Login() {
    const nav = useNavigate()
    const [email, setEmail] = useState('')
    const [pass, setPass] = useState('')
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)
    const [resetMsg, setResetMsg] = useState('')

    const onLogin = async (e) => {
        e.preventDefault()
        setError('')
        setResetMsg('')
        try {
            setBusy(true)
            await signInWithEmailAndPassword(auth, email.trim(), pass)
            nav('/homepage', { replace: true })
        } catch (err) {
            setError(err?.message || 'Failed to log in')
        } finally {
            setBusy(false)
        }
    }

    const onReset = async () => {
        setError('')
        setResetMsg('')
        if (!email) { setError('Enter your email to reset your password.'); return }
        try {
            setBusy(true)
            await sendPasswordResetEmail(auth, email.trim())
            setResetMsg('Password reset email sent.')
        } catch (err) {
            setError(err?.message || 'Failed to send reset email')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <h1 className="login-title">Welcome back</h1>
                    <p className="login-subtitle">Log in to continue</p>

                    {error && <div className="login-error" role="alert">{error}</div>}
                    {resetMsg && <div className="login-helper-text" role="status">{resetMsg}</div>}

                    <form className="login-form" onSubmit={onLogin}>
                        <div className="login-group">
                            <label className="login-label" htmlFor="login-email">Email</label>
                            <input
                                id="login-email"
                                type="email"
                                className="login-input"
                                placeholder="you@example.com"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={busy}
                                required
                            />
                        </div>

                        <div className="login-group">
                            <label className="login-label" htmlFor="login-pass">Password</label>
                            <input
                                id="login-pass"
                                type="password"
                                className="login-input"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                value={pass}
                                onChange={(e) => setPass(e.target.value)}
                                disabled={busy}
                                required
                            />
                        </div>

                        <div className="login-actions">
                            <button className="login-btn login-btn-primary" type="submit" disabled={busy}>
                                {busy ? 'Signing in...' : 'Sign in'}
                            </button>
                            <button type="button" className="link-btn" onClick={onReset} disabled={busy}>
                                Forgot your password?
                            </button>
                        </div>
                    </form>

                    <p className="login-helper-text" style={{ marginTop: 12 }}>
                        New here? <Link className="login-helper-link" to="/signup">Create an account</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
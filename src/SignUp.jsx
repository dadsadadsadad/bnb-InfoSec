import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { auth, db } from './firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import './assets/SignUp.css'

export default function Signup() {
    const nav = useNavigate()
    const [email, setEmail] = useState('')
    const [pass, setPass] = useState('')
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

    const onSignup = async (e) => {
        e.preventDefault()
        setError('')
        try {
            setBusy(true)
            const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass)
            const user = cred.user

            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                isHost: false,
                isAdmin: false,
                createdAt: serverTimestamp(),
                verified: false,
            })

            await sendEmailVerification(user)
            nav('/verify-email', { replace: true })
        } catch (err) {
            setError(err?.message || 'Failed to sign up')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="signup-page">
            <div className="signup-container">
                <div className="signup-card">
                    <h1 className="signup-title">Create your account</h1>
                    <p className="signup-subtitle">Sign up to start booking stays</p>

                    {error && <div className="signup-error" role="alert">{error}</div>}

                    <form className="signup-form" onSubmit={onSignup}>
                        <div className="signup-group">
                            <label className="signup-label" htmlFor="signup-email">Email</label>
                            <input
                                id="signup-email"
                                type="email"
                                className="signup-input"
                                placeholder="you@example.com"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={busy}
                                required
                            />
                        </div>

                        <div className="signup-group">
                            <label className="signup-label" htmlFor="signup-pass">Password</label>
                            <input
                                id="signup-pass"
                                type="password"
                                className="signup-input"
                                placeholder="••••••••"
                                autoComplete="new-password"
                                value={pass}
                                onChange={(e) => setPass(e.target.value)}
                                disabled={busy}
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="signup-actions">
                            <button className="signup-btn signup-btn-primary" type="submit" disabled={busy}>
                                {busy ? 'Creating account...' : 'Create account'}
                            </button>
                        </div>
                    </form>

                    <p className="signup-helper-text" style={{ marginTop: 12 }}>
                        Already have an account? <Link className="signup-helper-link" to="/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
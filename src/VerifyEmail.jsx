import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from './firebase'
import { sendEmailVerification, signOut } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import './assets/VerifyEmail.css'

export default function VerifyEmail() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [info, setInfo] = useState('')
    const [success, setSuccess] = useState('')
    const [cooldown, setCooldown] = useState(0)

    const markUserVerified = async (u) => {
        if (!u) return
        try {
            await setDoc(
                doc(db, 'users', u.uid),
                { verified: true, verifiedAt: serverTimestamp() },
                { merge: true }
            )
        } catch (e) {
            console.error('Failed to mark user verified:', e)
        }
    }

    useEffect(() => {
        const user = auth.currentUser
        if (!user) {
            navigate('/login', { replace: true })
            return
        }
        setEmail(user.email || '')
        if (user.emailVerified) navigate('/', { replace: true })
    }, [navigate])

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.get('verified') === '1') {
            auth.currentUser?.reload().then(async () => {
                const u = auth.currentUser
                if (u?.emailVerified) {
                    await markUserVerified(u)
                    navigate('/', { replace: true })
                } else {
                    setInfo('Not verified yet. Please click the link in your email.')
                }
            }).finally(() => {
                params.delete('verified')
                const qs = params.toString()
                const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ''}`
                window.history.replaceState({}, '', newUrl)
            })
        }
    }, [navigate])

    useEffect(() => {
        if (cooldown <= 0) return
        const t = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000)
        return () => clearInterval(t)
    }, [cooldown])

    const handleResend = async () => {
        const user = auth.currentUser
        if (!user) return
        setError('')
        setSuccess('')
        setInfo('')
        try {
            if (user.emailVerified) {
                await markUserVerified(user)
                navigate('/', { replace: true })
                return
            }
            const actionUrl = `${window.location.origin}/verify-email?verified=1`
            await sendEmailVerification(user, { url: actionUrl, handleCodeInApp: false })
            setSuccess('Verification email sent. Check your inbox.')
            setCooldown(60)
        } catch (e) {
            setError(e?.message || 'Failed to send verification email.')
        }
    }

    const handleRefresh = async () => {
        const user = auth.currentUser
        if (!user) return
        setError('')
        setSuccess('')
        setInfo('')
        try {
            await user.reload()
            if (user.emailVerified) {
                await markUserVerified(user)
                navigate('/', { replace: true })
            } else {
                setInfo('Not verified yet. Please click the link in your email.')
            }
        } catch (e) {
            setError(e?.message || 'Could not refresh verification status.')
        }
    }

    const handleSignOut = async () => {
        setError('')
        try {
            await signOut(auth)
            navigate('/login', { replace: true })
        } catch (e) {
            setError(e?.message || 'Failed to sign out.')
        }
    }

    return (
        <div className="verify">
            <h2 className="verify__title">Verify your email</h2>
            <p className="verify__text">We sent a verification link to: <strong>{email || 'your email'}</strong></p>
            <p className="verify__text">Open the link in your inbox to verify your account, then click Refresh status.</p>

            {error && <div className="verify__alert verify__alert--error" role="alert">{error}</div>}
            {success && <div className="verify__alert verify__alert--success" role="status">{success}</div>}
            {info && <div className="verify__alert verify__alert--info">{info}</div>}

            <div className="verify__actions">
                <button className="verify__primary" onClick={handleRefresh}>Refresh status</button>
                <button className="verify__btn" onClick={handleResend} disabled={cooldown > 0}>
                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email'}
                </button>
                <button className="verify__btn" onClick={handleSignOut}>Sign out</button>
            </div>
        </div>
    )
}